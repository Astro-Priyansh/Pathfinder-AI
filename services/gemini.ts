
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
    DietPlan
} from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_FAST = 'gemini-2.5-flash';

// Helper to parse JSON safely
const parseJSON = <T>(text: string | undefined, fallback: T): T => {
    if (!text) return fallback;
    try {
        return JSON.parse(text) as T;
    } catch (e) {
        console.error("JSON Parse Error", e);
        // Attempt to clean markdown code blocks
        const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
        try {
            return JSON.parse(cleaned) as T;
        } catch (e2) {
            return fallback;
        }
    }
};

export const analyzePersonality = async (answers: { question: string; answer: string }[]): Promise<PersonalityResult | null> => {
    const ai = getAI();
    const prompt = `Act as a clinical psychologist and expert career counselor. Analyze the following Big Five personality test answers to create a highly accurate and nuanced profile.
    
    User Answers: ${JSON.stringify(answers)}
    
    Task:
    1. Evaluate the user on the Big Five traits (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism) based on their responses.
    2. Provide a 'score' (0-100) and a deep, insightful 'description' for each trait.
    3. Generate an 'executive summary' of their personality archetype (e.g., "The Innovative Architect" or "The Empathetic Diplomat").
    4. Identify 3-5 core 'strengths' applicable to a professional setting.
    5. Describe their ideal 'workStyle' (e.g., environment, team dynamics, management preference).
    6. Suggest 5-7 distinct 'suggestedCareers' that scientifically align with this personality profile.
    
    Return strict JSON.`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        traits: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { trait: { type: Type.STRING }, score: { type: Type.NUMBER }, description: { type: Type.STRING } } } },
                        summary: { type: Type.STRING },
                        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                        workStyle: { type: Type.STRING },
                        suggestedCareers: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        return parseJSON(response.text, null);
    } catch (e) {
        console.error("Gemini Error:", e);
        return null;
    }
};

export const analyzeInterests = async (input: string): Promise<InterestAnalysis | null> => {
    const ai = getAI();
    const prompt = `Act as a career strategist. Analyze the following hobbies and interests to uncover underlying motivations and professional applications.
    
    User Interests: "${input}"
    
    Task:
    1. Identify broader 'categories' or themes (e.g., "Visual Storytelling", "Strategic Analysis", "Community Building").
    2. Suggest specific 'careers' that combine these interests.
       - 'title': Standard job title.
       - 'matchReason': Explain specifically HOW the user's hobbies translate to skills in this role.
    
    Return strict JSON.`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        categories: { type: Type.ARRAY, items: { type: Type.STRING } },
                        careers: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, matchReason: { type: Type.STRING } } } }
                    }
                }
            }
        });
        return parseJSON(response.text, null);
    } catch (e) {
        console.error("Gemini Error:", e);
        return null;
    }
};

export const getInterestDevelopmentTips = async (interest: string): Promise<InterestDevelopmentPlan | null> => {
    const ai = getAI();
    const prompt = `Create a structured, step-by-step roadmap for a beginner to master the interest/skill: "${interest}".
    
    Output requirements:
    - 'introduction': A motivating overview of why this skill is valuable.
    - 'steps': A chronological list of actionable steps (e.g., "Week 1: Learn X", "Month 1: Build Y").
    - 'resources': Specific types of resources (e.g., "Course: [Name]", "Book: [Title]", "Community: [Name]").
    
    Return strict JSON.`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
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
                    }
                }
            }
        });
        return parseJSON(response.text, null);
    } catch (e) {
        console.error("Gemini Error:", e);
        return null;
    }
};

export const generateRoadmap = async (currentRole: string, targetRole: string): Promise<CareerRoadmap | null> => {
    const ai = getAI();
    const prompt = `Create a realistic career roadmap to go from "${currentRole}" to "${targetRole}".
    
    Task:
    Provide 5-7 chronological steps. For each step:
    - 'title': Milestone name (e.g., "Gain Junior Certification").
    - 'description': What to learn or achieve.
    - 'duration': Estimated time (e.g., "3-6 months").
    - 'resources': Key courses, certifications, or projects.
    
    Return strict JSON.`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
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
                                } 
                            } 
                        }
                    }
                }
            }
        });
        return parseJSON(response.text, null);
    } catch (e) {
        console.error("Gemini Error:", e);
        return null;
    }
};

