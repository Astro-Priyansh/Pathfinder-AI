
import React, { useState, useEffect } from 'react';
import { CareerRoadmap, SimulationTurn, RoadmapStep } from '../types';
import { generateRoadmap, generateAdvancedRoadmap, generateSimulationTurn } from '../services/gemini';
import { 
  Loader2, MapPin, Clock, BookOpen, ChevronRight, PlayCircle, 
  RefreshCcw, Save, Download, CheckCircle, Circle, Zap, Map, 
  Info, Printer, Sparkles, X, Star, Eye, ArrowDown, 
  Layout, Image as ImageIcon, MousePointer2, ExternalLink,
  GraduationCap, Youtube, Book, Library, Globe
} from 'lucide-react';

interface CareerRoadmapProps {
  onComplete: (result: CareerRoadmap) => void;
  existingResult: CareerRoadmap | null;
}

export const CareerRoadmapTool: React.FC<CareerRoadmapProps> = ({ onComplete, existingResult }) => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'story'>('roadmap');
  
  // Roadmap State
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [planType, setPlanType] = useState<'standard' | 'advanced' | 'visual'>('standard');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(existingResult);
  const [savedStatus, setSavedStatus] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Story Mode State
  const [storyLoading, setStoryLoading] = useState(false);
  const [simulationHistory, setSimulationHistory] = useState<SimulationTurn[]>([]);
  const [simRole, setSimRole] = useState('');
  const [simStarted, setSimStarted] = useState(false);

  useEffect(() => {
    if (!existingResult) {
      setShowTutorial(true);
    }
    // Set plan type from existing result if available
    if (existingResult?.type) {
      setPlanType(existingResult.type as any);
    }
  }, [existingResult]);

  const handleGenerate = async () => {
    if (!currentRole || !targetRole) return;
    setLoading(true);
    setSavedStatus(false);
    try {
      let result;
      // 'visual' uses the same rich data as advanced but rendered differently
      if (planType === 'advanced' || planType === 'visual') {
          result = await generateAdvancedRoadmap(currentRole, targetRole);
      } else {
          result = await generateRoadmap(currentRole, targetRole);
      }
      if (result) {
        result.steps = result.steps || [];
        const finalResult: CareerRoadmap = { ...result, type: planType };
        setRoadmap(finalResult);
        onComplete(finalResult);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleStepCompletion = (index: number) => {
    if (!roadmap) return;
    const newSteps = [...roadmap.steps];
    newSteps[index].completed = !newSteps[index].completed;
    const newRoadmap = { ...roadmap, steps: newSteps };
    setRoadmap(newRoadmap);
    onComplete(newRoadmap);
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

  const handlePrintPDF = () => {
    window.print();
  };

  const startSimulation = async () => {
    if (!simRole) return;
    setStoryLoading(true);
    try {
        const turn = await generateSimulationTurn(simRole, "Starting afresh", "I want to begin my career journey.");
        if (turn) {
          setSimulationHistory([turn]);
          setSimStarted(true);
        }
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
        if (nextTurn) {
          setSimulationHistory([...simulationHistory, nextTurn]);
        }
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

  const completedCount = roadmap?.steps.filter(s => s.completed).length || 0;
  const totalSteps = roadmap?.steps.length || 0;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  // Visual Roadmap Step Card
  const VisualStepCard = ({ step, index }: { step: RoadmapStep, index: number }) => {
    const imageUrl = `https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop&q=80&auto=format&keywords=${encodeURIComponent(step.title)}`;
    
    return (
      <div className="relative group">
        <div className={`
          bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border-2 transition-all duration-500 
          hover:shadow-2xl hover:-translate-y-2
          ${step.completed ? 'border-green-400 opacity-90' : 'border-gray-100 dark:border-gray-700'}
        `}>
          {/* Illustrative Image */}
          <div className="h-48 w-full overflow-hidden relative">
            <img src={imageUrl} alt={step.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
            <div className="absolute bottom-4 left-4 right-4 text-white">
               <div className="flex items-center gap-2 mb-1">
                 <span className="bg-white/20 backdrop-blur-md text-[10px] uppercase font-bold px-2 py-0.5 rounded-lg border border-white/20">Phase {index + 1}</span>
                 <span className="bg-indigo-500/80 text-[10px] uppercase font-bold px-2 py-0.5 rounded-lg">{step.duration}</span>
               </div>
               <h3 className="font-bold text-lg leading-tight">{step.title}</h3>
            </div>
            {/* Completion Trigger */}
            <button 
                onClick={() => toggleStepCompletion(index)}
                className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md border transition-all ${
                    step.completed 
                    ? 'bg-green-500 border-green-400 text-white' 
                    : 'bg-white/20 border-white/20 text-white hover:bg-white/40'
                }`}
            >
                {step.completed ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
            </button>
          </div>

          {/* Card Content */}
          <div className="p-6 space-y-4">
             <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed font-medium line-clamp-3">
               {step.description}
             </p>
             
             {step.actions && (
               <div className="flex flex-wrap gap-2">
                 {step.actions.slice(0, 2).map((a, i) => (
                   <span key={i} className="text-[10px] font-bold px-2 py-1 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md border border-gray-100 dark:border-gray-600 flex items-center">
                     <Zap className="w-3 h-3 mr-1 text-amber-500" /> {a.length > 20 ? a.slice(0, 20) + '...' : a}
                   </span>
                 ))}
               </div>
             )}

             <button 
                onClick={() => { setExpandedId(expandedId === index ? null : index); }}
                className="w-full py-2 bg-gray-50 dark:bg-gray-900 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors flex items-center justify-center gap-2"
             >
                <Eye className="w-4 h-4" /> View Details
             </button>
          </div>
        </div>
      </div>
    );
  };

  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-20 md:pb-8">
      {/* Header */}
      <div className={`mb-8 bg-gradient-to-r ${headerGradient} p-8 rounded-3xl text-white shadow-xl dark:shadow-none flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500 no-print`}>
        <div>
            <h2 className="text-3xl font-bold font-brand flex items-center">
                {activeTab === 'roadmap' ? <Map className="w-8 h-8 mr-3 text-white/90" /> : <PlayCircle className="w-8 h-8 mr-3 text-white/90" />}
                {activeTab === 'roadmap' ? 'Career Roadmap' : 'Career Simulator'}
            </h2>
            <p className="text-white/90 mt-2 text-lg">
                {activeTab === 'roadmap' ? 'Visualize your path to success step by step.' : 'Roleplay your dream career and face realistic challenges.'}
            </p>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => setShowTutorial(!showTutorial)}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
            title="Show Tutorial"
          >
            <Info className="w-5 h-5" />
          </button>
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
      </div>

      {/* Tutorial Overlay */}
      {showTutorial && activeTab === 'roadmap' && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-800 mb-8 animate-in fade-in slide-in-from-top-4 no-print">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-200 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
              Maximize your Journey
            </h3>
            <button onClick={() => setShowTutorial(false)} className="text-indigo-400 hover:text-indigo-600 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid md:grid-cols-4 gap-6 text-sm text-indigo-800 dark:text-indigo-300">
            <div className="space-y-2">
              <p className="font-bold uppercase tracking-wider text-[10px] opacity-60">1. Select Style</p>
              <p>Choose "Visual" for an immersive flowchart or "Advanced" for high-detail mastery.</p>
            </div>
            <div className="space-y-2">
              <p className="font-bold uppercase tracking-wider text-[10px] opacity-60">2. Real Links</p>
              <p>Advanced plan includes redirecting links to courses, tutorials and more.</p>
            </div>
            <div className="space-y-2">
              <p className="font-bold uppercase tracking-wider text-[10px] opacity-60">3. Track Items</p>
              <p>Mark phases as complete to update your overall readiness dashboard.</p>
            </div>
            <div className="space-y-2">
              <p className="font-bold uppercase tracking-wider text-[10px] opacity-60">4. Master Plan</p>
              <p>Download your roadmap to use as a professional development checklist.</p>
            </div>
          </div>
        </div>
      )}

      <div key={activeTab} className="animate-fade-in">
        {activeTab === 'roadmap' ? (
            <div className="animate-slide-right duration-300">
              <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-10 no-print">
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
                           <button
                              onClick={() => setPlanType('visual')}
                              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center ${planType === 'visual' ? 'bg-white dark:bg-gray-800 text-cyan-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                           >
                               <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
                               Visual
                           </button>
                      </div>

                      <button
                          onClick={handleGenerate}
                          disabled={loading || !currentRole || !targetRole}
                          className={`px-8 py-3 text-white font-bold rounded-xl transition disabled:opacity-50 flex items-center justify-center whitespace-nowrap ${
                            planType === 'advanced' ? 'bg-fuchsia-600 hover:bg-fuchsia-700' : 
                            planType === 'visual' ? 'bg-cyan-600 hover:bg-cyan-700' : 
                            'bg-violet-600 hover:bg-violet-700'
                          } shadow-lg dark:shadow-none`}
                      >
                          {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <MapPin className="w-5 h-5 mr-2" />}
                          Generate Roadmap
                      </button>
                  </div>
              </div>

              {roadmap && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {/* Dashboard-Sync Progress Header */}
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 no-print shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className={`p-4 rounded-2xl ${
                            planType === 'advanced' ? 'bg-fuchsia-100 text-fuchsia-600' : 
                            planType === 'visual' ? 'bg-cyan-100 text-cyan-600' :
                            'bg-violet-100 text-violet-600'
                          }`}>
                            <Zap className="w-8 h-8" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Progress</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{completedCount} of {totalSteps} steps mastered</p>
                          </div>
                        </div>
                        <div className="flex-1 max-w-xs w-full px-4">
                           <div className="w-full bg-gray-100 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-1000 ${
                                  planType === 'advanced' ? 'bg-fuchsia-500' : 
                                  planType === 'visual' ? 'bg-cyan-500' :
                                  'bg-violet-500'
                                }`}
                                style={{ width: `${progressPercent}%` }}
                              />
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button 
                              onClick={handleSaveToStorage}
                              className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm border ${savedStatus ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}
                           >
                               {savedStatus ? <CheckCircle className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                               {savedStatus ? 'Saved!' : 'Save Plan'}
                           </button>
                           <button 
                              onClick={handlePrintPDF}
                              className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition shadow-sm"
                           >
                               <Printer className="w-4 h-4 mr-2" /> Download PDF
                           </button>
                        </div>
                      </div>

                      {/* --- Plan View Selection --- */}
                      {planType === 'visual' ? (
                        <div className="space-y-12 pb-20">
                           {/* Visual Flow Tutorial Hint */}
                           <div className="bg-cyan-50/50 dark:bg-cyan-900/10 border border-cyan-100 dark:border-cyan-800 p-4 rounded-2xl flex items-center gap-3 no-print">
                              <MousePointer2 className="w-5 h-5 text-cyan-500" />
                              <span className="text-xs font-bold text-cyan-800 dark:text-cyan-300 uppercase tracking-widest">Visual Roadmap: Click cards to mark progress. Detailed actions inside.</span>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative">
                              <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-violet-500 via-cyan-500 to-emerald-500 -translate-y-1/2 opacity-20 pointer-events-none"></div>

                              {(roadmap.steps || []).map((step, index) => (
                                <React.Fragment key={index}>
                                  <VisualStepCard step={step} index={index} />
                                  {index < (roadmap.steps || []).length - 1 && (
                                    <div className="hidden md:flex items-center justify-center opacity-30 lg:hidden">
                                       <ArrowDown className="w-8 h-8 text-cyan-500" />
                                    </div>
                                  )}
                                </React.Fragment>
                              ))}

                              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white flex flex-col items-center justify-center text-center shadow-xl hover:scale-105 transition-transform">
                                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                                     <Star className="w-8 h-8 fill-white" />
                                  </div>
                                  <h3 className="text-xl font-bold uppercase tracking-wider mb-1">Career Goal</h3>
                                  <p className="text-3xl font-extrabold font-brand">{roadmap.targetRole}</p>
                                  <p className="mt-4 text-emerald-100 text-sm font-medium">Keep going! You're {progressPercent}% of the way there.</p>
                              </div>
                           </div>

                           {/* Detailed Info for Selected Visual Card */}
                           {expandedId !== null && (
                             <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
                                <div className="bg-white dark:bg-gray-900 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col">
                                   <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                                      <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold">
                                            {expandedId + 1}
                                         </div>
                                         <h3 className="text-xl font-bold text-gray-900 dark:text-white font-brand">{roadmap.steps[expandedId].title}</h3>
                                      </div>
                                      <button onClick={() => setExpandedId(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition"><X className="w-5 h-5" /></button>
                                   </div>
                                   <div className="p-8 space-y-8 overflow-y-auto max-h-[75vh]">
                                      <div>
                                         <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">The Objective</h4>
                                         <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{roadmap.steps[expandedId].description}</p>
                                      </div>

                                      <div className="grid md:grid-cols-2 gap-6">
                                          <div className="bg-cyan-50 dark:bg-cyan-900/10 p-5 rounded-2xl border border-cyan-100 dark:border-cyan-800">
                                             <h4 className="text-[10px] font-bold text-cyan-800 dark:text-cyan-300 uppercase tracking-widest mb-4 flex items-center">
                                                <Zap className="w-4 h-4 mr-2" /> Execution Steps
                                             </h4>
                                             <ul className="space-y-3">
                                                {roadmap.steps[expandedId].actions?.map((a, i) => (
                                                  <li key={i} className="flex items-start text-sm text-gray-700 dark:text-gray-300 font-medium">
                                                     <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mr-3 mt-1.5"></div>
                                                     {a}
                                                  </li>
                                                ))}
                                             </ul>
                                          </div>
                                          
                                          {/* Advanced Structured Resources in Modal */}
                                          <div className="space-y-4">
                                              {roadmap.steps[expandedId].courses && roadmap.steps[expandedId].courses.length > 0 && (
                                                <div className="bg-fuchsia-50 dark:bg-fuchsia-900/10 p-4 rounded-2xl border border-fuchsia-100 dark:border-fuchsia-800">
                                                    <h4 className="text-[10px] font-bold text-fuchsia-800 dark:text-fuchsia-300 uppercase tracking-widest mb-3 flex items-center">
                                                        <GraduationCap className="w-4 h-4 mr-2" /> Recommended Courses
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {roadmap.steps[expandedId].courses.map((c, i) => (
                                                            <li key={i}>
                                                                <a href={c.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400 hover:underline flex items-center justify-between group">
                                                                    <span>{c.platform}: {c.title}</span>
                                                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                              )}
                                              {roadmap.steps[expandedId].books && roadmap.steps[expandedId].books.length > 0 && (
                                                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-800">
                                                    <h4 className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-widest mb-3 flex items-center">
                                                        <Book className="w-4 h-4 mr-2" /> Definitive Books
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {roadmap.steps[expandedId].books.map((b, i) => (
                                                            <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                                <div className="w-1 h-1 rounded-full bg-amber-400"></div>
                                                                <span className="font-bold">"{b.title}"</span> by {b.author}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                              )}
                                          </div>
                                      </div>
                                   </div>
                                   <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                                      <button 
                                        onClick={() => toggleStepCompletion(expandedId!)}
                                        className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                                          roadmap.steps[expandedId].completed 
                                          ? 'bg-green-100 text-green-700 border border-green-200' 
                                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none'
                                        }`}
                                      >
                                         {roadmap.steps[expandedId].completed ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                         {roadmap.steps[expandedId].completed ? 'Mark Incomplete' : 'Complete Phase'}
                                      </button>
                                   </div>
                                </div>
                             </div>
                           )}
                        </div>
                      ) : (
                        /* Standard & Advanced Timeline View */
                        <div className="relative space-y-8 pb-12 before:absolute inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-1/2 before:bg-gradient-to-b before:from-violet-500 before:via-fuchsia-500 before:to-transparent before:content-['']">
                          {(!roadmap.steps || roadmap.steps.length === 0) && (
                              <div className="p-4 bg-red-50 text-red-600 rounded-lg ml-8 no-print">
                                  No steps found. Please try regenerating the plan.
                              </div>
                          )}
                          
                          {(roadmap.steps || []).map((step, index) => (
                              <div key={index} className="relative flex gap-6 md:gap-10 items-start group">
                                  {/* Interactive Timeline Node */}
                                  <button 
                                      onClick={() => toggleStepCompletion(index)}
                                      className={`absolute left-0 ml-5 -translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white dark:border-gray-950 shadow-md transition-all group-hover:scale-110 z-10 no-print ${
                                          step.completed 
                                          ? 'bg-green-500 text-white' 
                                          : (planType === 'advanced' ? 'bg-fuchsia-600 text-white' : 'bg-violet-600 text-white')
                                      }`}
                                  >
                                      {step.completed ? <CheckCircle className="w-5 h-5" /> : <span className="text-sm font-bold">{index + 1}</span>}
                                  </button>

                                  {/* Print-only Node */}
                                  <div className={`hidden print:flex absolute left-0 ml-5 -translate-x-1/2 h-10 w-10 items-center justify-center rounded-full border-4 border-gray-200 z-10 bg-white ${step.completed ? 'bg-green-50' : ''}`}>
                                       {step.completed ? '✓' : index + 1}
                                  </div>
                                  
                                  <div className={`flex-1 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl border shadow-sm transition-all ml-8 md:ml-0 ${
                                      step.completed ? 'border-green-200 dark:border-green-900/30 opacity-75' : 
                                      (planType === 'advanced' ? 'border-fuchsia-100 dark:border-fuchsia-900/30' : 'border-violet-100 dark:border-violet-900/30')
                                  } print:opacity-100 print:border-gray-300 print:shadow-none`}>
                                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                                          <div className="flex items-center gap-3">
                                            <h3 className={`text-xl font-bold mb-2 md:mb-0 ${step.completed ? 'text-green-700 dark:text-green-300 line-through' : 'text-gray-900 dark:text-white'}`}>{step.title}</h3>
                                            {step.completed && <span className="hidden md:inline text-xs font-bold text-green-600 uppercase tracking-widest bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">Completed</span>}
                                          </div>
                                          <div className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full w-fit uppercase tracking-wide ${planType === 'advanced' ? 'text-fuchsia-700 dark:text-fuchsia-300 bg-fuchsia-50 dark:bg-fuchsia-900/30' : 'text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/30'} print:border print:border-gray-200`}>
                                              <Clock className="w-3 h-3 mr-1.5" /> {step.duration}
                                          </div>
                                      </div>
                                      
                                      <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed font-medium">{step.description}</p>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          {/* Action Items */}
                                          <div className={`bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 print:bg-white print:border-gray-200 ${planType === 'standard' ? 'md:col-span-2' : ''}`}>
                                              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 flex items-center">
                                                  <Zap className="w-4 h-4 mr-2" /> Mastery Checklist
                                              </h4>
                                              <ul className="space-y-3">
                                                  {(step.actions || []).map((action, i) => (
                                                      <li key={i} className="text-sm text-gray-800 dark:text-gray-200 flex items-start">
                                                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 mr-3 shrink-0"></div>
                                                          {action}
                                                      </li>
                                                  ))}
                                                  {(!step.actions && step.resources) && step.resources.map((res, i) => (
                                                      <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                                                          <span className="text-violet-400 mr-2 font-bold">→</span>
                                                          {res}
                                                      </li>
                                                  ))}
                                              </ul>
                                          </div>

                                          {/* Advanced Detailing Section */}
                                          {planType === 'advanced' && (
                                              <div className="space-y-6">
                                                  {/* Courses & Tutorials Section */}
                                                  {(step.courses || step.tutorials) && (
                                                      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-800/50">
                                                          <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wide mb-4 flex items-center">
                                                              <Library className="w-4 h-4 mr-2" /> Expert Tutorials & Courses
                                                          </h4>
                                                          <div className="space-y-4">
                                                              {step.courses?.map((c, i) => (
                                                                  <a key={i} href={c.url} target="_blank" rel="noreferrer" className="block p-3 bg-white dark:bg-gray-800 rounded-xl border border-indigo-100 dark:border-gray-700 hover:border-indigo-400 transition-colors group">
                                                                      <div className="flex justify-between items-start">
                                                                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">{c.platform}</span>
                                                                          <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-indigo-500" />
                                                                      </div>
                                                                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">{c.title}</p>
                                                                  </a>
                                                              ))}
                                                              {step.tutorials?.map((t, i) => (
                                                                  <a key={i} href={t.url} target="_blank" rel="noreferrer" className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                                                                      <div className="flex items-center">
                                                                          <Youtube className="w-4 h-4 mr-2 text-red-500" />
                                                                          <span>{t.title}</span>
                                                                      </div>
                                                                      <ExternalLink className="w-3 h-3" />
                                                                  </a>
                                                              ))}
                                                          </div>
                                                      </div>
                                                  )}

                                                  {/* Books & Insights Section */}
                                                  {(step.books || step.channels) && (
                                                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-5 border border-amber-100 dark:border-amber-800/50">
                                                           <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide mb-4 flex items-center">
                                                              <BookOpen className="w-4 h-4 mr-2" /> Top-Tier Books & Communities
                                                          </h4>
                                                          <div className="space-y-3">
                                                              {step.books?.map((b, i) => (
                                                                  <div key={i} className="text-sm text-gray-800 dark:text-gray-200 flex items-start gap-2">
                                                                      <Book className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                                                      <span><span className="font-bold">"{b.title}"</span> by {b.author}</span>
                                                                  </div>
                                                              ))}
                                                              {step.channels?.map((ch, i) => (
                                                                  <a key={i} href={ch.url} target="_blank" rel="noreferrer" className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-amber-600">
                                                                      <div className="flex items-center">
                                                                          <Globe className="w-4 h-4 mr-2 text-blue-500" />
                                                                          <span>{ch.platform}: {ch.name}</span>
                                                                      </div>
                                                                      <ExternalLink className="w-3 h-3" />
                                                                  </a>
                                                              ))}
                                                          </div>
                                                      </div>
                                                  )}
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          ))}
                          
                          <div className="relative flex items-center gap-6 ml-5">
                              <div className="absolute left-0 -translate-x-1/2 w-8 h-8 rounded-full bg-green-500 border-4 border-white dark:border-gray-950 shadow-md z-10 flex items-center justify-center text-white">
                                <Star className="w-4 h-4" />
                              </div>
                              <div className="pl-10 text-green-600 dark:text-green-500 font-bold text-2xl uppercase tracking-tighter">Goal Achieved!</div>
                          </div>
                        </div>
                      )}
                  </div>
              )}
            </div>
        ) : (
            <div className="animate-slide-right duration-300 no-print">
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
