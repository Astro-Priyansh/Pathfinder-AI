import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { UserState } from '../types';
import { Sparkles, Target, Compass, Cog, Sprout, Cpu, Clock, Sun, Flame, Wind } from 'lucide-react';
import { steampunkAudio } from '../services/steampunkAudio';
import { solarpunkAudio } from '../services/solarpunkAudio';

interface SplashScreenProps {
  onComplete: () => void;
  userState: UserState;
  themeColor?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, userState, themeColor = '#4f46e5' }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const uiStyle = userState.settings?.uiStyle || 'modern';

  // State calculations
  const targetCareer = userState.targetCareer;
  const traits = userState.personalityResult?.traits || [];
  const dominantTrait = traits.length > 0 
    ? traits.reduce((prev, current) => (prev.score > current.score) ? prev : current)
    : null;

  useEffect(() => {
    // Stage 1: Initial load transition
    const readyTimer = setTimeout(() => setIsReady(true), 100);
    
    // Stage 2: Start visual scanning & details reveal after logo elements assemble
    const effectsTimer = setTimeout(() => setShowEffects(true), 1200);

    // Stage 3: Smooth exit sequence
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 900);
    }, 4500);

    return () => {
      clearTimeout(readyTimer);
      clearTimeout(effectsTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  // Immersive programmatic audio initialization based on the user's selected style
  useEffect(() => {
    try {
      if (uiStyle === 'steampunk') {
        // Comforting boiler steam hiss greeting
        steampunkAudio.playSteamHiss(0.35);
        
        // Staggered clockwork escapement clicks during loading sequence
        const p1 = setTimeout(() => steampunkAudio.playTick(0.18), 600);
        const p2 = setTimeout(() => steampunkAudio.playTick(0.18), 1200);
        const p3 = setTimeout(() => steampunkAudio.playTick(0.18), 1800);
        const p4 = setTimeout(() => steampunkAudio.playTick(0.18), 2400);
        const p5 = setTimeout(() => steampunkAudio.playSteamHiss(0.15), 3200);
        
        return () => {
          clearTimeout(p1);
          clearTimeout(p2);
          clearTimeout(p3);
          clearTimeout(p4);
          clearTimeout(p5);
        };
      } else if (uiStyle === 'solarpunk') {
        // High-Q glass bar sun chime greeting
        solarpunkAudio.playSolarChime(0.4);
        
        // Warm organic water droplet trickles falling relative to progress
        const d1 = setTimeout(() => solarpunkAudio.playWaterDewdrop(0.2), 700);
        const d2 = setTimeout(() => solarpunkAudio.playWaterDewdrop(0.23), 1400);
        const d3 = setTimeout(() => solarpunkAudio.playSolarChime(0.25), 2100);
        const d4 = setTimeout(() => solarpunkAudio.playWaterDewdrop(0.18), 2900);
        
        return () => {
          clearTimeout(d1);
          clearTimeout(d2);
          clearTimeout(d3);
          clearTimeout(d4);
        };
      }
    } catch (err) {
      console.warn("Splash soundscape initialization skipped", err);
    }
  }, [uiStyle]);

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

  // -------------------------------------------------------------
  // THEME-SPECIFIC RENDERS
  // -------------------------------------------------------------

  // 1. DEFAULT MODERN CLASSIC RENDERING
  const renderModernSplash = () => {
    return (
      <div className="relative flex flex-col items-center w-full max-w-lg">
        {/* Dynamic Immersive Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${themeGradient} blur-[80px] sm:blur-[140px] animate-soft-pulse transition-opacity duration-[2500ms] ${isReady ? 'opacity-25' : 'opacity-0'}`}></div>

        {/* Modern Hexagon Logo Container with Glassmorphic Plate */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-8 sm:mb-12 group flex items-center justify-center rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.12] shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),_0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Subtle specularity sheen boundary highlighting */}
          <div className="absolute inset-0 border border-white/[0.08] rounded-3xl pointer-events-none" />

          {/* Core dynamic ambient colored light reflecting within the glass */}
          <div className="absolute w-16 h-16 rounded-full blur-2xl opacity-40 animate-pulse pointer-events-none" style={{ backgroundColor: themeColor }} />

          {/* Sweeping diagonal glass glare/shine effect */}
          <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.16] to-transparent w-[35%] h-[150%] skew-x-[30deg] -top-[25%] pointer-events-none transition-opacity duration-1000 ${showEffects ? 'opacity-100 animate-elegant-scan-diagonal' : 'opacity-0'}`} />

          <svg viewBox="0 0 24 24" className="w-[60%] h-[60%] drop-shadow-[0_0_25px_rgba(255,255,255,0.15)] animate-float z-10" style={{ color: themeColor }} fill="none" stroke="currentColor" strokeWidth="0.5">
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
              className="font-brand font-light text-[7px] tracking-tighter opacity-0 animate-fade-in-p-smooth animate-delay-200"
              style={{ fill: themeColor }}
            >
              P
            </text>
          </svg>
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
        
        {/* Progress Bar */}
        <div className={`mt-10 sm:mt-14 w-full max-w-[200px] sm:max-w-[288px] h-[1px] bg-white/5 relative overflow-hidden rounded-full transition-opacity duration-1000 ${showEffects ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 w-full animate-progress-flow-smooth" style={{ background: `linear-gradient(to right, transparent, ${themeColor}, transparent)` }}></div>
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
    );
  };

  // 2. STEAM ERA SPLASH RENDERING ("Chronograph")
  const renderSteampunkSplash = () => {
    return (
      <div className="relative flex flex-col items-center w-full max-w-lg p-8 rounded-[2.5rem] border-2 border-amber-800/40 bg-gradient-to-b from-[#1c1106] via-[#100904] to-black shadow-[0_24px_50px_rgba(0,0,0,0.85)] overflow-hidden">
        {/* Gold brass corner details */}
        <div className="absolute top-4 left-4 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-amber-500 to-amber-900 border border-amber-600/55 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-[#050301]"></div>
        </div>
        <div className="absolute top-4 right-4 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-amber-500 to-amber-900 border border-amber-600/55 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-[#050301]"></div>
        </div>
        <div className="absolute bottom-4 left-4 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-amber-500 to-amber-900 border border-amber-600/55 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-[#050301]"></div>
        </div>
        <div className="absolute bottom-4 right-4 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-amber-500 to-amber-900 border border-amber-600/55 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-[#050301]"></div>
        </div>

        {/* Dynamic boiler heat particle steam veil */}
        <div className={`absolute top-0 w-full h-[40%] bg-gradient-to-b from-amber-700/5 to-transparent blur-2xl transition-opacity duration-[2000ms] ${isReady ? 'opacity-100' : 'opacity-0'}`} />

        {/* Centerpiece Interlocking Gears mechanism */}
        <div className="relative w-32 h-32 mb-10 flex items-center justify-center select-none scale-110">
          {/* Main big driving gear */}
          <div className="absolute w-24 h-24 text-amber-700/30 animate-spin-slow">
            <Cog className="w-full h-full stroke-[0.8]" />
          </div>
          {/* Linked brass gear counter-rotating */}
          <div className="absolute -top-3 -right-3 w-14 h-14 text-amber-600/40 animate-spin-reverse-medium">
            <Cog className="w-full h-full stroke-[1.1]" />
          </div>
          {/* Delicate fast spinning escape star */}
          <div className="absolute -bottom-1 -left-2 w-12 h-12 text-amber-900/50 animate-spin-fast">
            <Cog className="w-full h-full stroke-[1.3]" />
          </div>
          
          {/* Dial and sweeping gauge indicator */}
          <div className="absolute w-16 h-16 border-2 border-dashed border-amber-600/30 rounded-full flex items-center justify-center bg-black/40">
            <motion.div 
              animate={{ rotate: [0, 45, 30, 95, 80, 160, 140, 245, 360] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-8 h-1 bg-yellow-600 origin-left -mr-4 rounded-full shadow-[0_0_8px_#d97706]"
            />
            <div className="w-4 h-4 rounded-full bg-amber-800 border-2 border-yellow-500 z-10 shadow-md"></div>
          </div>
        </div>

        {/* Industrial Victorian Era Typography */}
        <div className="text-center w-full z-10 font-serif">
          <h1 className="text-2xl sm:text-3xl font-black text-amber-500 tracking-[0.15em] uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)]">
            THE PATHFINDER
          </h1>
          <div className="text-amber-600/60 text-[9px] tracking-[0.44em] font-mono uppercase mt-1">
            CHRONOGRAPH ENGINE v2.0
          </div>

          {/* Calibrated Steam Engine Readouts */}
          <div className={`mt-8 space-y-2.5 bg-black/60 p-4 rounded-2xl border border-amber-900/25 font-mono text-[9px] text-amber-500/75 text-left transition-all duration-1000 ${showEffects ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex justify-between">
              <span>OPERATOR ID:</span>
              <span className="text-amber-300 font-bold uppercase">{userState.name || 'GUEST'}</span>
            </div>
            <div className="flex justify-between">
              <span>CRITICAL PRESSURE:</span>
              <span className="text-amber-400 font-bold">14.7 PSI // NOMINAL</span>
            </div>
            <div className="flex justify-between">
              <span>GOVERNOR COGNITY:</span>
              <span className="text-amber-300 font-bold max-w-[190px] truncate uppercase">
                {dominantTrait ? dominantTrait.trait : 'SPINDLE SYNCING'}
              </span>
            </div>
            <div className="flex justify-between border-t border-amber-900/30 pt-2 mt-2">
              <span>DESTINATION ROTOR:</span>
              <span className="text-yellow-500 font-bold max-w-[180px] truncate uppercase">
                {targetCareer ? targetCareer : 'CHARTED AT RANDOM'}
              </span>
            </div>
          </div>
        </div>

        {/* Solid Riveted loading bar */}
        <div className={`mt-8 w-full max-w-[260px] h-3 bg-black border border-amber-900/40 rounded-full relative overflow-hidden transition-opacity duration-1000 ${showEffects ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute top-px left-px bottom-px bg-gradient-to-r from-amber-900 to-amber-500 animate-[progress-flow-smooth_4s_infinite] rounded-full" style={{ width: '80%' }}></div>
          {/* Engraved ticks */}
          <div className="absolute inset-0 flex justify-between px-3 text-[5px] text-amber-900/60 font-sans pointer-events-none select-none">
            <span>|</span><span>|</span><span>|</span><span>|</span><span>|</span>
          </div>
        </div>
      </div>
    );
  };

  // 3. SOLARPUNK BOTANICAL RETREAT RENDERING
  const renderSolarpunkSplash = () => {
    return (
      <div className="relative flex flex-col items-center w-full max-w-lg p-10 rounded-[3rem] border border-teal-500/25 bg-gradient-to-b from-[#0a201c] via-[#040e0c] to-black shadow-[0_24px_50px_rgba(4,14,12,0.65)] overflow-hidden">
        {/* Soft sun-ray backdrops */}
        <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-amber-500/5 blur-3xl animate-soft-pulse"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-teal-500/5 blur-3xl animate-soft-pulse"></div>

        {/* Translucent botanical leaf vein background */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 20 Q 50 35 100 20 M0 50 Q 50 65 100 50 M0 80 Q 50 85 100 80 M50 0 Q 60 50 50 100" stroke="#14b8a6" strokeWidth="0.4" fill="none" />
        </svg>

        {/* Central Solar Dome Core */}
        <div className="relative w-32 h-32 mb-10 flex items-center justify-center scale-110">
          {/* Ring representing photovoltaic glass cells */}
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: 360 }}
            transition={{ rotate: { duration: 16, repeat: Infinity, ease: "linear" }, scale: { duration: 4.5, repeat: Infinity, ease: "easeInOut" } }}
            className="absolute w-24 h-24 border border-dashed border-teal-500/25 rounded-full flex items-center justify-center"
          >
            {/* Shimmering solar spikes */}
            <div className="absolute w-28 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent"></div>
            <div className="absolute h-28 w-px bg-gradient-to-b from-transparent via-teal-500/30 to-transparent"></div>
          </motion.div>

          {/* Falling glowing mist dewdrops */}
          <div className="absolute inset-0 flex justify-center items-start">
            <motion.div 
              animate={{ y: [0, -10, 0], opacity: [0.3, 0.75, 0.3] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.6)] mt-[-4px]"
            />
          </div>

          {/* Central organic green shoot pod */}
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#122e28] to-[#040e0c] border border-teal-500/20 flex items-center justify-center shadow-[inset_0_2px_10px_rgba(20,184,166,0.25)]">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: [1, 1.08, 1], opacity: 1 }}
              transition={{ scale: { repeat: Infinity, duration: 4, ease: "easeInOut" }, default: { delay: 0.6, duration: 1.2, type: 'spring' } }}
              className="text-teal-400 flex items-center justify-center"
            >
              <Sprout className="w-8 h-8 filter drop-shadow-[0_0_5px_rgba(20,184,166,0.8)]" />
            </motion.div>
          </div>
        </div>

        {/* Elegant Eco-Futurism Typography */}
        <div className="text-center w-full z-10 font-sans">
          <h1 className="text-2xl sm:text-3xl font-black text-teal-300 font-brand tracking-[0.22em] uppercase">
            PATHFINDER <span className="text-amber-400">ECO</span>
          </h1>
          <p className="text-teal-600/65 text-[9px] tracking-[0.3em] font-mono mt-1.5 uppercase">
            Ecosystem Integration Biosphere
          </p>

          {/* Restoratively-themed Diagnostic Card */}
          <div className={`mt-8 space-y-2.5 bg-[#061412]/75 backdrop-blur-md p-5 rounded-[2rem] border border-teal-950/70 font-sans text-xs text-[#d5f6f0] text-left transition-all duration-1000 ${showEffects ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span className="opacity-70 font-medium">GARDENER:</span>
              <span className="text-teal-300 font-black ml-auto uppercase text-[11px] tracking-wider">{userState.name || 'GUEST'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="opacity-70 font-medium">CANOPY RESONANCE:</span>
              <span className="text-emerald-300 font-bold ml-auto text-[11px] truncate max-w-[190px] uppercase">
                {dominantTrait ? dominantTrait.trait : 'CALIBRATING BALANCE'}
              </span>
            </div>

            <div className="flex items-center gap-2 border-t border-teal-950/60 pt-2.5 mt-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
              <span className="opacity-70 font-medium font-sans">NURTURING ROADMAP:</span>
              <span className="text-teal-200 font-bold ml-auto text-[11px] truncate max-w-[180px] uppercase">
                {targetCareer ? targetCareer : 'SEEDING BLANK PAGES'}
              </span>
            </div>
          </div>
        </div>

        {/* Slow organic cellular growth progress line */}
        <div className={`mt-8 w-full max-w-[260px] h-1.5 bg-teal-950/40 rounded-full relative overflow-hidden transition-all duration-1000 ${showEffects ? 'opacity-100' : 'opacity-0'}`}>
          <motion.div 
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 4.2, ease: "easeInOut" }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-500 via-emerald-400 to-amber-300 rounded-full"
          />
        </div>
        <div className={`mt-2 transition-opacity duration-1000 ${showEffects ? 'opacity-40' : 'opacity-0'}`}>
          <span className="text-[7.5px] text-teal-400/80 uppercase tracking-[0.25em] font-mono">SOIL TEMPERATURE OPTIMAL // 24.5°C</span>
        </div>
      </div>
    );
  };

  // 4. FUTURISTIC CYBERNETIC SPLASH RENDERING
  const renderFuturisticSplash = () => {
    return (
      <div className="relative flex flex-col items-center w-full max-w-lg p-8 rounded-3xl border border-cyan-500/35 bg-black shadow-[0_0_50px_rgba(6,182,212,0.18)] overflow-hidden">
        {/* Neon virtual matrix coordinate cells */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0e2030_1px,transparent_1px),linear-gradient(to_bottom,#0e2030_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />

        {/* Continuous neon laser sweeping line */}
        <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent top-0 animate-[elegant-scan_3.8s_infinite] opacity-60" />

        {/* Concentric rings / orbiting tech radar HUD */}
        <div className="relative w-32 h-32 mb-10 flex items-center justify-center scale-110">
          {/* Cyber outer ring layout */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute w-28 h-28 border border-dashed border-cyan-500/40 rounded-full"
          />
          {/* Tech inner counter ring layout */}
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute w-20 h-20 border border-cyan-400/50 border-t-transparent border-b-transparent rounded-full"
          />

          {/* Central flashing processor core */}
          <div className="relative w-14 h-14 rounded-full bg-cyan-950/20 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.25)]">
            <motion.div
              animate={{ scale: [1, 1.15, 1], filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="text-cyan-400 flex items-center justify-center"
            >
              <Cpu className="w-6 h-6" />
            </motion.div>
          </div>
        </div>

        {/* Monospaced Cyberpunk System Text */}
        <div className="text-center w-full z-10 font-mono">
          <h1 className="text-xl sm:text-2xl font-black text-cyan-400 tracking-widest uppercase">
            PATHFINDER.SYS // SECURE_INIT
          </h1>
          <p className="text-blue-500/50 text-[8px] tracking-[0.25em] mt-1 uppercase">
            Neural Diagnostic Network Calibrator
          </p>

          {/* Scrolling diagnostic data lines */}
          <div className={`mt-6 space-y-1.5 bg-[#01040a]/90 p-4 rounded-xl border border-cyan-950/80 font-mono text-[9px] text-cyan-500/80 text-left transition-all duration-1000 ${showEffects ? 'opacity-100' : 'opacity-0'}`}>
            <div>&gt; LINK_ESTABLISHED: TRACE_OK</div>
            <div>&gt; AUTHENTICATING_ID: [AUTH: {userState.name?.toUpperCase() || 'GUEST'}]</div>
            <div>&gt; NEURAL_MAPPING_LOADED: [PROFILE: {dominantTrait ? dominantTrait.trait.toUpperCase() : 'CALIBRATING...'}]</div>
            <div className="text-cyan-300">&gt; COMPILING_ROADMAPS: [CORE: {targetCareer ? targetCareer.toUpperCase() : 'SEARCHING ACTIVE VECTORS...'}]</div>
            <div className="text-[7.5px] text-blue-500/50 mt-1 animate-pulse">&gt; SYS_STATUS_READY_CHECKSUM: VAL_0x7FFA81D // DONE</div>
          </div>
        </div>

        {/* Binary grid dot matrix loader blocks */}
        <div className={`mt-8 w-full max-w-[260px] flex gap-1 justify-between transition-opacity duration-1000 ${showEffects ? 'opacity-100' : 'opacity-0'}`}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <motion.div 
              key={i}
              initial={{ backgroundColor: 'rgba(6, 182, 212, 0.05)' }}
              animate={{ backgroundColor: ['rgba(6,182,212,0.05)', 'rgba(34,211,238,0.8)', 'rgba(6,182,212,0.05)'] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.14 }}
              className="flex-1 h-2 rounded-sm border border-cyan-500/25 shadow-[0_0_3px_rgba(6,182,212,0.15)]"
            />
          ))}
        </div>
      </div>
    );
  };

  const renderThemedSplash = () => {
    switch (uiStyle) {
      case 'steampunk':
        return renderSteampunkSplash();
      case 'solarpunk':
        return renderSolarpunkSplash();
      case 'futuristic':
        return renderFuturisticSplash();
      case 'modern':
      default:
        return renderModernSplash();
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-gray-950 transition-all duration-[1200ms] cubic-bezier(0.16, 1, 0.3, 1) px-6 ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {renderThemedSplash()}

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
          40%, 60% { opacity: 0.45; }
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

        .animate-elegant-scan-diagonal {
          animation: elegant-scan-diagonal 3.5s cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }

        @keyframes elegant-scan-diagonal {
          0% { transform: translateX(-220%) skewX(30deg); }
          30% { opacity: 1; }
          50%, 100% { transform: translateX(250%) skewX(30deg); opacity: 0; }
        }

        .animate-modern-reveal-smooth {
          animation: modern-reveal-smooth 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 1.s; 
          opacity: 1;
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

        .animate-spin-slow {
          animation: spin 18s linear infinite;
        }

        .animate-spin-reverse-medium {
          animation: spin-backward 9s linear infinite;
        }

        .animate-spin-fast {
          animation: spin 4.5s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-backward {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
};
