
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { PersonalityTest } from './components/PersonalityTest';
import { InterestsAnalyzer } from './components/InterestsAnalyzer';
import { CareerRoadmapTool } from './components/CareerRoadmap';
import { SkillGapTool } from './components/SkillGap';
import { ResumeMaker } from './components/ResumeMaker';
import { CareerRecommender } from './components/CareerRecommender';
import { HabitEnhancer } from './components/HabitEnhancer';
import { CollegeFinder } from './components/CollegeFinder';
import { JobListings } from './components/JobListings';
import { AuthWidget } from './components/AuthWidget';
import { Chatbot } from './components/Chatbot';
import { SplashScreen } from './components/SplashScreen';
import { FeedbackModal } from './components/FeedbackModal';
import { Settings } from './components/Settings';
import { ProjectLab } from './components/ProjectLab';
import { ROIRunway } from './components/ROIRunway';
import { 
    AppView, UserState, PersonalityResult, InterestAnalysis, 
    CareerRoadmap, SkillGapAnalysis, ResumeData, CareerRecommendation, 
    SkillProficiency, DailyRoutine, UserProfile, CollegeResult, 
    SalaryInsights, ExercisePlan, DietPlan, UserSettings, ProjectIdea 
} from './types';
import { Menu, X, Globe, ChevronDown, Sprout } from 'lucide-react';

const COUNTRIES = [
  "India", "USA", "UK", "Canada", "Australia", 
  "Germany", "France", "European Union", "Japan", "China", 
  "Singapore", "UAE", "Brazil", "South Africa", "Global"
];

