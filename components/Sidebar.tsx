
import React from 'react';
import { LayoutDashboard, Brain, Heart, TrendingUp, Map, User, FileText, Compass, GraduationCap, Banknote, MessageSquareQuote, Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isDark: boolean;
  toggleTheme: () => void;
  onOpenFeedback: () => void;
  themeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isDark, toggleTheme, onOpenFeedback, themeColor = '#4f46e5' }) => {
  const navItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppView.PERSONALITY, label: 'Personality Test', icon: Brain },
    { id: AppView.INTERESTS, label: 'Interests Analyzer', icon: Heart },
    { id: AppView.SKILL_GAP, label: 'Skill Gap & Tracker', icon: TrendingUp },
    { id: AppView.CAREER_RECOMMENDER, label: 'Career AI Engine', icon: Compass },
    { id: AppView.ROADMAP, label: 'Career Roadmap', icon: Map },
    { id: AppView.SALARY_PREDICTOR, label: 'Salary Predictor', icon: Banknote },
    { id: AppView.COLLEGE_FINDER, label: 'College Finder', icon: GraduationCap },
    { id: AppView.HABIT_ENHANCER, label: 'Habit Enhancer', icon: GraduationCap },
    { id: AppView.RESUME_BUILDER, label: 'Resume Builder', icon: FileText },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full flex flex-col transition-colors duration-200">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-10 h-10 transition-colors duration-500" style={{ color: themeColor }} fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="absolute text-lg font-bold font-brand transition-colors duration-500" style={{ color: themeColor }}>P</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white font-brand tracking-tight">Pathfinder</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive 
                  ? 'dark:bg-white/5 font-medium' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
              style={{ 
                backgroundColor: isActive ? `${themeColor}15` : undefined,
                color: isActive ? themeColor : undefined 
              }}
            >
              <Icon className={`w-5 h-5 ${isActive ? '' : 'text-gray-400 dark:text-gray-500'}`} style={{ color: isActive ? themeColor : undefined }} />
              <span className="text-left">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" style={{ color: themeColor }} />}
          <span>{isDark ? 'Light Appearance' : 'Dark Appearance'}</span>
        </button>

        <button
          onClick={onOpenFeedback}
          className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 transition-colors font-medium"
          style={{ '--hover-color': themeColor } as React.CSSProperties}
        >
          <MessageSquareQuote className="w-5 h-5" />
          <span>Send Feedback</span>
        </button>

        <button
          onClick={() => onChangeView(AppView.SETTINGS)}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
            currentView === AppView.SETTINGS 
              ? 'dark:bg-white/5 font-medium' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
          }`}
          style={{ 
            backgroundColor: currentView === AppView.SETTINGS ? `${themeColor}15` : undefined,
            color: currentView === AppView.SETTINGS ? themeColor : undefined 
          }}
        >
          <SettingsIcon className={`w-5 h-5 ${currentView === AppView.SETTINGS ? '' : 'text-gray-400 dark:text-gray-500'}`} />
          <span className="text-left font-bold">Settings</span>
        </button>
      </div>
    </div>
  );
};
