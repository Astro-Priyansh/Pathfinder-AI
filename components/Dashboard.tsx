
import React from 'react';
import { UserState, AppView } from '../types';
import { ArrowRight, CheckCircle, Brain, Target, AlertCircle, User, Compass, FileText, Star, Briefcase, Zap, Activity, Clock, Coffee, Map, TrendingUp, GraduationCap, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface StatusCardProps {
  title: string;
  completed: boolean;
  icon: React.ElementType;
  description: string;
  actionLabel: string;
  onClick: () => void;
  colorClass: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, completed, icon: Icon, description, actionLabel, onClick, colorClass }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      {completed && (
        <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-1 rounded-full">
            <CheckCircle className="w-4 h-4" />
        </div>
      )}
    </div>
    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{title}</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 h-10 line-clamp-2" title={description}>{description}</p>
    <button 
      onClick={onClick}
      className="w-full py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-center group"
    >
      {actionLabel} <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  </div>
);

interface DashboardProps {
  userState: UserState;
  onChangeView: (view: AppView) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ userState, onChangeView }) => {
  const hasPersonality = !!userState.personalityResult;
  const hasRoadmap = !!userState.roadmap;
  const hasSkills = !!userState.skillGap;
  const hasResume = !!userState.resume;
  const hasRecommendations = !!userState.recommendations;
  const hasRecommendationsSet = !!userState.recommendations;
  const hasHabits = !!userState.habitRoutine;
  const targetCareer = userState.targetCareer;

  // Personalization logic
  const traits = userState.personalityResult?.traits || [];
  const dominantTrait = traits.length > 0 
    ? traits.reduce((prev, current) => (prev.score > current.score) ? prev : current)
    : null;
  
  const getGreeting = () => {
      const displayName = userState.name || 'Explorer';
      if (!dominantTrait) return `Welcome back, ${displayName}!`;
      const traitName = dominantTrait.trait.toLowerCase();
      if (traitName.includes('openness')) return `Hello ${displayName}, Creative Visionary!`;
      if (traitName.includes('conscientiousness')) return `Welcome ${displayName}, Master Planner!`;
      if (traitName.includes('extraversion')) return `Hi ${displayName}, People Person!`;
      if (traitName.includes('agreeableness')) return `Welcome ${displayName}, Team Player!`;
      if (traitName.includes('neuroticism')) return `Hello ${displayName}, Deep Thinker!`;
      return `Welcome back, ${displayName}!`;
  };

  // Dynamic Theme based on Personality
  const getThemeGradient = () => {
    if (!dominantTrait) return "from-indigo-600 to-purple-600";
    const t = dominantTrait.trait.toLowerCase();
    if (t.includes('openness')) return "from-blue-500 to-teal-400"; // Creative
    if (t.includes('conscientiousness')) return "from-emerald-600 to-teal-600"; // Organized
    if (t.includes('extraversion')) return "from-orange-500 to-red-500"; // Energetic
    if (t.includes('agreeableness')) return "from-pink-500 to-rose-400"; // Friendly
    if (t.includes('neuroticism')) return "from-violet-600 to-purple-600"; // Deep/Sensitive
    return "from-indigo-600 to-purple-600";
  };

  const themeGradient = getThemeGradient();

  // Journey Tracking - Enhanced with Roadmap completion
  const roadmapSteps = userState.roadmap?.steps || [];
  const roadmapCompletedCount = roadmapSteps.filter(s => s.completed).length;
  const roadmapTotal = roadmapSteps.length || 1;
  const roadmapProgressFactor = roadmapSteps.length > 0 ? (roadmapCompletedCount / roadmapTotal) : 0;

  // Fix: Added missing icon properties to journeySteps
  const journeySteps = [
    { label: 'Discovery', completed: hasPersonality && !!userState.interestAnalysis, weight: 1, icon: Brain },
    { label: 'Target Set', completed: !!targetCareer, weight: 1, icon: Target },
    { label: 'Skills Gap', completed: !!userState.skillGap, weight: 1, icon: Zap },
    { label: 'Routine', completed: !!userState.habitRoutine, weight: 1, icon: Activity },
    { label: 'Roadmap', completed: !!userState.roadmap, progress: roadmapProgressFactor, weight: 1, icon: Map },
  ];
  
  const totalWeight = journeySteps.reduce((acc, s) => acc + s.weight, 0);
  const earnedWeight = journeySteps.reduce((acc, s) => {
    if (s.progress !== undefined) return acc + (s.progress * s.weight);
    return acc + (s.completed ? s.weight : 0);
  }, 0);

  const journeyProgress = Math.round((earnedWeight / totalWeight) * 100);

  // If no target career, calculate general profile completion
  const profileSteps = [
      { label: 'Personality', completed: hasPersonality },
      { label: 'Interests', completed: !!userState.interestAnalysis },
      { label: 'Skills', completed: hasSkills },
      { label: 'Resume', completed: hasResume },
  ];
  const profileProgress = Math.round((profileSteps.filter(s => s.completed).length / profileSteps.length) * 100);

  const pieData = [
    { name: 'Completed', value: profileProgress },
    { name: 'Remaining', value: 100 - profileProgress },
  ];

  const firstUncompletedStep = roadmapSteps.find(s => !s.completed);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 md:pb-8">
      
      {/* Dynamic Header */}
      <div className={`relative rounded-3xl bg-gradient-to-r ${themeGradient} p-8 text-white shadow-xl overflow-hidden`}>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold font-brand flex items-center gap-3">
                    {getGreeting()}
                    {dominantTrait && <Sparkles className="text-white/80" />}
                </h1>
                <p className="text-white/90 mt-2 text-lg max-w-xl">
                    {targetCareer 
                    ? `We are tracking your progress to becoming a ${targetCareer}.`
                    : "Let's discover your perfect career path today."}
                </p>
                {dominantTrait && (
                    <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-sm font-medium">
                        <Star className="w-4 h-4 mr-2" />
                        Dominant Trait: {dominantTrait.trait}
                    </div>
                )}
            </div>
            
            {!targetCareer && (
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl flex items-center space-x-4 border border-white/20">
                    <div className="h-16 w-16 relative">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                            <Pie
                                data={pieData}
                                innerRadius={18}
                                outerRadius={28}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell key="completed" fill="#ffffff" />
                                <Cell key="remaining" fill="#ffffff" fillOpacity={0.2} />
                            </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                            {profileProgress}%
                        </div>
                    </div>
                    <div>
                        <div className="font-bold text-lg">Profile Strength</div>
                        <div className="text-xs text-white/70">Complete steps to unlock insights</div>
                    </div>
                </div>
            )}
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
      </div>

      {/* Target Career Progress Bar */}
      {targetCareer && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center font-brand">
                        <Compass className="w-6 h-6 mr-2 text-indigo-500"/>
                        Counselling Journey: {targetCareer}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Complete these milestones to fully prepare for your career.</p>
                </div>
                <div className="flex items-center bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl">
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mr-2">{journeyProgress}%</span>
                    <span className="text-xs text-indigo-800 dark:text-indigo-300 font-medium uppercase tracking-wide">Overall Ready</span>
                </div>
            </div>
            
            {/* The Main Progress Bar */}
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 mb-8 overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${themeGradient}`} 
                    style={{ width: `${journeyProgress}%` }}
                ></div>
            </div>
            
            {/* Steps Visualizer */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {journeySteps.map((step, idx) => {
                   const isPartiallyDone = step.progress !== undefined && step.progress > 0 && step.progress < 1;
                   const isFullyDone = step.progress === 1 || step.completed;
                   return (
                    <div key={idx} className={`relative flex flex-col items-center p-4 rounded-xl border transition-all duration-300 ${isFullyDone ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30' : isPartiallyDone ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700/50 grayscale opacity-70'}`}>
                        {isFullyDone && (
                            <div className="absolute top-2 right-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                            </div>
                        )}
                        <div className={`p-3 rounded-full mb-3 ${isFullyDone ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-sm' : isPartiallyDone ? 'bg-white text-indigo-600 shadow-sm' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                            <step.icon className="w-5 h-5" />
                        </div>
                        <span className={`text-sm font-semibold text-center ${isFullyDone ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{step.label}</span>
                        {isPartiallyDone && <span className="text-[10px] font-bold text-indigo-500 uppercase mt-1">{Math.round(step.progress! * 100)}%</span>}
                    </div>
                )})}
            </div>
        </div>
      )}

      {/* Insights & Habits Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personality Insights Card */}
          {hasPersonality && dominantTrait ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between min-h-[220px]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${themeGradient} text-white mr-3`}>
                            <Brain className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold font-brand text-gray-900 dark:text-white">Personality Insights</h2>
                    </div>
                    <button onClick={() => onChangeView(AppView.PERSONALITY)} className="text-xs text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">View Full</button>
                </div>
                
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">{dominantTrait.trait} Personality</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed" title={dominantTrait.description}>
                        {dominantTrait.description}
                    </p>
                </div>

                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recommended Career Paths</p>
                    <div className="flex flex-wrap gap-2">
                        {userState.personalityResult?.suggestedCareers.slice(0, 3).map((career, i) => (
                            <span key={i} className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-700 dark:text-gray-200 font-medium">
                                {career}
                            </span>
                        ))}
                    </div>
                </div>
              </div>
          ) : (
             <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 flex flex-col justify-center items-center text-center shadow-sm min-h-[220px]">
                <Brain className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Who are you?</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 max-w-sm">Take the personality test to unlock tailored career suggestions and a personalized dashboard theme.</p>
                <button onClick={() => onChangeView(AppView.PERSONALITY)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-none">
                    Start Assessment
                </button>
            </div>
          )}

          {/* Habit Enhancer Widget */}
          {hasHabits ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col min-h-[220px]">
                  <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-3">
                              <Activity className="w-5 h-5" />
                          </div>
                          <div>
                              <h2 className="text-lg font-bold text-gray-900 dark:text-white font-brand">Daily Routine</h2>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Target: {userState.habitRoutine?.targetCareer}</p>
                          </div>
                      </div>
                      <button onClick={() => onChangeView(AppView.HABIT_ENHANCER)} className="text-xs text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400">
                          Edit
                      </button>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-4">
                        <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-800/30">
                            <p className="text-xs font-bold text-green-800 dark:text-green-300 uppercase mb-3 flex items-center">
                                <Zap className="w-3 h-3 mr-1" /> Key Habits
                            </p>
                            <div className="flex flex-col gap-2">
                            {userState.habitRoutine?.habits.slice(0, 3).map((h, i) => (
                                <div key={i} className="flex items-center text-xs text-gray-700 dark:text-gray-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2"></div>
                                    <span className="truncate" title={h.name}>{h.name}</span>
                                </div>
                            ))}
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center">
                                <Clock className="w-3 h-3 mr-1" /> Schedule
                            </p>
                            <div className="space-y-2">
                                {userState.habitRoutine?.schedule.slice(0, 3).map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-xs">
                                        <span className="font-mono text-gray-500 dark:text-gray-500">{item.time}</span>
                                        <span className="text-gray-700 dark:text-gray-300 font-medium truncate ml-2" title={item.activity}>{item.activity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                  </div>
              </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 flex flex-col justify-center items-center text-center shadow-sm min-h-[220px]">
                <Coffee className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Optimize Your Day</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 max-w-sm">Generate a personalized daily routine and habit plan for your target career to boost productivity.</p>
                <button onClick={() => onChangeView(AppView.HABIT_ENHANCER)} className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-700 transition shadow-lg shadow-green-200 dark:shadow-none">
                    Create Routine
                </button>
            </div>
          )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Status Cards */}
        <StatusCard 
          title="Personality Profile"
          completed={hasPersonality}
          icon={Brain}
          description={hasPersonality ? `Type: ${userState.personalityResult?.summary.slice(0, 30)}...` : "Discover your strengths."}
          actionLabel={hasPersonality ? "View Analysis" : "Start Assessment"}
          onClick={() => onChangeView(AppView.PERSONALITY)}
          colorClass="text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400"
        />

        <StatusCard 
          title="Skill Analysis"
          completed={hasSkills}
          icon={Target}
          description={hasSkills ? `Match Score: ${userState.skillGap?.matchScore}%` : "Compare skills with market."}
          actionLabel={hasSkills ? "View Gaps" : "Analyze Skills"}
          onClick={() => onChangeView(AppView.SKILL_GAP)}
          colorClass="text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
        />

        <StatusCard 
          title="Career Engine"
          completed={hasRecommendationsSet}
          icon={Compass}
          description={hasRecommendationsSet ? `${userState.recommendations?.length} paths found.` : "Get AI career suggestions."}
          actionLabel={hasRecommendationsSet ? "View Paths" : "Get Recommendations"}
          onClick={() => onChangeView(AppView.CAREER_RECOMMENDER)}
          colorClass="text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400"
        />

        <StatusCard 
          title="Career Roadmap"
          completed={hasRoadmap}
          icon={User}
          // Fix: replaced completedCount with roadmapCompletedCount
          description={hasRoadmap ? `Progress: ${roadmapCompletedCount}/${roadmapTotal} steps` : "Plan your journey."}
          actionLabel={hasRoadmap ? "View Roadmap" : "Create Plan"}
          onClick={() => onChangeView(AppView.ROADMAP)}
          colorClass="text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400"
        />

        <StatusCard 
          title="Resume Builder"
          completed={hasResume}
          icon={FileText}
          description={hasResume ? "Resume draft saved." : "Build a professional resume."}
          actionLabel={hasResume ? "Edit Resume" : "Create Resume"}
          onClick={() => onChangeView(AppView.RESUME_BUILDER)}
          colorClass="text-pink-600 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400"
        />

        <StatusCard 
          title="College Finder"
          completed={!!userState.collegeResults}
          icon={GraduationCap}
          description="Find top colleges."
          actionLabel="Find Colleges"
          onClick={() => onChangeView(AppView.COLLEGE_FINDER)}
          colorClass="text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400"
        />
      </div>

      
      {targetCareer && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 font-brand">Recommended Next Steps for {targetCareer}</h2>
              <div className="space-y-3">
                  {!hasSkills && (
                      <button onClick={() => onChangeView(AppView.SKILL_GAP)} className="w-full text-left p-4 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/20 transition flex items-center group border border-red-100 dark:border-red-900/30">
                          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                              <AlertCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold block">Check Skill Gaps</span>
                            <span className="text-sm opacity-80">Analyze what you're missing for {targetCareer}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                  )}
                   {!userState.roadmap && (
                      <button onClick={() => onChangeView(AppView.ROADMAP)} className="w-full text-left p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition flex items-center group border border-orange-100 dark:border-orange-900/30">
                          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                             <Compass className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold block">Create Roadmap</span>
                            <span className="text-sm opacity-80">Generate a step-by-step plan for {targetCareer}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                  )}
                  {userState.roadmap && firstUncompletedStep ? (
                      <div className="p-5 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30 text-green-900 dark:text-green-200">
                          <div className="flex items-center mb-2">
                             <CheckCircle className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                             <span className="font-bold">Current Focus: {firstUncompletedStep.title}</span>
                          </div>
                          <p className="text-sm opacity-90 mb-3">{firstUncompletedStep.description}</p>
                          <button 
                            onClick={() => onChangeView(AppView.ROADMAP)}
                            className="text-xs font-bold uppercase tracking-wider underline hover:text-green-700 dark:hover:text-green-300"
                          >
                              Open Roadmap
                          </button>
                      </div>
                  ) : userState.roadmap && !firstUncompletedStep ? (
                    <div className="p-5 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-indigo-900 dark:text-indigo-200">
                        <div className="flex items-center mb-2">
                           <Star className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                           <span className="font-bold">Congratulations!</span>
                        </div>
                        <p className="text-sm opacity-90">You have completed all steps in your roadmap to becoming a {targetCareer}. You are career-ready!</p>
                    </div>
                  ) : null}
              </div>
          </div>
      )}
    </div>
  );
};
