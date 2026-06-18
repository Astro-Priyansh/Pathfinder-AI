
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
  JOB_LISTINGS = 'JOB_LISTINGS',
  PROJECT_LAB = 'PROJECT_LAB',
  ROI_RUNWAY = 'ROI_RUNWAY',
  SETTINGS = 'SETTINGS',
}

export type BotPersonality = 'casual' | 'minimalist' | 'businessman' | 'professional' | 'friend' | 'guide';
export type ResponseType = 'faster' | 'normal' | 'professional';

export interface UserSettings {
  themePrimary: string;
  botPersonality: BotPersonality;
  responseType: ResponseType;
  isPro: boolean;
  animationsEnabled: boolean;
  dynamicThemeEnabled: boolean;
  themeSource?: 'manual' | 'personality' | 'career';
  region: string;
  uiStyle?: 'steampunk' | 'solarpunk' | 'modern' | 'futuristic';
  calendarConnections?: {
    local: boolean;
    google: boolean;
    calendly: boolean;
  };
}

export interface UserProfile {
  username: string;
  password?: string;
  email?: string;
  avatarUrl?: string;
  joinDate: string;
  firstName?: string;
  lastName?: string;
  gender?: 'Male' | 'Female' | 'Rather not say';
  dob?: string;
  securityQuestion?: string;
  securityAnswer?: string;
}

export interface PersonalityTrait {
  trait: string;
  score: number;
  description: string;
}

export interface PersonalityResult {
  traits: PersonalityTrait[];
  mbti?: string;
  summary: string;
  strengths: string[];
  weaknesses?: string[];
  workStyle: string;
  interactionStyle?: string;
  suggestedCareers: string[];
}

export interface RoadmapStep {
  title: string;
  description: string;
  duration: string;
  resources: string[];
  actions?: string[];
  completed?: boolean;
  iconHint?: string;
  courses?: { platform: string; title: string; url: string }[];
  books?: { title: string; author: string }[];
  tutorials?: { title: string; url: string }[];
  channels?: { platform: string; name: string; url: string }[];
}

export interface CareerRoadmap {
  targetRole: string;
  steps: RoadmapStep[];
  type?: 'standard' | 'advanced' | 'visual';
}

export interface SkillGapAnalysis {
  matchScore: number;
  missingSkills: string[];
  masteredSkills: string[];
  recommendations: string[];
  skillsData?: {
    skill: string;
    currentLevel: number;
    targetLevel: number;
    importance: string;
  }[];
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
  projects?: { title: string; subtitle?: string; duration?: string; description: string }[];
  certifications?: { name: string; issuer?: string; year?: string }[];
}

export interface CareerRecommendation {
  title: string;
  matchScore: number;
  salaryRange: string;
  outlook: string;
  reason: string;
  jobRoles: string[];
  skills?: string[];
  salaryProjections?: { year: string; salary: number }[];
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
  coopScore?: number;
  coopDetails?: {
    campusEmployment: string;
    coOpInternships: string;
    industryPartnerships: string;
    loanOffsetEstimate: string;
  };
  colIndex?: number;
  colDetails?: {
    rentIndex: number;
    grocIndex: number;
    transitIndex: number;
    annualEstRent: string;
    annualEstTotalCOL: string;
    livingContext: string;
  };
  alumniPipeline?: {
    industrySectors: { sector: string; percentage: number }[];
    topEmployers: string[];
    topRegions: string[];
    overview: string;
  };
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

export interface JobListing {
  title: string;
  company: string;
  location: string;
  url: string;
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
  trendingSkills: string[];
  jobListings: JobListing[];
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ProjectIdea {
  title: string;
  description: string;
  skillsAddressed: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  keyFeatures: string[];
  stepByStepGuide: string[];
  techStack: string[];
  whyThisProject: string;
}

export interface LifestylePreference {
  workLifeBalance: number; // 1-10
  travelTolerance: 'none' | 'medium' | 'high';
  incomePriority: 'low' | 'medium' | 'high';
  autonomy: number; // 1-10
  locationPref: 'remote' | 'hybrid' | 'onsite';
  salaryVsHoursVsFlex: { salary: number; hours: number; flexibility: number }; // 0-100 sum up
  lastCheckIn?: string;
  checkInHistory?: { date: string; workLifeBalance: number; autonomy: number; targetRole: string }[];
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
  projectIdeas: ProjectIdea[] | null;
  settings: UserSettings;
  lifestylePreferences?: LifestylePreference;
}

export interface PersonalizedCollegeQueryParams {
  fieldOfStudy: string;
  studyLevel: 'UG' | 'PG' | 'PhD';
  academicsGrade: string; // 12th percentage, CGPA, etc.
  entranceExamsChecked: string[]; // Exams the user gave/will give
  entranceScores: string; // Score achieved/expected
  annualBudget: string; // Budget limit string
  scholarshipNeeded: 'High' | 'Medium' | 'Low';
  campusLifePreferences: string[]; // Multi-selectable options
  hostelNeeded: boolean;
  locationPreference: string; // Country or regional preference
  mattersMostPriorities: string[]; // Placements, Research, High ROI, MNC connections, Campus facilities, Alumni Network
  institutionTypes: string[]; // Public, Private, Liberal Arts, Technical
  rankingPreference: 'QS World' | 'Times Higher Education' | 'US News' | 'NIRF / Domestic' | 'No preference';
  personalPreferences: string; // Open-form text of extra requirements
}

export interface PersonalizedCollege extends College {
  fitScore: number; // 0-100 indicating match score
  fitReasons: string[]; // reasons like "Matches your GRE of 320", "Fully within budget", etc.
  scholarshipOpportunities: string; // details about scholarships available
  hostelFacilities: string; // information about campus housing
  campusLifeDetails: string; // description of the social/campus atmosphere
  overallRating?: number; // float rating 1.0 - 5.0
  institutionType?: string; // e.g. "Public", "Private", etc.
}

export interface PersonalizedCollegeResult {
  query: PersonalizedCollegeQueryParams;
  matchedColleges: PersonalizedCollege[];
  colleges?: PersonalizedCollege[];
  analysisOverview?: string;
}

export interface InDemandIndustry {
  name: string;
  reason: string;
  growthRate: string;
  topJobs: string[];
}


