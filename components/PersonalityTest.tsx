
import React, { useState } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { PersonalityResult } from '../types';
import { analyzePersonality } from '../services/gemini';
import { Loader2, RefreshCcw, ArrowRight, ArrowLeft, Check, Star, Briefcase, Brain, Activity } from 'lucide-react';

interface PersonalityTestProps {
  onComplete: (result: PersonalityResult) => void;
  existingResult: PersonalityResult | null;
}

const QUESTIONS = [
  // Openness
  "I have a vivid imagination.",
  "I am interested in abstract ideas.",
  "I enjoy visiting art galleries or museums.",
  "I rarely look for a deeper meaning in things.",
  
  // Conscientiousness
  "I get chores done right away.",
  "I like order.",
  "I follow a schedule.",
  "I often forget to put things back in their proper place.",
  
  // Extraversion
  "I am the life of the party.",
  "I feel comfortable around people.",
  "I don't mind being the center of attention.",
  "I am quiet around strangers.",
  
  // Agreeableness
  "I sympathize with others' feelings.",
  "I am interested in people.",
  "I have a soft heart.",
  "I am not interested in other people's problems.",
  
  // Neuroticism
  "I have frequent mood swings.",
  "I worry about things.",
  "I get stressed out easily.",
  "I am relaxed most of the time.",
  
  // Additional Work Style
  "I prefer working in a team rather than alone.",
  "I take charge in group situations.",
  "I am adaptable to sudden changes.",
  "I prefer sticking to proven methods over trying new ones."
];

const QUESTIONS_PER_PAGE = 6;

const PAGE_GRADIENTS = [
    'from-indigo-600 to-blue-600',
    'from-blue-600 to-cyan-600',
    'from-cyan-600 to-teal-600',
    'from-teal-600 to-emerald-600',
    'from-emerald-600 to-orange-600',
    'from-orange-600 to-purple-600'
];

