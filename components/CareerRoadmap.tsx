import React, { useState } from 'react';
import { CareerRoadmap, SimulationTurn } from '../types';
import { generateRoadmap, generateAdvancedRoadmap, generateSimulationTurn } from '../services/gemini';
import { Loader2, MapPin, Clock, BookOpen, ChevronRight, PlayCircle, Layers, RefreshCcw, Save, Download, CheckCircle, Zap, Map } from 'lucide-react';

interface CareerRoadmapProps {
  onComplete: (result: CareerRoadmap) => void;
  existingResult: CareerRoadmap | null;
}

export const CareerRoadmapTool: React.FC<CareerRoadmapProps> = ({ onComplete, existingResult }) => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'story'>('roadmap');
  
  // Roadmap State
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [planType, setPlanType] = useState<'standard' | 'advanced'>('standard');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(existingResult);
  const [savedStatus, setSavedStatus] = useState(false);

  // Story Mode State
  const [storyLoading, setStoryLoading] = useState(false);
  const [simulationHistory, setSimulationHistory] = useState<SimulationTurn[]>([]);
  const [simRole, setSimRole] = useState('');
  const [simStarted, setSimStarted] = useState(false);

  const handleGenerate = async () => {
    if (!currentRole || !targetRole) return;
    setLoading(true);
    setSavedStatus(false);
    try {
      let result;
      if (planType === 'advanced') {
          result = await generateAdvancedRoadmap(currentRole, targetRole);
      } else {
          result = await generateRoadmap(currentRole, targetRole);
      }
      setRoadmap(result);
      onComplete(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToStorage = () => {
      if (!roadmap) return;
      localStorage.setItem('savedRoadmap', JSON.stringify(roadmap));
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleDownloadJSON = () => {
      if (!roadmap) return;
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(roadmap));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `roadmap_${roadmap.targetRole.replace(/\s+/g, '_')}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const startSimulation = async () => {
    if (!simRole) return;
    setStoryLoading(true);
    try {
        const turn = await generateSimulationTurn(simRole, "Starting afresh", "I want to begin my career journey.");
        setSimulationHistory([turn]);
        setSimStarted(true);
    } catch (e) {
        console.error(e);
    } finally {
        setStoryLoading(false);
    }
  };

  const handleChoice = async (choiceText: string) => {
    setStoryLoading(true);
    try {
        const lastTurn = simulationHistory[simulationHistory.length - 1];
        const context = `Current Year: ${lastTurn.year}. Scenario: ${lastTurn.scenario}`;
        const nextTurn = await generateSimulationTurn(simRole, context, choiceText);
        setSimulationHistory([...simulationHistory, nextTurn]);
    } catch (e) {
        console.error(e);
    } finally {
        setStoryLoading(false);
    }
  };

  const resetSimulation = () => {
      setSimulationHistory([]);
      setSimStarted(false);
      setSimRole('');
  };

  const headerGradient = activeTab === 'roadmap'
    ? 'from-violet-600 to-purple-600 shadow-violet-200'
    : 'from-fuchsia-600 to-pink-600 shadow-fuchsia-200';

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-20 md:pb-8">
      {/* Header */}
      <div className={`mb-8 bg-gradient-to-r ${headerGradient} p-8 rounded-3xl text-white shadow-xl dark:shadow-none flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500`}>
        <div>
            <h2 className="text-3xl font-bold font-brand flex items-center">
                {activeTab === 'roadmap' ? <Map className="w-8 h-8 mr-3 text-white/90" /> : <PlayCircle className="w-8 h-8 mr-3 text-white/90" />}
                {activeTab === 'roadmap' ? 'Career Roadmap' : 'Career Simulator'}
            </h2>
            <p className="text-white/90 mt-2 text-lg">
                {activeTab === 'roadmap' ? 'Visualize your path to success step by step.' : 'Roleplay your dream career and face realistic challenges.'}
            </p>
        </div>
        <div className="bg-white/20 backdrop-blur-md p-1 rounded-xl flex self-start md:self-auto border border-white/20">
            <button 
                onClick={() => setActiveTab('roadmap')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'roadmap' ? 'bg-white text-violet-600 shadow-md' : 'text-white hover:bg-white/10'}`}
            >
                Roadmap Plan
            </button>
            <button 
                onClick={() => setActiveTab('story')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${activeTab === 'story' ? 'bg-white text-fuchsia-600 shadow-md' : 'text-white hover:bg-white/10'}`}
            >
                <PlayCircle className="w-4 h-4 mr-2" />
                Simulator
            </button>
        </div>
      </div>

      <div key={activeTab} className="animate-fade-in">
        {activeTab === 'roadmap' ? (
            <div className="animate-slide-right duration-300">
              <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-10">
                  <div className="flex flex-col md:flex-row gap-6 items-end mb-6">
                      <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">Current Status</label>
                          <input
                              type="text"
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-violet-500 outline-none font-medium"
                              placeholder="e.g. Student, Junior Dev"
                              value={currentRole}
                              onChange={(e) => setCurrentRole(e.target.value)}
                          />
                      </div>
                      <div className="hidden md:block pb-4 text-gray-300 dark:text-gray-600">
                          <ChevronRight className="w-8 h-8" />
                      </div>
                      <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">Target Role</label>
                          <input
                              type="text"
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-fuchsia-500 outline-none font-medium"
                              placeholder="e.g. CTO, Senior Designer"
                              value={targetRole}
                              onChange={(e) => setTargetRole(e.target.value)}
                          />
                      </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-gray-100 dark:border-gray-700 pt-6">
                      <div className="flex items-center space-x-4 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-xl">
                           <button
                              onClick={() => setPlanType('standard')}
                              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${planType === 'standard' ? 'bg-white dark:bg-gray-800 text-violet-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                           >
                               Standard
                           </button>
                           <button
                              onClick={() => setPlanType('advanced')}
                              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${planType === 'advanced' ? 'bg-white dark:bg-gray-800 text-fuchsia-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                           >
                               Advanced
                           </button>
                      </div>

                      <button
                          onClick={handleGenerate}
                          disabled={loading || !currentRole || !targetRole}
                          className={`px-8 py-3 text-white font-bold rounded-xl transition disabled:opacity-50 flex items-center justify-center whitespace-nowrap ${planType === 'advanced' ? 'bg-fuchsia-600 hover:bg-fuchsia-700 shadow-lg shadow-fuchsia-200 dark:shadow-none' : 'bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200 dark:shadow-none'}`}
                      >
                          {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <MapPin className="w-5 h-5 mr-2" />}
                          {planType === 'advanced' ? 'Generate Detailed Plan' : 'Generate Roadmap'}
                      </button>
                  </div>
              </div>

              {roadmap && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex justify-end mb-6 gap-3">
                           <button 
                              onClick={handleSaveToStorage}
                              className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm border ${savedStatus ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}
                           >
                               {savedStatus ? <CheckCircle className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                               {savedStatus ? 'Saved!' : 'Save Plan'}
                           </button>
                           <button 
                              onClick={handleDownloadJSON}
                              className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
                           >
                               <Download className="w-4 h-4 mr-2" /> JSON
                           </button>
                      </div>

                      <div className="relative space-y-8 pb-12 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-1/2 before:bg-gradient-to-b before:from-violet-500 before:via-fuchsia-500 before:to-transparent before:content-['']">
                          {(!roadmap.steps || roadmap.steps.length === 0) && (
                              <div className="p-4 bg-red-50 text-red-600 rounded-lg ml-8">
                                  No steps found. Please try regenerating the plan.
                              </div>
                          )}
                          
                          {(roadmap.steps || []).map((step, index) => (
                              <div key={index} className="relative flex gap-6 md:gap-10 items-start group">
                                  {/* Timeline Node */}
                                  <div className={`absolute left-0 ml-5 -translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white dark:border-gray-950 shadow-md transition-all group-hover:scale-110 z-10 ${planType === 'advanced' ? 'bg-fuchsia-600 text-white' : 'bg-violet-600 text-white'}`}>
                                      <span className="text-sm font-bold">{index + 1}</span>
                                  </div>
                                  
                                  <div className={`flex-1 bg-white dark:bg-gray-800 p-6 rounded-3xl border shadow-sm hover:shadow-lg transition-all ml-8 md:ml-0 ${planType === 'advanced' ? 'border-fuchsia-100 dark:border-fuchsia-900/30' : 'border-violet-100 dark:border-violet-900/30'}`}>
                                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 md:mb-0">{step.title}</h3>
                                          <div className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full w-fit uppercase tracking-wide ${planType === 'advanced' ? 'text-fuchsia-700 dark:text-fuchsia-300 bg-fuchsia-50 dark:bg-fuchsia-900/30' : 'text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/30'}`}>
                                              <Clock className="w-3 h-3 mr-1.5" /> {step.duration}
                                          </div>
                                      </div>
                                      
                                      <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed font-medium">{step.description}</p>
                                      
                                      <div className="space-y-4">
                                          {/* Action Items for Advanced Plan */}
                                          {step.actions && step.actions.length > 0 && (
                                              <div className="bg-fuchsia-50 dark:bg-fuchsia-900/10 rounded-2xl p-5 border border-fuchsia-100 dark:border-fuchsia-900/30">
                                                  <h4 className="text-xs font-bold text-fuchsia-800 dark:text-fuchsia-300 uppercase tracking-wide mb-3 flex items-center">
                                                      <Zap className="w-4 h-4 mr-2" /> Execution Strategy
                                                  </h4>
                                                  <ul className="space-y-2">
                                                      {step.actions.map((action, i) => (
                                                          <li key={i} className="text-sm text-gray-800 dark:text-gray-200 flex items-start">
                                                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-fuchsia-500 mr-3 shrink-0"></div>
                                                              {action}
                                                          </li>
                                                      ))}
                                                  </ul>
                                              </div>
                                          )}

                                          {step.resources && step.resources.length > 0 && (
                                              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                                                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center">
                                                      <BookOpen className="w-4 h-4 mr-2" /> Resources
                                                  </h4>
                                                  <ul className="space-y-2">
                                                      {step.resources.map((res, i) => (
                                                          <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                                                              <span className="text-violet-400 mr-2 font-bold">→</span>
                                                              {res}
                                                          </li>
                                                      ))}
                                                  </ul>
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          ))}
                          
                          <div className="relative flex items-center gap-6 ml-5">
                              <div className="absolute left-0 -translate-x-1/2 w-6 h-6 rounded-full bg-green-500 border-4 border-white dark:border-gray-950 shadow-sm z-10"></div>
                              <div className="pl-8 text-green-600 dark:text-green-500 font-bold text-xl">Goal Achieved: {roadmap.targetRole}</div>
                          </div>
                      </div>
                  </div>
              )}
            </div>
        ) : (
            <div className="animate-slide-right duration-300">
                {!simStarted ? (
                    <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 text-center max-w-2xl mx-auto mt-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-fuchsia-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-fuchsia-200 dark:shadow-none text-white">
                            <PlayCircle className="w-10 h-10 ml-1" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Career Path Simulator</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
                            Roleplay your dream career. Make critical decisions, face realistic challenges, and see where your choices lead you.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                          <input 
                              type="text" 
                              placeholder="Enter a role (e.g. Data Scientist)" 
                              className="flex-1 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl dark:bg-gray-900 dark:text-white outline-none focus:border-fuchsia-500 transition font-medium"
                              value={simRole}
                              onChange={(e) => setSimRole(e.target.value)}
                          />
                          <button 
                              onClick={startSimulation}
                              disabled={!simRole || storyLoading}
                              className="px-8 py-4 bg-fuchsia-600 text-white rounded-2xl hover:bg-fuchsia-700 disabled:opacity-50 transition font-bold shadow-lg shadow-fuchsia-200 dark:shadow-none whitespace-nowrap"
                          >
                              {storyLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Simulation'}
                          </button>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-8">
                         <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm sticky top-4 z-20">
                              <span className="px-4 py-1.5 bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 rounded-full text-sm font-bold border border-fuchsia-200 dark:border-fuchsia-800">
                                  Simulating: {simRole}
                              </span>
                              <button onClick={resetSimulation} className="text-gray-500 hover:text-red-500 transition flex items-center text-sm font-bold px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                  <RefreshCcw className="w-4 h-4 mr-2" /> Restart
                              </button>
                         </div>

                         <div className="space-y-6">
                             {simulationHistory.map((turn, index) => (
                                 <div key={index} className={`bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border ${index === simulationHistory.length - 1 ? 'border-fuchsia-500 ring-4 ring-fuchsia-500/10' : 'border-gray-100 dark:border-gray-700 opacity-80'}`}>
                                      <div className="flex justify-between items-start mb-6">
                                          <h4 className="text-2xl font-bold text-gray-900 dark:text-white font-brand">{turn.title}</h4>
                                          <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg text-gray-600 dark:text-gray-300">Year {turn.year}</span>
                                      </div>
                                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-8">{turn.scenario}</p>
                                      
                                      {index === simulationHistory.length - 1 && (
                                          <div className="grid gap-4">
                                              {(turn.options || []).map((opt, optIndex) => (
                                                  <button 
                                                      key={optIndex}
                                                      onClick={() => handleChoice(opt.text)}
                                                      disabled={storyLoading}
                                                      className="text-left p-6 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-fuchsia-500 dark:hover:border-fuchsia-500 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/10 transition group bg-gray-50 dark:bg-gray-900/30"
                                                  >
                                                      <span className="text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400 uppercase tracking-wider mb-2 block">Option {optIndex + 1}</span>
                                                      <span className="text-lg font-medium text-gray-800 dark:text-white group-hover:text-fuchsia-900 dark:group-hover:text-fuchsia-100">{opt.text}</span>
                                                  </button>
                                              ))}
                                          </div>
                                      )}
                                 </div>
                             ))}
                             {storyLoading && (
                                 <div className="flex justify-center p-8">
                                     <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg">
                                         <Loader2 className="w-8 h-8 animate-spin text-fuchsia-600" />
                                     </div>
                                 </div>
                             )}
                             <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
                         </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};