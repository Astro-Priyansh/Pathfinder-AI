import React, { useState, useEffect } from 'react';
import { InterestAnalysis, InterestDevelopmentPlan } from '../types';
import { analyzeInterests, getInterestDevelopmentTips } from '../services/gemini';
import { getTrendingInterestsByCountry, TrendingInterest } from './trendingInterestsData';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  Legend 
} from 'recharts';
import { 
  Loader2, 
  Tag, 
  Briefcase, 
  Sprout, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  Heart, 
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Globe,
  MapPin,
  CheckCircle,
  Code,
  Layers,
  ChevronRight,
  BookmarkPlus
} from 'lucide-react';

interface InterestsAnalyzerProps {
  onComplete: (result: InterestAnalysis) => void;
  existingResult: InterestAnalysis | null;
  country?: string;
  themeColor?: string;
}

export const InterestsAnalyzer: React.FC<InterestsAnalyzerProps> = ({ 
  onComplete, 
  existingResult,
  country = 'Global',
  themeColor = '#3b82f6'
}) => {
  // Navigation tabs between Personal Analyzer and Regional Trend board
  const [activeTab, setActiveTab] = useState<'trending' | 'personal'>('trending');

  // Main Analyzer State
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InterestAnalysis | null>(existingResult);

  // Development Section State
  const [developInput, setDevelopInput] = useState('');
  const [developLoading, setDevelopLoading] = useState(false);
  const [developResult, setDevelopResult] = useState<InterestDevelopmentPlan | null>(null);

  // Trending Section State
  const trendingInterests = getTrendingInterestsByCountry(country);
  const [selectedInterestId, setSelectedInterestId] = useState<string>(
    trendingInterests[0]?.id || 'gen_ai'
  );

  // Automatically update selected interest if list updates with country
  useEffect(() => {
    if (trendingInterests.length > 0) {
      setSelectedInterestId(trendingInterests[0].id);
    }
  }, [country]);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const analysis = await analyzeInterests(input);
      setResult(analysis);
      onComplete(analysis);
    } catch (error) {
      console.error("Interest analysis error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDevelop = async () => {
    if (!developInput.trim()) return;
    setDevelopLoading(true);
    try {
      const plan = await getInterestDevelopmentTips(developInput);
      setDevelopResult(plan);
    } catch (error) {
      console.error("Development plan error", error);
    } finally {
      setDevelopLoading(false);
    }
  };

  // Direct selection mapping from trends list into manual passions box
  const handleQuickAnalyzeFromTrend = (careerTitle: string) => {
    const query = `Analyze the feasibility of getting into a career as: ${careerTitle}. I love doing practical research on this and expanding my skills.`;
    setInput(query);
    setActiveTab('personal');
    // Scroll smoothly to top of manual text area
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  const selectedInterest = trendingInterests.find(item => item.id === selectedInterestId) || trendingInterests[0];

  // Map category to styles for premium tags
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Technology':
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/30',
          text: 'text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/60',
          badge: 'bg-blue-600 text-white',
          accent: '#3b82f6'
        };
      case 'Sustainability':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/30',
          text: 'text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/60',
          badge: 'bg-emerald-600 text-white',
          accent: '#10b981'
        };
      case 'Creative Arts':
        return {
          bg: 'bg-purple-50 dark:bg-purple-950/30',
          text: 'text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-900/60',
          badge: 'bg-purple-600 text-white',
          accent: '#a855f7'
        };
      case 'Finance':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/30',
          text: 'text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900/60',
          badge: 'bg-amber-600 text-white',
          accent: '#f59e0b'
        };
      case 'Life Sciences':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/30',
          text: 'text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-900/60',
          badge: 'bg-rose-600 text-white',
          accent: '#f43f5e'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800/30',
          text: 'text-gray-700 dark:text-gray-300 border-gray-150 dark:border-gray-800',
          badge: 'bg-gray-600 text-white',
          accent: '#6b7280'
        };
    }
  };

  // Recharts Data Mapping
  const chartData = trendingInterests.map(item => ({
    id: item.id,
    shortName: item.title.split(' & ')[0],
    fullName: item.title,
    popularity: item.popularity,
    growthRate: item.growthRate,
    category: item.category
  }));

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-24 md:pb-12">
      {/* Prime Header Block */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100 dark:shadow-none flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold tracking-wider uppercase mb-3 border border-white/10 backdrop-blur-sm">
            <Globe className="w-3.5 h-3.5" />
            Market Trends Synchronized
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold font-brand flex items-center tracking-tight">
            <Heart className="w-9 h-9 mr-3 text-white fill-white/20 animate-pulse" />
            Interests Analyzer
          </h2>
          <p className="text-indigo-100 mt-2 text-base md:text-lg">
            Map your personal passions or discover trending regional careers in <span className="font-bold underline decoration-cyan-300 underline-offset-4">{country}</span>.
          </p>
        </div>
        <div className="bg-white/10 p-4 rounded-2xl flex items-center gap-3 backdrop-blur-md border border-white/25 shadow-inner">
          <div className="p-2.5 rounded-xl bg-cyan-400 text-slate-900 shadow-sm">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs uppercase font-extrabold text-cyan-200 tracking-widest">Active Country</div>
            <div className="text-base font-black tracking-tight">{country}</div>
          </div>
        </div>
      </div>

      {/* Styled Inner Navigation Tab Bar */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 mb-8 p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl gap-1 max-w-lg">
        <button
          onClick={() => setActiveTab('trending')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'trending'
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Trending Market pulse
          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-[10px] rounded-full text-blue-700 dark:text-blue-300">Top 25</span>
        </button>
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'personal'
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm shadow-indigo-100'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          My Passion Mapper
        </button>
      </div>

      {/* RENDER TAB 1: REGIONAL TREND INTEL */}
      {activeTab === 'trending' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* Quick Informational Toast */}
          <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/10 border border-blue-100/50 dark:border-blue-900/40 p-4 rounded-2xl flex items-center gap-3 text-sm text-blue-800 dark:text-blue-300">
            <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
            <div>
              <span className="font-bold">Pro-tip:</span> Tap any interest pill on the left or interactive bar in the chart to inspect full details, pros & cons, and related study materials!
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Hand list of Top 25 Interests */}
            <div className="lg:col-span-5 space-y-3 lg:max-h-[1450px] overflow-y-auto pr-2 custom-scrollbar lg:sticky lg:top-6">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">Interest & Domain</span>
                <span className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">Popularity In {country}</span>
              </div>
              
              {trendingInterests.map((interest) => {
                const isSelected = interest.id === selectedInterestId;
                const catInfo = getCategoryStyles(interest.category);
                
                return (
                  <button
                    key={interest.id}
                    onClick={() => setSelectedInterestId(interest.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 group relative ${
                      isSelected
                        ? 'bg-white dark:bg-gray-800 border-blue-500 shadow-md ring-2 ring-blue-500/10'
                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm'
                    }`}
                  >
                    {/* Active line indicator */}
                    {isSelected && (
                      <div className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-lg" style={{ backgroundColor: themeColor }} />
                    )}
                    
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl font-mono flex items-center justify-center text-xs font-black ${
                        isSelected 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400'
                      }`}>
                        #{interest.rank}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors text-sm leading-tight">
                          {interest.title}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${catInfo.text}`}>
                            {interest.category}
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                            +{interest.growthRate}% yr growth
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-black font-brand text-gray-900 dark:text-white leading-none">
                        {interest.popularity}%
                      </div>
                      <div className="text-[9px] text-gray-400 mt-0.5">market score</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Hand Charts & Detailed Analytics Card */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Dynamic Recharts Bar Dashboard */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white text-lg tracking-tight flex items-center gap-2">
                      <Layers className="w-5 h-5 text-indigo-500" />
                      Popularity Comparison Chart
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Shows current interest score per domain. Click any bar to inspect.</p>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold font-mono">
                    {country} Metrics
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                      onClick={(data: any) => {
                        if (data && data.activePayload && data.activePayload[0]) {
                          const payload = data.activePayload[0].payload;
                          if (payload && payload.id) {
                            setSelectedInterestId(payload.id);
                          }
                        }
                      }}
                    >
                      <XAxis type="number" domain={[0, 100]} stroke="#6b7280" fontSize={10} tickLine={false} />
                      <YAxis dataKey="shortName" type="category" stroke="#6b7280" fontSize={10} width={90} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-gray-900 text-white p-3 rounded-xl shadow-lg border border-gray-800 text-xs">
                                <p className="font-extrabold mb-1">{data.fullName}</p>
                                <p className="text-blue-400 font-semibold">Popularity Score: {data.popularity}%</p>
                                <p className="text-emerald-400 font-semibold">Demand Growth: +{data.growthRate}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="popularity" radius={[0, 6, 6, 0]} barSize={14}>
                        {chartData.map((entry, index) => {
                          const isSel = entry.id === selectedInterestId;
                          const catStyles = getCategoryStyles(entry.category);
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={isSel ? catStyles.accent : `${catStyles.accent}40`}
                              className="transition-all duration-300"
                              cursor="pointer"
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Curated Interactive Details Breakdown for Selected Trend */}
              {selectedInterest && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xl shadow-gray-100 dark:shadow-none p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                  
                  {/* Selected Interest Title Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-5">
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-black border ${getCategoryStyles(selectedInterest.category).text} mb-2`}>
                        {selectedInterest.category} Domain
                      </span>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {selectedInterest.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <div className="text-center bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">Rank</div>
                        <div className="text-lg font-black text-blue-600 dark:text-blue-400">#{selectedInterest.rank}</div>
                      </div>
                      <div className="text-center bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">Growth</div>
                        <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">+{selectedInterest.growthRate}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Why it's trending locally */}
                  <div className="bg-blue-50/50 dark:bg-blue-950/20 p-5 rounded-2xl border border-blue-100/40 dark:border-blue-900/40">
                    <h4 className="text-xs uppercase font-black text-blue-800 dark:text-blue-300 flex items-center gap-2 tracking-widest mb-1.5">
                      <Globe className="w-4 h-4 text-blue-600" />
                      Dynamic Trend Factor inside {country}
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm font-medium leading-relaxed">
                      {selectedInterest.whyTrending}
                    </p>
                  </div>

                  {/* Dynamic Pros and Cons Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="text-xs uppercase font-black text-emerald-600 dark:text-emerald-400 tracking-widest flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        Advantages / Pros
                      </h4>
                      <div className="space-y-2">
                        {selectedInterest.pros.map((pro, i) => (
                          <div key={i} className="flex gap-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300 font-medium bg-emerald-50/30 dark:bg-emerald-950/10 p-3 rounded-xl border border-emerald-500/10">
                            <span className="text-emerald-500 flex-shrink-0 mt-0.5">✓</span>
                            <span>{pro}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs uppercase font-black text-amber-600 dark:text-amber-400 tracking-widest flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Considerations / Cons
                      </h4>
                      <div className="space-y-2">
                        {selectedInterest.cons.map((con, i) => (
                          <div key={i} className="flex gap-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300 font-medium bg-amber-50/30 dark:bg-amber-950/10 p-3 rounded-xl border border-amber-500/10">
                            <span className="text-amber-500 flex-shrink-0 mt-0.5">!</span>
                            <span>{con}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Required Skills Required */}
                  <div className="space-y-2 border-t border-gray-100 dark:border-gray-700 pt-5">
                    <h4 className="text-xs uppercase font-black text-gray-400 tracking-widest flex items-center gap-1.5">
                      <Code className="w-4 h-4 text-indigo-400" />
                      Core Capabilities & Skills to Build
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedInterest.relatedSkills.map((skill, i) => (
                        <span key={i} className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold font-mono">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Related Careers - Button targets with action loop! */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs uppercase font-black text-gray-400 tracking-widest flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-sky-400" />
                        Related Career Roles
                      </h4>
                      <span className="text-[10px] text-gray-400">Click role to map pathway</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedInterest.relatedCareers.map((career, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickAnalyzeFromTrend(career)}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-900 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10 hover:border-blue-300 dark:hover:border-blue-900/50 rounded-xl border border-gray-100 dark:border-gray-800 text-left transition text-xs font-bold text-gray-800 dark:text-gray-200 group/btn"
                        >
                          <span className="group-hover/btn:text-blue-600 dark:group-hover/btn:text-blue-400 transition-colors uppercase tracking-wider">{career}</span>
                          <span className="p-1 rounded-lg bg-white dark:bg-gray-800 text-gray-400 group-hover/btn:bg-blue-600 group-hover/btn:text-white transition-all shadow-sm">
                            <BookmarkPlus className="w-3.5 h-3.5" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Academic / Learning Channels */}
                  <div className="space-y-2 border-t border-gray-100 dark:border-gray-700 pt-5">
                    <h4 className="text-xs uppercase font-black text-gray-400 tracking-widest flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-amber-500" />
                      Recommended Learning Channels
                    </h4>
                    <div className="space-y-2">
                      {selectedInterest.learningChannels.map((channel, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 font-medium">
                          <ArrowRight className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          <span>{channel}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>

        </div>
      )}


      {/* RENDER TAB 2: MY PASSIONS MAPPER */}
      {activeTab === 'personal' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
              <Heart className="w-64 h-64 text-blue-500" />
            </div>
            
            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
              Describe Your Hobbies, Tasks & Passions
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-6 border-2 border-gray-100 dark:border-gray-800 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 dark:bg-gray-900 dark:text-white transition-all h-40 resize-none text-base leading-relaxed placeholder-gray-400 dark:placeholder-gray-600 font-medium outline-none"
              placeholder="e.g. I absolutely love coding interactive animations, sketching futuristic scenery, playing complex logic board games with family, and configuring microcontrollers..."
            />
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-gray-400 font-medium">
                Our Generative AI will extract core domain groupings and project potential real-world careers.
              </p>
              <button
                onClick={handleAnalyze}
                disabled={loading || !input.trim()}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition disabled:opacity-50 flex items-center justify-center font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:shadow-xl hover:scale-[1.02]"
              >
                {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                Analyze My Interests
              </button>
            </div>
          </div>

          {result && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50/50 dark:bg-blue-900/20 p-8 rounded-3xl border border-blue-100/50 dark:border-blue-900/40">
                  <h3 className="flex items-center text-lg font-black text-blue-900 dark:text-blue-300 mb-6 uppercase tracking-wider">
                    <Tag className="w-5 h-5 mr-3 text-blue-500" /> Key Categories Extracted
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {(result.categories || []).map((cat, i) => (
                      <span key={i} className="px-4 py-2 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold shadow-sm border border-blue-100 dark:border-blue-900/60">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="bg-cyan-50/50 dark:bg-cyan-900/20 p-8 rounded-3xl border border-cyan-100/50 dark:border-cyan-900/40 flex flex-col justify-center">
                  <h3 className="flex items-center text-lg font-black text-cyan-900 dark:text-cyan-300 mb-4 uppercase tracking-wider">
                    <Briefcase className="w-5 h-5 mr-3 text-cyan-600" /> Career Alignment Info
                  </h3>
                  <p className="text-cyan-800 dark:text-cyan-200 text-base leading-relaxed">
                    We've calibrated <span className="font-extrabold text-2xl text-blue-600 dark:text-blue-400 mx-1">{(result.careers || []).length}</span> bespoke career trajectories aligning directly with your personal profile.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-black text-gray-900 dark:text-white px-2 uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500" /> Match Deep-Dive Breakdown
                </h3>
                
                <div className="grid gap-4">
                  {(result.careers || []).map((career, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all group">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform flex-shrink-0">
                          <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {career.title}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm font-medium">
                            {career.matchReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Learn Something New / Roadmap Generator Sub-module */}
          <div className="mt-16 pt-10 border-t border-gray-200 dark:border-gray-800">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-green-100/80 dark:bg-green-900/30 rounded-2xl mb-4 text-green-600 dark:text-green-400">
                <Sprout className="w-8 h-8" />
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white font-brand tracking-tight">
                Instantly Start a Learning Journey
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto text-sm">
                Curious about a specific hobby (e.g., Photography, Chess, Cooking)? Enter it below to build a customized roadmap.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-lg shadow-gray-150 dark:shadow-none border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-2 max-w-2xl mx-auto mb-12">
              <input
                type="text"
                className="flex-1 px-6 py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-base font-semibold"
                placeholder="e.g. Creative Photography, Quantum Computing..."
                value={developInput}
                onChange={(e) => setDevelopInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDevelop()}
              />
              <button
                onClick={handleDevelop}
                disabled={developLoading || !developInput.trim()}
                className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center whitespace-nowrap shadow-md"
              >
                {developLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Roadmap'}
              </button>
            </div>

            {developResult && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="bg-green-50/50 dark:bg-green-950/20 p-6 rounded-2xl border border-green-150 dark:border-green-800">
                  <h4 className="text-base font-black text-green-800 dark:text-green-300 mb-2">Why learn {developResult.interest}?</h4>
                  <p className="text-green-700 dark:text-green-400 leading-relaxed text-sm font-medium">{developResult.introduction}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-lg font-black text-gray-900 dark:text-white flex items-center">
                      <CheckCircle2 className="w-5 h-5 mr-3 text-indigo-505 text-indigo-500" /> Action Roadmap Steps
                    </h4>
                    <div className="relative border-l-2 border-indigo-100 dark:border-indigo-900/40 ml-3 space-y-6 pl-6 py-2">
                      {developResult.steps.map((step, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm ring-4 ring-white dark:ring-gray-800">{i + 1}</div>
                          <p className="text-gray-700 dark:text-gray-300 text-sm font-medium leading-relaxed bg-gray-50/40 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100/50 dark:border-gray-800/40">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-black text-gray-900 dark:text-white flex items-center">
                      <BookOpen className="w-5 h-5 mr-3 text-orange-500" /> Curated High-Yield Resources
                    </h4>
                    <div className="space-y-3">
                      {developResult.resources.map((res, i) => (
                        <div key={i} className="flex items-start p-4 bg-orange-50/20 dark:bg-orange-950/10 border border-orange-100/50 dark:border-orange-900/30 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition text-sm">
                          <ArrowRight className="w-4 h-4 text-orange-400 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-800 dark:text-gray-200 font-semibold">{res}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
