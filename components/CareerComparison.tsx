import React from 'react';
import { UserState, CareerRecommendation } from '../types';
import { X, TrendingUp, DollarSign, Target, CheckCircle2, Award, Briefcase, HelpCircle, ShieldCheck, Zap } from 'lucide-react';
import { SalaryGrowthChart } from './SalaryGrowthChart';

interface CareerComparisonProps {
  careerA: CareerRecommendation;
  careerB: CareerRecommendation;
  userState: UserState;
  onClose: () => void;
  onSelectGoal: (title: string) => void;
}

export const CareerComparison: React.FC<CareerComparisonProps> = ({
  careerA,
  careerB,
  userState,
  onClose,
  onSelectGoal
}) => {

  const getSkillsForCareer = (rec: CareerRecommendation): string[] => {
    if (rec.skills && rec.skills.length > 0) return rec.skills;
    
    // Custom robust fallback generator based on common career terms to ensure beautiful visual data even for older cached runs
    const titleLower = rec.title.toLowerCase();
    if (titleLower.includes('developer') || titleLower.includes('engineer') || titleLower.includes('software') || titleLower.includes('programmer') || titleLower.includes('tech')) {
      return ['Software Engineering', 'System Architecture', 'Problem Solving', 'Data Structures', 'Database Management', 'APIs & Integration'];
    }
    if (titleLower.includes('data') || titleLower.includes('analyst') || titleLower.includes('analytics') || titleLower.includes('science')) {
      return ['Data Analysis', 'Python/R', 'SQL', 'Statistical Modeling', 'Machine Learning', 'Data Visualization'];
    }
    if (titleLower.includes('design') || titleLower.includes('ui') || titleLower.includes('ux') || titleLower.includes('creative') || titleLower.includes('art')) {
      return ['UI/UX Design', 'Figma Mastery', 'Visual Hierarchy', 'Wireframing', 'User Research', 'Prototyping'];
    }
    if (titleLower.includes('product') || titleLower.includes('manager') || titleLower.includes('management') || titleLower.includes('lead')) {
      return ['Product Strategy', 'Agile/Scrum', 'Market Research', 'Roadmapping', 'Cross-functional Control', 'Stakeholder Communication'];
    }
    if (titleLower.includes('market') || titleLower.includes('growth') || titleLower.includes('seo') || titleLower.includes('sales')) {
      return ['Digital Marketing', 'SEO Optimization', 'Copywriting & Content', 'Campaign Analytics', 'Sales Pipeline Strategy', 'Brand Positioning'];
    }
    if (titleLower.includes('finance') || titleLower.includes('banking') || titleLower.includes('account') || titleLower.includes('investment')) {
      return ['Financial Modeling', 'Risk Assessment', 'Accounting Standards', 'Portfolio Management', 'Excel Pro Techniques', 'Quantitative Analysis'];
    }
    if (titleLower.includes('consultant') || titleLower.includes('strategy') || titleLower.includes('business')) {
      return ['Business Strategy', 'Management Consulting', 'Problem Solving', 'Financial Advisory', 'Public Speaking', 'Executive Presentation'];
    }
    return ['Critical Thinking', 'Project Management', 'Professional Communication', 'Technical Literacy', 'Problem Solving', 'Team Collaboration'];
  };

  const checkUserHasSkill = (skillName: string) => {
    const normalized = skillName.toLowerCase();
    
    // Check in masteredSkills
    if (userState.skillGap?.masteredSkills?.some(s => {
      const sNorm = s.toLowerCase();
      return sNorm.includes(normalized) || normalized.includes(sNorm);
    })) {
      return { has: true, label: 'Mastered', level: 100, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' };
    }
    
    // Check in skillTracker
    if (userState.skillTracker) {
      const tracked = userState.skillTracker.find(s => {
        const sNorm = s.skill.toLowerCase();
        return sNorm.includes(normalized) || normalized.includes(sNorm);
      });
      if (tracked) {
        const isMastered = tracked.level >= 60;
        return {
          has: isMastered,
          label: `Level ${tracked.level}%`,
          level: tracked.level,
          color: isMastered 
            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' 
            : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20'
        };
      }
    }
    
    return { has: false, label: 'Gap Found', level: 0, color: 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800' };
  };

  const getProjections = (rec: CareerRecommendation) => {
    if (rec.salaryProjections && rec.salaryProjections.length > 0) {
      return rec.salaryProjections;
    }
    
    // Fallback parser if not returned by older structure cached in localstorage
    let baseMin = 65000;
    let baseMax = 110000;
    
    try {
      const numbers = rec.salaryRange.match(/\d[\d,.]*/g);
      if (numbers && numbers.length >= 2) {
        baseMin = parseInt(numbers[0].replace(/,/g, '')) || 65000;
        baseMax = parseInt(numbers[1].replace(/,/g, '')) || 110000;
      } else if (numbers && numbers.length === 1) {
        baseMin = parseInt(numbers[0].replace(/,/g, '')) || 65000;
        baseMax = baseMin * 1.6;
      }
    } catch (e) {
      console.error("Error parsing salary: ", e);
    }

    const result = [];
    const years = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];
    let currentVal = baseMin;
    const growthRate = (baseMax - baseMin) / 4 || currentVal * 0.12;

    for (let idx = 0; idx < 5; idx++) {
      result.push({
        year: years[idx],
        salary: Math.round(currentVal)
      });
      currentVal = currentVal + growthRate * (0.90 + Math.random() * 0.2);
    }
    return result;
  };

  const getCurrencySymbol = (range: string) => {
    if (range.includes('₹') || range.includes('Rs') || range.includes('INR')) return '₹';
    if (range.includes('£') || range.includes('GBP')) return '£';
    if (range.includes('€') || range.includes('EUR')) return '€';
    return '$';
  };

  const listA = getSkillsForCareer(careerA);
  const listB = getSkillsForCareer(careerB);

  // Skill alignment analytics
  const alignmentCountA = listA.filter(s => checkUserHasSkill(s).has).length;
  const alignmentCountB = listB.filter(s => checkUserHasSkill(s).has).length;

  return (
    <div id="career-comp-overlay" className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-pink-100 bg-white/10 px-2 py-0.5 rounded-md self-start mb-1">
              Engine Interactive Tool
            </span>
            <h3 className="text-xl md:text-2xl font-black uppercase flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-300 animate-pulse" />
              Side-By-Side Career Contrast
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-transform active:scale-95"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Scrollable Contents info */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-150 dark:divide-gray-800">
            
            {/* COLUMN A */}
            <div className="space-y-6 flex flex-col justify-between">
              <div>
                {/* Header Info */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/10 px-2.5 py-1 rounded-lg">
                      Option One
                    </span>
                    <h4 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mt-2.5 tracking-tight leading-none">
                      {careerA.title}
                    </h4>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-3xl font-black text-pink-600 dark:text-pink-400 leading-none">
                      {careerA.matchScore}%
                    </span>
                    <span className="text-[10px] uppercase font-black text-gray-400 dark:text-gray-500 tracking-wider">Match</span>
                  </div>
                </div>

                {/* Info Pills */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3 bg-gray-50/50 dark:bg-gray-950/30 rounded-2xl border border-gray-100 dark:border-gray-800/60">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Avg. Base Salary</span>
                    <span className="text-sm font-black text-gray-700 dark:text-gray-200 flex items-center gap-1 mt-0.5">
                      <DollarSign className="w-3.5 h-3.5 text-green-500 shrink-0" /> {careerA.salaryRange}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50/50 dark:bg-gray-950/30 rounded-2xl border border-gray-100 dark:border-gray-800/60">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Market Outlook</span>
                    <span className="text-sm font-black text-gray-700 dark:text-gray-200 flex items-center gap-1 mt-0.5">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-500 shrink-0" /> {careerA.outlook}
                    </span>
                  </div>
                </div>

                {/* Match Details */}
                <div className="space-y-1 bg-gray-50/50 dark:bg-gray-950/30 p-4 rounded-3xl border border-gray-100 dark:border-gray-800/60 mb-6">
                  <span className="text-[10px] text-pink-600 dark:text-pink-400 font-black uppercase tracking-wider block">Match Analysis</span>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-semibold">
                    {careerA.reason}
                  </p>
                </div>

                {/* Visual D3 Chart */}
                <div className="mb-6">
                  <SalaryGrowthChart 
                    projections={getProjections(careerA)} 
                    currencySymbol={getCurrencySymbol(careerA.salaryRange)}
                    themeColor="#db2777"
                  />
                </div>

                {/* Essential Skills Breakdown */}
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center bg-gray-100/60 dark:bg-gray-800 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                    <span className="text-xs font-black uppercase text-gray-700 dark:text-gray-200">Required Skills</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 font-black px-2 py-0.5 rounded-md uppercase">
                      Alignment: {alignmentCountA}/{listA.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {listA.map((skill, index) => {
                      const status = checkUserHasSkill(skill);
                      return (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-2.5 bg-gray-50/40 dark:bg-gray-950/20 border border-gray-150/60 dark:border-gray-800/60 rounded-xl"
                        >
                          <span className="text-xs font-black text-gray-800 dark:text-gray-200 truncate pr-2">
                            {skill}
                          </span>
                          <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Common Roles */}
                <div className="mt-6 space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-gray-400">Target Functional Roles</span>
                  <div className="flex flex-wrap gap-1.5">
                    {careerA.jobRoles.map((role, rIdx) => (
                      <span key={rIdx} className="text-[10px] px-2.5 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-150 dark:border-gray-800 font-black rounded-lg">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Set Goal Column Action */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 mt-6 md:sticky md:bottom-0 bg-white dark:bg-gray-900 py-2">
                <button
                  onClick={() => {
                    onSelectGoal(careerA.title);
                  }}
                  className={`w-full py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5
                    ${userState.targetCareer === careerA.title
                      ? 'bg-emerald-600 text-white cursor-default shadow-lg shadow-emerald-100 dark:shadow-none'
                      : 'bg-pink-600 text-white hover:bg-pink-700 shadow-lg shadow-pink-100 dark:shadow-none active:scale-98'
                    }`}
                >
                  {userState.targetCareer === careerA.title ? <CheckCircle2 className="w-4 h-4" /> : <Target className="w-4 h-4 animate-spin-slow" />}
                  {userState.targetCareer === careerA.title ? 'Target Goal Selected' : `Select ${careerA.title}`}
                </button>
              </div>

            </div>

            {/* COLUMN B */}
            <div className="space-y-6 flex flex-col justify-between pt-8 md:pt-0 md:pl-8">
              <div>
                {/* Header Info */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10 px-2.5 py-1 rounded-lg">
                      Option Two
                    </span>
                    <h4 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mt-2.5 tracking-tight leading-none">
                      {careerB.title}
                    </h4>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 leading-none">
                      {careerB.matchScore}%
                    </span>
                    <span className="text-[10px] uppercase font-black text-gray-400 dark:text-gray-500 tracking-wider">Match</span>
                  </div>
                </div>

                {/* Info Pills */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3 bg-gray-50/50 dark:bg-gray-950/30 rounded-2xl border border-gray-100 dark:border-gray-800/60">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Avg. Base Salary</span>
                    <span className="text-sm font-black text-gray-700 dark:text-gray-200 flex items-center gap-1 mt-0.5">
                      <DollarSign className="w-3.5 h-3.5 text-green-500 shrink-0" /> {careerB.salaryRange}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50/50 dark:bg-gray-950/30 rounded-2xl border border-gray-100 dark:border-gray-800/60">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Market Outlook</span>
                    <span className="text-sm font-black text-gray-700 dark:text-gray-200 flex items-center gap-1 mt-0.5">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-500 shrink-0" /> {careerB.outlook}
                    </span>
                  </div>
                </div>

                {/* Match Details */}
                <div className="space-y-1 bg-gray-50/50 dark:bg-gray-950/30 p-4 rounded-3xl border border-gray-100 dark:border-gray-800/60 mb-6">
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-wider block">Match Analysis</span>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-semibold">
                    {careerB.reason}
                  </p>
                </div>

                {/* Visual D3 Chart */}
                <div className="mb-6">
                  <SalaryGrowthChart 
                    projections={getProjections(careerB)} 
                    currencySymbol={getCurrencySymbol(careerB.salaryRange)}
                    themeColor="#4f46e5"
                  />
                </div>

                {/* Essential Skills Breakdown */}
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center bg-gray-100/60 dark:bg-gray-800 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                    <span className="text-xs font-black uppercase text-gray-700 dark:text-gray-200">Required Skills</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 font-black px-2 py-0.5 rounded-md uppercase">
                      Alignment: {alignmentCountB}/{listB.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {listB.map((skill, index) => {
                      const status = checkUserHasSkill(skill);
                      return (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-2.5 bg-gray-50/40 dark:bg-gray-950/20 border border-gray-150/60 dark:border-gray-800/60 rounded-xl"
                        >
                          <span className="text-xs font-black text-gray-800 dark:text-gray-200 truncate pr-2">
                            {skill}
                          </span>
                          <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Common Roles */}
                <div className="mt-6 space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-gray-400">Target Functional Roles</span>
                  <div className="flex flex-wrap gap-1.5">
                    {careerB.jobRoles.map((role, rIdx) => (
                      <span key={rIdx} className="text-[10px] px-2.5 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-150 dark:border-gray-800 font-black rounded-lg">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Set Goal Column Action */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 mt-6 md:sticky md:bottom-0 bg-white dark:bg-gray-900 py-2">
                <button
                  onClick={() => {
                    onSelectGoal(careerB.title);
                  }}
                  className={`w-full py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5
                    ${userState.targetCareer === careerB.title
                      ? 'bg-emerald-600 text-white cursor-default shadow-lg shadow-emerald-100 dark:shadow-none'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none active:scale-98'
                    }`}
                >
                  {userState.targetCareer === careerB.title ? <CheckCircle2 className="w-4 h-4" /> : <Target className="w-4 h-4 animate-spin-slow" />}
                  {userState.targetCareer === careerB.title ? 'Target Goal Selected' : `Select ${careerB.title}`}
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Footer info/legend */}
        <div className="bg-gray-50 dark:bg-gray-950 p-4 border-t border-gray-100 dark:border-gray-800 text-center flex flex-col sm:flex-row justify-center items-center gap-4 text-xs font-bold text-gray-400">
          <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Underlining items highlight student alignment dynamically</span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-yellow-500" /> Match index represents aggregate fit scores</span>
        </div>
        
      </div>
    </div>
  );
};
