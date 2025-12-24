
import React, { useState, useEffect } from 'react';
import { DailyRoutine, ExercisePlan, DietPlan, MealItem, UserSettings } from '../types';
import { getDailyRoutine, getExercisePlan, getDietPlan } from '../services/gemini';
import { Loader2, Coffee, Sun, Moon, Briefcase, Heart, Activity, Dumbbell, Calendar, Apple, ChevronRight, Trash2, Plus, CheckCircle2, Circle, Clock, Zap, Utensils, Droplets, Scale, Lock, Flame, Check, Sparkles, Sprout, Drumstick, RefreshCw, CalendarDays } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface HabitEnhancerProps {
  onCompleteRoutine: (routine: DailyRoutine) => void;
  onCompletePlan: (plan: ExercisePlan) => void;
  onCompleteDiet: (plan: DietPlan) => void;
  existingRoutine: DailyRoutine | null;
  existingPlan: ExercisePlan | null;
  existingDiet: DietPlan | null;
  targetCareer: string | null;
  settings: UserSettings;
}

export const HabitEnhancer: React.FC<HabitEnhancerProps> = ({ 
  onCompleteRoutine, 
  onCompletePlan, 
  onCompleteDiet, 
  existingRoutine, 
  existingPlan, 
  existingDiet, 
  targetCareer,
  settings
}) => {
  const [activeTab, setActiveTab] = useState<'routine' | 'exercise' | 'diet'>('routine');
  
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
        <div className="bg-white/20 backdrop-blur-md p-1 rounded-xl flex self-start md:self-auto border border-white/20">
            <button onClick={() => setActiveTab('routine')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${activeTab === 'routine' ? 'bg-white text-indigo-600 shadow-md' : 'text-white hover:bg-white/10'}`}><Coffee className="w-4 h-4 mr-2" /> Routine</button>
            <button onClick={() => setActiveTab('exercise')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${activeTab === 'exercise' ? 'bg-white text-blue-600 shadow-md' : 'text-white hover:bg-white/10'}`}><Dumbbell className="w-4 h-4 mr-2" /> Fitness</button>
            <button onClick={() => canAccessDiet && setActiveTab('diet')} disabled={!canAccessDiet} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${activeTab === 'diet' ? 'bg-white text-teal-600 shadow-md' : 'text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed'}`} title={!canAccessDiet ? "Complete Routine and Fitness first" : ""} >{canAccessDiet ? <Utensils className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />} Diet</button>
        </div>
      </div>

      <div key={activeTab} className="animate-fade-in">
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
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">Fitness Goal</label>
                      <input type="text" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" placeholder="e.g. Build Muscle, Lose Weight, Yoga for Flexibility" value={fitnessGoal} onChange={(e) => setFitnessGoal(e.target.value)} />
                  </div>
                  <button onClick={handleGeneratePlan} disabled={exerciseLoading || !fitnessGoal} className={`w-full md:w-auto px-8 py-3 ${theme.button} text-white rounded-xl transition disabled:opacity-50 flex items-center justify-center whitespace-nowrap shadow-lg ${theme.shadow} font-bold`} >
                      {exerciseLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Dumbbell className="w-5 h-5 mr-2" />}
                      Create Workout Plan
                  </button>
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
