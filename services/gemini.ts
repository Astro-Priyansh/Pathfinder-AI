
import { GoogleGenAI, Type } from "@google/genai";
import { 
    ChatMessage, 
    DailyRoutine, 
    ExercisePlan, 
    PersonalityResult, 
    InterestAnalysis, 
    InterestDevelopmentPlan,
    CareerRoadmap,
    SimulationTurn,
    SkillGapAnalysis,
    CareerRecommendation,
    CollegeResult,
    SalaryInsights,
    DietPlan,
    BotPersonality,
    ProjectIdea,
    PersonalizedCollegeQueryParams,
    PersonalizedCollegeResult
} from "../types";

// Initialize the Gemini API client with the correct environment variable
const getAI = () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Dynamically wrap generateContent on ai.models to handle quota/rate limitation
    const originalGenerateContent = ai.models.generateContent.bind(ai.models);
    ai.models.generateContent = async (params: any, ...args: any[]) => {
        try {
            return await originalGenerateContent(params, ...args);
        } catch (error: any) {
            const errorStr = String(error?.message || error);
            const isQuotaError = errorStr.includes("429") || errorStr.includes("quota") || errorStr.includes("RESOURCE_EXHAUSTED");
            
            if (isQuotaError) {
                const currentModel = params?.model || MODEL_PRO;
                console.warn(`Got quota error (429) for model ${currentModel}. Attempting fallback to gemini-3.5-flash...`);
                
                // Try fallback to gemini-3.5-flash
                const fallbackParams = { ...params, model: 'gemini-3.5-flash' };
                try {
                    return await originalGenerateContent(fallbackParams, ...args);
                } catch (fallbackError: any) {
                    const fallbackErrorStr = String(fallbackError?.message || fallbackError);
                    const isFallbackQuota = fallbackErrorStr.includes("429") || fallbackErrorStr.includes("quota") || fallbackErrorStr.includes("RESOURCE_EXHAUSTED");
                    
                    if (isFallbackQuota) {
                        console.warn(`Fallback to gemini-3.5-flash also rate limited. Trying ultimate fallback gemini-3.1-flash-lite...`);
                        const ultimateParams = { ...params, model: 'gemini-3.1-flash-lite' };
                        try {
                            return await originalGenerateContent(ultimateParams, ...args);
                        } catch (e) {
                            // If ultimate also fails, propagate original fallback error
                            throw fallbackError;
                        }
                    }
                    throw fallbackError;
                }
            }
            throw error;
         }
    };
    
    // Dynamically wrap chats.create on ai.chats to handle quota/rate limitation
    const originalChatsCreate = ai.chats.create.bind(ai.chats);
    ai.chats.create = (chatParams: any, ...args: any[]) => {
        const chat = originalChatsCreate(chatParams, ...args);
        const originalSendMessage = chat.sendMessage.bind(chat);
        
        chat.sendMessage = async (messageParams: any, ...msgArgs: any[]) => {
            try {
                return await originalSendMessage(messageParams, ...msgArgs);
            } catch (error: any) {
                const errorStr = String(error?.message || error);
                const isQuotaError = errorStr.includes("429") || errorStr.includes("quota") || errorStr.includes("RESOURCE_EXHAUSTED");
                
                if (isQuotaError) {
                    const currentModel = chatParams?.model || MODEL_FLASH;
                    console.warn(`Got quota error (429) for chat with model ${currentModel}. Re-creating chat with fallback model gemini-3.5-flash...`);
                    
                    const fallbackChat = originalChatsCreate({
                        ...chatParams,
                        model: 'gemini-3.5-flash'
                    }, ...args);
                    
                    try {
                        return await fallbackChat.sendMessage(messageParams, ...msgArgs);
                    } catch (fallbackError: any) {
                        const fallbackErrorStr = String(fallbackError?.message || fallbackError);
                        const isFallbackQuota = fallbackErrorStr.includes("429") || fallbackErrorStr.includes("quota") || fallbackErrorStr.includes("RESOURCE_EXHAUSTED");
                        
                        if (isFallbackQuota) {
                            console.warn(`Fallback chat model gemini-3.5-flash also rate limited. Re-creating with gemini-3.1-flash-lite...`);
                            const ultimateChat = originalChatsCreate({
                                ...chatParams,
                                model: 'gemini-3.1-flash-lite'
                            }, ...args);
                            try {
                                return await ultimateChat.sendMessage(messageParams, ...msgArgs);
                            } catch (e) {
                                throw fallbackError;
                            }
                        }
                        throw fallbackError;
                    }
                }
                throw error;
            }
        };
        
        return chat;
    };
    
    return ai;
};

const MODEL_FLASH = 'gemini-3.5-flash';
const MODEL_PRO = 'gemini-3.1-pro-preview';

/**
 * Enhanced JSON parsing with multi-stage cleaning and logging.
 */