export const generateAdvancedRoadmap = async (currentRole: string, targetRole: string): Promise<CareerRoadmap | null> => {
    const ai = getAI();
    const prompt = `Create a highly detailed, executive-level career roadmap from "${currentRole}" to "${targetRole}".
    
    Task:
    Provide 5-7 strategic steps. For each step:
    - 'title': Milestone name.
    - 'description': Strategic focus.
    - 'duration': Realistic timeline.
    - 'resources': Advanced certifications, executive education, or influential books.
    - 'actions': Specific, granular actions (e.g., "Lead a cross-functional team of 5", "Speak at X conference").
    
    Return strict JSON.`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
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
                                    resources: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    actions: { type: Type.ARRAY, items: { type: Type.STRING } }
                                } 
                            } 
                        }
                    }
                }
            }
        });
        return parseJSON(response.text, null);
    } catch (e) {
        console.error("Gemini Error:", e);
        return null;
    }
};

export const generateSimulationTurn = async (role: string, context: string, userAction: string): Promise<SimulationTurn | null> => {
    const ai = getAI();
    const prompt = `You are a Career Simulation Engine.
    Role: ${role}.
    Current State: ${context}.
    User Action: ${userAction}.
    
    Task:
    1. Determine the consequence of the user's action. Did it succeed? Fail? Have a tradeoff?
    2. Advance the timeline realistically.
    3. Generate the next 'scenario' (a challenge or opportunity).
    4. Provide 2-4 distinct 'options' for the user to respond with.
    
    Return strict JSON.`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        scenario: { type: Type.STRING },
                        title: { type: Type.STRING },
                        year: { type: Type.NUMBER },
                        options: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT, 
                                properties: { 
                                    text: { type: Type.STRING }, 
                                    outcomePreview: { type: Type.STRING } 
                                } 
                            } 
                        }
                    }
                }
            }
        });
        return parseJSON(response.text, null);
    } catch (e) {
        console.error("Gemini Error:", e);
        return null;
    }
};

export const analyzeSkillGap = async (currentSkills: string, targetRole: string): Promise<SkillGapAnalysis | null> => {
    const ai = getAI();
    const prompt = `Analyze the skill gap for a professional aiming to be a "${targetRole}".
    Current Skills Provided: ${currentSkills}.
    
    Task:
    1. Estimate a 'matchScore' (0-100) based on industry standards for ${targetRole}.
    2. Identify 'missingSkills': Critical hard/soft skills the user lacks.
    3. Identify 'masteredSkills': Skills the user already lists that fit the role.
    4. Provide 'recommendations': Specific advice on how to bridge the gap (projects, courses).
    
    Return strict JSON.`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
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
                    }
                }
            }
        });
        return parseJSON(response.text, null);
    } catch (e) {
        console.error("Gemini Error:", e);
        return null;
    }
};

export const getSkillAdvice = async (skill: string, currentLevel: number): Promise<string> => {
    const ai = getAI();
    const prompt = `Act as a senior mentor. The user has a skill level of ${currentLevel}/100 in "${skill}".
    Provide one paragraph of concise, high-impact advice to reach the next level. 
    If beginner, suggest foundations. If intermediate, suggest projects. If advanced, suggest teaching or niche specialization.`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: prompt,
        });
        return response.text?.trim() || "Practice regularly and seek feedback.";
    } catch (e) {
        console.error("Gemini Error:", e);
        return "Keep practicing.";
    }
};

export const optimizeResumeSection = async (section: string, text: string): Promise<string> => {
    const ai = getAI();
    const prompt = `You are a professional resume writer (CPRW certified). 
    Optimize the following "${section}" of a resume.
    
    Original Text: "${text}"
    
    Guidelines:
    - Use strong action verbs.
    - Implement the "Google XYZ Formula" (Accomplished [X] as measured by [Y], by doing [Z]) where possible.
    - Remove fluff and passive voice.
    - Keep it concise and impactful.
    
    Return ONLY the rewritten text.`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: prompt,
        });
        return response.text?.trim() || text;
    } catch (e) {
        console.error("Gemini Error:", e);
        return text;
    }
};

export const getCareerRecommendations = async (profile: string): Promise<CareerRecommendation[]> => {
    const ai = getAI();
    const prompt = `Act as a global talent acquisition specialist. Based on the following user profile, recommend the top 3-5 career paths.
    
    User Profile:
    ${profile}
    
    For each recommendation, provide:
    - 'title': Job Title.
    - 'matchScore': 0-100 relevance.
    - 'salaryRange': Realistic entry-to-mid level salary (mention currency).
    - 'outlook': Market demand (e.g., "Growing", "Stable", "Competitive").
    - 'reason': A specific explanation of why this fits their personality, interests, and skills.
    - 'jobRoles': 3 specific roles within this field.
    
    Return strict JSON.`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
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
                        }
                    }
                }
            }
        });
        return parseJSON(response.text, []);
    } catch (e) {
        console.error("Gemini Error:", e);
        return [];
    }
};

