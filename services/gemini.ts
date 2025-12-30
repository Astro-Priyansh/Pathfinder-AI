
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
    BotPersonality
} from "../types";

// Initialize the Gemini API client with the requested environment variable
// Fix: Use process.env.API_KEY instead of process.env.GEMINI_API_KEY as per guidelines
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_FLASH = 'gemini-3-flash-preview';
const MODEL_PRO = 'gemini-3-pro-preview';

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

// Analyze personality using the Big Five framework
export const analyzePersonality = async (answers: { question: string; answer: string }[]): Promise<PersonalityResult | null> => {
    return withRetry(async () => {
        const ai = getAI();
        const prompt = `Act as a clinical psychologist and career counselor. Analyze these personality test responses: ${JSON.stringify(answers)}.
        Provide a detailed analysis using the Big Five framework. Return strict JSON.`;

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
                        summary: { type: Type.STRING },
                        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                        workStyle: { type: Type.STRING },
                        suggestedCareers: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["traits", "summary", "strengths", "workStyle", "suggestedCareers"]
                }
            }
        });
        // Fix: Use response.text property instead of method
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
        // Fix: Use response.text property instead of method
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
        // Fix: Use response.text property instead of method
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
        // Fix: Use response.text property instead of method
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
        // Fix: Use response.text property instead of method
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
        // Fix: Use response.text property instead of method
        return parseJSON(response.text, null);
    });
};

// Analyze skill gap for a target role
export const analyzeSkillGap = async (currentSkills: string, targetRole: string): Promise<SkillGapAnalysis | null> => {
    return withRetry(async () => {
        const ai = getAI();
        const prompt = `Analyze the skill gap between these current skills: [${currentSkills}] and the target role: "${targetRole}". 
        Evaluate match score, identify missing critical skills, mastered skills, and provide specific learning recommendations. Return JSON.`;

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
                        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["matchScore", "missingSkills", "masteredSkills", "recommendations"]
                }
            }
        });
        // Fix: Use response.text property instead of method
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
        // Fix: Use response.text property instead of method
        return response.text || "Keep practicing consistent projects in this area.";
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
        // Fix: Use response.text property instead of method
        return response.text || text;
    });
};

// Get tailored career recommendations based on user profile
export const getCareerRecommendations = async (profile: string): Promise<CareerRecommendation[]> => {
    return withRetry(async () => {
        const ai = getAI();
        const prompt = `Based on this user profile: "${profile}", suggest 5 ideal career paths. 
        For each, provide a title, match score (0-100), typical salary range, market outlook, reason for the match, and common job roles. Return JSON array.`;

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
                            jobRoles: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["title", "matchScore", "salaryRange", "outlook", "reason", "jobRoles"]
                    }
                }
            }
        });
        // Fix: Use response.text property instead of method
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
        // Fix: Use response.text property instead of method
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
        // Fix: Use response.text property instead of method
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
        // Fix: Use response.text property instead of method
        return parseJSON(response.text, null);
    });
};

// Find colleges for a specific field and country
export const findColleges = async (field: string, country: string): Promise<CollegeResult | null> => {
    return withRetry(async () => {
        const ai = getAI();
        const prompt = `Find top 10 domestic colleges in "${country}" and 10 top global colleges for studying "${field}". 
        For each college, provide ranking, location, description, website, contact, fees, ROI, placements, exams, and eligibility. Return JSON.`;

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
                courses: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["name", "ranking", "location", "description", "website", "contact", "fees", "roi", "placements", "exams", "cutoffs", "eligibility", "courses"]
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
        // Fix: Use response.text property instead of method
        return parseJSON(response.text, null);
    });
};

// Get salary insights for a specific role and location
export const getSalaryInsights = async (role: string, location: string): Promise<SalaryInsights | null> => {
    return withRetry(async () => {
        const ai = getAI();
        const prompt = `Provide detailed salary insights for the role: "${role}" in "${location}". 
        Include currency, current levels (Entry, Mid, Senior, Lead), 5-year future trends, market outlook, and rising/declining related roles. Return JSON.`;

        const response = await ai.models.generateContent({
            model: MODEL_PRO,
            contents: prompt,
            config: {
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
                        decliningRoles: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["role", "location", "currency", "currentLevels", "futureTrends", "marketOutlook", "risingRoles", "decliningRoles"]
                }
            }
        });
        // Fix: Use response.text property instead of method
        return parseJSON(response.text, null);
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
        // Fix: Use response.text property instead of method
        return response.text || "I'm having trouble connecting right now. How else can I help you?";
    });
};
