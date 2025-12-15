
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  PERSONALITY = 'PERSONALITY',
  INTERESTS = 'INTERESTS',
  SKILL_GAP = 'SKILL_GAP',
  ROADMAP = 'ROADMAP',
  RESUME_BUILDER = 'RESUME_BUILDER',
  CAREER_RECOMMENDER = 'CAREER_RECOMMENDER',
  HABIT_ENHANCER = 'HABIT_ENHANCER',
  COLLEGE_FINDER = 'COLLEGE_FINDER',
  SALARY_PREDICTOR = 'SALARY_PREDICTOR',
}

export interface UserProfile {
  username: string;
  password?: string;
  email?: string;
  avatarUrl?: string;
  joinDate: string;
}

export interface PersonalityTrait {
  trait: string;
  score: number;
  description: string;
}

export interface PersonalityResult {
  traits: PersonalityTrait[];
  summary: string;
  strengths: string[];
  workStyle: string;
  suggestedCareers: string[];
}

export interface RoadmapStep {
  title: string;
  description: string;
  duration: string;
  resources: string[];
  actions?: string[];
}

export interface CareerRoadmap {
  targetRole: string;
  steps: RoadmapStep[];
  type?: 'standard' | 'advanced';
}

export interface SkillGapAnalysis {
  matchScore: number;
  missingSkills: string[];
  masteredSkills: string[];
  recommendations: string[];
}

export interface SkillProficiency {
  skill: string;
  level: number;
  targetLevel: number;
  advice: string;
  lastUpdated: string;
}

export interface InterestAnalysis {
  categories: string[];
  careers: {
    title: string;
    matchReason: string;
  }[];
}

export interface InterestDevelopmentPlan {
  interest: string;
  introduction: string;
  steps: string[];
  resources: string[];
}

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  summary: string;
  experience: { role: string; company: string; duration: string; description: string }[];
  education: { degree: string; school: string; year: string }[];
  skills: string[];
}

export interface CareerRecommendation {
  title: string;
  matchScore: number;
  salaryRange: string;
  outlook: string;
  reason: string;
  jobRoles: string[];
}

export interface SimulationTurn {
  scenario: string;
  options: {
    text: string;
    outcomePreview?: string;
  }[];
  year: number;
  title: string;
}

export interface HabitItem {
  name: string;
  type: 'health' | 'productivity' | 'learning';
  duration: string;
  benefit: string;
}

export interface DailyRoutine {
  targetCareer: string;
  schedule: { time: string; activity: string; category: string }[];
  habits: HabitItem[];
  tips: string[];
}

export interface ExercisePlan {
  goal: string;
  weeklySchedule: { day: string; workout: string; duration: string }[];
  exercises: { name: string; sets: string; reps: string; tips: string }[];
  nutritionTips: string[];
}

export interface MealItem {
  item: string;
  optional: boolean;
  calories?: string;
}

export interface DietPlan {
  bmi: number;
  bmiCategory: string;
  calories: string;
  macros: { protein: string; carbs: string; fats: string };
  vegetarian: {
    breakfast: MealItem[];
    lunch: MealItem[];
    snack: MealItem[];
    dinner: MealItem[];
  };
  mixed: {
    breakfast: MealItem[];
    lunch: MealItem[];
    snack: MealItem[];
    dinner: MealItem[];
  };
  hydration: string;
  explanation: string;
}

export interface College {
  name: string;
  ranking: string;
  location: string;
  description: string;
  website: string;
  contact: string;
  fees: string;
  roi: string;
  placements: string;
  exams: string[];
  cutoffs: string;
  eligibility: string;
  courses: string[];
}

export interface CollegeResult {
  field: string;
  domestic: College[];
  foreign: College[];
  country: string;
}

export interface SalaryLevel {
  level: string;
  min: number;
  max: number;
  average: number;
}

export interface SalaryTrend {
  year: number;
  salary: number;
}

export interface SalaryInsights {
  role: string;
  location: string;
  currency: string;
  currentLevels: SalaryLevel[];
  futureTrends: SalaryTrend[];
  marketOutlook: string;
  risingRoles: string[];
  decliningRoles: string[];
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface UserState {
  name: string;
  country: string;
  personalityResult: PersonalityResult | null;
  roadmap: CareerRoadmap | null;
  skillGap: SkillGapAnalysis | null;
  skillTracker: SkillProficiency[] | null;
  interestAnalysis: InterestAnalysis | null;
  resume: ResumeData | null;
  recommendations: CareerRecommendation[] | null;
  targetCareer: string | null;
  habitRoutine: DailyRoutine | null;
  exercisePlan: ExercisePlan | null;
  dietPlan: DietPlan | null;
  collegeResults: CollegeResult | null;
  salaryInsights: SalaryInsights | null;
}