const DEFAULT_SETTINGS: UserSettings = {
    themePrimary: '#4f46e5',
    botPersonality: 'guide',
    responseType: 'normal',
    isPro: false,
    animationsEnabled: true,
    dynamicThemeEnabled: false,
    region: 'India',
    uiStyle: 'modern',
    calendarConnections: {
        local: false,
        google: false,
        calendly: false,
    },
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [previousView, setPreviousView] = useState<AppView>(AppView.DASHBOARD);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAmbientRunning, setIsAmbientRunning] = useState(false);
  
  // Application State
  const [userState, setUserState] = useState<UserState>({
    name: '',
    country: 'India', 
    personalityResult: null,
    roadmap: null,
    skillGap: null,
    skillTracker: null,
    interestAnalysis: null,
    resume: null,
    recommendations: null,
    targetCareer: null,
    habitRoutine: null,
    exercisePlan: null,
    dietPlan: null,
    collegeResults: null,
    salaryInsights: null,
    projectIdeas: null,
    settings: DEFAULT_SETTINGS,
  });

  // Restore State from local storage
  useEffect(() => {
    // Theme
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || !storedTheme) {
        setIsDark(true);
        document.documentElement.classList.add('dark');
    }

    // Load entire UserState if exists
    const storedState = localStorage.getItem('pathfinder_full_state');
    if (storedState) {
        try {
            const parsed = JSON.parse(storedState);
            setUserState(parsed);
        } catch(e) { console.error("Error loading state", e); }
    }

    // User Session
    const session = localStorage.getItem('pathfinder_session');
    if (session) {
        try {
            const user = JSON.parse(session);
            setCurrentUser(user);
            setUserState(prev => ({ ...prev, name: user.firstName || user.username }));
        } catch(e) { console.error(e); }
    } else {
      setUserState(prev => ({ ...prev, name: 'Guest' }));
    }
  }, []);

  // Save state to storage on every change
  useEffect(() => {
    localStorage.setItem('pathfinder_full_state', JSON.stringify(userState));
  }, [userState]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // Manage Steampunk & Solarpunk ambient hum and click audio interactions
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const currentStyle = userState.settings.uiStyle;
      if (currentStyle === 'steampunk') {
        const target = e.target as HTMLElement;
        const isInteractive = target.closest('button, a, input, select, textarea, [role="button"], [class*="cursor-pointer"]');
        if (isInteractive) {
          import('./services/steampunkAudio').then(({ steampunkAudio }) => {
            steampunkAudio.playTick(0.2);
          });
        }
      } else if (currentStyle === 'solarpunk') {
        const target = e.target as HTMLElement;
        const isInteractive = target.closest('button, a, input, select, textarea, [role="button"], [class*="cursor-pointer"]');
        if (isInteractive) {
          import('./services/solarpunkAudio').then(({ solarpunkAudio }) => {
            solarpunkAudio.playWaterDewdrop(0.35);
          });
        }
      }
    };

    window.addEventListener('click', handleGlobalClick, { capture: true });
    return () => {
      window.removeEventListener('click', handleGlobalClick, { capture: true });
    };
  }, [userState.settings.uiStyle]);

  // Turn ambient state off if user leaves Steampunk or Solarpunk
  useEffect(() => {
    if (userState.settings.uiStyle !== 'steampunk' && isAmbientRunning) {
      import('./services/steampunkAudio').then(({ steampunkAudio }) => {
        if (steampunkAudio.isRunning()) {
          steampunkAudio.stopAmbient();
        }
        setIsAmbientRunning(false);
      });
    }
    if (userState.settings.uiStyle !== 'solarpunk' && isAmbientRunning) {
      import('./services/solarpunkAudio').then(({ solarpunkAudio }) => {
        if (solarpunkAudio.isRunning()) {
          solarpunkAudio.stopAmbient();
        }
        setIsAmbientRunning(false);
      });
    }
  }, [userState.settings.uiStyle, isAmbientRunning]);

  // Derive dynamic theme color
  const themePrimary = useMemo(() => {
    const source = userState.settings.themeSource || (userState.settings.dynamicThemeEnabled ? 'personality' : 'manual');

    if (source === 'manual') return userState.settings.themePrimary;

    if (source === 'personality' && userState.personalityResult?.mbti) {
      const mbti = userState.personalityResult.mbti.toUpperCase().substring(0, 4);
      const mbtiColors: Record<string, string> = {
        'INTJ': '#8b5cf6', // Violet
        'INTP': '#6366f1', // Indigo
        'ENTJ': '#d946ef', // Fuchsia
        'ENTP': '#ec4899', // Pink
        'INFJ': '#10b981', // Emerald
        'INFP': '#14b8a6', // Teal
        'ENFJ': '#059669', // Green
        'ENFP': '#84cc16', // Lime
        'ISTJ': '#0ea5e9', // Sky
        'ISFJ': '#3b82f6', // Blue
        'ESTJ': '#0284c7', // Light Blue
        'ESFJ': '#2563eb', // Royal Blue
        'ISTP': '#f59e0b', // Amber
        'ISFP': '#f97316', // Orange
        'ESTP': '#ef4444', // Red
        'ESFP': '#eab308', // Yellow
      };
      if (mbtiColors[mbti]) return mbtiColors[mbti];
    }

    if (source === 'career' && userState.targetCareer) {
      const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'];
      let hash = 0;
      for (let i = 0; i < userState.targetCareer.length; i++) {
        hash = userState.targetCareer.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    }

    const traits = userState.personalityResult?.traits || [];
    const dominantTrait = traits.length > 0
      ? traits.reduce((prev, current) => (prev.score > current.score) ? prev : current)
      : null;

    if (dominantTrait) {
      const t = dominantTrait.trait.toLowerCase();
      if (t.includes('openness')) return '#0d9488'; // Teal
      if (t.includes('conscientiousness')) return '#059669'; // Emerald
      if (t.includes('extraversion')) return '#d97706'; // Amber
      if (t.includes('agreeableness')) return '#e11d48'; // Rose
      if (t.includes('neuroticism')) return '#7c3aed'; // Violet
    }

    // Progress based fallback tints if personality isn't set but other tabs are
    if (userState.roadmap) return '#8b5cf6'; // Violet
    if (userState.skillGap) return '#2563eb'; // Blue
    if (userState.interestAnalysis) return '#0ea5e9'; // Sky
    if (userState.targetCareer) return '#4f46e5'; // Indigo

    return userState.settings.themePrimary;
  }, [userState.settings.themeSource, userState.settings.dynamicThemeEnabled, userState.settings.themePrimary, userState.personalityResult, userState.roadmap, userState.skillGap, userState.interestAnalysis, userState.targetCareer]);

  // Update scrollbar CSS variables based on themePrimary
  useEffect(() => {
    const root = document.documentElement;
    // Add alpha to hex for semi-transparent scrollbar
    const alpha10 = '1a'; // 10%
    const alpha40 = '66'; // 40%
    const alpha60 = '99'; // 60%
    
    if (isDark) {
      root.style.setProperty('--scrollbar-thumb', `${themePrimary}${alpha40}`);
      root.style.setProperty('--scrollbar-thumb-hover', `${themePrimary}${alpha60}`);
    } else {
      root.style.setProperty('--scrollbar-thumb', `${themePrimary}${alpha10}`);
      root.style.setProperty('--scrollbar-thumb-hover', `${themePrimary}${alpha40}`);
    }
  }, [themePrimary, isDark]);

  // Convert and update RGB variable and manage futuristic class tag
  useEffect(() => {
    const root = document.documentElement;
    const hex = themePrimary.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 79;
    const g = parseInt(hex.substring(2, 4), 16) || 70;
    const b = parseInt(hex.substring(4, 6), 16) || 229;
    root.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);

    const uiStyle = userState.settings.uiStyle || 'modern';
    ['steampunk', 'solarpunk', 'futuristic'].forEach(styleName => {
      if (uiStyle === styleName) {
        root.classList.add(styleName);
      } else {
        root.classList.remove(styleName);
      }
    });
  }, [themePrimary, userState.settings.uiStyle]);

  const handleUpdateUser = (updates: Partial<UserState>) => {
    setUserState(prev => ({ ...prev, ...updates }));
  };

  const handleUpdateSettings = (updates: Partial<UserSettings>) => {
    setUserState(prev => {
        const nextSettings = { ...prev.settings, ...updates };
        // Sync country/region
        const nextCountry = updates.region || prev.country;
        return { ...prev, country: nextCountry, settings: { ...nextSettings, region: nextCountry } };
    });
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      handleUpdateSettings({ region: val });
  };

  const handleNavigate = (view: AppView) => {
    if (currentView !== AppView.SETTINGS) {
        setPreviousView(currentView);
    }
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userState, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `pathfinder_data_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleResetData = () => {
      if (confirm("CRITICAL WARNING: This will permanently delete all your data. Continue?")) {
          localStorage.removeItem('pathfinder_full_state');
          localStorage.removeItem('pathfinder_session');
          window.location.reload();
      }
  };

  // Auth Handlers
  const handleLogin = (user: UserProfile) => {
      setCurrentUser(user);
      setUserState(prev => ({ ...prev, name: user.firstName || user.username }));
      localStorage.setItem('pathfinder_session', JSON.stringify(user));
  };

  const handleLogout = () => {
      setCurrentUser(null);
      setUserState(prev => ({ ...prev, name: 'Guest' }));
      localStorage.removeItem('pathfinder_session');
      setCurrentView(AppView.DASHBOARD);
  };

  const handleDeleteAccount = () => {
      if (!currentUser) return;
      const usersStr = localStorage.getItem('pathfinder_users');
      if (usersStr) {
          const users: UserProfile[] = JSON.parse(usersStr);
          const filtered = users.filter(u => u.username !== currentUser.username);
          localStorage.setItem('pathfinder_users', JSON.stringify(filtered));
      }
      handleLogout();
      handleResetData();
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
      if (!currentUser) return;
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      localStorage.setItem('pathfinder_session', JSON.stringify(updatedUser));
      setUserState(prev => ({ ...prev, name: updatedUser.firstName || updatedUser.username }));
      
      const usersStr = localStorage.getItem('pathfinder_users');
      if (usersStr) {
          const users: UserProfile[] = JSON.parse(usersStr);
          const index = users.findIndex(u => u.username === currentUser.username);
          if (index !== -1) {
              users[index] = { ...users[index], ...updates };
              localStorage.setItem('pathfinder_users', JSON.stringify(users));
          }
      }
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard userState={userState} onChangeView={handleNavigate} />;
      case AppView.PERSONALITY:
        return (
          <PersonalityTest 
            existingResult={userState.personalityResult}
            onComplete={(result: PersonalityResult) => handleUpdateUser({ personalityResult: result })}
          />
        );
      case AppView.INTERESTS:
        return (
          <InterestsAnalyzer 
            existingResult={userState.interestAnalysis}
            onComplete={(result: InterestAnalysis) => handleUpdateUser({ interestAnalysis: result })}
            country={userState.country}
            themeColor={themePrimary}
          />
        );
      case AppView.ROADMAP:
        return (
          <CareerRoadmapTool 
            existingResult={userState.roadmap}
            onComplete={(result: CareerRoadmap) => handleUpdateUser({ 
                roadmap: result,
                targetCareer: result.targetRole 
            })}
          />
        );
      case AppView.SKILL_GAP:
        return (
          <SkillGapTool 
            existingResult={userState.skillGap}
            existingTracker={userState.skillTracker}
            onComplete={(result: SkillGapAnalysis) => handleUpdateUser({ skillGap: result })}
            onUpdateTracker={(skills: SkillProficiency[]) => handleUpdateUser({ skillTracker: skills })}
          />
        );
      case AppView.PROJECT_LAB:
        return (
          <ProjectLab
            userState={userState}
            onUpdateProjects={(projects: ProjectIdea[]) => handleUpdateUser({ projectIdeas: projects })}
          />
        );
      case AppView.RESUME_BUILDER:
        return (
          <ResumeMaker
            existingData={userState.resume}
            onSave={(data: ResumeData) => handleUpdateUser({ resume: data })}
            userState={userState}
          />
        );
      case AppView.CAREER_RECOMMENDER:
        return (
          <CareerRecommender
            userState={userState}
            country={userState.country}
            onUpdate={(recs: CareerRecommendation[]) => handleUpdateUser({ recommendations: recs })}
            onSetTarget={(career: string) => {
                handleUpdateUser({ targetCareer: career });
                setCurrentView(AppView.DASHBOARD);
            }}
          />
        );
      case AppView.HABIT_ENHANCER:
        return (
          <HabitEnhancer
            existingRoutine={userState.habitRoutine}
            existingPlan={userState.exercisePlan}
            existingDiet={userState.dietPlan}
            targetCareer={userState.targetCareer}
            settings={userState.settings}
            userState={userState}
            onUpdateUserState={(updates) => handleUpdateUser(updates)}
            onCompleteRoutine={(routine: DailyRoutine) => handleUpdateUser({ habitRoutine: routine })}
            onCompletePlan={(plan: ExercisePlan) => handleUpdateUser({ exercisePlan: plan })}
            onCompleteDiet={(plan: DietPlan) => handleUpdateUser({ dietPlan: plan })}
          />
        );
      case AppView.COLLEGE_FINDER:
        return (
          <CollegeFinder
            country={userState.country}
            existingResult={userState.collegeResults}
            onComplete={(result: CollegeResult) => handleUpdateUser({ collegeResults: result })}
          />
        );
      case AppView.JOB_LISTINGS:
        return (
          <JobListings
            country={userState.country}
            existingData={userState.salaryInsights}
            onComplete={(result: SalaryInsights) => handleUpdateUser({ salaryInsights: result })}
          />
        );
      case AppView.ROI_RUNWAY:
        return (
          <ROIRunway 
            userState={userState}
            themeColor={themePrimary}
          />
        );
      case AppView.SETTINGS:
        return null;
      default:
        return <Dashboard userState={userState} onChangeView={handleNavigate} />;
    }
  };

  const isViewingSharedResume = typeof window !== 'undefined' && window.location.search.includes('viewResume=true');
  if (isViewingSharedResume) {
    return (
      <ResumeMaker
        existingData={userState.resume}
        onSave={(data: ResumeData) => handleUpdateUser({ resume: data })}
        userState={userState}
      />
    );
  }

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} userState={userState} themeColor={themePrimary} />}
      {userState.settings.uiStyle === 'futuristic' && !showSplash && <div className="futuristic-scanline" />}
      
      <div className={`flex h-screen font-sans text-gray-900 bg-gray-50 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-200 ${showSplash ? 'hidden' : 'flex'} view-${currentView.toLowerCase()}`}>
        <div className="md:hidden fixed top-0 w-full bg-white/95 dark:bg-gray-950 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50 flex items-center justify-between p-4 transition-colors">
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700 dark:text-gray-200 p-1">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <span className="font-bold text-lg font-brand" style={{ color: themePrimary }}>Pathfinder</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsRegionOpen(!isRegionOpen)}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 cursor-pointer"
                  style={{ color: themePrimary }}
                >
                    <Globe className="w-4 h-4" />
                </motion.div>
                <AnimatePresence>
                {isRegionOpen && (
                  <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsRegionOpen(false)} 
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="absolute top-full right-0 mt-2 w-48 overflow-hidden rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 z-50 origin-top-right bg-white/95 dark:bg-gray-950 backdrop-blur-3xl p-1.5"
                    >
                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                            {COUNTRIES.map((c, idx) => (
                                <motion.button
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    key={c}
                                    onClick={() => {
                                        handleCountryChange({ target: { value: c } } as any);
                                        setIsRegionOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all mb-1 last:mb-0 flex items-center justify-between ${
                                        userState.country === c 
                                        ? '' 
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                                    }`}
                                    style={userState.country === c ? { backgroundColor: `${themePrimary}22`, color: themePrimary } : {}}
                                >
                                    {c}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                  </>
                )}
                </AnimatePresence>
            </div>
            {userState.settings.uiStyle === 'steampunk' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  import('./services/steampunkAudio').then(({ steampunkAudio }) => {
                    const state = steampunkAudio.toggleAmbientSteamEngine();
                    setIsAmbientRunning(state);
                  });
                }}
                className={`relative flex items-center justify-center w-9 h-9 rounded-full border border-[#8c6239] bg-[#241b14] shadow-md cursor-pointer`}
              >
                <div className="absolute inset-0.5 rounded-full bg-[#f4ebd9] dark:bg-[#1a1410] border border-[#a27f5a] flex items-center justify-center overflow-hidden">
                  <motion.div 
                    initial={{ rotate: -45 }}
                    animate={{ rotate: isAmbientRunning ? [35, 45, 40, 50, 42, 45] : -40 }}
                    transition={isAmbientRunning ? { repeat: Infinity, duration: 4, ease: "easeInOut" } : { type: "spring" }}
                    className="absolute w-0.5 h-3 bg-red-600 origin-bottom rounded-full"
                    style={{ bottom: '50%', transformOrigin: 'bottom center' }}
                  />
                  <div className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8c6239] border border-black/40 z-10" />
                </div>
              </motion.button>
            )}
            {userState.settings.uiStyle === 'solarpunk' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  import('./services/solarpunkAudio').then(({ solarpunkAudio }) => {
                    const state = solarpunkAudio.toggleAmbientCanopy();
                    setIsAmbientRunning(state);
                  });
                }}
                className={`relative flex items-center justify-center w-9 h-9 rounded-full border border-teal-600/50 bg-[#1e3a35]/10 dark:bg-teal-950/20 shadow-md cursor-pointer`}
              >
                <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-[#f0fbf9] to-[#d8f3ee] dark:from-[#0d221e] dark:to-[#040e0c] border border-teal-500/20 flex items-center justify-center overflow-hidden">
                  <motion.div 
                    animate={isAmbientRunning ? { scale: [1, 1.15, 1], rotate: [0, 180, 360] } : { scale: 1, rotate: 0 }}
                    transition={isAmbientRunning ? { repeat: Infinity, duration: 6, ease: "linear" } : { type: "spring" }}
                    className="text-teal-600 dark:text-teal-400 flex items-center justify-center"
                  >
                    <Sprout className="w-4 h-4" />
                  </motion.div>
                </div>
              </motion.button>
            )}
            <AuthWidget 
                currentUser={currentUser}
                onLogin={handleLogin}
                onLogout={handleLogout}
                onDeleteAccount={handleDeleteAccount}
                onUpdateProfile={handleUpdateProfile}
                themeColor={themePrimary}
                isDark={isDark}
            />
          </div>
        </div>

        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}>
           <Sidebar 
              currentView={currentView} 
              onChangeView={handleNavigate} 
              isDark={isDark}
              toggleTheme={toggleTheme}
              onOpenFeedback={() => { setIsFeedbackOpen(true); setMobileMenuOpen(false); }}
              themeColor={themePrimary}
           />
        </div>

        <main className="flex-1 flex flex-col h-screen overflow-hidden w-full pt-16 md:pt-0 relative">
            <div className="hidden md:flex justify-between items-center p-4 bg-white/50 dark:bg-gray-900 backdrop-blur-sm sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="relative group">
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsRegionOpen(!isRegionOpen)}
                        className={`flex items-center transition-all duration-300 py-2.5 px-4 rounded-2xl border cursor-pointer relative z-10 ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white/60 border-white/80 hover:bg-white shadow-sm hover:shadow-md backdrop-blur-xl'}`}
                      >
                          <div className="p-1.5 rounded-lg bg-white dark:bg-white/10 shadow-sm mr-3" style={{ color: themePrimary }}>
                              <Globe className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex flex-col">
                              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Region</span>
                              <div className="flex items-center">
                                  <span className="text-xs font-black text-gray-900 dark:text-white tracking-tight mr-2">{userState.country}</span>
                                  <ChevronDown className={`w-3 h-3 opacity-30 group-hover:opacity-100 transition-all duration-300 ${isRegionOpen ? 'rotate-180 opacity-100' : ''}`} />
                              </div>
                          </div>
                      </motion.div>

                      <AnimatePresence>
                      {isRegionOpen && (
                        <>
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40" 
                            onClick={() => setIsRegionOpen(false)} 
                          />
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="absolute top-full left-0 mt-3 w-56 overflow-hidden rounded-[2rem] shadow-2xl border border-white/20 dark:border-white/10 z-50 origin-top-left bg-white/95 dark:bg-gray-950 backdrop-blur-3xl p-2"
                          >
                              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                  {COUNTRIES.map((c, idx) => (
                                      <motion.button
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: idx * 0.03 }}
                                          key={c}
                                          onClick={() => {
                                              handleCountryChange({ target: { value: c } } as any);
                                              setIsRegionOpen(false);
                                          }}
                                          className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all mb-1 last:mb-0 flex items-center justify-between group ${
                                              userState.country === c 
                                              ? '' 
                                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                                          }`}
                                          style={userState.country === c ? { backgroundColor: `${themePrimary}22`, color: themePrimary } : {}}
                                      >
                                          {c}
                                          {userState.country === c && <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.4)]" style={{ backgroundColor: themePrimary, boxShadow: `0 0 8px ${themePrimary}cc` }} />}
                                      </motion.button>
                                  ))}
                              </div>
                          </motion.div>
                        </>
                      )}
                      </AnimatePresence>
                      {/* Subtle hover blob */}
                      <div className="absolute -right-2 -bottom-2 w-12 h-12 rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{ backgroundColor: themePrimary }}></div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {userState.settings.uiStyle === 'steampunk' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Toggle Steam Boiler Comfort Loop"
                      onClick={() => {
                        import('./services/steampunkAudio').then(({ steampunkAudio }) => {
                          const state = steampunkAudio.toggleAmbientSteamEngine();
                          setIsAmbientRunning(state);
                        });
                      }}
                      className={`relative flex items-center justify-center w-12 h-12 rounded-full border border-[#8c6239] transition-all bg-[#241b14] shadow-[0_4px_12px_rgba(140,98,57,0.3)] cursor-pointer group`}
                    >
                      {/* Gauge Faceplate background texture */}
                      <div className="absolute inset-0.5 rounded-full bg-[#f4ebd9] dark:bg-[#1a1410] border border-[#a27f5a] flex items-center justify-center overflow-hidden">
                        {/* Gauge ticks circle */}
                        <div className="absolute inset-1 rounded-full border border-dashed border-[#8c6239]/20 flex items-center justify-center">
                          {/* Inside labels */}
                          <div className="text-[6px] font-sans font-extrabold text-[#8c6239]/50 absolute top-2 leading-none uppercase">BOILER</div>
                          <div className="text-[5px] font-mono text-[#8c6239]/50 absolute bottom-1.5 leading-none">PSI</div>
                        </div>

                        {/* Pointer Needle */}
                        <motion.div 
                          initial={{ rotate: -45 }}
                          animate={{ rotate: isAmbientRunning ? [35, 45, 40, 50, 42, 45] : -40 }}
                          transition={isAmbientRunning ? { repeat: Infinity, duration: 4, ease: "easeInOut" } : { type: "spring" }}
                          className="absolute w-0.5 h-4 bg-red-600 origin-bottom rounded-full"
                          style={{ bottom: '50%', transformOrigin: 'bottom center' }}
                        />

                        {/* Center brass screw casing */}
                        <div className="absolute w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8c6239] border border-black/40 shadow-sm z-10 flex items-center justify-center" />
                      </div>

                      {/* Tooltip puff of steam indicator */}
                      <span className="absolute -bottom-8 right-0 text-[8px] tracking-wider uppercase bg-[#1e1814] text-[#f2ebd9] border border-[#8c6239] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 select-none pointer-events-none whitespace-nowrap z-50">
                        {isAmbientRunning ? "Boiler: Steam On" : "Boiler: Ignited"}
                      </span>
                    </motion.button>
                  )}
                  {userState.settings.uiStyle === 'solarpunk' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Toggle Botanical Wind Loop"
                      onClick={() => {
                        import('./services/solarpunkAudio').then(({ solarpunkAudio }) => {
                          const state = solarpunkAudio.toggleAmbientCanopy();
                          setIsAmbientRunning(state);
                        });
                      }}
                      className={`relative flex items-center justify-center w-12 h-12 rounded-full border border-teal-600 bg-[#16302b] shadow-[0_4px_16px_rgba(20,184,166,0.25)] cursor-pointer group`}
                    >
                      {/* Solar Cell Glass background */}
                      <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-[#f2fcf9] to-[#d3f2ec] dark:from-[#0d221e] dark:to-[#040f0c] border border-teal-500/20 flex items-center justify-center overflow-hidden">
                        {/* Leaf veins design */}
                        <div className="absolute inset-1.5 rounded-full border border-[#14b8a6]/20 flex items-center justify-center">
                          <div className="text-[5px] font-sans font-black text-teal-600/40 absolute top-2 leading-none uppercase tracking-widest">WIND</div>
                          <div className="text-[5px] font-mono text-teal-600/40 absolute bottom-2 leading-none">CELL</div>
                        </div>

                        {/* Sprout Spin movement */}
                        <motion.div 
                          animate={isAmbientRunning ? { scale: [1, 1.15, 1], rotate: [0, 180, 360] } : { scale: 1, rotate: 0 }}
                          transition={isAmbientRunning ? { repeat: Infinity, duration: 8, ease: "linear" } : { type: "spring" }}
                          className="text-teal-600 dark:text-teal-400 absolute flex items-center justify-center"
                        >
                          <Sprout className="w-5 h-5" />
                        </motion.div>
                      </div>

                      {/* Tooltip message */}
                      <span className="absolute -bottom-8 right-0 text-[8px] tracking-wider uppercase bg-[#091a16] text-[#e6f7f3] border border-teal-500/40 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 select-none pointer-events-none whitespace-nowrap z-50">
                        {isAmbientRunning ? "Meadow: Breeze Flowing" : "Meadow: Stationary"}
                      </span>
                    </motion.button>
                  )}
                  <AuthWidget 
                      currentUser={currentUser}
                      onLogin={handleLogin}
                      onLogout={handleLogout}
                      onDeleteAccount={handleDeleteAccount}
                      onUpdateProfile={handleUpdateProfile}
                      themeColor={themePrimary}
                      isDark={isDark}
                  />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
               <div key={currentView} className={`flex-1 ${userState.settings.animationsEnabled ? 'animate-slide-up' : ''} fill-mode-forwards`}>
                  {renderView()}
               </div>
            </div>
        </main>

        <Chatbot settings={userState.settings} themeColor={themePrimary} />
        
        <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} themeColor={themePrimary} />

        {/* Fullscreen Settings Overlay */}
        {currentView === AppView.SETTINGS && (
          <Settings 
             settings={userState.settings}
             user={currentUser}
             userState={userState}
             onUpdateSettings={handleUpdateSettings}
             onUpdateProfile={handleUpdateProfile}
             onExportData={handleExportData}
             onResetData={handleResetData}
             onNavigate={handleNavigate}
             previousView={previousView}
             isDark={isDark}
             toggleTheme={toggleTheme}
             themeColor={themePrimary}
          />
        )}
      </div>
    </>
  );
};

export default App;