export const getDailyRoutine = async (targetCareer: string): Promise<DailyRoutine | null> => {
    const ai = getAI();
    const prompt = `Design a high-performance daily routine for an aspiring "${targetCareer}".
    
    Task:
    1. Create a time-blocked 'schedule' that balances deep work, skill acquisition, health, and rest.
    2. Suggest 'habits' specific to success in this career (e.g., "Code Review" for Devs, "Reading Markets" for Traders).
    3. Categorize activities correctly (Work, Health, Learning, Rest).
    4. Provide actionable 'tips' for adherence.
    
    Return strict JSON.`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
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
                                    category: { type: Type.STRING, enum: ['Work', 'Health', 'Learning', 'Rest'] } 
                                } 
                            } 
                        },
                        habits: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT, 
                                properties: { 
                                    name: { type: Type.STRING }, 
                                    type: { type: Type.STRING, enum: ['health', 'productivity', 'learning'] },
                                    duration: { type: Type.STRING },
                                    benefit: { type: Type.STRING }
                                } 
                            } 
                        },
                        tips: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        return parseJSON(response.text, null);
    } catch (e) {
        console.error("Gemini Error:", e);
        return null;
    }
};

export const getExercisePlan = async (goal: string): Promise<ExercisePlan | null> => {
    const ai = getAI();
    const prompt = `Create a scientifically structured weekly exercise plan for the goal: "${goal}".
    
    Task:
    1. 'weeklySchedule': Outline split (e.g., Push/Pull/Legs or Upper/Lower) with rest days.
    2. 'exercises': Key compound and isolation movements with set/rep ranges suitable for the goal.
    3. 'nutritionTips': Pre/post-workout nutrition advice.
    
    Return strict JSON.`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
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
                                } 
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
                                } 
                            } 
                        },
                        nutritionTips: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        return parseJSON(response.text, null);
    } catch (e) {
        console.error("Gemini Error:", e);
        return null;
    }
};

export const getDietPlan = async (bmi: number, routine: DailyRoutine, fitness: ExercisePlan) => {
  const ai = getAI();
  const prompt = `Create a personalized, healthy diet plan.
  
  User Data:
  - BMI: ${bmi.toFixed(1)}
  - Fitness Goal: ${fitness.goal}
  - Career Lifestyle: ${routine.targetCareer}
  
  Task:
  1. Calculate estimated daily calorie needs and macronutrient split (Protein/Carb/Fat).
  2. Provide two meal plans (Vegetarian & Mixed).
  3. Ensure meals are nutritious, whole-food based, and support the fitness goal.
  4. 'hydration': Specific water intake recommendation.
  5. 'explanation': Why this specific macro split suits their goal.
  
  Return strict JSON.`;

  try {
      const response = await ai.models.generateContent({
          model: MODEL_FAST,
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
                          }
                      },
                      vegetarian: {
                          type: Type.OBJECT,
                          properties: {
                              breakfast: { 
                                  type: Type.ARRAY, 
                                  items: { 
                                      type: Type.OBJECT, 
                                      properties: { item: { type: Type.STRING }, optional: { type: Type.BOOLEAN } } 
                                  } 
                              },
                              lunch: { 
                                type: Type.ARRAY, 
                                items: { 
                                    type: Type.OBJECT, 
                                    properties: { item: { type: Type.STRING }, optional: { type: Type.BOOLEAN } } 
                                } 
                              },
                              snack: { 
                                type: Type.ARRAY, 
                                items: { 
                                    type: Type.OBJECT, 
                                    properties: { item: { type: Type.STRING }, optional: { type: Type.BOOLEAN } } 
                                } 
                              },
                              dinner: { 
                                type: Type.ARRAY, 
                                items: { 
                                    type: Type.OBJECT, 
                                    properties: { item: { type: Type.STRING }, optional: { type: Type.BOOLEAN } } 
                                } 
                              }
                          }
                      },
                      mixed: {
                          type: Type.OBJECT,
                          properties: {
                              breakfast: { 
                                  type: Type.ARRAY, 
                                  items: { 
                                      type: Type.OBJECT, 
                                      properties: { item: { type: Type.STRING }, optional: { type: Type.BOOLEAN } } 
                                  } 
                              },
                              lunch: { 
                                type: Type.ARRAY, 
                                items: { 
                                    type: Type.OBJECT, 
                                    properties: { item: { type: Type.STRING }, optional: { type: Type.BOOLEAN } } 
                                } 
                              },
                              snack: { 
                                type: Type.ARRAY, 
                                items: { 
                                    type: Type.OBJECT, 
                                    properties: { item: { type: Type.STRING }, optional: { type: Type.BOOLEAN } } 
                                } 
                              },
                              dinner: { 
                                type: Type.ARRAY, 
                                items: { 
                                    type: Type.OBJECT, 
                                    properties: { item: { type: Type.STRING }, optional: { type: Type.BOOLEAN } } 
                                } 
                              }
                          }
                      },
                      hydration: { type: Type.STRING },
                      explanation: { type: Type.STRING }
                  }
              }
          }
      });

      const parsed = parseJSON<any>(response.text, {});
      return {
          bmi: parsed.bmi || bmi,
          bmiCategory: parsed.bmiCategory || "Unknown",
          calories: parsed.calories || "2000 kcal",
          macros: parsed.macros || { protein: "0g", carbs: "0g", fats: "0g" },
          vegetarian: parsed.vegetarian || { breakfast: [], lunch: [], snack: [], dinner: [] },
          mixed: parsed.mixed || { breakfast: [], lunch: [], snack: [], dinner: [] },
          hydration: parsed.hydration || "Drink water.",
          explanation: parsed.explanation || "Balanced diet."
      } as DietPlan;
  } catch (e) {
      console.error("Gemini Error:", e);
      return null;
  }
};

