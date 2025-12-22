import React, { useEffect, useState } from 'react';
import { UserState } from '../types';
import { Sparkles, Target, Compass } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  userState: UserState;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, userState }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 800);
    }, 3200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Determine dynamic theme and content based on progress
  const targetCareer = userState.targetCareer;
  const traits = userState.personalityResult?.traits || [];
  const dominantTrait = traits.length > 0 
    ? traits.reduce((prev, current) => (prev.score > current.score) ? prev : current)
    : null;

  const getThemeGradient = () => {
    if (!dominantTrait) return "from-indigo-600 via-purple-600 to-indigo-900";
    const t = dominantTrait.trait.toLowerCase();
    if (t.includes('openness')) return "from-blue-600 via-teal-500 to-emerald-600";
    if (t.includes('conscientiousness')) return "from-emerald-600 via-teal-600 to-cyan-700";
    if (t.includes('extraversion')) return "from-orange-500 via-red-500 to-rose-600";
    if (t.includes('agreeableness')) return "from-pink-500 via-rose-400 to-purple-600";
    if (t.includes('neuroticism')) return "from-violet-600 via-purple-600 to-indigo-900";
    return "from-indigo-600 via-purple-600 to-indigo-900";
  };

  const themeGradient = getThemeGradient();

  const getStatusMessage = () => {
    if (targetCareer) return `Refining your path to ${targetCareer}`;
    if (userState.personalityResult) return "Synthesizing your personality profile";
    return "Charting your career future";
  };

  return (
    <div 
      className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-gray-950 transition-all duration-1000 ease-in-out ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Dynamic Immersive Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${themeGradient} opacity-20 blur-[120px] animate-pulse`}></div>
      
      <div className="relative flex flex-col items-center">
        {/* Modern Hexagon Logo */}
        <div className="relative w-32 h-32 mb-12 group">
          <svg viewBox="0 0 24 24" className="w-full h-full text-white/90 drop-shadow-2xl" fill="none" stroke="currentColor" strokeWidth="0.5">
            <path 
              d="M12 2L2 7V17L12 22L22 17V7L12 2Z" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="path-draw-modern"
            />
            {/* Minimal Static P */}
            <text 
              x="12" 
              y="15.2" 
              textAnchor="middle" 
              className="fill-white font-brand font-light text-[7px] tracking-tighter opacity-0 animate-fade-in-p"
            >
              P
            </text>
          </svg>
          
          {/* Subtle Scanning Line */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent h-full w-full animate-scan pointer-events-none"></div>
        </div>

        {/* Minimal Typography */}
        <div className="text-center">
          <div className="overflow-hidden mb-2">
            <h1 className="text-5xl font-extralight text-white font-brand tracking-[0.3em] uppercase opacity-0 animate-modern-reveal">
              Pathfinder <span className="font-bold text-white/40">AI</span>
            </h1>
          </div>
          
          <div className="flex items-center justify-center gap-3 mt-4 opacity-0 animate-fade-in-delayed">
             {targetCareer ? <Target className="w-4 h-4 text-white/60" /> : <Compass className="w-4 h-4 text-white/60" />}
             <p className="text-gray-400 text-xs font-medium tracking-[0.2em] uppercase">
                {getStatusMessage()}
             </p>
          </div>
        </div>
        
        {/* Modern Progress Indicator */}
        <div className="mt-12 w-64 h-[1px] bg-white/10 relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent w-1/2 animate-progress-flow`}></div>
        </div>

        {/* Contextual Progress Icons */}
        {userState.personalityResult && (
          <div className="mt-8 flex gap-6 opacity-0 animate-fade-in-extra">
            <div className="flex flex-col items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></div>
                <span className="text-[10px] text-white/30 font-bold tracking-widest uppercase">Verified</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .path-draw-modern {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: draw-modern 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes draw-modern {
          to {
            stroke-dashoffset: 0;
            stroke-width: 0.8;
          }
        }

        @keyframes modern-reveal {
          from {
            transform: translateY(40px);
            letter-spacing: 0.5em;
            opacity: 0;
          }
          to {
            transform: translateY(0);
            letter-spacing: 0.3em;
            opacity: 1;
          }
        }

        @keyframes scan {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(100%); opacity: 0; }
        }

        @keyframes progress-flow {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(150%); }
        }

        .animate-modern-reveal {
          animation: modern-reveal 1.8s cubic-bezier(0.19, 1, 0.22, 1) forwards;
          animation-delay: 0.6s;
        }

        .animate-scan {
          animation: scan 3s linear infinite;
        }

        .animate-progress-flow {
          animation: progress-flow 2.5s infinite ease-in-out;
        }

        .animate-fade-in-p {
          animation: fadeIn 1s ease-out forwards;
          animation-delay: 2s;
        }

        .animate-fade-in-delayed {
          animation: fadeIn 1.2s ease-out forwards;
          animation-delay: 1.5s;
        }

        .animate-fade-in-extra {
          animation: fadeIn 1.2s ease-out forwards;
          animation-delay: 2.2s;
        }

        @keyframes fadeIn {
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
