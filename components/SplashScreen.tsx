
import React, { useEffect, useState } from 'react';
import { UserState } from '../types';
import { Sparkles, Target, Compass } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  userState: UserState;
  themeColor?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, userState, themeColor = '#4f46e5' }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Stage 1: Initial background fade
    const readyTimer = setTimeout(() => setIsReady(true), 100);
    
    // Stage 2: Start shining effects after logo drawing is well underway
    const effectsTimer = setTimeout(() => setShowEffects(true), 1200);

    // Stage 3: Exit sequence
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 900);
    }, 4000);

    return () => {
      clearTimeout(readyTimer);
      clearTimeout(effectsTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

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
      className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-gray-950 transition-all duration-[1200ms] cubic-bezier(0.16, 1, 0.3, 1) px-6 ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Dynamic Immersive Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${themeGradient} blur-[80px] sm:blur-[140px] animate-soft-pulse transition-opacity duration-[2500ms] ${isReady ? 'opacity-25' : 'opacity-0'}`}></div>
      
      <div className="relative flex flex-col items-center w-full max-w-lg">
        {/* Modern Hexagon Logo Container */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-8 sm:mb-12 group perspective-1000">
          <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-[0_0_25px_rgba(255,255,255,0.1)] animate-float" style={{ color: themeColor }} fill="none" stroke="currentColor" strokeWidth="0.5">
            <path 
              d="M12 2L2 7V17L12 22L22 17V7L12 2Z" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="path-draw-smooth"
            />
            <text 
              x="12" 
              y="15.2" 
              textAnchor="middle" 
              className="font-brand font-light text-[7px] tracking-tighter opacity-0 animate-fade-in-p-smooth"
              style={{ fill: themeColor }}
            >
              P
            </text>
          </svg>
          
          {/* Scanning Line - Only visible after logo drawing starts */}
          <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent h-[20%] w-full animate-elegant-scan pointer-events-none transition-opacity duration-1000 ${showEffects ? 'opacity-100' : 'opacity-0'}`}></div>
        </div>

        {/* Typography Reveal */}
        <div className="text-center w-full relative">
          <div className="mb-2 py-1 px-2 sm:px-4 flex justify-center">
            <h1 className="text-3xl sm:text-5xl font-extralight text-white font-brand tracking-[0.2em] sm:tracking-[0.3em] uppercase opacity-0 animate-modern-reveal-smooth whitespace-nowrap">
              Pathfinder <span className="font-bold text-white/30" style={{ color: `${themeColor}50` }}>AI</span>
            </h1>
          </div>
          
          <div className={`flex items-center justify-center gap-2 sm:gap-3 mt-4 transition-all duration-1000 ${showEffects ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
             {targetCareer ? <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/40" /> : <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/40" />}
             <p className="text-gray-400 text-[10px] sm:text-xs font-medium tracking-[0.15em] sm:tracking-[0.25em] uppercase px-4 max-w-xs sm:max-w-md">
                {getStatusMessage()}
             </p>
          </div>
        </div>
        
        {/* Progress Bar - Synchronized with effects */}
        <div className={`mt-10 sm:mt-14 w-full max-w-[200px] sm:max-w-[288px] h-[1px] bg-white/5 relative overflow-hidden rounded-full transition-opacity duration-1000 ${showEffects ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`absolute inset-0 w-full animate-progress-flow-smooth`} style={{ background: `linear-gradient(to right, transparent, ${themeColor}, transparent)` }}></div>
        </div>

        {/* Profiles Loaded Status */}
        {userState.personalityResult && (
          <div className={`mt-8 sm:mt-10 flex gap-6 transition-all duration-1000 delay-500 ${showEffects ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex flex-col items-center gap-2">
                <div className="w-1 h-1 rounded-full animate-ping" style={{ backgroundColor: themeColor }}></div>
                <span className="text-[8px] sm:text-[9px] text-white/20 font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase">Neural Profiles Synced</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .path-draw-smooth {
          stroke-dasharray: 80;
          stroke-dashoffset: 80;
          animation: draw-smooth 3.5s cubic-bezier(0.65, 0, 0.35, 1) forwards;
          opacity: 0;
        }

        @keyframes draw-smooth {
          0% { opacity: 0; stroke-dashoffset: 80; stroke-width: 0.1; }
          15% { opacity: 1; }
          100% { stroke-dashoffset: 0; stroke-width: 0.7; opacity: 1; }
        }

        @keyframes modern-reveal-smooth {
          from {
            transform: translateY(20px);
            opacity: 0;
            filter: blur(8px);
          }
          to {
            transform: translateY(0);
            opacity: 1;
            filter: blur(0);
          }
        }

        @keyframes elegant-scan {
          0% { transform: translateY(-150%); opacity: 0; }
          40%, 60% { opacity: 0.4; }
          100% { transform: translateY(400%); opacity: 0; }
        }

        @keyframes progress-flow-smooth {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes soft-pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.08); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .animate-soft-pulse {
          animation: soft-pulse 10s ease-in-out infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-modern-reveal-smooth {
          animation: modern-reveal-smooth 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 1s;
        }

        .animate-elegant-scan {
          animation: elegant-scan 5s cubic-bezier(0.445, 0.05, 0.55, 0.95) infinite;
        }

        .animate-progress-flow-smooth {
          animation: progress-flow-smooth 4s ease-in-out infinite;
        }

        .animate-fade-in-p-smooth {
          animation: fadeInText 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          animation-delay: 2.5s;
        }

        @keyframes fadeInText {
          from { opacity: 0; filter: blur(4px); transform: translateY(2px); }
          to { opacity: 1; filter: blur(0); transform: translateY(0); }
        }

        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};