export const findColleges = async (field: string, country: string): Promise<CollegeResult> => {
  const ai = getAI();
  const prompt = `Act as an educational consultant. List top colleges for "${field}".
  
  Scope:
  - 10 Top Colleges in ${country} (Domestic).
  - 10 Top Colleges Globally (excluding ${country}) (Foreign).
  
  Data Quality Requirements:
  - 'ranking': Current authoritative ranking (e.g., QS, THE, NIRF).
  - 'fees': Annual tuition in ${country === 'Global' ? 'USD' : 'Local Currency'}.
  - 'placements': Specific stats (Average Salary, Placement %).
  - 'roi': Assessment of Return on Investment (High/Med/Low) with reasoning.
  - 'exams': Accepted entrance exams.
  
  Return strict JSON.`;

  try {
      const response = await ai.models.generateContent({
          model: MODEL_FAST,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                  field: { type: Type.STRING },
                  domestic: {
                      type: Type.ARRAY,
                      items: {
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
                          }
                      }
                  },
                  foreign: {
                    type: Type.ARRAY,
                    items: {
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
                        }
                    }
                }
              }
            }
          }
        });
      
        const parsed = parseJSON<any>(response.text, {});
        return {
            field: parsed.field || field,
            domestic: parsed.domestic || [],
            foreign: parsed.foreign || [],
            country: country
        } as CollegeResult;
  } catch (e) {
      console.error("Gemini Error:", e);
      return { field: field, domestic: [], foreign: [], country };
  }
};

export const getSalaryInsights = async (role: string, location: string = "Global"): Promise<SalaryInsights | null> => {
  const ai = getAI();
  const prompt = `Act as a compensation analyst. Analyze market salary data for the role of "${role}" in "${location}".
  
  Task:
  1. 'currency': Determine the standard currency for ${location} (e.g., USD, INR, EUR, GBP).
  2. 'currentLevels': Provide Min, Max, and Average annual salary for Entry, Intermediate, Expert, and Professional levels.
  3. 'futureTrends': Predict salary trends for the next 5 years based on inflation and industry growth.
  4. 'marketOutlook': A professional assessment of job security and demand.
  5. 'risingRoles' / 'decliningRoles': Related job titles gaining or losing traction.
  
  Return strict JSON.`;

  try {
      const response = await ai.models.generateContent({
          model: MODEL_FAST,
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
                              level: { type: Type.STRING, enum: ['Entry Level', 'Intermediate', 'Expert', 'Professional'] },
                              min: { type: Type.NUMBER },
                              max: { type: Type.NUMBER },
                              average: { type: Type.NUMBER }
                          }
                      }
                  },
                  futureTrends: {
                      type: Type.ARRAY,
                      items: {
                          type: Type.OBJECT,
                          properties: {
                              year: { type: Type.NUMBER },
                              salary: { type: Type.NUMBER }
                          }
                      }
                  },
                  marketOutlook: { type: Type.STRING },
                  risingRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
                  decliningRoles: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          }
        });
      
        return parseJSON<SalaryInsights | null>(response.text, null);
  } catch (e) {
      console.error("Gemini Error:", e);
      return null;
  }
};

export const getChatResponse = async (history: ChatMessage[], message: string) => {
  const ai = getAI();
  
  // Construct context from recent history to keep it stateless but context-aware
  const context = history.slice(-6).map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`).join('\n');
  
  const prompt = `You are "Pathfinder AI", an empathetic, intelligent, and highly knowledgeable career counselor.
  
  Your Goals:
  1. Encourage the user.
  2. Provide actionable, concise advice.
  3. If asked about features, guide them to the specific tools in the app (e.g., "Check out the Skill Gap tool for that").
  
  Tone: Professional yet warm.
  
  Recent Conversation Context:
  ${context}
  
  User's New Message: "${message}"
  
  Respond directly to the user.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
    });
    return response.text?.trim() || "I'm having trouble processing that right now.";
  } catch (e) {
    console.error("Chat Error:", e);
    return "Sorry, I am unable to connect to the server right now.";
  }
};