export const PersonalityTest: React.FC<PersonalityTestProps> = ({ onComplete, existingResult }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [localResult, setLocalResult] = useState<PersonalityResult | null>(existingResult);
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(QUESTIONS.length / QUESTIONS_PER_PAGE);
  const currentQuestions = QUESTIONS.slice(page * QUESTIONS_PER_PAGE, (page + 1) * QUESTIONS_PER_PAGE);

  const handleOptionChange = (qIndex: number, value: string) => {
    setAnswers(prev => ({ ...prev, [qIndex]: value }));
  };

  const handleNext = () => {
    if (page < totalPages - 1) {
      setPage(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (page > 0) {
      setPage(prev => prev - 1);
    }
  };

  const isPageComplete = () => {
    const startIndex = page * QUESTIONS_PER_PAGE;
    const endIndex = Math.min(startIndex + QUESTIONS_PER_PAGE, QUESTIONS.length);
    for (let i = startIndex; i < endIndex; i++) {
      if (!answers[i]) return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formattedAnswers = QUESTIONS.map((q, i) => ({
        question: q,
        answer: answers[i] || "Neutral"
      }));
      
      const result = await analyzePersonality(formattedAnswers);
      setLocalResult(result);
      onComplete(result);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setLoading(false);
    }
  };

  const currentGradient = PAGE_GRADIENTS[page % PAGE_GRADIENTS.length];

  if (localResult) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto pb-20 md:pb-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-3xl text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-all">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-brand flex items-center">
                <Brain className="w-8 h-8 mr-3 text-white/90" />
                Your Personality Profile
            </h2>
            <p className="text-white/90 mt-2">Here's a deep dive into who you are and how you work best.</p>
          </div>
          <button 
            onClick={() => { setLocalResult(null); setAnswers({}); setPage(0); }}
            className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition font-medium text-sm border border-white/20"
          >
            <RefreshCcw className="w-4 h-4 mr-2" /> Retake Test
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 h-[450px] flex flex-col">
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">Trait Analysis</h3>
            <div className="flex-1 w-full h-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={localResult.traits || []}>
                    <PolarGrid stroke="#9ca3af" opacity={0.3} />
                    <PolarAngleAxis dataKey="trait" tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '12px' }} />
                </RadarChart>
                </ResponsiveContainer>
            </div>
          </div>

          {/* Results Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/30">
              <h3 className="font-bold text-xl mb-3 flex items-center text-indigo-900 dark:text-indigo-200">
                  <Star className="w-6 h-6 mr-2 text-indigo-500" /> Executive Summary
              </h3>
              <p className="leading-relaxed text-indigo-800 dark:text-indigo-300 text-lg">{localResult.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center text-lg">
                        <Check className="w-5 h-5 mr-2 text-emerald-500" /> Core Strengths
                    </h3>
                    <ul className="space-y-3">
                        {(localResult.strengths || ["Detailed Oriented", "Creative", "Reliable"]).map((str, i) => (
                            <li key={i} className="flex items-center text-sm text-gray-700 dark:text-gray-300 font-medium">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3"></div>
                                {str}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center text-lg">
                        <Briefcase className="w-5 h-5 mr-2 text-blue-500" /> Work Style
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                        {localResult.workStyle || "Prefers structured environments with clear goals."}
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center text-lg">
                  <Activity className="w-5 h-5 mr-2 text-purple-500" /> Suggested Careers
              </h3>
              <div className="flex flex-wrap gap-2">
                {(localResult.suggestedCareers || []).map((career, idx) => (
                  <span key={idx} className="px-4 py-2 bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800 rounded-xl text-purple-700 dark:text-purple-300 text-sm font-bold shadow-sm">
                    {career}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-20 md:pb-8">
      {/* Header */}
      <div className={`mb-8 bg-gradient-to-r ${currentGradient} p-8 rounded-3xl text-white shadow-xl shadow-indigo-200 dark:shadow-none transition-all duration-700`}>
        <h2 className="text-3xl font-bold font-brand mb-2">Personality Assessment</h2>
        <p className="text-indigo-100 opacity-90">Discover your strengths and ideal career path in just a few minutes.</p>
        
        <div className="flex items-center mt-6 gap-4">
            <span className="text-xs font-bold uppercase tracking-wider bg-black/20 px-3 py-1 rounded-full">Step {page + 1} of {totalPages}</span>
            <div className="flex-1 bg-black/20 h-2 rounded-full overflow-hidden">
                <div 
                    className="bg-white h-full transition-all duration-500 ease-out"
                    style={{ width: `${((page + 1) / totalPages) * 100}%` }}
                ></div>
            </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 md:p-10 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 min-h-[400px] flex flex-col justify-between relative overflow-hidden">
        <div className="space-y-8 relative z-10">
            {currentQuestions.map((question, index) => {
            const actualIndex = page * QUESTIONS_PER_PAGE + index;
            return (
                <div key={actualIndex} className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                    <label className="block text-gray-900 dark:text-white font-bold text-lg">{actualIndex + 1}. {question}</label>
                    <div className="grid grid-cols-3 gap-3">
                    {['Disagree', 'Neutral', 'Agree'].map((option) => {
                        const isSelected = answers[actualIndex] === option;
                        let optionClass = 'bg-gray-50 dark:bg-gray-900 border-transparent hover:border-gray-200 dark:hover:border-gray-700 text-gray-500 dark:text-gray-400';
                        
                        if (isSelected) {
                            if (option === 'Disagree') optionClass = 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md transform scale-105 border-none';
                            else if (option === 'Neutral') optionClass = 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md transform scale-105 border-none';
                            else if (option === 'Agree') optionClass = 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md transform scale-105 border-none';
                        }

                        return (
                            <label 
                                key={option} 
                                className={`flex flex-col items-center justify-center cursor-pointer p-3 rounded-xl border-2 transition-all duration-200 ${optionClass}`}
                            >
                            <input
                                type="radio"
                                name={`q-${actualIndex}`}
                                value={option}
                                checked={isSelected}
                                onChange={() => handleOptionChange(actualIndex, option)}
                                className="hidden"
                            />
                            <span className="text-sm font-bold">{option}</span>
                            </label>
                        );
                    })}
                    </div>
                </div>
            )})}
        </div>

        <div className="pt-8 mt-8 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center relative z-10">
            <button
                onClick={handlePrev}
                disabled={page === 0}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition disabled:opacity-0"
            >
                <ArrowLeft className="w-5 h-5 inline mr-2" /> Back
            </button>

            {page === totalPages - 1 ? (
                 <button
                    onClick={handleSubmit}
                    disabled={loading || Object.keys(answers).length < QUESTIONS.length}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl hover:scale-105"
                >
                    {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing...</> : 'Complete & Analyze'}
                </button>
            ) : (
                <button
                    onClick={handleNext}
                    disabled={!isPageComplete()}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl"
                >
                    Next Step <ArrowRight className="w-5 h-5 ml-2" />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};
