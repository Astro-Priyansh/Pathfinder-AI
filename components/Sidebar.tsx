
import React from 'react';
import { LayoutDashboard, Brain, Heart, TrendingUp, Map, User, FileText, Compass, Moon, Sun, Coffee, GraduationCap, Banknote } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isDark, toggleTheme }) => {
  const navItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppView.PERSONALITY, label: 'Personality Test', icon: Brain },
    { id: AppView.INTERESTS, label: 'Interests Analyzer', icon: Heart },
    { id: AppView.SKILL_GAP, label: 'Skill Gap & Tracker', icon: TrendingUp },
    { id: AppView.CAREER_RECOMMENDER, label: 'Career AI Engine', icon: Compass },
    { id: AppView.ROADMAP, label: 'Career Roadmap', icon: Map },
    { id: AppView.SALARY_PREDICTOR, label: 'Salary Predictor', icon: Banknote },
    { id: AppView.COLLEGE_FINDER, label: 'College Finder', icon: GraduationCap },
    { id: AppView.HABIT_ENHANCER, label: 'Habit Enhancer', icon: Coffee },
    { id: AppView.RESUME_BUILDER, label: 'Resume Builder', icon: FileText },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full flex flex-col transition-colors duration-200">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10 flex items-center justify-center">
            {/* Custom Pathfinder Logo */}
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="absolute text-lg font-bold text-indigo-600 dark:text-indigo-400 font-brand">P</span>
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
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`} />
              <span className="text-left">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
          <h3 className="font-medium mb-1 font-brand">Unlock Pro</h3>
          <p className="text-xs text-indigo-100 mb-3">Get advanced insights and mentor matching.</p>
          <button className="w-full py-1.5 px-3 bg-white/20 hover:bg-white/30 rounded text-sm transition-colors text-center backdrop-blur-sm">
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};
