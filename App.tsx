
import React, { useState, useEffect } from 'react';
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
import { AppView, UserState, PersonalityResult, InterestAnalysis, CareerRoadmap, SkillGapAnalysis, ResumeData, CareerRecommendation, SkillProficiency, DailyRoutine, UserProfile, CollegeResult, SalaryInsights, ExercisePlan, DietPlan } from './types';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';

const COUNTRIES = [
  "India", "USA", "UK", "Canada", "Australia", 
  "Germany", "France", "European Union", "Japan", "China", 
  "Singapore", "UAE", "Brazil", "South Africa", "Global"
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  // Application State
  const [userState, setUserState] = useState<UserState>({
    name: '',
    country: 'India', // Default country
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
  });

  // Restore Theme and Auth from local storage
  useEffect(() => {
    // Theme
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
        setIsDark(true);
        document.documentElement.classList.add('dark');
    }

    // User Session
    const session = localStorage.getItem('pathfinder_session');
    if (session) {
        try {
            const user = JSON.parse(session);
            setCurrentUser(user);
            setUserState(prev => ({ ...prev, name: user.username }));
        } catch(e) { console.error(e); }
    } else {
      // Guest Mode Default
      setUserState(prev => ({ ...prev, name: 'Guest' }));
    }
  }, []);

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

  const handleUpdateUser = (updates: Partial<UserState>) => {
    setUserState(prev => ({ ...prev, ...updates }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      handleUpdateUser({ country: e.target.value });
  };

  // Auth Handlers
  const handleLogin = (user: UserProfile) => {
      setCurrentUser(user);
      setUserState(prev => ({ ...prev, name: user.username }));
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
      // Clear app state
      setUserState({
        name: 'Guest',
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
      });
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
      if (!currentUser) return;
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      localStorage.setItem('pathfinder_session', JSON.stringify(updatedUser));
      
      // Update persistent users list
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
        return <Dashboard userState={userState} onChangeView={setCurrentView} />;
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
                targetCareer: result.targetRole // Sync target career with roadmap
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
      default:
        return <Dashboard userState={userState} onChangeView={setCurrentView} />;
    }
  };

  return (
    <div className={`flex h-screen font-sans text-gray-900 bg-gray-50 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-200`}>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50 flex items-center justify-between p-4 transition-colors">
        <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400 font-brand">Pathfinder AI</span>
        <div className="flex items-center gap-3">
           <AuthWidget 
                currentUser={currentUser}
                onLogin={handleLogin}
                onLogout={handleLogout}
                onDeleteAccount={handleDeleteAccount}
                onUpdateProfile={handleUpdateProfile}
            />
           <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700 dark:text-gray-200 p-1">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
         <Sidebar 
            currentView={currentView} 
            onChangeView={(view) => { setCurrentView(view); setMobileMenuOpen(false); }} 
            isDark={isDark}
            toggleTheme={toggleTheme}
         />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full pt-16 md:pt-0 relative">
          <div className="hidden md:flex justify-end items-center p-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800 gap-6">
              
              {/* Refined Region Selector */}
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

              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>

              <AuthWidget 
                  currentUser={currentUser}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                  onDeleteAccount={handleDeleteAccount}
                  onUpdateProfile={handleUpdateProfile}
              />
          </div>
          
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
             {/* Animation Wrapper */}
             <div key={currentView} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards ease-out">
                {renderView()}
             </div>
          </div>
      </main>

      {/* Floating Chatbot */}
      <Chatbot />
    </div>
  );
};

export default App;
