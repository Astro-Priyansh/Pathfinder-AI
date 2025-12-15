
import React, { useState } from 'react';
import { InterestAnalysis, InterestDevelopmentPlan } from '../types';
import { analyzeInterests, getInterestDevelopmentTips } from '../services/gemini';
import { Loader2, Tag, Briefcase, Sprout, BookOpen, CheckCircle2, ArrowRight, Heart, Sparkles } from 'lucide-react';

interface InterestsAnalyzerProps {
  onComplete: (result: InterestAnalysis) => void;
  existingResult: InterestAnalysis | null;
}

export const InterestsAnalyzer: React.FC<InterestsAnalyzerProps> = ({ onComplete, existingResult }) => {
  // Main Analyzer State
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InterestAnalysis | null>(existingResult);

  // Development Section State
  const [developInput, setDevelopInput] = useState('');
  const [developLoading, setDevelopLoading] = useState(false);
  const [developResult, setDevelopResult] = useState<InterestDevelopmentPlan | null>(null);

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

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-20 md:pb-8">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-blue-500 to-cyan-500 p-8 rounded-3xl text-white shadow-xl shadow-blue-200 dark:shadow-none flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
            <h2 className="text-3xl font-bold font-brand flex items-center">
                <Heart className="w-8 h-8 mr-3 text-white/90 fill-white/20" />
                Interests Analyzer
            </h2>
            <p className="text-blue-50 mt-2 text-lg">Turn your passions into a profession. Tell us what you love.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <Heart className="w-64 h-64 text-blue-500" />
        </div>
        
        <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Your Hobbies & Interests
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-6 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-gray-900 dark:text-white transition-all h-40 resize-none text-lg leading-relaxed placeholder-gray-300 dark:placeholder-gray-600 font-medium"
          placeholder="e.g. I love playing video games, solving math puzzles, organizing events for my friends, and sketching landscapes..."
        />
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={loading || !input.trim()}
            className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition disabled:opacity-50 flex items-center justify-center font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:shadow-xl hover:scale-105"
          >
            {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
            Analyze My Interests
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-3xl border border-blue-100 dark:border-blue-800">
              <h3 className="flex items-center text-xl font-bold text-blue-900 dark:text-blue-300 mb-6">
                <Tag className="w-6 h-6 mr-3 text-blue-500" /> Key Categories
              </h3>
              <div className="flex flex-wrap gap-3">
                {(result.categories || []).map((cat, i) => (
                  <span key={i} className="px-4 py-2 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 rounded-xl text-sm font-bold shadow-sm border border-blue-100 dark:border-blue-900">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="bg-cyan-50 dark:bg-cyan-900/20 p-8 rounded-3xl border border-cyan-100 dark:border-cyan-800 flex flex-col justify-center">
              <h3 className="flex items-center text-xl font-bold text-cyan-900 dark:text-cyan-300 mb-4">
                <Briefcase className="w-6 h-6 mr-3 text-cyan-600" /> Career Potential
              </h3>
              <p className="text-cyan-800 dark:text-cyan-200 text-lg leading-relaxed">
                We've identified <span className="font-bold text-2xl mx-1">{(result.careers || []).length}</span> strong career paths that align with your unique profile.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white px-2">Top Matches</h3>
            {(result.careers || []).map((career, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all group">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{career.title}</h4>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm font-medium">{career.matchReason}</p>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Develop New Interest Section */}
      <div className="mt-16 pt-10 border-t border-gray-200 dark:border-gray-700">
         <div className="mb-8 text-center">
             <div className="inline-flex items-center justify-center p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl mb-4 text-green-600 dark:text-green-400">
                <Sprout className="w-8 h-8" />
             </div>
             <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white font-brand">
                 Want to Learn Something New?
             </h3>
             <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto">Curious about a hobby? Type it below and we'll generate a beginner's roadmap for you.</p>
         </div>

         <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-lg shadow-gray-200 dark:shadow-none border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-2 max-w-2xl mx-auto mb-12">
            <input
                type="text"
                className="flex-1 px-6 py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-lg font-medium"
                placeholder="e.g. Photography, Coding, Chess..."
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
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                 <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-100 dark:border-green-800">
                     <h4 className="text-lg font-bold text-green-800 dark:text-green-300 mb-2">Why {developResult.interest}?</h4>
                     <p className="text-green-700 dark:text-green-400 leading-relaxed font-medium">{developResult.introduction}</p>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="space-y-6">
                         <h4 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                             <CheckCircle2 className="w-6 h-6 mr-3 text-indigo-500" /> Action Plan
                         </h4>
                         <div className="relative border-l-2 border-indigo-100 dark:border-indigo-900/50 ml-3 space-y-6 pl-6 py-2">
                             {developResult.steps.map((step, i) => (
                                 <div key={i} className="relative">
                                     <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm ring-4 ring-white dark:ring-gray-800">{i + 1}</div>
                                     <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">{step}</p>
                                 </div>
                             ))}
                         </div>
                     </div>

                     <div className="space-y-4">
                         <h4 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                             <BookOpen className="w-6 h-6 mr-3 text-orange-500" /> Resources
                         </h4>
                         <div className="space-y-3">
                             {developResult.resources.map((res, i) => (
                                 <div key={i} className="flex items-start p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/20 transition">
                                     <ArrowRight className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                                     <span className="text-gray-800 dark:text-gray-200 font-medium">{res}</span>
                                 </div>
                             ))}
                         </div>
                     </div>
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};