const parseJSON = <T>(text: string | undefined, fallback: T): T => {
    if (!text) {
        console.warn("Gemini returned empty response text.");
        return fallback;
    }
    
    // Stage 1: Direct parse
    try {
        return JSON.parse(text) as T;
    } catch (e) {
        // Continue to cleanup
    }

    // Stage 2: Clean markdown and common hallucinations
    let cleaned = text.trim();
    // Remove markdown code blocks if present (handle both ```json and ```)
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    
    try {
        return JSON.parse(cleaned) as T;
    } catch (e2) {
        console.error("Resilient JSON parse failed. Raw text snippet:", text.substring(0, 100));
        return fallback;
    }
};

/**
 * Generic retry wrapper with exponential backoff for API robustness.
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        const errorMsg = error?.message || String(error);
        if (retries <= 0 || errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("403")) {
            throw error;
        }
        
        console.warn(`Gemini API call failed, retrying in ${delay}ms... (${retries} left)`, errorMsg);
        await new Promise(r => setTimeout(r, delay));
        return withRetry(fn, retries - 1, delay * 2);
    }
}

export interface SkillQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Generate an interactive RPG Skill quiz based on skill name and level
export const generateSkillQuiz = async (skill: string, level: number): Promise<SkillQuizQuestion | null> => {
    return withRetry(async () => {
        const ai = getAI();
        const prompt = `Create a highly engaging, professional multiple-choice quiz question about "${skill}" tailored specifically for a learner who is at ${level}% proficiency (where 0 is a beginner and 100 is an advanced systems architect/master).
        Avoid overly simple definitions. Present an interesting real-world scenario or technical trade-off question.
        Provide exactly 4 clear distinct options. One option must be correct.
        
        You MUST respond only in JSON containing these fields:
        - "question": The actual question string.
        - "options": An array of exactly 4 strings.
        - "correctIndex": The index (0 to 3) of the correct answer string.
        - "explanation": A detailed, insightful explanation of why the answer is correct and the underlying architecture principle.`;

        const response = await ai.models.generateContent({
            model: MODEL_FLASH,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        correctIndex: { type: Type.INTEGER },
                        explanation: { type: Type.STRING }
                    },
                    required: ["question", "options", "correctIndex", "explanation"]
                }
            }
        });
        return parseJSON<SkillQuizQuestion | null>(response.text, null);
    });
};

// Analyze personality using the Big Five framework and MBTI
export const analyzePersonality = async (answers: { question: string; answer: string }[]): Promise<PersonalityResult | null> => {
    return withRetry(async () => {
        const ai = getAI();
        const prompt = `Act as an expert clinical psychologist and career counselor. Analyze these personality test responses: ${JSON.stringify(answers)}.
        Provide a highly detailed analysis. You MUST determine the user's 5-letter MBTI type (e.g., INTJ-A, ENFP-T).
        Include a comprehensive summary, at least 5 core strengths, at least 5 potential weaknesses, a detailed work style description, a detailed interaction style description, and at least 6 suggested careers.
        Also provide the Big Five traits with scores 0-100. Return strict JSON.`;

        const response = await ai.models.generateContent({
            model: MODEL_PRO,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        traits: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT, 
                                properties: { 
                                    trait: { type: Type.STRING }, 
                                    score: { type: Type.NUMBER }, 
                                    description: { type: Type.STRING } 
                                },
                                required: ["trait", "score", "description"]
                            } 
                        },
                        mbti: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                        workStyle: { type: Type.STRING },
                        interactionStyle: { type: Type.STRING },
                        suggestedCareers: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["traits", "mbti", "summary", "strengths", "weaknesses", "workStyle", "interactionStyle", "suggestedCareers"]
                }
            }
        });
        return parseJSON(response.text, null);
    });
};

// Analyze interests to categorize and suggest careers
export const analyzeInterests = async (input: string): Promise<InterestAnalysis | null> => {
    return withRetry(async () => {
        const ai = getAI();
        const prompt = `Act as a career strategist. Analyze these interests: "${input}". Return JSON with categories and matched careers.`;

        const response = await ai.models.generateContent({
            model: MODEL_PRO,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        categories: { type: Type.ARRAY, items: { type: Type.STRING } },
                        careers: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT, 
                                properties: { 
                                    title: { type: Type.STRING }, 
                                    matchReason: { type: Type.STRING } 
                                },
                                required: ["title", "matchReason"]
                            } 
                        }
                    },
                    required: ["categories", "careers"]
                }
            }
        });
        return parseJSON(response.text, null);
    });
};

// Generate beginner tips and roadmap for a specific interest
export const getInterestDevelopmentTips = async (interest: string): Promise<InterestDevelopmentPlan | null> => {
    return withRetry(async () => {
        const ai = getAI();
        const prompt = `Structured beginner roadmap for learning: "${interest}". Return introduction, steps, and resources as JSON.`;

        const response = await ai.models.generateContent({
            model: MODEL_PRO,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        interest: { type: Type.STRING },
                        introduction: { type: Type.STRING },
                        steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                        resources: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["interest", "introduction", "steps", "resources"]
                }
            }
        });
        return parseJSON(response.text, null);
    });
};

// Generate a standard career roadmap between roles
export const generateRoadmap = async (currentRole: string, targetRole: string): Promise<CareerRoadmap | null> => {
    return withRetry(async () => {
        const ai = getAI();
        const prompt = `Actionable career roadmap from "${currentRole}" to "${targetRole}". 5-7 steps. Return JSON.`;

        const response = await ai.models.generateContent({
            model: MODEL_PRO,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        targetRole: { type: Type.STRING },
                        steps: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT, 
                                properties: { 
                                    title: { type: Type.STRING }, 
                                    description: { type: Type.STRING }, 
                                    duration: { type: Type.STRING }, 
                                    resources: { type: Type.ARRAY, items: { type: Type.STRING } } 
                                },
                                required: ["title", "description", "duration", "resources"]
                            } 
                        }
                    },
                    required: ["targetRole", "steps"]
                }
            }
        });
        return parseJSON(response.text, null);
    });
};

// Generate an advanced career roadmap with rich resources
export const generateAdvancedRoadmap = async (currentRole: string, targetRole: string): Promise<CareerRoadmap | null> => {
    return withRetry(async () => {
        const ai = getAI();
        const prompt = `Detailed strategic roadmap from "${currentRole}" to "${targetRole}". 6-8 steps with actions, courses, and books. JSON output.`;

        const response = await ai.models.generateContent({
            model: MODEL_PRO,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        targetRole: { type: Type.STRING },
                        type: { type: Type.STRING },
                        steps: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT, 
                                properties: { 
                                    title: { type: Type.STRING }, 
                                    description: { type: Type.STRING }, 
                                    duration: { type: Type.STRING }, 
                                    actions: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    courses: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { platform: { type: Type.STRING }, title: { type: Type.STRING }, url: { type: Type.STRING } } } },
                                    books: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, author: { type: Type.STRING } } } },
                                    tutorials: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, url: { type: Type.STRING } } } },
                                    channels: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { platform: { type: Type.STRING }, name: { type: Type.STRING }, url: { type: Type.STRING } } } }
                                },
                                required: ["title", "description", "duration", "actions"]
                            } 
                        }
                    },
                    required: ["targetRole", "steps"]
                }
            }
        });
        return parseJSON(response.text, null);
    });
};

// Generate a simulation turn for roleplay
export const generateSimulationTurn = async (role: string, context: string, userChoice: string): Promise<SimulationTurn | null> => {
    return withRetry(async () => {
        const ai = getAI();
        const prompt = `Act as a career simulation engine for the role of ${role}. Context: ${context}. User's latest action: ${userChoice}. 
        Return a JSON object representing the next turn in the career journey. Include a scenario, 2-3 options with outcomes, current year, and a title.`;

        const response = await ai.models.generateContent({
            model: MODEL_PRO,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        scenario: { type: Type.STRING },
                        options: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    text: { type: Type.STRING },
                                    outcomePreview: { type: Type.STRING }
                                },
                                required: ["text"]
                            }
                        },
                        year: { type: Type.INTEGER },
                        title: { type: Type.STRING }
                    },
                    required: ["scenario", "options", "year", "title"]
                }
            }
        });
        return parseJSON(response.text, null);
    });
};

// Analyze skill gap for a target role
export const analyzeSkillGap = async (currentSkills: string, targetRole: string): Promise<SkillGapAnalysis | null> => {
    return withRetry(async () => {
        const ai = getAI();
        const prompt = `Analyze the skill gap between these current skills: [${currentSkills}] and the target role: "${targetRole}". 
        Evaluate match score, identify missing critical skills, mastered skills, and provide specific learning recommendations.
        Also, provide a detailed 'skillsData' array containing 5 to 8 key skills required for the target role. For each skill, estimate the user's 'currentLevel' (0-100) based on their provided skills, the 'targetLevel' (0-100) required for the role, and its 'importance' (High, Medium, Low). Return JSON.`;

        const response = await ai.models.generateContent({
            model: MODEL_PRO,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        matchScore: { type: Type.NUMBER },
                        missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                        masteredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                        skillsData: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    skill: { type: Type.STRING },
                                    currentLevel: { type: Type.NUMBER },
                                    targetLevel: { type: Type.NUMBER },
                                    importance: { type: Type.STRING }
                                },
                                required: ["skill", "currentLevel", "targetLevel", "importance"]
                            }
                        }
                    },
                    required: ["matchScore", "missingSkills", "masteredSkills", "recommendations"]
                }
            }
        });
        return parseJSON(response.text, null);
    });
};

// Get specific advice for a skill at a certain level
export const getSkillAdvice = async (skill: string, level: number): Promise<string> => {
    return withRetry(async () => {
        const ai = getAI();
        const prompt = `Provide one specific, actionable expert tip for improving in "${skill}" given current proficiency level is ${level}%. Keep it concise and impactful.`;
        const response = await ai.models.generateContent({
            model: MODEL_FLASH,
            contents: prompt,
        });
        return response.text || "Keep practicing consistent projects in this area.";
    });
};

// Generate custom project ideas based on skill gaps and interests
export const generateProjectIdeas = async (skillGaps: string[], interests: string): Promise<ProjectIdea[]> => {
    return withRetry(async () => {
        const ai = getAI();
        const prompt = `Generate 4 highly detailed custom project ideas tailored to help a user close these specific skill gaps: [${skillGaps.join(', ')}]. 
        The projects should align with these interests if possible: "${interests}". 
        Return a JSON array of project objects. Each project should have:
        - title: A catchy project title
        - description: A detailed 2-3 sentence overview of the project
        - skillsAddressed: Array of skills from the skill gaps list
        - difficulty: "Beginner", "Intermediate", or "Advanced"
        - estimatedTime: e.g. "2 weeks", "1 month"
        - keyFeatures: Array of 3-5 specific, actionable features to build
        - stepByStepGuide: Array of 4-6 detailed steps to complete the project
        - techStack: Array of specific technologies, libraries, or tools to use
        - whyThisProject: A short paragraph explaining exactly how this project will help close their specific skill gaps.`;

        const response = await ai.models.generateContent({
            model: MODEL_PRO,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            skillsAddressed: { type: Type.ARRAY, items: { type: Type.STRING } },
                            difficulty: { type: Type.STRING },
                            estimatedTime: { type: Type.STRING },
                            keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
                            stepByStepGuide: { type: Type.ARRAY, items: { type: Type.STRING } },
                            techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
                            whyThisProject: { type: Type.STRING }
                        },
                        required: ["title", "description", "skillsAddressed", "difficulty", "estimatedTime", "keyFeatures", "stepByStepGuide", "techStack", "whyThisProject"]
                    }
                }
            }
        });
        return parseJSON(response.text, []);
    });
};

// Polish/Optimize a resume section
export const optimizeResumeSection = async (sectionPrompt: string, text: string): Promise<string> => {
    return withRetry(async () => {
        const ai = getAI();
        const prompt = `Optimize this ${sectionPrompt} for a professional resume. Use strong action verbs, quantify achievements if possible, and maintain a professional tone.
        Original text: "${text}"`;
        const response = await ai.models.generateContent({
            model: MODEL_PRO,
            contents: prompt,
        });
        return response.text || text;
    });
};

export interface EnhancedResumeResult {
  improvedText: string;
  detectedErrors: string[];
  suggestions: string[];
}

export const enhanceResumeTextAI = async (section: string, text: string, instructions?: string): Promise<EnhancedResumeResult> => {
    return withRetry(async () => {
        const ai = getAI();
        const prompt = `You are an elite executive resume writer and career coach. Review and enhance this resume section: "${section}".
        
        Original Text: "${text}"
        ${instructions ? `User instructions / target direction: "${instructions}"` : ''}
        
        Analyze the text for spelling/grammar errors, weak formatting, or lack of impact. List them in "detectedErrors", provide professional suggestions to elevate the content (re-writing generic tasks into impact-driven accomplishments, quantifying metrics, incorporating action-verbs) in "suggestions", and return the fully revised/improved text in "improvedText".
        
        Return ONLY valid JSON matching the schema.`;

        const response = await ai.models.generateContent({
            model: MODEL_FLASH,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        improvedText: { type: Type.STRING },
                        detectedErrors: { type: Type.ARRAY, items: { type: Type.STRING } },
                        suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["improvedText", "detectedErrors", "suggestions"]
                }
            }
        });
        return parseJSON<EnhancedResumeResult>(response.text, {
            improvedText: text,
            detectedErrors: [],
            suggestions: []
        });
    });
};

// Get tailored career recommendations based on user profile
export const getCareerRecommendations = async (profile: string): Promise<CareerRecommendation[]> => {
    return withRetry(async () => {
        const ai = getAI();
        const prompt = `Based on this user profile: "${profile}", suggest 5 ideal career paths. 
        For each, provide a title, match score (0-100), typical salary range, market outlook, reason for the match, common job roles, a list of 5 key required/essential skills for success in this career, and a structured list of 5-year salary projections representing estimated annual base salary from Year 1 to Year 5 reflecting realistic career growth. Return JSON array.`;

        const response = await ai.models.generateContent({
            model: MODEL_PRO,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            matchScore: { type: Type.NUMBER },
                            salaryRange: { type: Type.STRING },
                            outlook: { type: Type.STRING },
                            reason: { type: Type.STRING },
                            jobRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
                            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                            salaryProjections: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        year: { type: Type.STRING },
                                        salary: { type: Type.NUMBER }
                                    },
                                    required: ["year", "salary"]
                                }
                            }
                        },
                        required: ["title", "matchScore", "salaryRange", "outlook", "reason", "jobRoles", "skills", "salaryProjections"]
                    }
                }
            }
        });
        return parseJSON(response.text, []);
    });
};

// Generate a daily routine for a target career
export const getDailyRoutine = async (career: string): Promise<DailyRoutine | null> => {
    return withRetry(async () => {
        const ai = getAI();
        const prompt = `Design an optimized daily routine and set of habits for a successful professional in the field of: "${career}". 
        Include a 24-hour schedule (time, activity, category: Work/Health/Learning/Rest), 5 core habits, and 3 productivity tips. Return JSON.`;

        const response = await ai.models.generateContent({
            model: MODEL_PRO,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        targetCareer: { type: Type.STRING },
                        schedule: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    time: { type: Type.STRING },
                                    activity: { type: Type.STRING },
                                    category: { type: Type.STRING }
                                },
                                required: ["time", "activity", "category"]
                            }
                        },
                        habits: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    type: { type: Type.STRING },
                                    duration: { type: Type.STRING },
                                    benefit: { type: Type.STRING }
                                },
                                required: ["name", "type", "duration", "benefit"]
                            }
                        },
                        tips: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["targetCareer", "schedule", "habits", "tips"]
                }
            }
        });
        return parseJSON(response.text, null);
    });
};

// Generate a tailored exercise plan
export const getExercisePlan = async (goal: string): Promise<ExercisePlan | null> => {
    return withRetry(async () => {
        const ai = getAI();
        const prompt = `Create a 7-day exercise plan for the goal: "${goal}". 
        Include a weekly schedule, 4-6 key exercises with sets/reps, and 5 nutrition tips. Return JSON.`;

        const response = await ai.models.generateContent({
            model: MODEL_PRO,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        goal: { type: Type.STRING },
                        weeklySchedule: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    day: { type: Type.STRING },
                                    workout: { type: Type.STRING },
                                    duration: { type: Type.STRING }
                                },
                                required: ["day", "workout", "duration"]
                            }
                        },
                        exercises: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    sets: { type: Type.STRING },
                                    reps: { type: Type.STRING },
                                    tips: { type: Type.STRING }
                                },
                                required: ["name", "sets", "reps", "tips"]
                            }
                        },
                        nutritionTips: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["goal", "weeklySchedule", "exercises", "nutritionTips"]
                }
            }
        });
        return parseJSON(response.text, null);
    });
};

// Generate a personalized diet plan based on BMI and lifestyle
export const getDietPlan = async (bmi: number, routine: DailyRoutine, plan: ExercisePlan): Promise<DietPlan | null> => {
    return withRetry(async () => {
        const ai = getAI();
        const prompt = `Generate a personalized diet plan for a user with BMI: ${bmi.toFixed(1)}. 
        Context: Daily Routine includes ${routine.schedule.length} activities. Weekly fitness plan focuses on ${plan.goal}. 
        Return JSON with calorie targets, macros, hydration advice, and meal plans for both vegetarian and mixed preferences.`;

        const mealSchema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    item: { type: Type.STRING },
                    optional: { type: Type.BOOLEAN },
                    calories: { type: Type.STRING }
                },
                required: ["item", "optional"]
            }
        };

        const response = await ai.models.generateContent({
            model: MODEL_PRO,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        bmi: { type: Type.NUMBER },
                        bmiCategory: { type: Type.STRING },
                        calories: { type: Type.STRING },
                        macros: {
                            type: Type.OBJECT,
                            properties: {
                                protein: { type: Type.STRING },
                                carbs: { type: Type.STRING },
                                fats: { type: Type.STRING }
                            },
                            required: ["protein", "carbs", "fats"]
                        },
                        vegetarian: {
                            type: Type.OBJECT,
                            properties: {
                                breakfast: mealSchema,
                                lunch: mealSchema,
                                snack: mealSchema,
                                dinner: mealSchema
                            },
                            required: ["breakfast", "lunch", "snack", "dinner"]
                        },
                        mixed: {
                            type: Type.OBJECT,
                            properties: {
                                breakfast: mealSchema,
                                lunch: mealSchema,
                                snack: mealSchema,
                                dinner: mealSchema
                            },
                            required: ["breakfast", "lunch", "snack", "dinner"]
                        },
                        hydration: { type: Type.STRING },
                        explanation: { type: Type.STRING }
                    },
                    required: ["bmi", "bmiCategory", "calories", "macros", "vegetarian", "mixed", "hydration", "explanation"]
                }
            }
        });
        return parseJSON(response.text, null);
    });
};

// Find colleges for a specific field and country
export const findColleges = async (field: string, country: string): Promise<CollegeResult | null> => {
    return withRetry(async () => {
        const ai = getAI();
        const prompt = `Find top 25 domestic colleges in "${country}" and 25 top global colleges for studying "${field}". 
        For each college, provide ranking, location, description, website, contact, fees, ROI, placements, exams, and eligibility.
        IMPORTANT: For 'fees' and monetary details, use the CORRECT local country currency of each college (e.g. INR/₹ for domestic colleges in India, GBP/£ for UK, EUR/€ for European Union, USD/$ for USA, etc.). Never hardcode '$' for colleges outside of the US.
        Also construct and include:
        1. A 'coopScore' integer (0-100 indicating work-study strength) and 'coopDetails' (campusEmployment, coOpInternships, industryPartnerships, and loanOffsetEstimate using the local country currency of the college, e.g. "₹2,50,000/yr" or "£12,500/yr").
        2. Cost of Living data: 'colIndex' (integer, 50-200 where 100 is average National baseline), and 'colDetails' (rentIndex, grocIndex, transitIndex, annualEstRent using local country currency e.g. "₹1,80,000/yr", annualEstTotalCOL e.g. "₹3,50,000/yr", and livingContext).
        3. Alumni pipeline data: 'alumniPipeline' containing 'industrySectors' (each with 'sector' string and 'percentage' integer), 'topEmployers' (list of major hiring firms), 'topRegions' (main cities/hubs grads move to), and an 'overview' of college ties. Return JSON.`;

        const collegeSchema = {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                ranking: { type: Type.STRING },
                location: { type: Type.STRING },
                description: { type: Type.STRING },
                website: { type: Type.STRING },
                contact: { type: Type.STRING },
                fees: { type: Type.STRING },
                roi: { type: Type.STRING },
                placements: { type: Type.STRING },
                exams: { type: Type.ARRAY, items: { type: Type.STRING } },
                cutoffs: { type: Type.STRING },
                eligibility: { type: Type.STRING },
                courses: { type: Type.ARRAY, items: { type: Type.STRING } },
                coopScore: { type: Type.INTEGER },
                coopDetails: {
                    type: Type.OBJECT,
                    properties: {
                        campusEmployment: { type: Type.STRING },
                        coOpInternships: { type: Type.STRING },
                        industryPartnerships: { type: Type.STRING },
                        loanOffsetEstimate: { type: Type.STRING }
                    },
                    required: ["campusEmployment", "coOpInternships", "industryPartnerships", "loanOffsetEstimate"]
                },
                colIndex: { type: Type.INTEGER },
                colDetails: {
                    type: Type.OBJECT,
                    properties: {
                        rentIndex: { type: Type.INTEGER },
                        grocIndex: { type: Type.INTEGER },
                        transitIndex: { type: Type.INTEGER },
                        annualEstRent: { type: Type.STRING },
                        annualEstTotalCOL: { type: Type.STRING },
                        livingContext: { type: Type.STRING }
                    },
                    required: ["rentIndex", "grocIndex", "transitIndex", "annualEstRent", "annualEstTotalCOL", "livingContext"]
                },
                alumniPipeline: {
                    type: Type.OBJECT,
                    properties: {
                        industrySectors: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    sector: { type: Type.STRING },
                                    percentage: { type: Type.INTEGER }
                                },
                                required: ["sector", "percentage"]
                            }
                        },
                        topEmployers: { type: Type.ARRAY, items: { type: Type.STRING } },
                        topRegions: { type: Type.ARRAY, items: { type: Type.STRING } },
                        overview: { type: Type.STRING }
                    },
                    required: ["industrySectors", "topEmployers", "topRegions", "overview"]
                }
            },
            required: ["name", "ranking", "location", "description", "website", "contact", "fees", "roi", "placements", "exams", "cutoffs", "eligibility", "courses", "coopScore", "coopDetails", "colIndex", "colDetails", "alumniPipeline"]
        };

        const response = await ai.models.generateContent({
            model: MODEL_PRO,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        field: { type: Type.STRING },
                        domestic: { type: Type.ARRAY, items: collegeSchema },
                        foreign: { type: Type.ARRAY, items: collegeSchema },
                        country: { type: Type.STRING }
                    },
                    required: ["field", "domestic", "foreign", "country"]
                }
            }
        });
        return parseJSON(response.text, null);
    });
};

// Find highly personalized tailored colleges based on student's profiles and preferences
export const findCollegesPersonalized = async (params: PersonalizedCollegeQueryParams): Promise<PersonalizedCollegeResult | null> => {
    return withRetry(async () => {
        const ai = getAI();
        const examsText = params.entranceExamsChecked && params.entranceExamsChecked.length > 0
            ? params.entranceExamsChecked.join(", ") 
            : "None";
            
        const campusVibeText = params.campusLifePreferences && params.campusLifePreferences.length > 0
            ? params.campusLifePreferences.join(", ")
            : "No preference";

        const mattersMostText = params.mattersMostPriorities && params.mattersMostPriorities.length > 0
            ? params.mattersMostPriorities.join(", ")
            : "No preference";

        const institutionTypesText = params.institutionTypes && params.institutionTypes.length > 0
            ? params.institutionTypes.join(", ")
            : "Any";

        const prompt = `Perform a highly specialized personal fit college matching and ranking. Find the top 15 colleges in the user's region of choice/domestic context ("${params.locationPreference || 'US/India'}") and the top 15 global colleges (totaling 30 distinct institutions) that are a PERFECT fit for this student profile:
        - **Subject of Interest / Field of Study**: ${params.fieldOfStudy}
        - **Academic Level (UG/PG/PhD)**: ${params.studyLevel}
        - **12th / Previous Academic Scores**: ${params.academicsGrade}
        - **Given Entrance Exams**: ${examsText}
        - **Entrance Exam Scores**: ${params.entranceScores || 'N/A'}
        - **Annual Budget Limit**: ${params.annualBudget}
        - **Scholarship Relevance**: ${params.scholarshipNeeded} priority
        - **Preferred Campus Vibe(s)**: ${campusVibeText}
        - **Hostel / On-Campus Housing Required**: ${params.hostelNeeded ? 'Yes, strictly needed' : 'Optional / Off-campus preferred'}
        - **What matters most (Priorities & Careers)**: ${mattersMostText}
        - **Preferred Institution Types**: ${institutionTypesText}
        - **Ranking System Preference**: ${params.rankingPreference || 'No preference'}
        - **Other Personal Guidelines**: "${params.personalPreferences || 'None'}"

        For each matched college, provide detailed standard details PLUS customized match parameters:
        1. 'fitScore': An integer from 50 to 100 stating how closely this college matches their preferences (budget, academic eligibility, location, priority focus, types, and hostel availability).
        2. 'fitReasons': Top 3-4 bullet-point explanations highlighting why this is an ideal fit (e.g. "Its typical SAT requirement aligns perfectly with your 1450", "The annual fee of $15,000 fits safely inside your $20,000 budget limit", etc.).
        3. 'scholarshipOpportunities': Dedicated explanation of potential scholarships relevant to academic standing and budgets.
        4. 'hostelFacilities': Specific details of on-campus housing, room charges, and safety.
        5. 'campusLifeDetails': Tailored look at student clubs, residential environment, and city vibe.
        6. 'overallRating': A float reasoning from 1.0 to 5.0 (such as 4.7 or 4.9) reflecting its solid overall global and regional academics standing.
        7. 'institutionType': A text label specifying the type of the college (e.g. "Public Research", "Private Ivy", "Public Technical", "Liberal Arts").

        Also write a comprehensive "analysisOverview" summarizing the overall strategic advice for this student's profile.

        IMPORTANT: For 'fees' and monetary details, use the CORRECT local country currency of each college (e.g. INR/₹ for Indian colleges, GBP/£ for UK, EUR/€ for Europe, USD/$ for USA).
        Return JSON following the specified schema.`;

        const personalizedCollegeSchema = {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                ranking: { type: Type.STRING },
                location: { type: Type.STRING },
                description: { type: Type.STRING },
                website: { type: Type.STRING },
                contact: { type: Type.STRING },
                fees: { type: Type.STRING },
                roi: { type: Type.STRING },
                placements: { type: Type.STRING },
                exams: { type: Type.ARRAY, items: { type: Type.STRING } },
                cutoffs: { type: Type.STRING },
                eligibility: { type: Type.STRING },
                courses: { type: Type.ARRAY, items: { type: Type.STRING } },
                fitScore: { type: Type.INTEGER },
                fitReasons: { type: Type.ARRAY, items: { type: Type.STRING } },
                scholarshipOpportunities: { type: Type.STRING },
                hostelFacilities: { type: Type.STRING },
                campusLifeDetails: { type: Type.STRING },
                overallRating: { type: Type.NUMBER },
                institutionType: { type: Type.STRING },
                coopScore: { type: Type.INTEGER },
                coopDetails: {
                    type: Type.OBJECT,
                    properties: {
                        campusEmployment: { type: Type.STRING },
                        coOpInternships: { type: Type.STRING },
                        industryPartnerships: { type: Type.STRING },
                        loanOffsetEstimate: { type: Type.STRING }
                    },
                    required: ["campusEmployment", "coOpInternships", "industryPartnerships", "loanOffsetEstimate"]
                },
                colIndex: { type: Type.INTEGER },
                colDetails: {
                    type: Type.OBJECT,
                    properties: {
                        rentIndex: { type: Type.INTEGER },
                        grocIndex: { type: Type.INTEGER },
                        transitIndex: { type: Type.INTEGER },
                        annualEstRent: { type: Type.STRING },
                        annualEstTotalCOL: { type: Type.STRING },
                        livingContext: { type: Type.STRING }
                    },
                    required: ["rentIndex", "grocIndex", "transitIndex", "annualEstRent", "annualEstTotalCOL", "livingContext"]
                },
                alumniPipeline: {
                    type: Type.OBJECT,
                    properties: {
                        industrySectors: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    sector: { type: Type.STRING },
                                    percentage: { type: Type.INTEGER }
                                },
                                required: ["sector", "percentage"]
                            }
                        },
                        topEmployers: { type: Type.ARRAY, items: { type: Type.STRING } },
                        topRegions: { type: Type.ARRAY, items: { type: Type.STRING } },
                        overview: { type: Type.STRING }
                    },
                    required: ["industrySectors", "topEmployers", "topRegions", "overview"]
                }
            },
            required: [
                "name", "ranking", "location", "description", "website", "contact", "fees", "roi", "placements", "exams", "cutoffs", "eligibility", "courses",
                "fitScore", "fitReasons", "scholarshipOpportunities", "hostelFacilities", "campusLifeDetails", "overallRating", "institutionType", "coopScore", "coopDetails", "colIndex", "colDetails", "alumniPipeline"
            ]
        };

        const response = await ai.models.generateContent({
            model: MODEL_PRO,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        matchedColleges: { type: Type.ARRAY, items: personalizedCollegeSchema },
                        analysisOverview: { type: Type.STRING }
                    },
                    required: ["matchedColleges", "analysisOverview"]
                }
            }
        });
        
        const parsed = parseJSON(response.text, null);
        if (parsed && parsed.matchedColleges) {
            return {
                query: params,
                matchedColleges: parsed.matchedColleges,
                colleges: parsed.matchedColleges,
                analysisOverview: parsed.analysisOverview || ""
            };
        }
        return null;
    });
};

// Get salary insights and job listings for a specific role and location
export const getSalaryInsights = async (role: string, location: string): Promise<SalaryInsights | null> => {
    return withRetry(async () => {
        const ai = getAI();
        const prompt = `Provide detailed real-time market insights for the role: "${role}" in "${location}". 
        Use Google Search to find current average salaries, trending skills (new "must-have" technologies), and current job openings (direct links to LinkedIn, Indeed, or similar).
        Include currency, current levels (Entry, Mid, Senior, Lead), 5-year future trends, market outlook, rising/declining related roles, trending skills, and job listings. Return JSON.`;

        const response = await ai.models.generateContent({
            model: MODEL_PRO,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        role: { type: Type.STRING },
                        location: { type: Type.STRING },
                        currency: { type: Type.STRING },
                        currentLevels: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    level: { type: Type.STRING },
                                    min: { type: Type.NUMBER },
                                    max: { type: Type.NUMBER },
                                    average: { type: Type.NUMBER }
                                },
                                required: ["level", "min", "max", "average"]
                            }
                        },
                        futureTrends: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    year: { type: Type.INTEGER },
                                    salary: { type: Type.NUMBER }
                                },
                                required: ["year", "salary"]
                            }
                        },
                        marketOutlook: { type: Type.STRING },
                        risingRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
                        decliningRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
                        trendingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                        jobListings: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    company: { type: Type.STRING },
                                    location: { type: Type.STRING },
                                    url: { type: Type.STRING }
                                },
                                required: ["title", "company", "location", "url"]
                            }
                        }
                    },
                    required: ["role", "location", "currency", "currentLevels", "futureTrends", "marketOutlook", "risingRoles", "decliningRoles", "trendingSkills", "jobListings"]
                }
            }
        });
        return parseJSON(response.text, null);
    });
};

// Analyze CFP Budget & ROI Runway
export const analyzeCFPBudget = async (payload: {
  country: string;
  currency: string;
  annualTuition: number;
  scholarshipApplied: number;
  workStudyIncome: number;
  accumulatedDebt: number;
  interestRate: number;
  entrySalary: number;
  growthRate: number;
  annualLivingExpense: number;
  inflationRate: number;
  flatTaxRate: number;
  remainingDebtYear10: number;
  netWorthYear10: number;
  breakEvenYear: string | number;
  totalTaxesPaid: number;
  totalInterestAccrued: number;
  careerPath: string;
  investmentAllocation?: number;
  marketYield?: number;
}, repayShare: number): Promise<string> => {
    return withRetry(async () => {
        const ai = getAI();
        const prompt = `Act as an expert Certified Financial Planner (CFP) and professional career ROI analyst. Review this 10-Year budget projection modeled for a client studying/working in ${payload.country} under typical local taxes and pricing:
        
        ${JSON.stringify(payload, null, 2)}
        
        You MUST analyze:
        1. The ROI of their academic investment: Compare their total tuition debt vs the entry wage. Is it a highly efficient launchpad or a financial drag?
        2. Tax and Inflation realities: Analyze if local taxes (${payload.flatTaxRate}%) and inflation (${payload.inflationRate}%) will strain their buying power over 10 years.
        3. Repayment Strategy & Investment Compounding optimization: Suggest tweaks to their repayment share (${repayShare}%) or budgeting to accelerate debt payoff and compound savings early. Note that they have configured a market portfolio investment simulation directing ${payload.investmentAllocation || 0}% of monthly surplus cashflow into index funds targeting an average annual market yield of ${payload.marketYield || 0}%. Assess whether this allocation is hitting the optimal compounding leverage point.
        4. Provide 3 highly tactical, customized career/investment recommendations (e.g. upskilling to jump entry base, side hustles, tax deductions).
        
        Write your strategy and advice in high-contrast professional, direct markdown. Use bullet points and clear, actionable headings. Be supportive but realistic. Avoid financial jargon where simple English works better.`;

        const response = await ai.models.generateContent({
            model: MODEL_FLASH,
            contents: prompt,
        });
        return response.text || "Failed to generate dynamic analysis report.";
    });
};

// Get a context-aware chat response
export const getChatResponse = async (history: ChatMessage[], message: string, personality?: BotPersonality): Promise<string> => {
    return withRetry(async () => {
        const ai = getAI();
        const chat = ai.chats.create({
            model: MODEL_FLASH,
            config: {
                systemInstruction: `You are Pathfinder AI, a career assistant with a ${personality || 'guide'} personality. Help the user with their career path, resume, skills, or lifestyle optimization.`,
            },
            history: history.map(m => ({
                role: m.sender === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            }))
        });
        
        const response = await chat.sendMessage({ message });
        return response.text || "I'm having trouble connecting right now. How else can I help you?";
    });
};
