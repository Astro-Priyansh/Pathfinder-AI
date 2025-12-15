
import React, { useState, useEffect } from 'react';
import { UserState, CareerRecommendation } from '../types';
import { getCareerRecommendations } from '../services/gemini';
import { Loader2, Sparkles, TrendingUp, DollarSign, Search, Briefcase, Target, Compass, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';

interface CareerRecommenderProps {
  userState: UserState;
  onUpdate: (recs: CareerRecommendation[]) => void;
  onSetTarget: (career: string) => void;
  country: string;
}

export const CareerRecommender: React.FC<CareerRecommenderProps> = ({ userState, onUpdate, onSetTarget, country }) => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>(userState.recommendations || []);

  const canGenerate = userState.personalityResult || userState.interestAnalysis || userState.skillGap;

  const handleGenerate = async () => {
    setLoading(true);
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
                            <div className="flex flex-col items-end">
                                <span className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                                    {rec.matchScore}%
                                </span>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Match</span>
                            </div>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-5 leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                            {rec.reason}
                        </p>
                        
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
                            
                            <button 
                                onClick={() => onSetTarget(rec.title)}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition flex items-center whitespace-nowrap
                                    ${userState.targetCareer === rec.title 
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-default'
                                        : 'bg-pink-50 text-pink-600 hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400 dark:hover:bg-pink-900/40'
                                    }`}
                            >
                                {userState.targetCareer === rec.title ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Target className="w-4 h-4 mr-2" />}
                                {userState.targetCareer === rec.title ? 'Selected Goal' : 'Set as Goal'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};
