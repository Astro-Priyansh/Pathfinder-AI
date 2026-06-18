
import React, { useState, useEffect } from 'react';
import { UserState, CareerRecommendation } from '../types';
import { getCareerRecommendations } from '../services/gemini';
import { Loader2, Sparkles, TrendingUp, DollarSign, Search, Briefcase, Target, Compass, CheckCircle2, Plus, Check, X } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import { SalaryGrowthChart } from './SalaryGrowthChart';
import { CareerComparison } from './CareerComparison';

interface CareerRecommenderProps {
  userState: UserState;
  onUpdate: (recs: CareerRecommendation[]) => void;
  onSetTarget: (career: string) => void;
  country: string;
}

export const CareerRecommender: React.FC<CareerRecommenderProps> = ({ userState, onUpdate, onSetTarget, country }) => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>(userState.recommendations || []);
  const [activeChartIndex, setActiveChartIndex] = useState<number | null>(null);
  const [comparedTitles, setComparedTitles] = useState<string[]>([]);
  const [showCompareOverview, setShowCompareOverview] = useState(false);

  const toggleCompare = (title: string) => {
    setComparedTitles((prev) => {
      if (prev.includes(title)) {
        return prev.filter((t) => t !== title);
      }
      if (prev.length >= 2) {
        // Swap or replace the 2nd one to enforce a max size of 2
        return [prev[0], title];
      }
      return [...prev, title];
    });
  };

  const canGenerate = userState.personalityResult || userState.interestAnalysis || userState.skillGap;

  const handleGenerate = async () => {
    setLoading(true);
    setActiveChartIndex(null);
    try {
      // Aggregate profile data
      const profile = `
        Location/Country: ${country}
        Personality: ${userState.personalityResult ? userState.personalityResult.summary : 'Unknown'}
        Interests: ${userState.interestAnalysis ? userState.interestAnalysis.categories.join(', ') : 'Unknown'}
        Skills: ${userState.skillGap ? userState.skillGap.masteredSkills.join(', ') : 'Unknown'}
        Resume Summary: ${userState.resume ? userState.resume.summary : 'Unknown'}
      `;

      const recs = await getCareerRecommendations(profile);
      setRecommendations(recs);
      onUpdate(recs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-8 rounded-3xl text-white shadow-xl shadow-pink-200 dark:shadow-none flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
           <h2 className="text-3xl font-bold font-brand flex items-center">
                <Compass className="w-8 h-8 mr-3 text-white/90" />
                AI Career Engine
           </h2>
           <p className="text-pink-100 mt-2 text-lg">Our AI analyzes your entire profile to find your perfect career match in {country}.</p>
        </div>
        <button
            onClick={handleGenerate}
            disabled={loading || !canGenerate}
            className="w-full md:w-auto px-8 py-4 bg-white text-pink-600 hover:bg-gray-50 rounded-xl shadow-lg transition flex items-center justify-center font-bold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
            {recommendations.length > 0 ? 'Refresh Analysis' : 'Find My Career'}
        </button>
      </div>

      {!canGenerate && (
         <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-6 rounded-3xl text-orange-800 dark:text-orange-200 text-center">
            <p className="font-bold">Profile Incomplete</p>
            <p className="text-sm mt-1">Please complete the Personality Test, Interest Analyzer, or Skill Gap analysis first to get accurate recommendations.</p>
         </div>
      )}

      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Charts Section */}
            <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 h-[450px] flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 text-center">Match Strength Overview</h3>
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={recommendations} layout="vertical" margin={{ left: 0, right: 10, bottom: 0, top: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" opacity={0.5} />
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis dataKey="title" type="category" width={110} tick={{fill: '#6b7280', fontSize: 11, fontWeight: 600}} />
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '12px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="matchScore" barSize={24} radius={[0, 6, 6, 0]}>
                                {recommendations.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#db2777', '#9333ea', '#7c3aed', '#4f46e5', '#2563eb'][index % 5]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* List Section */}
            <div className="lg:col-span-7 space-y-5">
                {recommendations.map((rec, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">{rec.title}</h4>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                    <div className="flex items-center">
                                        <DollarSign className="w-4 h-4 mr-1 text-green-500" /> {rec.salaryRange}
                                    </div>
                                    <div className="flex items-center">
                                        <TrendingUp className="w-4 h-4 mr-1 text-blue-500" /> {rec.outlook}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2.5">
                                <div className="flex flex-col items-end leading-none">
                                    <span className="text-2xl font-black text-pink-600 dark:text-pink-400">
                                        {rec.matchScore}%
                                    </span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Match</span>
                                </div>
                                <button
                                    onClick={() => toggleCompare(rec.title)}
                                    className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg border transition-all duration-200 flex items-center justify-center gap-1
                                        ${comparedTitles.includes(rec.title)
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                            : 'bg-transparent border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400'
                                        }`}
                                >
                                    {comparedTitles.includes(rec.title) ? (
                                        <>
                                            <Check className="w-3 h-3" /> Selected
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-3 h-3" /> Compare
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-5 leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                            {rec.reason}
                        </p>

                        {activeChartIndex === i && (
                            <div className="mb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                                <SalaryGrowthChart 
                                    projections={getProjections(rec)} 
                                    currencySymbol={getCurrencySymbol(rec.salaryRange)}
                                    themeColor={['#db2777', '#9333ea', '#7c3aed', '#4f46e5', '#2563eb'][i % 5]}
                                />
                            </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                            {rec.jobRoles && rec.jobRoles.length > 0 && (
                                <div className="flex-1">
                                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Roles</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {rec.jobRoles.slice(0, 3).map((role, idx) => (
                                            <span key={idx} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold">
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button 
                                    onClick={() => setActiveChartIndex(activeChartIndex === i ? null : i)}
                                    className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap
                                        ${activeChartIndex === i 
                                            ? 'bg-pink-600 text-white shadow-lg shadow-pink-100 dark:shadow-none' 
                                            : 'bg-pink-50 text-pink-600 hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400 dark:hover:bg-pink-900/40'
                                        }`}
                                >
                                    <TrendingUp className="w-4 h-4" />
                                    {activeChartIndex === i ? 'Hide Growth' : 'Salary Growth'}
                                </button>
                                
                                <button 
                                    onClick={() => onSetTarget(rec.title)}
                                    className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center whitespace-nowrap
                                        ${userState.targetCareer === rec.title 
                                            ? 'bg-emerald-600 text-white cursor-default shadow-lg shadow-emerald-100 dark:shadow-none'
                                            : 'bg-gray-150 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {userState.targetCareer === rec.title ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <Target className="w-4 h-4 mr-1.5" />}
                                    {userState.targetCareer === rec.title ? 'Goal Set' : 'Set as Goal'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Floating Sticky comparison bar */}
      {comparedTitles.length > 0 && (
          <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 bg-gray-900/95 dark:bg-gray-950/95 backdrop-blur-md text-white px-5 py-4 rounded-3xl shadow-2xl border border-gray-800/85 z-40 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black tracking-widest text-pink-400">Path Comparison Desk</span>
                      <span className="text-xs font-bold text-gray-200 mt-0.5">
                          {comparedTitles.length === 1 
                            ? `Selected: ${comparedTitles[0]}` 
                            : `${comparedTitles[0]} vs ${comparedTitles[1]}`}
                      </span>
                  </div>
                  <button
                      onClick={() => setComparedTitles([])}
                      className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                  >
                      <X className="w-3.5 h-3.5" />
                  </button>
              </div>
              <div className="flex gap-2">
                  <button 
                      onClick={() => {
                        if (comparedTitles.length === 2) {
                            setShowCompareOverview(true);
                        } else {
                            // Find another candidate to auto-populate if only 1 is selected
                            const other = recommendations.find(r => r.title !== comparedTitles[0]);
                            if (other) {
                                setComparedTitles([...comparedTitles, other.title]);
                                setShowCompareOverview(true);
                            }
                        }
                      }}
                      className="flex-1 py-2.5 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition duration-150 text-center shadow-lg shadow-pink-900/30"
                  >
                      {comparedTitles.length === 2 ? "Compare Side-By-Side" : "Auto-Compare & Open"}
                  </button>
              </div>
          </div>
      )}

      {/* Career Side-by-Side Comparison Modal Sheet */}
      {showCompareOverview && comparedTitles.length === 2 && (() => {
         const selection = recommendations.filter(r => comparedTitles.includes(r.title));
         if (selection.length === 2) {
             return (
                 <CareerComparison 
                     careerA={selection[0]} 
                     careerB={selection[1]} 
                     userState={userState} 
                     onClose={() => setShowCompareOverview(false)}
                     onSelectGoal={(title) => {
                         onSetTarget(title);
                     }}
                 />
             );
         }
         return null;
      })()}
    </div>
  );
};
