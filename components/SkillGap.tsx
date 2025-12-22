import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import { SkillGapAnalysis, SkillProficiency } from '../types';
import { analyzeSkillGap, getSkillAdvice } from '../services/gemini';
import { Loader2, Plus, X, Zap, TrendingUp, Lightbulb, Target, CheckCircle2 } from 'lucide-react';

interface SkillGapProps {
  onComplete: (result: SkillGapAnalysis) => void;
  onUpdateTracker: (skills: SkillProficiency[]) => void;
  existingResult: SkillGapAnalysis | null;
  existingTracker: SkillProficiency[] | null;
}

export const SkillGapTool: React.FC<SkillGapProps> = ({ onComplete, onUpdateTracker, existingResult, existingTracker }) => {
  const [activeTab, setActiveTab] = useState<'gap' | 'tracker'>('gap');
  
  // Gap Analysis State
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SkillGapAnalysis | null>(existingResult);

  // Tracker State
  const [trackedSkills, setTrackedSkills] = useState<SkillProficiency[]>(existingTracker || []);
  const [adviceLoading, setAdviceLoading] = useState<string | null>(null);

  // Initialize tracker with skills from analysis if empty
  useEffect(() => {
    if (result && trackedSkills.length === 0) {
      const initialSkills: SkillProficiency[] = [
        ...(result.missingSkills || []),
        ...(result.masteredSkills || [])
      ].map(skill => ({
        skill,
        level: 20, // Default start level
        targetLevel: 80,
        advice: '',
        lastUpdated: new Date().toISOString()
      }));
      setTrackedSkills(initialSkills);
      onUpdateTracker(initialSkills);
    }
  }, [result]);

  const addSkill = () => {
    if (skillInput.trim()) {
      setCurrentSkills([...currentSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setCurrentSkills(currentSkills.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addSkill();
  };

  const handleAnalyze = async () => {
    if (currentSkills.length === 0 || !targetRole) return;
    setLoading(true);
    try {
      const analysis = await analyzeSkillGap(currentSkills.join(', '), targetRole);
      setResult(analysis);
      onComplete(analysis);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateSkillLevel = (index: number, newLevel: number) => {
    const updated = [...trackedSkills];
    updated[index].level = newLevel;
    setTrackedSkills(updated);
    onUpdateTracker(updated);
  };

  const getAdviceForSkill = async (index: number) => {
    const skill = trackedSkills[index];
    setAdviceLoading(skill.skill);
    try {
      const advice = await getSkillAdvice(skill.skill, skill.level);
      const updated = [...trackedSkills];
      updated[index].advice = advice;
      setTrackedSkills(updated);
      onUpdateTracker(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setAdviceLoading(null);
    }
  };

  const chartData = result ? [
    { name: 'Your Match', score: result.matchScore },
    { name: 'Gap', score: 100 - result.matchScore }
  ] : [];

  const headerGradient = activeTab === 'gap' 
    ? 'from-blue-600 to-indigo-600 shadow-blue-200' 
    : 'from-emerald-600 to-teal-600 shadow-emerald-200';

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-20 md:pb-8">
      {/* Header */}
      <div className={`mb-8 bg-gradient-to-r ${headerGradient} p-8 rounded-3xl text-white shadow-xl dark:shadow-none flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500`}>
        <div>
           <h2 className="text-3xl font-bold font-brand flex items-center">
               {activeTab === 'gap' ? <Target className="w-8 h-8 mr-3 text-white/90" /> : <TrendingUp className="w-8 h-8 mr-3 text-white/90" />}
               Skill Center
           </h2>
           <p className="text-white/90 mt-2 text-lg">
               {activeTab === 'gap' ? "Benchmark your skills against your target role." : "Track your learning progress and growth over time."}
           </p>
        </div>
        <div className="bg-white/20 backdrop-blur-md p-1 rounded-xl flex self-start md:self-auto border border-white/20">
            <button 
                onClick={() => setActiveTab('gap')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'gap' ? 'bg-white text-blue-600 shadow-md' : 'text-white hover:bg-white/10'}`}
            >
                Gap Analysis
            </button>
            <button 
                onClick={() => setActiveTab('tracker')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${activeTab === 'tracker' ? 'bg-white text-emerald-600 shadow-md' : 'text-white hover:bg-white/10'}`}
            >
                <TrendingUp className="w-4 h-4 mr-2" />
                Tracker
            </button>
        </div>
      </div>

      <div key={activeTab} className="animate-fade-in">
        {activeTab === 'gap' ? (
          <div className="animate-slide-right duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <div className="mb-6">
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">Target Role</label>
                          <input
                              type="text"
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                              placeholder="e.g. Senior Product Manager"
                              value={targetRole}
                              onChange={(e) => setTargetRole(e.target.value)}
                          />
                      </div>

                      <div className="mb-6">
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">Your Skills</label>
                          <div className="flex gap-2 mb-4">
                              <input
                              type="text"
                              className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                              placeholder="Add a skill..."
                              value={skillInput}
                              onChange={(e) => setSkillInput(e.target.value)}
                              onKeyDown={handleKeyDown}
                              />
                              <button 
                              onClick={addSkill}
                              className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition"
                              >
                              <Plus className="w-6 h-6" />
                              </button>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 min-h-[80px] content-start p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                              {currentSkills.length === 0 && <span className="text-gray-400 dark:text-gray-500 text-sm italic w-full text-center py-2">Added skills will appear here.</span>}
                              {currentSkills.map((skill, index) => (
                              <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700">
                                  {skill}
                                  <button onClick={() => removeSkill(index)} className="ml-2 text-gray-400 hover:text-red-500">
                                  <X className="w-3 h-3" />
                                  </button>
                              </span>
                              ))}
                          </div>
                      </div>

                      <button
                          onClick={handleAnalyze}
                          disabled={loading || currentSkills.length === 0 || !targetRole}
                          className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 flex justify-center items-center shadow-lg shadow-indigo-200 dark:shadow-none"
                      >
                          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Analyze Gap"}
                      </button>
                  </div>

                  {result && (
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 w-full text-left flex items-center">
                          Match Score
                          <span className="ml-auto text-3xl text-indigo-600 dark:text-indigo-400">{result.matchScore}%</span>
                      </h3>
                      <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" opacity={0.5} />
                          <XAxis type="number" domain={[0, 100]} hide />
                          <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#6b7280', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '12px' }} />
                          <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={40}>
                              {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#f3f4f6'} />
                              ))}
                          </Bar>
                          </BarChart>
                      </ResponsiveContainer>
                      </div>
                      <p className="text-center text-gray-500 dark:text-gray-400 mt-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl text-sm">
                          You are a <strong className="text-indigo-600 dark:text-indigo-400">{result.matchScore}% match</strong> for this role based on the skills provided.
                      </p>
                  </div>
                  )}
              </div>

              {result && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-3xl border border-red-100 dark:border-red-900/30">
                      <h3 className="font-bold text-red-800 dark:text-red-300 mb-6 flex items-center text-lg">
                      <Zap className="w-5 h-5 mr-3 text-red-500" /> Missing Critical Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                      {(result.missingSkills || []).map((skill, i) => (
                          <div key={i} className="flex items-center px-4 py-2 bg-white dark:bg-red-900/20 rounded-xl text-red-700 dark:text-red-300 font-medium border border-red-100 dark:border-red-800 shadow-sm">
                              {skill}
                          </div>
                      ))}
                      </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/10 p-8 rounded-3xl border border-green-100 dark:border-green-900/30">
                      <h3 className="font-bold text-green-800 dark:text-green-300 mb-6 flex items-center text-lg">
                      <CheckCircle2 className="w-5 h-5 mr-3 text-green-500" /> Mastered Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                      {(result.masteredSkills || []).map((skill, i) => (
                          <div key={i} className="flex items-center px-4 py-2 bg-white dark:bg-green-900/20 rounded-xl text-red-700 dark:text-red-300 font-medium border border-red-100 dark:border-red-800 shadow-sm">
                              {skill}
                          </div>
                      ))}
                      </div>
                  </div>
                  
                  <div className="md:col-span-2 bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                      <h3 className="font-bold text-xl mb-4 font-brand">AI Recommendations</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                      {(result.recommendations || []).map((rec, i) => (
                          <div key={i} className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10 text-sm leading-relaxed font-medium">
                          {rec}
                          </div>
                      ))}
                      </div>
                  </div>
                  </div>
              )}
          </div>
        ) : (
          <div className="space-y-6 animate-slide-right duration-300">
              {trackedSkills.length === 0 ? (
                  <div className="text-center p-16 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                      <Target className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Skills Tracked Yet</h3>
                      <p className="text-gray-500 dark:text-gray-400">Run a gap analysis first or manually add skills to start tracking proficiency.</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {trackedSkills.map((skill, index) => (
                          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                              <div className="flex justify-between items-center mb-6">
                                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{skill.skill}</h3>
                                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${
                                      skill.level < 40 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                      skill.level < 70 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                  }`}>
                                      {skill.level < 40 ? 'Beginner' : skill.level < 70 ? 'Intermediate' : 'Advanced'}
                                  </span>
                              </div>
                              
                              <div className="mb-8">
                                  <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                      <span>Proficiency: {skill.level}%</span>
                                      <span>Target: {skill.targetLevel}%</span>
                                  </div>
                                  <div className="relative h-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                                      <div 
                                          className={`absolute h-full rounded-full transition-all duration-500 ${
                                              skill.level < 40 ? 'bg-red-500' :
                                              skill.level < 70 ? 'bg-yellow-500' :
                                              'bg-green-500'
                                          }`}
                                          style={{ width: `${skill.level}%` }}
                                      ></div>
                                      <input 
                                          type="range" 
                                          min="0" 
                                          max="100" 
                                          value={skill.level} 
                                          onChange={(e) => updateSkillLevel(index, parseInt(e.target.value))}
                                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                      />
                                  </div>
                              </div>

                              <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                                  <div className="flex justify-between items-start mb-3">
                                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center">
                                          <Lightbulb className="w-3 h-3 mr-1.5 text-yellow-500" />
                                          Improvement Advice
                                      </h4>
                                      <button 
                                          onClick={() => getAdviceForSkill(index)}
                                          disabled={adviceLoading === skill.skill}
                                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm"
                                      >
                                          {adviceLoading === skill.skill ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Get AI Tip'}
                                      </button>
                                  </div>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                      {skill.advice || "Click button to get personalized AI advice based on your current level."}
                                  </p>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};