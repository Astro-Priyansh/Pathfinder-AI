import React, { useState } from 'react';
import { SkillProficiency } from '../types';
import { Flame, Sparkles, Sliders, HelpCircle, AlertCircle, Info } from 'lucide-react';

interface SkillHeatmapProps {
  trackedSkills: SkillProficiency[];
  onSkillClick?: (index: number) => void;
}

type PaletteType = 'magma' | 'emerald' | 'neon';

export const SkillHeatmap: React.FC<SkillHeatmapProps> = ({ trackedSkills, onSkillClick }) => {
  const [palette, setPalette] = useState<PaletteType>('neon');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!trackedSkills || trackedSkills.length === 0) {
    return null;
  }

  // Helper color map generator
  const getCellClasses = (level: number, type: PaletteType) => {
    if (type === 'magma') {
      if (level < 20) return 'bg-orange-50 text-orange-900 dark:bg-orange-950/10 dark:text-orange-300 border-orange-100 dark:border-orange-950/35';
      if (level < 40) return 'bg-orange-150 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 border-orange-200 dark:border-orange-900/40';
      if (level < 60) return 'bg-amber-400 text-amber-950 dark:bg-amber-500/40 dark:text-amber-200 border-amber-500 dark:border-amber-700/40 shadow-sm';
      if (level < 80) return 'bg-orange-500 text-white dark:bg-orange-600/60 dark:text-orange-100 border-orange-600 dark:border-orange-500/50 shadow-md shadow-orange-100 dark:shadow-none';
      return 'bg-red-600 text-white dark:bg-red-700 border-red-500 shadow-lg shadow-red-200 dark:shadow-none font-black ring-2 ring-red-400 dark:ring-red-950';
    }
    
    if (type === 'emerald') {
      if (level < 20) return 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/10 dark:text-emerald-300 border-emerald-100 dark:border-emerald-950/35';
      if (level < 40) return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40';
      if (level < 60) return 'bg-emerald-300 text-emerald-950 dark:bg-emerald-500/40 dark:text-emerald-200 border-emerald-400 dark:border-emerald-700/40 shadow-sm';
      if (level < 80) return 'bg-emerald-500 text-white dark:bg-emerald-600/60 dark:text-emerald-100 border-emerald-600 dark:border-emerald-500/50 shadow-md shadow-emerald-100 dark:shadow-none';
      return 'bg-teal-600 text-white dark:bg-teal-700 border-teal-500 shadow-lg shadow-teal-200 dark:shadow-none font-black ring-2 ring-teal-400 dark:ring-teal-950';
    }

    // Default 'neon' / Futuristic Cyan & Indigo theme
    if (level < 20) return 'bg-blue-50/50 text-blue-900 dark:bg-blue-950/10 dark:text-blue-300 border-blue-100/50 dark:border-blue-950/35';
    if (level < 40) return 'bg-blue-100/80 text-blue-900 dark:bg-blue-950/30 dark:text-blue-300 border-blue-200/70 dark:border-blue-900/40';
    if (level < 60) return 'bg-indigo-300/80 text-indigo-950 dark:bg-indigo-500/40 dark:text-indigo-200 border-indigo-400 dark:border-indigo-700/40 shadow-sm';
    if (level < 80) return 'bg-indigo-600 text-white dark:bg-indigo-600/85 dark:text-indigo-100 border-indigo-700 dark:border-indigo-600/50 shadow-md shadow-indigo-100 dark:shadow-none';
    return 'bg-purple-600 text-white dark:bg-violet-700 border-purple-500 shadow-lg shadow-purple-200 dark:shadow-none font-black ring-2 ring-purple-400 dark:ring-purple-950';
  };

  // Stats summaries
  const avgProficiency = Math.round(trackedSkills.reduce((acc, s) => acc + s.level, 0) / trackedSkills.length);
  const expertCount = trackedSkills.filter(s => s.level >= 80).length;
  const growthNeedCount = trackedSkills.filter(s => s.level < 40).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm mb-8">
      {/* Heatmap Controls & Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-black uppercase text-gray-900 dark:text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            Skills Intensity Heatmap
          </h3>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Visual representation of your skill grid strength & expertise density.</p>
        </div>

        {/* Color Palette Toggle Selector */}
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-1 rounded-xl border border-gray-150 dark:border-gray-800">
          <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 dark:text-gray-500 px-2 flex items-center gap-1">
            <Sliders className="w-3 h-3" /> Scheme
          </span>
          {(['neon', 'magma', 'emerald'] as PaletteType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setPalette(tab)}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wider transition-all duration-150 ${
                palette === tab
                  ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-100 dark:border-gray-700'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Intensity Squares */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {trackedSkills.map((skill, index) => {
          const isHovered = hoveredIndex === index;
          return (
            <div
              key={index}
              onClick={() => onSkillClick && onSkillClick(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`p-4 rounded-2xl border text-center cursor-pointer relative transition-all duration-300 select-none flex flex-col justify-between min-h-[92px] group
                ${getCellClasses(skill.level, palette)}
                ${isHovered ? 'scale-105 -translate-y-1 z-10' : 'hover:scale-[1.02]'}
              `}
            >
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider opacity-60">
                  Lv.{skill.level}
                </span>
                {skill.level >= 80 && (
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse pointer-events-none" />
                )}
              </div>
              
              <div className="my-2.5">
                <span className="text-xs font-black truncate block tracking-tight group-hover:whitespace-normal group-hover:break-words">
                  {skill.skill}
                </span>
              </div>

              {/* Progress pill display */}
              <div className="w-full bg-black/5 dark:bg-white/10 h-1 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-current opacity-70`}
                  style={{ width: `${skill.level}%` }}
                />
              </div>

              {/* Interactive Tooltip layer */}
              {isHovered && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 bg-gray-950 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-xl w-36 pointer-events-none z-20 text-center uppercase tracking-wide border border-gray-800 flex flex-col gap-0.5">
                  <span className="text-gray-400">Target Level: {skill.targetLevel}%</span>
                  <span className="text-pink-400 font-extrabold">Gap: {Math.max(0, skill.targetLevel - skill.level)}% Left</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Grid Summary Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100 dark:border-gray-700/70 text-center">
        <div className="bg-gray-50/50 dark:bg-gray-900/35 p-3 rounded-2xl border border-gray-100 dark:border-gray-800/60 flex items-center justify-between px-5">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block">Average Skill Heat</span>
            <span className="text-sm font-black text-gray-700 dark:text-gray-300">{avgProficiency}%</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
        </div>
        <div className="bg-gray-50/50 dark:bg-gray-900/35 p-3 rounded-2xl border border-gray-100 dark:border-gray-800/60 flex items-center justify-between px-5">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block">Peak Expertise</span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{expertCount} Skills</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="bg-gray-50/50 dark:bg-gray-900/35 p-3 rounded-2xl border border-gray-100 dark:border-gray-800/60 flex items-center justify-between px-5">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block">Immediate Growth Areas</span>
            <span className="text-sm font-black text-red-500 dark:text-rose-400">{growthNeedCount} Skills</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
