
import React, { useState, useEffect, useMemo } from 'react';
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
import { SalaryPredictor } from './components/SalaryPredictor';
import { AuthWidget } from './components/AuthWidget';
import { Chatbot } from './components/Chatbot';
import { SplashScreen } from './components/SplashScreen';
import { FeedbackModal } from './components/FeedbackModal';
import { Settings } from './components/Settings';
import { 
    AppView, UserState, PersonalityResult, InterestAnalysis, 
    CareerRoadmap, SkillGapAnalysis, ResumeData, CareerRecommendation, 
    SkillProficiency, DailyRoutine, UserProfile, CollegeResult, 
    SalaryInsights, ExercisePlan, DietPlan, UserSettings 
} from './types';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';

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
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [previousView, setPreviousView] = useState<AppView>(AppView.DASHBOARD);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  
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
    settings: DEFAULT_SETTINGS,
  });

  // Restore State from local storage
  useEffect(() => {
    // Theme
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
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

  // Derive dynamic theme color
  const themePrimary = useMemo(() => {
    if (!userState.settings.dynamicThemeEnabled) return userState.settings.themePrimary;

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
  }, [userState.settings.dynamicThemeEnabled, userState.settings.themePrimary, userState.personalityResult, userState.roadmap, userState.skillGap, userState.interestAnalysis, userState.targetCareer]);

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
      case AppView.RESUME_BUILDER:
        return (
          <ResumeMaker
            existingData={userState.resume}
            onSave={(data: ResumeData) => handleUpdateUser({ resume: data })}
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
      case AppView.SALARY_PREDICTOR:
        return (
          <SalaryPredictor
            country={userState.country}
            existingData={userState.salaryInsights}
            onComplete={(result: SalaryInsights) => handleUpdateUser({ salaryInsights: result })}
          />
        );
      case AppView.SETTINGS:
        return null;
      default:
        return <Dashboard userState={userState} onChangeView={handleNavigate} />;
    }
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} userState={userState} themeColor={themePrimary} />}
      
      <div className={`flex h-screen font-sans text-gray-900 bg-gray-50 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-200 ${showSplash ? 'hidden' : 'flex'}`}>
        <div className="md:hidden fixed top-0 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50 flex items-center justify-between p-4 transition-colors">
          <span className="font-bold text-lg font-brand" style={{ color: themePrimary }}>Pathfinder AI</span>
          <div className="flex items-center gap-3">
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700 dark:text-gray-200 p-1">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
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
            <div className="hidden md:flex justify-between items-center p-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="relative group">
                      <div className="flex items-center text-gray-500 dark:text-gray-400 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 py-2 px-3 rounded-xl transition cursor-pointer">
                          <Globe className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium mr-2 text-gray-700 dark:text-gray-200">{userState.country}</span>
                          <ChevronDown className="w-3 h-3 opacity-50" />
                      </div>
                      <select 
                        value={userState.country}
                        onChange={handleCountryChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      >
                          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <AuthWidget 
                      currentUser={currentUser}
                      onLogin={handleLogin}
                      onLogout={handleLogout}
                      onDeleteAccount={handleDeleteAccount}
                      onUpdateProfile={handleUpdateProfile}
                      themeColor={themePrimary}
                  />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
               <div key={currentView} className={`flex-1 ${userState.settings.animationsEnabled ? 'animate-slide-up' : ''} fill-mode-forwards`}>
                  {renderView()}
               </div>
            </div>
        </main>

        <Chatbot settings={userState.settings} />
        
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
