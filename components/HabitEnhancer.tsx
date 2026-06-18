
import React, { useState, useEffect, useMemo } from 'react';
import { DailyRoutine, ExercisePlan, DietPlan, MealItem, UserSettings, UserState, LifestylePreference } from '../types';
import { getDailyRoutine, getExercisePlan, getDietPlan } from '../services/gemini';
import { Loader2, Coffee, Sun, Moon, Briefcase, Heart, Activity, Dumbbell, Calendar, Apple, ChevronRight, Trash2, Plus, CheckCircle2, Circle, Clock, Zap, Utensils, Droplets, Scale, Lock, Flame, Check, Sparkles, Sprout, Drumstick, RefreshCw, CalendarDays, Compass, Sliders, RotateCcw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const LOCAL_EXERCISES: Record<string, { name: string; reps: string; sets: string; tips: string }[]> = {
  Chest: [
    { name: "Incline Barbell Bench Press", sets: "4", reps: "8-12", tips: "Keep shoulders retracted, focus on upper chest contraction." },
    { name: "Flat Dumbbell Press", sets: "3", reps: "10-12", tips: "Lower smoothly to chest level, push up without locking elbows." },
    { name: "Dumbbell Flyes", sets: "3", reps: "12-15", tips: "Slight bend in elbows, feel the stretch in your pectorals." },
  ],
  Shoulders: [
    { name: "Overhead Dumbbell Press", sets: "4", reps: "8-10", tips: "Keep brace engaged, extend arms fully at the top." },
    { name: "Lateral Raises", sets: "4", reps: "12-15", tips: "Lead with your elbows, slightly lean forward, keep trap involvement low." },
    { name: "Rear Delt Flyes", sets: "3", reps: "15", tips: "Focus on pulling with your elbows outward, squeeze rear delts." },
  ],
  Biceps: [
    { name: "Standing Barbell Curls", sets: "4", reps: "8-12", tips: "Minimize body momentum, squeeze elbows to sides." },
    { name: "Hammer Curls", sets: "3", reps: "10-12", tips: "Keep palms facing each other to target brachialis and forearms." },
    { name: "Incline Dumbbell Curl", sets: "3", reps: "12", tips: "Keep shoulders back, maximize stretch at bottom." },
  ],
  Triceps: [
    { name: "Tricep Pushdowns (Rope)", sets: "4", reps: "12-15", tips: "Spread the rope at the bottom, lock elbows at sides." },
    { name: "Overhead Dumbbell Extension", sets: "3", reps: "10-12", tips: "Keep elbows pointed forward, lower weight behind neck safely." },
    { name: "Close-Grip Bench Press", sets: "3", reps: "8-10", tips: "Keep grip shoulder-width, lower bar to mid-chest." },
  ],
  Abs: [
    { name: "Hanging Leg Raises", sets: "3", reps: "12-15", tips: "Control the descent, do not swing, pull hips up." },
    { name: "Plank Hold", sets: "3", reps: "60 seconds", tips: "Engage glutes and core, keep body parallel to floor." },
    { name: "Weighted Ab Crunches", sets: "3", reps: "15", tips: "Focus on curling the spine, squeeze upper abdominals." },
  ],
  Quads: [
    { name: "Barbell Back Squats", sets: "4", reps: "6-10", tips: "Go parallel or below, keep chest up, push through heels." },
    { name: "Bulgarian Split Squats", sets: "3", reps: "10-12 per leg", tips: "Focus load on front heel, torso slightly forward for glute bias." },
    { name: "Leg Press", sets: "3", reps: "10-12", tips: "Do not lock out knees at top, lower under control." },
  ],
  Hamstrings: [
    { name: "Romanian Deadlifts (RDLs)", sets: "4", reps: "8-12", tips: "Hinge at hips, push glutes back, feel deep stretch in hamstrings." },
    { name: "Lying Leg Curls", sets: "3", reps: "10-12", tips: "Keep hips on pad, squeeze hamstrings at peak contraction." },
    { name: "Kettlebell Swings", sets: "3", reps: "15-20", tips: "Explosive hip hinge driving the bell forward using glutes." },
  ],
  Glutes: [
    { name: "Barbell Hip Thrusts", sets: "4", reps: "8-12", tips: "Tuck chin, squeeze glutes hard at the top with a 1-sec hold." },
    { name: "Sumo Squats", sets: "3", reps: "10-12", tips: "Wide stance, toes pointed outwards, push up from heels." },
    { name: "Glute Kickbacks", sets: "3", reps: "15 per leg", tips: "Kick straight back, focus completely on glute contraction." },
  ],
  Back: [
    { name: "Pull-Ups / Lat Pulldown", sets: "4", reps: "8-12", tips: "Pull elbows down, puff chest out to meet the bar." },
    { name: "Bent-Over Barbell Rows", sets: "4", reps: "8-10", tips: "Keep back straight, pull bar to waist level." },
    { name: "Seated Cable Rows", sets: "3", reps: "10-12", tips: "Squeeze shoulder blades together, let weight stretch lats." },
  ],
  Calves: [
    { name: "Standing Calf Raises", sets: "4", reps: "15-20", tips: "Go all the way down, pause, then explode on tiptoes." },
    { name: "Seated Calf Raises", sets: "3", reps: "15", tips: "Slow stretch at bottom, squeeze soleus muscle at peak." },
  ],
  Neck: [
    { name: "Weighted Neck Extensions", sets: "3", reps: "15-20", tips: "Use a head harness or plate with towel, extend chin smoothly up." },
    { name: "Isometric Neck Holds", sets: "3", reps: "30 seconds", tips: "Apply gentle pressure with hands, resist neck motion strictly." },
    { name: "Dumbbell Shrugs (Upper Traps)", sets: "4", reps: "12-15", tips: "Lift shoulders straight up to ears, squeeze and hold 1 sec." },
  ],
  Forearms: [
    { name: "Barbell Wrist Curls (Palms Up)", sets: "4", reps: "15-20", tips: "Rest forearms on bench, allow bar to roll to fingertips." },
    { name: "Reverse Grip Barbell Curls", sets: "3", reps: "12", tips: "Targets pronator and brachioradialis, control the descent." },
    { name: "Dead Hangs / Farmer's Carry", sets: "3", reps: "60 seconds / max", tips: "Squeeze bar intensely, depress scapula, build robust raw grip." },
  ],
  Wrist: [
    { name: "Wrist Rollers (Extension/Flexion)", sets: "3", reps: "3 rolls up/down", tips: "Keep shoulders locked, drive rollers entirely from movement of wrists." },
    { name: "Plate Pinches", sets: "3", reps: "45 seconds", tips: "Pinch two smooth plates back-to-back using fingertips only." },
    { name: "Behind-the-Back Wrist Flexions", sets: "3", reps: "15", tips: "Stand tall, hold barbell behind glutes, flex wrists upward." },
  ],
  Feet: [
    { name: "Towel Grab Toe Flexions", sets: "3", reps: "20 reps", tips: "Spread feet flat, scrunch and pull a dry towel with toes." },
    { name: "Ankle Band Resisted Inversion", sets: "3", reps: "15", tips: "Attach resistance band to anchor, flex ankle inwards safely." },
    { name: "Single-Leg Balance Board / Flat Balance", sets: "3", reps: "45 seconds", tips: "Stand on one leg, focus ankle micro-corrections for balance." },
  ],
  Obliques: [
    { name: "Russian Twists with Weight", sets: "3", reps: "15 per side", tips: "Lean back 45 degrees, rotate torso completely rather than just hands." },
    { name: "Hanging Side Knee Raises", sets: "3", reps: "12 per side", tips: "Pull knees up diagonally to ribs, squeeze lateral torso." },
    { name: "Cable Woodchoppers", sets: "3", reps: "12 per side", tips: "Pull diagonally across body, pivot back foot, rotate hips." },
  ],
};

const PathsByGender = {
  Male: {
    front: {
      head: "M 80,30 m -14,0 a 14,14 0 1,1 28,0 a 14,14 0 1,1 -28,0",
      neck: "M 74,40 L 86,40 L 86,48 L 74,48 Z",
      shoulders_l: "M 72,48 C 60,48 46,51 40,65 C 38,72 40,78 46,78 L 52,68 Z",
      shoulders_r: "M 88,48 C 100,48 114,51 120,65 C 122,72 120,78 114,78 L 108,68 Z",
      chest_l: "M 78,54 L 52,58 C 50,78 60,88 78,88 Z",
      chest_r: "M 82,54 L 108,58 C 110,78 100,88 82,88 Z",
      abs: "M 56,90 L 104,90 L 96,146 L 64,146 Z",
      obliques_l: "M 52,90 L 56,90 L 64,146 L 58,146 Z",
      obliques_r: "M 108,90 L 104,90 L 96,146 L 102,146 Z",
      biceps_l: "M 38,68 C 28,78 28,96 34,104 L 44,98 L 44,74 Z",
      biceps_r: "M 122,68 C 132,78 132,96 126,104 L 116,98 L 116,74 Z",
      forearms_l: "M 34,104 C 28,114 26,128 32,138 L 40,132 L 44,98 Z",
      forearms_r: "M 126,104 C 132,114 134,128 128,138 L 120,132 L 116,98 Z",
      wrists_l: "M 32,138 L 31,146 L 39,144 L 40,132 Z",
      wrists_r: "M 128,138 L 129,146 L 121,144 L 120,132 Z",
      hands_l: "M 31,146 C 29,152 31,156 34,160 L 39,154 L 39,144 Z",
      hands_r: "M 129,146 C 131,152 129,156 126,160 L 121,154 L 121,144 Z",
      quads_l: "M 62,150 L 46,155 L 50,220 L 64,220 Z",
      quads_r: "M 98,150 L 114,155 L 110,220 L 96,220 Z",
      calves_l: "M 50,226 L 42,265 L 52,285 L 56,226 Z",
      calves_r: "M 110,226 L 118,265 L 108,285 L 104,226 Z",
      feet_l: "M 42,265 L 34,295 C 34,298 44,298 52,295 L 52,285 Z",
      feet_r: "M 118,265 L 126,295 C 126,298 116,298 108,295 L 108,285 Z",
    },
    back: {
      head: "M 80,30 m -14,0 a 14,14 0 1,1 28,0 a 14,14 0 1,1 -28,0",
      neck: "M 74,40 L 86,40 L 86,44 L 74,44 Z",
      traps: "M 70,44 L 90,44 L 104,62 L 56,62 Z",
      lats_l: "M 52,64 L 78,64 L 76,110 L 56,104 Z",
      lats_r: "M 108,64 L 82,64 L 84,110 L 104,104 Z",
      triceps_l: "M 38,68 C 30,78 30,96 34,104 L 44,98 Z",
      triceps_r: "M 122,68 C 130,78 130,96 126,104 L 116,98 Z",
      forearms_l: "M 34,104 C 28,114 26,128 32,138 L 40,132 L 44,98 Z",
      forearms_r: "M 126,104 C 132,114 134,128 128,138 L 120,132 L 116,98 Z",
      wrists_l: "M 32,138 L 31,146 L 39,144 L 40,132 Z",
      wrists_r: "M 128,138 L 129,146 L 121,144 L 120,132 Z",
      hands_l: "M 31,146 C 29,152 31,156 34,160 L 39,154 L 39,144 Z",
      hands_r: "M 129,146 C 131,152 129,156 126,160 L 121,154 L 121,144 Z",
      glutes: "M 56,112 L 104,112 C 112,138 102,154 80,154 C 58,154 48,138 56,112 Z",
      hamstrings_l: "M 62,156 L 46,162 L 50,220 L 64,220 Z",
      hamstrings_r: "M 98,156 L 114,162 L 110,220 L 96,220 Z",
      calves_l: "M 50,226 L 42,265 L 52,285 L 56,226 Z",
      calves_r: "M 110,226 L 118,265 L 108,285 L 104,226 Z",
      feet_l: "M 42,265 L 34,295 C 34,298 44,298 52,295 L 52,285 Z",
      feet_r: "M 118,265 L 126,295 C 126,298 116,298 108,295 L 108,285 Z",
    }
  },
  Female: {
    front: {
      head: "M 80,30 m -12,0 a 12,12 0 1,1 24,0 a 12,12 0 1,1 -24,0",
      neck: "M 75,38 L 85,38 L 85,46 L 75,46 Z",
      shoulders_l: "M 73,46 C 63,46 52,48 44,60 Q 42,65 47,68 L 52,60 Z",
      shoulders_r: "M 87,46 C 97,46 108,48 116,60 Q 118,65 113,68 L 108,60 Z",
      chest_l: "M 78,54 L 54,58 C 50,74 58,82 78,82 Z",
      chest_r: "M 82,54 L 106,58 C 110,74 102,82 82,82 Z",
      abs: "M 58,84 L 102,84 L 92,142 L 68,142 Z",
      obliques_l: "M 54,84 L 58,84 L 68,142 L 62,142 Z",
      obliques_r: "M 106,84 L 102,84 L 92,142 L 98,142 Z",
      biceps_l: "M 42,62 C 34,70 32,88 38,96 L 46,90 L 46,68 Z",
      biceps_r: "M 118,62 C 126,70 128,88 122,96 L 114,90 L 114,68 Z",
      forearms_l: "M 38,96 C 35,108 34,124 37,134 L 43,128 L 46,90 Z",
      forearms_r: "M 122,96 C 125,108 126,124 123,134 L 117,128 L 114,90 Z",
      wrists_l: "M 37,134 L 35,144 L 41,142 L 43,128 Z",
      wrists_r: "M 123,134 L 125,144 L 119,142 L 117,128 Z",
      hands_l: "M 35,144 C 33,150 35,154 38,158 L 43,154 L 41,142 Z",
      hands_r: "M 125,144 C 127,150 125,154 122,158 L 117,154 L 119,142 Z",
      quads_l: "M 64,146 L 42,152 L 48,220 L 64,220 Z",
      quads_r: "M 96,146 L 118,152 L 112,220 L 96,220 Z",
      calves_l: "M 48,226 L 40,265 L 52,285 L 56,226 Z",
      calves_r: "M 112,226 L 120,265 L 108,285 L 104,226 Z",
      feet_l: "M 40,265 L 34,293 Q 34,298 46,296 L 52,285 Z",
      feet_r: "M 120,265 L 126,293 Q 126,298 114,296 L 108,285 Z",
    },
    back: {
      head: "M 80,30 m -12,0 a 12,12 0 1,1 24,0 a 12,12 0 1,1 -24,0",
      neck: "M 75,38 L 85,38 L 85,42 L 75,42 Z",
      traps: "M 72,42 L 88,42 L 100,58 L 60,58 Z",
      lats_l: "M 54,60 L 78,60 L 76,104 L 58,98 Z",
      lats_r: "M 106,60 L 82,60 L 84,104 L 102,98 Z",
      triceps_l: "M 42,62 C 34,70 32,88 38,96 L 46,90 Z",
      triceps_r: "M 118,62 C 126,70 128,88 122,96 L 114,90 Z",
      forearms_l: "M 38,96 C 35,108 34,124 37,134 L 43,128 L 46,90 Z",
      forearms_r: "M 122,96 C 125,108 126,124 123,134 L 117,128 L 114,90 Z",
      wrists_l: "M 37,134 L 35,144 L 41,142 L 43,128 Z",
      wrists_r: "M 123,134 L 125,144 L 119,142 L 117,128 Z",
      hands_l: "M 35,144 C 33,150 35,154 38,158 L 43,154 L 41,142 Z",
      hands_r: "M 125,144 C 127,150 125,154 122,158 L 117,154 L 119,142 Z",
      glutes: "M 58,106 L 102,106 C 112,134 102,150 80,150 C 58,150 48,134 58,106 Z",
      hamstrings_l: "M 64,152 L 42,158 L 48,220 L 64,220 Z",
      hamstrings_r: "M 96,152 L 118,158 L 112,220 L 96,220 Z",
      calves_l: "M 48,226 L 40,265 L 52,285 L 56,226 Z",
      calves_r: "M 112,226 L 120,265 L 108,285 L 104,226 Z",
      feet_l: "M 40,265 L 34,293 Q 34,298 46,296 L 52,285 Z",
      feet_r: "M 120,265 L 126,293 Q 126,298 114,296 L 108,285 Z",
    }
  }
};

const MuscleMapping: Record<string, string> = {
  neck: "Neck",
  shoulders_l: "Shoulders",
  shoulders_r: "Shoulders",
  chest_l: "Chest",
  chest_r: "Chest",
  biceps_l: "Biceps",
  biceps_r: "Biceps",
  forearms_l: "Forearms",
  forearms_r: "Forearms",
  wrists_l: "Wrist",
  wrists_r: "Wrist",
  hands_l: "Forearms",
  hands_r: "Forearms",
  abs: "Abs",
  obliques_l: "Obliques",
  obliques_r: "Obliques",
  quads_l: "Quads",
  quads_r: "Quads",
  calves_l: "Calves",
  calves_r: "Calves",
  feet_l: "Feet",
  feet_r: "Feet",
  traps: "Back",
  lats_l: "Back",
  lats_r: "Back",
  triceps_l: "Triceps",
  triceps_r: "Triceps",
  glutes: "Glutes",
  hamstrings_l: "Hamstrings",
  hamstrings_r: "Hamstrings",
};

interface HabitEnhancerProps {
  onCompleteRoutine: (routine: DailyRoutine) => void;
  onCompletePlan: (plan: ExercisePlan) => void;
  onCompleteDiet: (plan: DietPlan) => void;
  existingRoutine: DailyRoutine | null;
  existingPlan: ExercisePlan | null;
  existingDiet: DietPlan | null;
  targetCareer: string | null;
  settings: UserSettings;
  userState: UserState;
  onUpdateUserState: (updates: Partial<UserState>) => void;
}

export const HabitEnhancer: React.FC<HabitEnhancerProps> = ({ 
  onCompleteRoutine, 
  onCompletePlan, 
  onCompleteDiet, 
  existingRoutine, 
  existingPlan, 
  existingDiet, 
  targetCareer,
  settings,
  userState,
  onUpdateUserState
}) => {
  const [activeTab, setActiveTab] = useState<'main' | 'routine' | 'exercise' | 'diet'>('main');

  // Helper to pre-populate characteristics of selected careers
  const getCareerLifestyleFactors = (careerName: string) => {
    const name = careerName.toLowerCase();
    if (name.includes('software') || name.includes('developer') || name.includes('programmer') || name.includes('tech') || name.includes('web') || name.includes('engine')) {
      return { flexibility: 9, stress: 5, hours: 40, community: 7, environment: 'Hybrid / Remote Tech Hub', remoteRatio: 85 };
    }
    if (name.includes('writer') || name.includes('author') || name.includes('creative') || name.includes('artist') || name.includes('copywrite')) {
      return { flexibility: 10, stress: 3, hours: 32, community: 3, environment: 'Highly Autonomous Home Studio', remoteRatio: 95 };
    }
    if (name.includes('doctor') || name.includes('nurse') || name.includes('medical') || name.includes('surgeon') || name.includes('health') || name.includes('physician')) {
      return { flexibility: 2, stress: 9, hours: 55, community: 9, environment: 'High-Pace Hospital / Clinic', remoteRatio: 5 };
    }
    if (name.includes('consult') || name.includes('finance') || name.includes('bank') || name.includes('analyst') || name.includes('accountant')) {
      return { flexibility: 5, stress: 8, hours: 55, community: 8, environment: 'Corporate Office / Client Boardrooms', remoteRatio: 30 };
    }
    if (name.includes('designer') || name.includes('ux') || name.includes('ui') || name.includes('illustrator')) {
      return { flexibility: 8, stress: 5, hours: 38, community: 7, environment: 'Creative Agency / Remote Workspace', remoteRatio: 75 };
    }
    if (name.includes('manager') || name.includes('lead') || name.includes('product') || name.includes('director')) {
      return { flexibility: 6, stress: 7, hours: 45, community: 10, environment: 'Collaborative Workspace / HQ', remoteRatio: 50 };
    }
    if (name.includes('teacher') || name.includes('prof') || name.includes('acad') || name.includes('educat')) {
      return { flexibility: 4, stress: 6, hours: 42, community: 8, environment: 'School Campus Classroom', remoteRatio: 15 };
    }
    return { flexibility: 6, stress: 6, hours: 40, community: 6, environment: 'Modern Professional Environment', remoteRatio: 40 };
  };

  // Lifestyle states synced with UserState
  const [profileWLB, setProfileWLB] = useState<number>(userState.lifestylePreferences?.workLifeBalance ?? 7);
  const [profileTravel, setProfileTravel] = useState<'none' | 'medium' | 'high'>(userState.lifestylePreferences?.travelTolerance ?? 'medium');
  const [profileIncome, setProfileIncome] = useState<'low' | 'medium' | 'high'>(userState.lifestylePreferences?.incomePriority ?? 'medium');
  const [profileAutonomy, setProfileAutonomy] = useState<number>(userState.lifestylePreferences?.autonomy ?? 7);
  const [profileLocation, setProfileLocation] = useState<'remote' | 'hybrid' | 'onsite'>(userState.lifestylePreferences?.locationPref ?? 'hybrid');

  // Trade-off rates (Salary vs Hours vs Flexibility)
  const [tradeOffSalary, setTradeOffSalary] = useState<number>(userState.lifestylePreferences?.salaryVsHoursVsFlex?.salary ?? 40);
  const [tradeOffHours, setTradeOffHours] = useState<number>(userState.lifestylePreferences?.salaryVsHoursVsFlex?.hours ?? 30);
  const [tradeOffFlex, setTradeOffFlex] = useState<number>(userState.lifestylePreferences?.salaryVsHoursVsFlex?.flexibility ?? 30);

  // Check in Success banner state
  const [showCheckInSuccess, setShowCheckInSuccess] = useState(false);

  // Sync state handler
  const savePreferences = (updated: Partial<LifestylePreference>) => {
    const nextPrefs: LifestylePreference = {
      workLifeBalance: profileWLB,
      travelTolerance: profileTravel,
      incomePriority: profileIncome,
      autonomy: profileAutonomy,
      locationPref: profileLocation,
      salaryVsHoursVsFlex: { salary: tradeOffSalary, hours: tradeOffHours, flexibility: tradeOffFlex },
      lastCheckIn: userState.lifestylePreferences?.lastCheckIn,
      checkInHistory: userState.lifestylePreferences?.checkInHistory ?? [],
      ...updated
    };
    onUpdateUserState({ lifestylePreferences: nextPrefs });
  };

  // Handle Log Current Preferences
  const handleCheckInLog = () => {
    const today = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const currentHist = userState.lifestylePreferences?.checkInHistory ?? [];
    
    const newHist = {
      date: today,
      workLifeBalance: profileWLB,
      autonomy: profileAutonomy,
      targetRole: targetCareer || 'General Pathseeker'
    };

    const nextHistList = [newHist, ...currentHist.filter(x => x.date !== today)].slice(0, 10);
    savePreferences({
      lastCheckIn: today,
      checkInHistory: nextHistList
    });
    
    setShowCheckInSuccess(true);
    setTimeout(() => setShowCheckInSuccess(false), 4000);
  };

  // Compute Wellbeing Score
  const wellbeingScore = useMemo(() => {
    let score = 50; 
    score += profileWLB * 3.5; 
    score += profileAutonomy * 1.5; 
    if (profileLocation === 'remote') score += 10;
    else if (profileLocation === 'hybrid') score += 5;
    if (profileTravel === 'none') score += 5;
    else if (profileTravel === 'medium') score += 3;
    
    const hoursWeight = tradeOffHours / 100;
    const flexWeight = tradeOffFlex / 100;
    score -= hoursWeight * 15;
    score += flexWeight * 10;

    return Math.min(100, Math.max(25, Math.round(score)));
  }, [profileWLB, profileAutonomy, profileLocation, profileTravel, tradeOffHours, tradeOffFlex]);

  // Compute Alignment Score
  const alignmentScoreAndFeedback = useMemo(() => {
    const activeCareer = targetCareer || 'Software Engineer';
    const factors = getCareerLifestyleFactors(activeCareer);
    
    let wlbDiff = Math.abs(profileWLB - (10 - factors.stress));
    let wlbMatch = 100 - (wlbDiff * 8);

    let autonomyDiff = Math.abs(profileAutonomy - factors.flexibility);
    let autonomyMatch = 100 - (autonomyDiff * 8);

    let locMatch = 100;
    if (profileLocation === 'remote' && factors.remoteRatio < 50) {
      locMatch = 40;
    } else if (profileLocation === 'remote' && factors.remoteRatio < 80) {
      locMatch = 75;
    } else if (profileLocation === 'onsite' && factors.remoteRatio > 80) {
      locMatch = 70;
    }

    let salaryMatch = 100;
    if (profileIncome === 'high' && factors.stress < 6 && factors.hours < 40) {
      salaryMatch = 70;
    }

    const avg = Math.round((wlbMatch + autonomyMatch + locMatch + salaryMatch) / 4);
    const finalScore = Math.min(100, Math.max(30, avg));

    let feedbackText = '';
    if (finalScore >= 85) {
      feedbackText = `Outstanding alignment! Your request for autonomy, and hybrid/remote work aligns seamlessly with typical conditions for a ${activeCareer}.`;
    } else if (finalScore >= 70) {
      feedbackText = `Satisfactory fit. ${activeCareer} will support your key lifestyle preferences nicely, but keep a healthy boundary to manage potential stress peaks.`;
    } else if (finalScore >= 50) {
      feedbackText = `Moderate lifestyle friction found. The stress levels and typical schedules of a ${activeCareer} might challenge your target work-life balance of ${profileWLB}/10.`;
    } else {
      feedbackText = `Noticeable mismatch warning! A typical ${activeCareer} environment requires long hours (${factors.hours}h) or has stress of ${factors.stress}/10, which strongly conflicts with your low-stress, high-WLB preferences.`;
    }

    return { score: finalScore, feedback: feedbackText, factors };
  }, [targetCareer, profileWLB, profileAutonomy, profileLocation, profileIncome]);

  // Routine State
  const [careerInput, setCareerInput] = useState(targetCareer || '');
  const [loading, setLoading] = useState(false);
  const [routine, setRoutine] = useState<DailyRoutine | null>(existingRoutine);
  const [completedHabits, setCompletedHabits] = useState<Record<number, boolean>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success'>('idle');

  // Exercise State
  const [fitnessGoal, setFitnessGoal] = useState('');
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [plan, setPlan] = useState<ExercisePlan | null>(existingPlan);
  const [selectedGender, setSelectedGender] = useState<'Male' | 'Female'>('Male');
  const [focusType, setFocusType] = useState<'whole' | 'muscle'>('whole');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  // Auto-sync typing body part name to anatomy selection
  useEffect(() => {
    if (focusType === 'muscle' && fitnessGoal) {
      const trimmedGoal = fitnessGoal.trim().toLowerCase();
      const matched = Object.keys(LOCAL_EXERCISES).find(m => 
        trimmedGoal.includes(m.toLowerCase()) || m.toLowerCase().includes(trimmedGoal)
      );
      if (matched) {
        setSelectedMuscle(matched);
      } else if (trimmedGoal === '') {
        setSelectedMuscle(null);
      }
    }
  }, [fitnessGoal, focusType]);

  // Diet State
  const [height, setHeight] = useState(''); // cm
  const [weight, setWeight] = useState(''); // kg
  const [dietLoading, setDietLoading] = useState(false);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(existingDiet);
  const [dailyDietComplete, setDailyDietComplete] = useState(false);
  const [dietPreference, setDietPreference] = useState<'vegetarian' | 'mixed'>('vegetarian');

  // Diet Prerequisites
  const canAccessDiet = !!routine && !!plan;

  // Calendar Status
  const getConnectedCalendar = () => {
    if (!settings.calendarConnections) return null;
    if (settings.calendarConnections.google) return 'Google Calendar';
    if (settings.calendarConnections.calendly) return 'Calendly';
    if (settings.calendarConnections.local) return 'Local Calendar';
    return null;
  };
  const connectedCalName = getConnectedCalendar();
  const isAnyCalendarConnected = !!connectedCalName;

  // Daily Diet Tracker Check
  useEffect(() => {
      const today = new Date().toDateString();
      const saved = localStorage.getItem('pathfinder_diet_tracker');
      if (saved) {
          try {
              const parsed = JSON.parse(saved);
              if (parsed.date === today) {
                  setDailyDietComplete(parsed.completed);
              } else {
                  // Reset for new day
                  localStorage.setItem('pathfinder_diet_tracker', JSON.stringify({ date: today, completed: false }));
                  setDailyDietComplete(false);
              }
          } catch(e) {
              console.error(e);
          }
      }
  }, []);

  const toggleDietComplete = () => {
      const today = new Date().toDateString();
      const newState = !dailyDietComplete;
      setDailyDietComplete(newState);
      localStorage.setItem('pathfinder_diet_tracker', JSON.stringify({ date: today, completed: newState }));
  };

  const handleSyncToCalendar = () => {
    if (!routine || isSyncing) return;
    setIsSyncing(true);
    
    // Simulate specific event injection logic
    console.log(`Injecting ${routine.schedule.length} events into ${connectedCalName}...`);
    
    setTimeout(() => {
        setIsSyncing(false);
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 3000);
    }, 2000);
  };

  // Dynamic Theme Config
  const getTheme = () => {
    switch (activeTab) {
      case 'main':
        return {
          gradient: 'from-fuchsia-600 to-violet-600',
          shadow: 'shadow-fuchsia-200 dark:shadow-none',
          accent: 'text-fuchsia-600 dark:text-fuchsia-400',
          bgLight: 'bg-fuchsia-50 dark:bg-fuchsia-900/20',
          border: 'border-fuchsia-100 dark:border-fuchsia-800',
          button: 'bg-fuchsia-600 hover:bg-fuchsia-700',
          icon: Sliders
        };
      case 'routine':
        return {
          gradient: 'from-violet-600 to-indigo-600',
          shadow: 'shadow-indigo-200 dark:shadow-none',
          accent: 'text-indigo-600 dark:text-indigo-400',
          bgLight: 'bg-indigo-50 dark:bg-indigo-900/20',
          border: 'border-indigo-100 dark:border-indigo-800',
          button: 'bg-indigo-600 hover:bg-indigo-700',
          icon: Coffee
        };
      case 'exercise':
        return {
          gradient: 'from-blue-600 to-cyan-500',
          shadow: 'shadow-blue-200 dark:shadow-none',
          accent: 'text-blue-600 dark:text-blue-400',
          bgLight: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-100 dark:border-blue-800',
          button: 'bg-blue-600 hover:bg-blue-700',
          icon: Dumbbell
        };
      case 'diet':
        return {
          gradient: 'from-emerald-500 to-teal-600',
          shadow: 'shadow-emerald-200 dark:shadow-none',
          accent: 'text-emerald-600 dark:text-emerald-400',
          bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
          border: 'border-emerald-100 dark:border-emerald-800',
          button: 'bg-teal-600 hover:bg-teal-700',
          icon: Apple
        };
      default:
        return {
            gradient: 'from-indigo-600 to-purple-600',
            shadow: 'shadow-gray-200',
            accent: 'text-gray-600',
            bgLight: 'bg-gray-50',
            border: 'border-gray-100',
            button: 'bg-gray-600',
            icon: Activity
        };
    }
  };

  const theme = getTheme();
  const ThemeIcon = theme.icon;

  const handleGenerateRoutine = async () => {
    if (!careerInput) return;
    setLoading(true);
    try {
      const result = await getDailyRoutine(careerInput);
      setRoutine(result);
      onCompleteRoutine(result);
      setCompletedHabits({}); // Reset tracker
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
      if (!fitnessGoal) return;
      setExerciseLoading(true);
      try {
          const result = await getExercisePlan(fitnessGoal);
          if (result) {
              setPlan(result);
              onCompletePlan(result);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setExerciseLoading(false);
      }
  };

  const handleGenerateDiet = async () => {
      if (!height || !weight || !routine || !plan) return;
      setDietLoading(true);
      
      const h = parseFloat(height);
      const w = parseFloat(weight);
      const bmi = w / Math.pow(h / 100, 2);

      try {
          const result = await getDietPlan(bmi, routine, plan);
          if (result) {
              setDietPlan(result);
              onCompleteDiet(result);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setDietLoading(false);
      }
  };

  const updateScheduleItem = (index: number, field: string, value: string) => {
    if (!routine) return;
    const newSchedule = [...routine.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    const updatedRoutine = { ...routine, schedule: newSchedule };
    setRoutine(updatedRoutine);
    onCompleteRoutine(updatedRoutine);
  };

  const addScheduleItem = () => {
    if (!routine) return;
    const newSchedule = [...routine.schedule, { time: '09:00 AM', activity: 'New Activity', category: 'Work' }];
    const updatedRoutine = { ...routine, schedule: newSchedule };
    setRoutine(updatedRoutine);
    onCompleteRoutine(updatedRoutine);
  };

  const removeScheduleItem = (index: number) => {
    if (!routine) return;
    const newSchedule = routine.schedule.filter((_, i) => i !== index);
    const updatedRoutine = { ...routine, schedule: newSchedule };
    setRoutine(updatedRoutine);
    onCompleteRoutine(updatedRoutine);
  };

  const toggleHabit = (index: number) => {
      setCompletedHabits(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const getCategoryStyles = (category: string) => {
    const norm = category.toLowerCase();
    if (norm === 'work') return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800', hex: '#3b82f6', icon: Briefcase };
    if (norm === 'health') return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', hex: '#10b981', icon: Heart };
    if (norm === 'learning') return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', hex: '#f59e0b', icon: Zap };
    if (norm === 'rest') return { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800', hex: '#f43f5e', icon: Moon };
    return { bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-700', hex: '#6b7280', icon: Circle };
  };

  const categories = ['Work', 'Health', 'Learning', 'Rest'];
  const chartData = routine ? categories.map(cat => ({
      name: cat,
      value: routine.schedule.filter(i => i.category === cat).length
  })).filter(i => i.value > 0) : [];

  const bmiValue = dietPlan ? parseFloat(dietPlan.bmi.toFixed(1)) : 0;
  const bmiPercent = Math.min(Math.max((bmiValue - 15) / (35 - 15) * 100, 0), 100);
  const needleAngle = 180 - (bmiPercent / 100) * 180;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleLen = 35;
  const needleX = 50 + needleLen * Math.cos(needleRad);
  const needleY = 45 - needleLen * Math.sin(needleRad);

  const getBmiColor = (val: number) => {
      if (val < 18.5) return 'text-blue-500';
      if (val < 25) return 'text-green-500';
      if (val < 30) return 'text-yellow-500';
      return 'text-red-500';
  };

  const renderMealList = (items: MealItem[]) => {
      return (
          <div className="space-y-2 mt-1">
              {items.map((item, i) => (
                  <div key={i} className={`flex items-start text-sm ${item.optional ? 'opacity-70' : ''}`}>
                      {item.optional ? (
                          <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                              <Plus className="w-2.5 h-2.5 text-gray-400" />
                          </div>
                      ) : (
                          <div className="w-4 h-4 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                              <Check className="w-2.5 h-2.5 text-teal-600 dark:text-teal-400" />
                          </div>
                      )}
                      <div className="flex-1">
                          <span className={`font-medium ${item.optional ? 'text-gray-500 dark:text-gray-400 decoration-dashed' : 'text-gray-800 dark:text-gray-200'}`}>
                              {item.item}
                          </span>
                          {item.optional && <span className="ml-2 text-[10px] uppercase font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">Optional</span>}
                      </div>
                  </div>
              ))}
          </div>
      );
  };

  const getCurrentMeals = () => {
      if (!dietPlan) return null;
      return dietPlan[dietPreference];
  };

  const currentMeals = getCurrentMeals();

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-20 md:pb-8">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-gradient-to-r ${theme.gradient} p-6 rounded-3xl text-white shadow-lg ${theme.shadow} transition-all duration-500`}>
        <div>
            <h2 className="text-2xl md:text-3xl font-bold flex items-center font-brand">
                <ThemeIcon className="w-8 h-8 mr-3 text-white/90" />
                Lifestyle Optimizer
            </h2>
            <p className="text-white/90 mt-2 max-w-lg">Design a day that brings you closer to your goals. Balance productivity, health, and rest.</p>
        </div>
        <div className="w-full md:w-auto overflow-x-auto no-scrollbar flex flex-row items-center gap-1.5 p-1.5 bg-white/15 dark:bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl shrink-0">
            <style>{`
              .no-scrollbar::-webkit-scrollbar { display: none !important; }
              .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
            `}</style>
            <button onClick={() => setActiveTab('main')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center whitespace-nowrap flex-shrink-0 ${activeTab === 'main' ? 'bg-white text-fuchsia-600 shadow-md' : 'text-white hover:bg-white/10'}`}><Sliders className="w-4 h-4 mr-2" /> Lifestyle Match</button>
            <button onClick={() => setActiveTab('routine')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center whitespace-nowrap flex-shrink-0 ${activeTab === 'routine' ? 'bg-white text-indigo-600 shadow-md' : 'text-white hover:bg-white/10'}`}><Coffee className="w-4 h-4 mr-2" /> Routine</button>
            <button onClick={() => setActiveTab('exercise')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center whitespace-nowrap flex-shrink-0 ${activeTab === 'exercise' ? 'bg-white text-blue-600 shadow-md' : 'text-white hover:bg-white/10'}`}><Dumbbell className="w-4 h-4 mr-2" /> Fitness</button>
            <button onClick={() => canAccessDiet && setActiveTab('diet')} disabled={!canAccessDiet} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center whitespace-nowrap flex-shrink-0 ${activeTab === 'diet' ? 'bg-white text-teal-600 shadow-md' : 'text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed'}`} title={!canAccessDiet ? "Complete Routine and Fitness first" : ""} >{canAccessDiet ? <Utensils className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />} Diet</button>
        </div>
      </div>

      <div key={activeTab} className="animate-fade-in">
        {activeTab === 'main' && (
          <div className="space-y-8 animate-slide-right duration-300">
            {/* Realtime Success Toast */}
            {showCheckInSuccess && (
              <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-600 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500 animate-slide-up">
                <CheckCircle2 className="w-5 h-5 text-white" />
                <div className="text-xs font-bold font-brand tracking-wide">
                  LIFESTYLE CHECK-IN LOGGED SECURELY ⚡
                </div>
              </div>
            )}

            {/* Core Metrics & Dynamic Alignment Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Preferences Configurator */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/60 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                    <Sliders className="w-40 h-40 text-fuchsia-600 dark:text-fuchsia-400" />
                  </div>
                  
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center font-brand">
                        <Sliders className="w-5 h-5 mr-2 text-fuchsia-500" /> Lifestyle Preference Profile
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">Configure your target quality of life standards below. Alignment computes instantly.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setProfileWLB(7);
                        setProfileAutonomy(7);
                        setProfileTravel('medium');
                        setProfileIncome('medium');
                        setProfileLocation('hybrid');
                        savePreferences({
                          workLifeBalance: 7,
                          autonomy: 7,
                          travelTolerance: 'medium',
                          incomePriority: 'medium',
                          locationPref: 'hybrid'
                        });
                      }}
                      className="text-[10px] uppercase font-black tracking-widest text-[#4f46e5] bg-indigo-50 dark:bg-indigo-950/20 px-3 py-1.5 rounded-xl hover:scale-105 transition"
                    >
                      Reset profile
                    </button>
                  </div>

                  <div className="relative z-10 space-y-8">
                    {/* Work Life Balance Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          ⚖️ Desired Work-Life Balance: <span className="text-fuchsia-500 font-black">{profileWLB}/10</span>
                        </label>
                        <span className="text-[10px] text-gray-400 font-semibold italic">
                          {profileWLB >= 8 ? 'Wants flexible leisure priority' : profileWLB >= 5 ? 'Standard office balance' : 'Intense high-grind dedication'}
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={profileWLB} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setProfileWLB(val);
                          savePreferences({ workLifeBalance: val });
                        }}
                        className="w-full accent-fuchsia-500 bg-gray-100 dark:bg-gray-900 h-2 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Autonomy Level Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          🎨 Creative Autonomy & Freedom: <span className="text-violet-500 font-black">{profileAutonomy}/10</span>
                        </label>
                        <span className="text-[10px] text-gray-400 font-semibold italic">
                          {profileAutonomy >= 8 ? 'Complete self-direction' : profileAutonomy >= 5 ? 'Collaborative guidance' : 'Rigid structured instructions'}
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={profileAutonomy} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setProfileAutonomy(val);
                          savePreferences({ autonomy: val });
                        }}
                        className="w-full accent-violet-500 bg-gray-100 dark:bg-gray-900 h-2 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Work Location Mode Chips */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        🌐 Preferred Workspace Model
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { val: 'remote', label: '💻 Remote Laptop', desc: 'Work from anywhere' },
                          { val: 'hybrid', label: '🔄 Hybrid Mix', desc: 'Best of both worlds' },
                          { val: 'onsite', label: '🏢 Onsite Hub', desc: 'In-person workplace' }
                        ].map(item => (
                          <button
                            key={item.val}
                            onClick={() => {
                              setProfileLocation(item.val as any);
                              savePreferences({ locationPref: item.val as any });
                            }}
                            className={`p-3 rounded-2xl border text-left transition transform duration-200 active:scale-95 ${
                              profileLocation === item.val
                              ? 'bg-gradient-to-r from-fuchsia-500/10 to-violet-500/10 border-fuchsia-400 shadow-md text-fuchsia-700 dark:text-fuchsia-300'
                              : 'bg-gray-50/50 dark:bg-gray-900/55 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/40'
                            }`}
                          >
                            <div className="text-xs font-bold leading-none mb-1">{item.label}</div>
                            <div className="text-[10px] font-medium opacity-75">{item.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Travel Tolerance Selector */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        ✈️ Business Travel Tolerance
                      </label>
                      <div className="flex bg-gray-50 dark:bg-gray-900/80 p-1 rounded-2xl border border-gray-100 dark:border-gray-800 justify-between">
                        {[
                          { val: 'none', label: 'Zero Travel' },
                          { val: 'medium', label: 'Moderate' },
                          { val: 'high', label: 'Frequent' }
                        ].map((choice) => (
                          <button
                            key={choice.val}
                            onClick={() => {
                              setProfileTravel(choice.val as any);
                              savePreferences({ travelTolerance: choice.val as any });
                            }}
                            className={`flex-1 text-center py-2 rounded-xl text-xs font-bold transition-all ${
                              profileTravel === choice.val 
                              ? 'bg-white dark:bg-gray-800 text-fuchsia-600 dark:text-fuchsia-400 shadow' 
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                          >
                            {choice.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Income Preference Sector */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        💰 Income Priority Level
                      </label>
                      <div className="flex bg-gray-50 dark:bg-gray-900/80 p-1 rounded-2xl border border-gray-100 dark:border-gray-800 justify-between">
                        {[
                          { val: 'low', label: 'Lifestyle First' },
                          { val: 'medium', label: 'Balanced Pay' },
                          { val: 'high', label: 'Max Earnings' }
                        ].map((choice) => (
                          <button
                            key={choice.val}
                            onClick={() => {
                              setProfileIncome(choice.val as any);
                              savePreferences({ incomePriority: choice.val as any });
                            }}
                            className={`flex-1 text-center py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                              profileIncome === choice.val 
                              ? 'bg-white dark:bg-gray-800 text-violet-600 dark:text-violet-400 shadow' 
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                          >
                            {choice.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* College Lifestyle Synergy Panel */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-sm text-left">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center mb-2 font-brand">
                    <Compass className="w-5 h-5 text-indigo-500 mr-2" /> College Student Lifestyle Synergy
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-400 mb-4">
                    Assesses financial and commute stress vectors based on your College Finder selections.
                  </p>

                  {userState.collegeResults && (userState.collegeResults.domestic?.length || userState.collegeResults.foreign?.length) ? (
                    (() => {
                      const allColleges = [
                        ...(userState.collegeResults.domestic || []), 
                        ...(userState.collegeResults.foreign || [])
                      ];
                      
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {allColleges.slice(0, 4).map((col, cId) => {
                            const rentLevel = col.colDetails?.rentIndex ?? Math.round((25 + (cId * 15)) % 90 + 20);
                            const grocLevel = col.colDetails?.grocIndex ?? Math.round((30 + (cId * 10)) % 80 + 25);
                            const totalCol = col.colDetails?.annualEstTotalCOL ?? `$${Math.round(8000 + (cId * 2400))}/yr`;
                            
                            let studentFitColor = 'text-green-505 bg-green-500/10 border-green-500/20';
                            let studentFitLabel = 'Excellent Financial Fit';
                            if (rentLevel > 70) {
                              studentFitColor = 'text-red-500 bg-red-500/10 border-red-500/20';
                              studentFitLabel = 'High Cost Warning';
                            } else if (rentLevel > 45) {
                              studentFitColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
                              studentFitLabel = 'Moderate City Cost';
                            }

                            return (
                              <div key={cId} className="p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                                <div className="text-left">
                                  <div className="flex justify-between items-start gap-1 pb-2">
                                    <h4 className="text-xs font-bold text-gray-850 dark:text-gray-200 line-clamp-1">{col.name}</h4>
                                    <span className="text-[9px] uppercase tracking-widest bg-indigo-500/10 px-1.5 py-0.5 rounded text-indigo-500 shrink-0 font-bold">ROI: {col.roi || 'TBD'}</span>
                                  </div>
                                  <p className="text-[10px] text-gray-405 dark:text-gray-400 mb-2 line-clamp-1">📍 {col.location}</p>
                                  
                                  <div className="space-y-1 text-[10px] text-gray-550 dark:text-gray-400 border-t border-gray-100 dark:border-gray-850/60 pt-2">
                                    <div className="flex justify-between">
                                      <span>Rent Index:</span> 
                                      <span className="font-mono text-gray-700 dark:text-gray-300 font-bold">{rentLevel}/100</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Grocery Index:</span> 
                                      <span className="font-mono text-gray-700 dark:text-gray-300 font-bold">{grocLevel}/100</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Est. Living Cost:</span> 
                                      <span className="font-mono text-gray-700 dark:text-gray-300 font-extrabold">{totalCol}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className={`mt-3 text-[9px] font-black uppercase text-center py-1 rounded-lg border ${studentFitColor}`}>
                                  {studentFitLabel}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="p-6 bg-gray-50 dark:bg-gray-900/40 rounded-2xl text-center text-xs text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-800">
                      <p className="max-w-md mx-auto">No domestic or international colleges from your College Finder search are currently mapped. Visit your Finder page to check candidate profiles.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Wellbeing Scoring & Alignment */}
              <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                
                {/* Score Section */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between items-center relative overflow-hidden">
                  <div className="w-full flex justify-between items-center mb-6">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider font-brand">Wellbeing Scoring</h3>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-xl">
                      <Activity className="w-3.5 h-3.5 animate-pulse" /> Live Analysis
                    </div>
                  </div>

                  {/* Circular Score Visual representation */}
                  <div className="relative w-40 h-40 flex items-center justify-center my-3 select-none">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100 dark:text-gray-700" />
                      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * wellbeingScore) / 100} className="text-fuchsia-500 transition-all duration-1000 ease-out" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-extrabold font-brand text-gray-900 dark:text-white tracking-tighter">{wellbeingScore}</span>
                      <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">Vitality Index</span>
                    </div>
                  </div>

                  <div className="w-full text-center mt-3 p-3 bg-gray-50/50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                     <div className="text-[11px] font-black tracking-widest text-[#d946ef] dark:text-fuchsia-400 uppercase leading-relaxed mb-0.5">
                       {wellbeingScore >= 80 ? '👑 Premium Vitality Status' : wellbeingScore >= 55 ? '⚖️ Healthy Balanced State' : '⚠️ Alert: high burn risk detected'}
                     </div>
                     <p className="text-[10px] text-gray-500 leading-normal max-w-xs mx-auto">
                       Derived from preferred boundaries, hours allocation, travel friction, and custom workplace flexibilities.
                     </p>
                  </div>
                </div>

                {/* Career Alignment Scoring Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm text-left">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-gray-950 dark:text-white uppercase tracking-wider font-brand">Lifestyle Alignment Score</h3>
                    <div className="text-xs font-bold text-fuchsia-600 dark:text-fuchsia-450">
                      Target: <span className="font-extrabold">{targetCareer || 'Software Engineer'}</span>
                    </div>
                  </div>

                  {/* Alignment Meter Bar */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs font-black">
                      <span className="text-gray-400 uppercase tracking-widest">Compatibility matching</span>
                      <span style={{ color: alignmentScoreAndFeedback.score >= 75 ? '#10b981' : alignmentScoreAndFeedback.score >= 50 ? '#f59e0b' : '#ef4444' }}>
                        {alignmentScoreAndFeedback.score}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-150 dark:bg-gray-900 h-2.5 rounded-full overflow-hidden">
                      <div 
                        style={{ 
                          width: `${alignmentScoreAndFeedback.score}%`, 
                          backgroundColor: alignmentScoreAndFeedback.score >= 75 ? '#10b981' : alignmentScoreAndFeedback.score >= 50 ? '#f59e0b' : '#ef4444' 
                        }} 
                        className="h-full rounded-full transition-all duration-1000 ease-out" />
                    </div>
                  </div>

                  {/* Alignment Feedback text */}
                  <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed italic bg-fuchsia-500/[0.03] p-4 rounded-2xl border border-fuchsia-500/10 mb-4 font-medium">
                     "{alignmentScoreAndFeedback.feedback}"
                  </div>

                  {/* Career parameters rating */}
                  <div className="pt-2 space-y-3 border-t border-gray-100 dark:border-gray-800/80">
                     <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Typical Job Characteristics</span>

                     <div className="grid grid-cols-2 gap-3 text-[10px]">
                        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80">
                           <span className="text-gray-405 block uppercase font-bold tracking-wider mb-1 leading-none">🧠 Autonomy</span>
                           <span className="text-gray-950 dark:text-white font-mono font-black">{alignmentScoreAndFeedback.factors.flexibility}/10 (Self-Direction)</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80">
                           <span className="text-gray-405 block uppercase font-bold tracking-wider mb-1 leading-none">⚡ stress level</span>
                           <span className="text-gray-950 dark:text-white font-mono font-black">{alignmentScoreAndFeedback.factors.stress}/10 (Severe demands)</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80">
                           <span className="text-gray-405 block uppercase font-bold tracking-wider mb-1 leading-none">⏰ Weekly hours</span>
                           <span className="text-gray-950 dark:text-white font-mono font-black">{alignmentScoreAndFeedback.factors.hours} hours/week</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80">
                           <span className="text-gray-405 block uppercase font-bold tracking-wider mb-1 leading-none">🏢 Environment</span>
                           <span className="text-gray-950 dark:text-white font-bold tracking-tight text-[9px] truncate block">{alignmentScoreAndFeedback.factors.environment}</span>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Recommended Career selector - Cross-linking directly */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-sm text-left relative z-20">
                   <h4 className="text-xs font-black uppercase tracking-widest text-gray-404 mb-2 font-brand">🧬 Compare Goal Careers</h4>
                   <p className="text-[11px] text-gray-400 mb-4 leading-normal">
                     Tap on any recommended career choice to set it as your target and view dynamic alignment and wellbeing updates in real-time!
                   </p>

                   {/* Recommended buttons */}
                   <div className="flex flex-wrap gap-2">
                     {(userState.recommendations?.length ? userState.recommendations : [
                        { title: 'Software Engineer', matchScore: 92 },
                        { title: 'UX Designer', matchScore: 85 },
                        { title: 'Product Manager', matchScore: 78 },
                        { title: 'Data Scientist', matchScore: 88 },
                        { title: 'Technical Writer', matchScore: 90 }
                     ]).slice(0, 5).map((rec: any, idx) => (
                       <button
                         key={idx}
                         onClick={() => {
                           onUpdateUserState({ targetCareer: rec.title });
                           setCareerInput(rec.title);
                         }}
                         className={`px-3.5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 border cursor-pointer hover:scale-[1.03] active:scale-95 ${
                            (targetCareer === rec.title || (!targetCareer && rec.title === 'Software Engineer'))
                            ? 'bg-gradient-to-r from-fuchsia-500/10 to-violet-500/10 border-fuchsia-500 text-fuchsia-600 dark:text-fuchsia-300 font-extrabold shadow-sm'
                            : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-800 text-gray-650 dark:text-gray-400'
                         }`}
                       >
                         {rec.title} ({rec.matchScore ?? rec.matchValue ?? 85}%)
                       </button>
                     ))}
                   </div>
                </div>
              </div>
            </div>

            {/* Trade-Off Explorer Section */}
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700/60 shadow-sm relative overflow-hidden text-left">
               <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none">
                 <Scale className="w-56 h-56 text-violet-500" />
               </div>

               <div className="mb-6 relative z-10">
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center font-brand">
                   <Scale className="w-5 h-5 mr-2 text-violet-500 animate-pulse" /> High-Level Trade-Off Explorer
                 </h3>
                 <p className="text-xs text-gray-400 mt-1 pb-1">
                   Adjust your focus allocations below. High salaries, perfect work hours, and calendar flexibility directly compete.
                 </p>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
                  {/* Sliders for trade-off */}
                  <div className="space-y-6">
                     <div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                           <span>💵 Salary Priority: <span className="text-emerald-500 font-extrabold">{tradeOffSalary}%</span></span>
                           <span className="text-[10px] italic text-gray-400">Yields corporate demands</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={tradeOffSalary} 
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setTradeOffSalary(val);
                            savePreferences({ salaryVsHoursVsFlex: { salary: val, hours: tradeOffHours, flexibility: tradeOffFlex } });
                          }}
                          className="w-full accent-emerald-500 bg-gray-100 dark:bg-gray-900 h-2 rounded-lg cursor-pointer"
                        />
                     </div>

                     <div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                           <span>⏰ Maximum Leisure / Free Time: <span className="text-violet-500 font-extrabold">{tradeOffHours}%</span></span>
                           <span className="text-[10px] italic text-gray-400">Reduces occupational burnout</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={tradeOffHours} 
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setTradeOffHours(val);
                            savePreferences({ salaryVsHoursVsFlex: { salary: tradeOffSalary, hours: val, flexibility: tradeOffFlex } });
                          }}
                          className="w-full accent-violet-500 bg-gray-100 dark:bg-gray-900 h-2 rounded-lg cursor-pointer"
                        />
                     </div>

                     <div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                           <span>🤸 Workspace & Schedule Flexibility: <span className="text-pink-500 font-extrabold">{tradeOffFlex}%</span></span>
                           <span className="text-[10px] italic text-gray-400">Demands highly specialized skills</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={tradeOffFlex} 
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setTradeOffFlex(val);
                            savePreferences({ salaryVsHoursVsFlex: { salary: tradeOffSalary, hours: tradeOffHours, flexibility: val } });
                          }}
                          className="w-full accent-pink-500 bg-gray-100 dark:bg-gray-900 h-2 rounded-lg cursor-pointer"
                        />
                     </div>
                  </div>

                  {/* Output interpretation Card based on values */}
                  <div className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 text-xs">
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#4f46e5] block mb-2 leading-none">🧠 Trade-Off Engine Insights</span>
                     
                     {(() => {
                       if (tradeOffSalary > 65 && tradeOffHours > 60) {
                         return (
                           <div className="space-y-3">
                             <p className="font-semibold text-gray-800 dark:text-white">
                               "Ambition Conflict Warning"
                             </p>
                             <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                               Demanding maximum salary while expecting low work hours is an extremely luxurious, rare combination. To achieve this, focus heavily on high-leverage assets like independent software micro-businesses, niche freelance consultancies, or scaling royalty structures. Standard corporate listings will rarely support both.
                             </p>
                           </div>
                         );
                       }
                       if (tradeOffSalary > 70) {
                         return (
                           <div className="space-y-3">
                             <p className="font-semibold text-gray-800 dark:text-white">
                               "Corporate Peak Earning Mode"
                             </p>
                             <p className="text-gray-550 dark:text-gray-400 leading-relaxed">
                               You are prioritizing commercial returns. Careers like Investment Banking, Chief Officers, or Specialized Medical practitioners fit this. Prepare, however, for intense schedule constraints: typical work hours range from 50 to 75 hours per week, with limited workspace freedom.
                             </p>
                           </div>
                         );
                       }
                       if (tradeOffFlex > 70 && tradeOffHours > 60) {
                         return (
                           <div className="space-y-3">
                             <p className="font-semibold text-gray-800 dark:text-white">
                               "Autonomous Lifestyle Designer"
                             </p>
                             <p className="text-gray-550 dark:text-gray-400 leading-relaxed">
                               Maximum flexibility preference. You value customized schedules, relaxed paces, and geographical freedom above all. This aligns with copywriting, content creation, indie hacking, and remote web consultants. Income potential relies heavily on self-promotion, but stress index scores remain extremely comfortable.
                             </p>
                           </div>
                         );
                       }
                       return (
                         <div className="space-y-3">
                           <p className="font-semibold text-gray-800 dark:text-white">
                             "Balanced Integration"
                           </p>
                           <p className="text-gray-550 dark:text-gray-400 leading-relaxed">
                             A healthy, standard lifestyle balance. Your parameters reflect realistic, stable conditions: a dynamic workspace offering standard hybrid schedules (38-42 work hours per week) combined with competitive middle-tier salaries. Classic in technology sectors, product companies, and institutional agencies.
                           </p>
                         </div>
                       );
                     })()}
                  </div>
               </div>
            </div>

            {/* Periodic Check-In Segment */}
            <div className="bg-gradient-to-r from-violet-900/40 via-fuchsia-900/40 to-pink-900/40 border border-fuchsia-100/10 dark:border-fuchsia-900/30 p-6 md:p-8 rounded-[2.5rem] shadow-xl text-white text-left">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-lg font-bold flex items-center font-brand">
                      <RotateCcw className="w-5 h-5 mr-2 text-fuchsia-400 animate-spin-slow animate-pulse" /> Periodic Lifestyle Check-In
                    </h3>
                    <p className="text-xs text-white/80 mt-1 max-w-xl">
                      Are your core life priorities shifting? Execute a periodic check-in to securely store your active desired work-life balance and autonomy metrics in a historical log timeline below.
                    </p>
                  </div>
                  <button
                    onClick={handleCheckInLog}
                    className="self-start md:self-auto bg-white text-fuchsia-700 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl duration-300 pointer-events-auto shrink-0 font-brand"
                  >
                    🚀 Track Check-In
                  </button>
               </div>

               {/* Log Table of past check ins */}
               <div className="mt-8 border-t border-white/10 pt-6">
                  <span className="block text-[10px] font-black uppercase text-fuchsia-400 tracking-widest mb-4">
                    Check-In progress logs
                  </span>

                  {userState.lifestylePreferences?.checkInHistory && userState.lifestylePreferences.checkInHistory.length > 0 ? (
                    <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                      {userState.lifestylePreferences.checkInHistory.map((hist, hIdx) => (
                        <div key={hIdx} className="bg-white/5 border border-white/5 p-3.5 rounded-2xl flex justify-between items-center text-xs">
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-fuchsia-500 shadow-glow" />
                             <div>
                               <span className="font-mono font-bold text-white/90">{hist.date}</span>
                               <span className="text-white/40 mx-2">|</span>
                               <span className="text-white/60">Target Path:</span> <span className="font-bold text-white/95">{hist.targetRole}</span>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <div>
                               <span className="text-white/50 text-[10px] uppercase font-bold mr-1">Work Balance:</span>
                               <span className="font-bold font-mono text-fuchsia-400">{hist.workLifeBalance}/10</span>
                             </div>
                             <div>
                               <span className="text-white/50 text-[10px] uppercase font-bold mr-1">Autonomy:</span>
                               <span className="font-bold font-mono text-violet-405 text-purple-400">{hist.autonomy}/10</span>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-white/5 border border-dashed border-white/10 rounded-2xl text-xs text-white/50">
                       No logged check-ins yet. Adjust sliders and click "Track Check-In" above to begin tracking.
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'routine' && (
            <div className="animate-slide-right duration-300">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">Target Career / Goal</label>
                      <input type="text" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" placeholder="e.g. Software Engineer, Writer, Marathon Runner" value={careerInput} onChange={(e) => setCareerInput(e.target.value)} />
                  </div>
                  <button onClick={handleGenerateRoutine} disabled={loading || !careerInput} className={`w-full md:w-auto px-8 py-3 ${theme.button} text-white rounded-xl transition disabled:opacity-50 flex items-center justify-center whitespace-nowrap shadow-lg ${theme.shadow} font-bold`} >
                      {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Coffee className="w-5 h-5 mr-2" />}
                      Generate Daily Plan
                  </button>
              </div>

              {routine && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-7 space-y-6">
                          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                  <Sun className="w-32 h-32 text-indigo-50 dark:text-indigo-900/20" />
                              </div>
                              
                              <div className="flex justify-between items-center mb-6 relative z-10">
                                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                      <Clock className={`w-6 h-6 mr-2 ${theme.accent}`} /> Daily Schedule
                                  </h3>
                                  <div className="flex gap-2">
                                      {isAnyCalendarConnected && (
                                          <button 
                                            onClick={handleSyncToCalendar}
                                            disabled={isSyncing}
                                            className={`flex items-center px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm ${
                                                syncStatus === 'success' 
                                                ? 'bg-emerald-500 text-white' 
                                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50'
                                            }`}
                                            title={`Syncing to ${connectedCalName}`}
                                          >
                                              {isSyncing ? (
                                                  <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                                              ) : syncStatus === 'success' ? (
                                                  <Check className="w-3 h-3 mr-2" />
                                              ) : (
                                                  <CalendarDays className="w-3 h-3 mr-2 text-indigo-500" />
                                              )}
                                              {isSyncing ? 'Syncing...' : syncStatus === 'success' ? 'Synced!' : 'Sync to Calendar'}
                                          </button>
                                      )}
                                      <span className={`text-xs ${theme.bgLight} ${theme.accent} px-3 py-1 rounded-full font-bold flex items-center`}>
                                          {routine.schedule.length} Activities
                                      </span>
                                  </div>
                              </div>

                              <div className="relative z-10 space-y-4">
                                  <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                                  {routine.schedule.map((item, index) => {
                                      const styles = getCategoryStyles(item.category);
                                      return (
                                          <div key={index} className="relative pl-10 group">
                                              <div className={`absolute left-[11px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm z-10 transition-colors duration-300`} style={{ backgroundColor: styles.hex }}></div>
                                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                                                  <input value={item.time} onChange={(e) => updateScheduleItem(index, 'time', e.target.value)} className="w-24 bg-transparent font-mono text-xs font-bold text-gray-500 dark:text-gray-400 focus:text-indigo-600 dark:focus:text-indigo-400 focus:outline-none text-right sm:text-left" />
                                                  <div className="flex-1 min-w-0">
                                                      <input value={item.activity} onChange={(e) => updateScheduleItem(index, 'activity', e.target.value)} className="w-full bg-transparent text-gray-900 dark:text-white font-medium focus:outline-none text-sm border-b border-transparent focus:border-indigo-300 dark:focus:border-indigo-700 transition-colors px-1" />
                                                  </div>
                                                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                                      <select value={item.category} onChange={(e) => updateScheduleItem(index, 'category', e.target.value)} className={`text-xs font-bold px-2 py-1 rounded-lg cursor-pointer outline-none border transition-colors ${styles.bg} ${styles.text} ${styles.border}`} >
                                                          <option value="Work">Work</option>
                                                          <option value="Health">Health</option>
                                                          <option value="Learning">Learning</option>
                                                          <option value="Rest">Rest</option>
                                                      </select>
                                                      <button onClick={() => removeScheduleItem(index)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition opacity-0 group-hover:opacity-100" >
                                                          <Trash2 className="w-4 h-4" />
                                                      </button>
                                                  </div>
                                              </div>
                                          </div>
                                      );
                                  })}
                                  <button onClick={addScheduleItem} className="relative ml-10 w-[calc(100%-2.5rem)] py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-400 hover:text-indigo-500 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 flex items-center justify-center transition" >
                                      <Plus className="w-4 h-4 mr-2" /> Add Activity
                                  </button>
                              </div>
                          </div>
                      </div>

                      <div className="lg:col-span-5 space-y-6">
                          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 h-80 flex flex-col">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Time Allocation</h3>
                              <div className="flex-1 min-h-0 relative">
                                  {chartData.length > 0 ? (
                                      <ResponsiveContainer width="100%" height="100%">
                                          <PieChart>
                                              <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" animationDuration={1000} stroke="none" >
                                                  {chartData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={getCategoryStyles(entry.name).hex} /> ))}
                                              </Pie>
                                              <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} itemStyle={{ color: '#fff', fontWeight: 'bold' }} />
                                              <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                                          </PieChart>
                                      </ResponsiveContainer>
                                  ) : (
                                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                          <Activity className="w-10 h-10 mb-2 opacity-20" />
                                          <span className="text-sm">No activities scheduled</span>
                                      </div>
                                  )}
                              </div>
                          </div>

                          <div className="bg-indigo-900 dark:bg-gray-800 p-6 rounded-3xl text-white shadow-lg shadow-indigo-200 dark:shadow-none border border-indigo-800 dark:border-gray-700">
                              <h3 className="text-lg font-bold mb-4 flex items-center">
                                  <Heart className="w-5 h-5 mr-2 text-pink-400" /> Daily Habits
                              </h3>
                              <div className="space-y-3">
                                  {routine.habits.map((habit, index) => {
                                      const isDone = completedHabits[index];
                                      return (
                                          <div key={index} onClick={() => toggleHabit(index)} className={`p-3 rounded-xl backdrop-blur-sm border transition-all cursor-pointer flex items-start gap-3 group ${isDone ? 'bg-green-500/20 border-green-500/30' : 'bg-white/10 hover:bg-white/20 border-white/10'}`} >
                                              <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isDone ? 'border-green-400 bg-green-400 text-white' : 'border-white/30 group-hover:border-white/50'}`}>
                                                  {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                  <div className={`text-sm font-bold transition-opacity ${isDone ? 'opacity-50 line-through' : 'opacity-100'}`}>{habit.name}</div>
                                                  <div className="flex justify-between items-center mt-1">
                                                      <span className="text-xs text-indigo-200/80">{habit.duration}</span>
                                                      <span className="text-[10px] uppercase tracking-wider font-bold bg-black/20 px-1.5 py-0.5 rounded text-white/70">{habit.type}</span>
                                                  </div>
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>

                          <div className="bg-orange-50 dark:bg-orange-900/10 p-6 rounded-3xl border border-orange-100 dark:border-orange-900/30">
                              <h3 className="text-lg font-bold text-orange-800 dark:text-orange-200 mb-3 flex items-center">
                                  <Zap className="w-5 h-5 mr-2 text-orange-500" /> Pro Tips
                              </h3>
                              <ul className="space-y-3">
                                  {routine.tips.map((tip, index) => (
                                      <li key={index} className="text-sm text-orange-800 dark:text-orange-300 flex items-start">
                                          <span className="mr-3 text-orange-400 font-bold">•</span> 
                                          <span className="leading-relaxed opacity-90">{tip}</span>
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      </div>
                  </div>
              )}
            </div>
        )}

        {activeTab === 'exercise' && (
            <div className="animate-slide-right duration-300">
                {/* Visual Selectors Control Panel */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 mb-8 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-950 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500 animate-pulse" /> Custom Fitness Configuration
                    </h3>
                    
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                        {/* Gender selection */}
                        <div className="flex-1">
                            <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">Anatomy Outline Silhouette</span>
                            <div className="flex bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-1.5 rounded-2xl w-full">
                                <button
                                    onClick={() => setSelectedGender('Male')}
                                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedGender === 'Male' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                >
                                    Male Model
                                </button>
                                <button
                                    onClick={() => setSelectedGender('Female')}
                                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedGender === 'Female' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                >
                                    Female Model
                                </button>
                            </div>
                        </div>

                        {/* Focus Type Selection */}
                        <div className="flex-1">
                            <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">Target Focus Coverage</span>
                            <div className="flex bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-1.5 rounded-2xl w-full">
                                <button
                                    onClick={() => { setFocusType('whole'); setSelectedMuscle(null); }}
                                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${focusType === 'whole' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                >
                                    Whole Body Fitness
                                </button>
                                <button
                                    onClick={() => setFocusType('muscle')}
                                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${focusType === 'muscle' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                >
                                    Particular Muscle Area
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Particular Area Muscle Anatomy display */}
                    {focusType === 'muscle' && (
                        <div className="mb-6">
                            <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 ml-1">Interactive Anatomical Selector MAP</span>
                            <div className="flex flex-col lg:flex-row gap-8 items-stretch justify-center p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl">
                                {/* Front Model */}
                                <div className="flex-1 flex flex-col items-center p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl">
                                    <span className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-4">Anterior (Front View)</span>
                                    <svg viewBox="0 0 160 300" className="w-48 h-96 drop-shadow-md">
                                        {Object.entries(PathsByGender[selectedGender].front).map(([key, d]) => {
                                            if (key === 'head') {
                                                return (
                                                    <path 
                                                        key={key} 
                                                        d={d} 
                                                        className="fill-gray-300 dark:fill-gray-600 stroke-white dark:stroke-gray-800"
                                                    />
                                                );
                                            }
                                            const muscleName = MuscleMapping[key] || "Neutral";
                                            const isSelected = selectedMuscle === muscleName;
                                            return (
                                                <path
                                                    key={key}
                                                    d={d}
                                                    className={`transition-all duration-200 cursor-pointer stroke-white dark:stroke-gray-900 ${
                                                        isSelected 
                                                            ? 'fill-blue-500 hover:fill-blue-600 drop-shadow-lg' 
                                                            : 'fill-gray-200 dark:fill-gray-700 hover:fill-blue-300 dark:hover:fill-blue-800/85'
                                                    }`}
                                                    onClick={() => {
                                                        setSelectedMuscle(muscleName);
                                                        setFitnessGoal(muscleName);
                                                    }}
                                                >
                                                    <title>{muscleName}</title>
                                                </path>
                                            );
                                        })}
                                    </svg>
                                </div>

                                {/* Back Model */}
                                <div className="flex-1 flex flex-col items-center p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl">
                                    <span className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-4">Posterior (Back View)</span>
                                    <svg viewBox="0 0 160 300" className="w-48 h-96 drop-shadow-md">
                                        {Object.entries(PathsByGender[selectedGender].back).map(([key, d]) => {
                                            if (key === 'head') {
                                                return (
                                                    <path 
                                                        key={key} 
                                                        d={d} 
                                                        className="fill-gray-300 dark:fill-gray-600 stroke-white dark:stroke-gray-800"
                                                    />
                                                );
                                            }
                                            const muscleName = MuscleMapping[key] || "Neutral";
                                            const isSelected = selectedMuscle === muscleName;
                                            return (
                                                <path
                                                    key={key}
                                                    d={d}
                                                    className={`transition-all duration-200 cursor-pointer stroke-white dark:stroke-gray-900 ${
                                                        isSelected 
                                                            ? 'fill-blue-500 hover:fill-blue-600 drop-shadow-lg' 
                                                            : 'fill-gray-200 dark:fill-gray-700 hover:fill-blue-300 dark:hover:fill-blue-800/85'
                                                    }`}
                                                    onClick={() => {
                                                        setSelectedMuscle(muscleName);
                                                        setFitnessGoal(muscleName);
                                                    }}
                                                >
                                                    <title>{muscleName}</title>
                                                </path>
                                            );
                                        })}
                                    </svg>
                                </div>

                                {/* Instant Exercises Display Panel */}
                                <div className="flex-1 flex flex-col justify-between bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 p-6 rounded-2xl">
                                    <div>
                                        {selectedMuscle ? (
                                            <div className="animate-in fade-in duration-350">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className="w-3 h-3 rounded-full bg-blue-500 shadow-md shadow-blue-200 animate-pulse"></span>
                                                    <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider">{selectedMuscle} Exercises</h4>
                                                </div>
                                                <div className="space-y-4">
                                                    {(LOCAL_EXERCISES[selectedMuscle] || []).map((ex, idx) => (
                                                        <div key={idx} className="p-3.5 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/30 rounded-2xl hover:scale-[1.01] transition-transform">
                                                            <div className="flex justify-between items-baseline mb-1">
                                                                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight">{ex.name}</span>
                                                                <span className="text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-lg shrink-0 ml-2">{ex.sets} Sets × {ex.reps}</span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">{ex.tips}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-16 text-center h-full">
                                                <Dumbbell className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4 animate-bounce" />
                                                <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1">Tap a Muscle Blueprint</h4>
                                                <p className="text-xs text-gray-400 dark:text-gray-400 max-w-xs leading-normal">Select coordinates on the anatomical shape models to immediately display targeted exercise sets, or type in the input bar below.</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {selectedMuscle && (
                                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                                            <p className="text-[11px] text-blue-500 dark:text-blue-400 font-semibold text-center italic">
                                                Selected: {selectedMuscle} • Click generate below for a full 7-day calendar plan
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Input Bar & Create Button */}
                    <div className="flex flex-col md:flex-row gap-4 items-end bg-gray-50 dark:bg-gray-900/55 p-4 rounded-3xl border border-gray-200 dark:border-gray-700/80">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
                                {focusType === 'whole' ? 'Fitness Goal / Workout Focus' : 'Selected Muscle Area (Can edit or type manually)'}
                            </label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm" 
                                placeholder={focusType === 'whole' ? "e.g. Lose 10kg in 3 months, Crossfit Beginner, Yoga for core strength..." : "e.g. Chest, Quads, Triceps, Calves, upper back..."} 
                                value={fitnessGoal} 
                                onChange={(e) => setFitnessGoal(e.target.value)} 
                            />
                        </div>
                        <button 
                            onClick={handleGeneratePlan} 
                            disabled={exerciseLoading || !fitnessGoal} 
                            className={`w-full md:w-auto px-8 py-3.5 ${theme.button} text-white rounded-2xl transition disabled:opacity-50 flex items-center justify-center whitespace-nowrap shadow-lg ${theme.shadow} font-black text-sm uppercase tracking-wider`}
                        >
                            {exerciseLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                            Create Workout Plan
                        </button>
                    </div>
                </div>

                {plan && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                       <div className="lg:col-span-8 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-6">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                  <Calendar className={`w-6 h-6 mr-2 ${theme.accent}`} /> Weekly Schedule
                              </h3>
                              <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">{plan.goal}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {plan.weeklySchedule.map((day, idx) => (
                                  <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 transition group">
                                      <div className="flex justify-between items-center mb-3">
                                          <span className="font-bold text-blue-700 dark:text-blue-400">{day.day}</span>
                                          <span className="text-[10px] font-bold text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 group-hover:text-blue-500 transition-colors">{day.duration}</span>
                                      </div>
                                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">{day.workout}</div>
                                  </div>
                              ))}
                          </div>
                          <h4 className="text-md font-bold text-gray-900 dark:text-white mt-8 mb-4 flex items-center">
                              <Dumbbell className={`w-5 h-5 mr-2 ${theme.accent}`} /> Key Exercises
                          </h4>
                          <div className="space-y-3">
                              {plan.exercises.map((ex, idx) => (
                                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                                       <div className="mb-2 sm:mb-0">
                                           <span className="font-bold text-gray-900 dark:text-white block">{ex.name}</span>
                                           <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 block">{ex.tips}</span>
                                       </div>
                                       <div className="flex gap-2 text-xs font-mono font-bold text-blue-600 dark:text-blue-300">
                                           <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-900/50">{ex.sets} Sets</span>
                                           <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-900/50">{ex.reps} Reps</span>
                                       </div>
                                  </div>
                              ))}
                          </div>
                       </div>
                       <div className="lg:col-span-4 bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 h-fit sticky top-4">
                          <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-6 flex items-center">
                              <Apple className="w-5 h-5 mr-2" /> Nutrition & Tips
                          </h3>
                          <ul className="space-y-4">
                              {plan.nutritionTips.map((tip, idx) => (
                                  <li key={idx} className="flex items-start bg-white/60 dark:bg-gray-800/40 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                                      <ChevronRight className="w-4 h-4 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                                      <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100 opacity-90">{tip}</span>
                                  </li>
                              ))}
                          </ul>
                       </div>
                  </div>
              )}
            </div>
        )}

        {activeTab === 'diet' && canAccessDiet && (
            <div className="animate-slide-right duration-300">
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 flex flex-col md:flex-row gap-4 items-end">
                  <div className="w-full md:w-1/3">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">Height (cm)</label>
                      <input type="number" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-medium" placeholder="e.g. 175" value={height} onChange={(e) => setHeight(e.target.value)} />
                  </div>
                  <div className="w-full md:w-1/3">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">Weight (kg)</label>
                      <input type="number" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-medium" placeholder="e.g. 70" value={weight} onChange={(e) => setWeight(e.target.value)} />
                  </div>
                  <button onClick={handleGenerateDiet} disabled={dietLoading || !height || !weight} className={`w-full md:w-auto px-8 py-3 ${theme.button} text-white rounded-xl transition disabled:opacity-50 flex items-center justify-center whitespace-nowrap shadow-lg ${theme.shadow} font-bold`} >
                      {dietLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Utensils className="w-5 h-5 mr-2" />}
                      Create Diet Plan
                  </button>
                </div>

                {dietPlan && currentMeals && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                       <div className="lg:col-span-4 space-y-6">
                          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 text-center relative overflow-hidden">
                               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-green-400 to-red-400"></div>
                               <div className="mb-4">
                                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Body Mass Index</h3>
                                  <div className={`text-3xl font-bold mt-1 ${getBmiColor(bmiValue)}`}>{bmiValue}</div>
                               </div>
                               <div className="relative h-24 mx-auto w-48 mb-2">
                                  <svg viewBox="0 0 100 60" className="w-full h-full">
                                      <defs> <linearGradient id="bmiGradient" x1="0%" y1="0%" x2="100%" y2="0%"> <stop offset="0%" stopColor="#3b82f6" /> <stop offset="50%" stopColor="#22c55e" /> <stop offset="100%" stopColor="#ef4444" /> </linearGradient> </defs>
                                      <path d="M10 45 A 40 40 0 0 1 90 45" fill="none" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round" className="dark:stroke-gray-700" />
                                      <path d="M10 45 A 40 40 0 0 1 90 45" fill="none" stroke="url(#bmiGradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray="126" strokeDashoffset={126 - (126 * bmiPercent) / 100} className="transition-all duration-1000 ease-out" />
                                      <line x1="50" y1="45" x2={needleX} y2={needleY} stroke="currentColor" strokeWidth="2" className="text-gray-800 dark:text-white transition-all duration-1000 ease-out" />
                                      <circle cx="50" cy="45" r="3" fill="currentColor" className="text-gray-800 dark:text-white" />
                                  </svg>
                               </div>
                               <div className="inline-block px-4 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm border border-gray-200 dark:border-gray-600">{dietPlan.bmiCategory}</div>
                          </div>
                          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-800/30 overflow-hidden">
                              <h3 className="flex items-center text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-6"> <Flame className="w-5 h-5 mr-2 text-emerald-500" /> Daily Targets </h3>
                              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-6 pb-4 border-b border-emerald-200 dark:border-emerald-800/50">
                                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-1 sm:mb-0">Calories</span>
                                  <span className="text-2xl font-bold text-gray-900 dark:text-white break-words">{dietPlan.calories}</span>
                              </div>
                              <div className="space-y-5">
                                  <div className="min-w-0">
                                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1.5"> <span className="text-rose-600 dark:text-rose-400">Protein</span> <span className="text-gray-900 dark:text-white truncate ml-2" title={dietPlan.macros.protein}>{dietPlan.macros.protein}</span> </div>
                                      <div className="w-full bg-white dark:bg-gray-700 h-2.5 rounded-full overflow-hidden shadow-sm"> <div className="bg-rose-500 h-full rounded-full w-2/5"></div> </div>
                                  </div>
                                  <div className="min-w-0">
                                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1.5"> <span className="text-amber-600 dark:text-amber-400">Carbs</span> <span className="text-gray-900 dark:text-white truncate ml-2" title={dietPlan.macros.carbs}>{dietPlan.macros.carbs}</span> </div>
                                      <div className="w-full bg-white dark:bg-gray-700 h-2.5 rounded-full overflow-hidden shadow-sm"> <div className="bg-amber-500 h-full rounded-full w-1/3"></div> </div>
                                  </div>
                                  <div className="min-w-0">
                                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1.5"> <span className="text-blue-600 dark:text-blue-400">Fats</span> <span className="text-gray-900 dark:text-white truncate ml-2" title={dietPlan.macros.fats}>{dietPlan.macros.fats}</span> </div>
                                      <div className="w-full bg-white dark:bg-gray-700 h-2.5 rounded-full overflow-hidden shadow-sm"> <div className="bg-blue-500 h-full rounded-full w-1/4"></div> </div>
                                  </div>
                              </div>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                               <h3 className="flex items-center text-lg font-bold text-blue-800 dark:text-blue-300 mb-2"> <Droplets className="w-5 h-5 mr-2" /> Hydration </h3>
                              <p className="text-sm text-blue-700 dark:text-blue-200 leading-relaxed">{dietPlan.hydration}</p>
                          </div>
                       </div>
                       <div className="lg:col-span-8 space-y-6">
                           <div className="flex flex-col sm:flex-row gap-4">
                               <div className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                                   <div>
                                       <h3 className="text-lg font-bold flex items-center"> <Sparkles className="w-5 h-5 mr-2" /> Today's Progress </h3>
                                       <p className="text-teal-100 text-sm opacity-90">Track your daily adherence.</p>
                                   </div>
                                   <button onClick={toggleDietComplete} className={`flex items-center px-4 py-2 rounded-xl font-bold transition-all shadow-sm text-sm whitespace-nowrap ${dailyDietComplete ? 'bg-white text-teal-600' : 'bg-black/20 hover:bg-black/30 text-white'}`} >
                                       <div className={`w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center ${dailyDietComplete ? 'border-teal-600' : 'border-white'}`}>{dailyDietComplete && <Check className="w-2.5 h-2.5" />}</div>
                                       {dailyDietComplete ? 'Done!' : 'Mark Done'}
                                   </button>
                               </div>
                           </div>
                           <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center"> <Utensils className="w-6 h-6 mr-2 text-teal-500" /> Daily Meal Plan </h3>
                                  <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl self-stretch sm:self-auto">
                                      <button onClick={() => setDietPreference('vegetarian')} className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${dietPreference === 'vegetarian' ? 'bg-white dark:bg-gray-600 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}><Sprout className="w-4 h-4 mr-2" /> Vegetarian</button>
                                      <button onClick={() => setDietPreference('mixed')} className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${dietPreference === 'mixed' ? 'bg-white dark:bg-gray-600 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}><Drumstick className="w-4 h-4 mr-2" /> Veg & Non-Veg</button>
                                  </div>
                               </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300" key={dietPreference}>
                                   <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-900 transition-colors">
                                       <div className="flex justify-between items-center mb-3 border-b border-gray-200 dark:border-gray-700 pb-2"> <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Breakfast</span> <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded">8:00 AM</span> </div>
                                       {Array.isArray(currentMeals.breakfast) ? renderMealList(currentMeals.breakfast) : <p className="text-sm text-gray-500 italic">No meals found.</p>}
                                   </div>
                                   <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-900 transition-colors">
                                       <div className="flex justify-between items-center mb-3 border-b border-gray-200 dark:border-gray-700 pb-2"> <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Lunch</span> <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded">1:00 PM</span> </div>
                                       {Array.isArray(currentMeals.lunch) ? renderMealList(currentMeals.lunch) : <p className="text-sm text-gray-500 italic">No meals found.</p>}
                                   </div>
                                   <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-900 transition-colors">
                                       <div className="flex justify-between items-center mb-3 border-b border-gray-200 dark:border-gray-700 pb-2"> <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Snack</span> <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded">4:00 PM</span> </div>
                                       {Array.isArray(currentMeals.snack) ? renderMealList(currentMeals.snack) : <p className="text-sm text-gray-500 italic">No meals found.</p>}
                                   </div>
                                   <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-900 transition-colors">
                                       <div className="flex justify-between items-center mb-3 border-b border-gray-200 dark:border-gray-700 pb-2"> <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Dinner</span> <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded">8:00 PM</span> </div>
                                       {Array.isArray(currentMeals.dinner) ? renderMealList(currentMeals.dinner) : <p className="text-sm text-gray-500 italic">No meals found.</p>}
                                   </div>
                               </div>
                           </div>
                           <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
                               <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Why this works for you</h3>
                               <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">{dietPlan.explanation}</p>
                           </div>
                       </div>
                  </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
