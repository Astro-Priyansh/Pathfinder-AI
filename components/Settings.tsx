
import React, { useState, useRef, useEffect } from 'react';
import { UserSettings, UserProfile, BotPersonality, ResponseType, AppView, UserState } from '../types';
import { 
  Settings as SettingsIcon, Palette, Bot, ShieldCheck, Download, Trash2, 
  RotateCcw, Sparkles, Check, ChevronLeft, Zap, Cloud, Cpu, Globe, 
  User, Mail, Key, Home, HardDrive, Layout, Server, ArrowRight, Save,
  ChevronRight, X, Circle, Camera, Calendar, ShieldQuestion, HelpCircle,
  ChevronDown, Lock, Eye, EyeOff, Moon, Sun, Link, ExternalLink, CalendarDays,
  ShieldAlert, RefreshCw, Fingerprint, Loader2
} from 'lucide-react';

interface SettingsProps {
  settings: UserSettings;
  user: UserProfile | null;
  userState: UserState;
  onUpdateSettings: (updates: Partial<UserSettings>) => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onExportData: () => void;
  onResetData: () => void;
  onNavigate: (view: AppView) => void;
  previousView: AppView;
  isDark: boolean;
  toggleTheme: () => void;
  themeColor: string;
}

const THEME_COLORS = [
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Violet', value: '#8b5cf6' },
];

const PERSONALITIES: { id: BotPersonality; label: string; desc: string }[] = [
  { id: 'casual', label: 'Casual Buddy', desc: 'Informal & fun.' },
  { id: 'minimalist', label: 'Minimalist', desc: 'Brief & direct.' },
  { id: 'businessman', label: 'Executive', desc: 'ROI & Market driven.' },
  { id: 'professional', label: 'Consultant', desc: 'Structured & polite.' },
  { id: 'friend', label: 'Friend', desc: 'Empathetic & kind.' },
  { id: 'guide', label: 'Mentor', desc: 'Strategic wisdom.' },
];

const RESPONSE_TYPES: { id: ResponseType; label: string; desc: string }[] = [
  { id: 'faster', label: 'Faster', desc: 'Reduced latency, concise.' },
  { id: 'normal', label: 'Normal', desc: 'Balanced reasoning.' },
  { id: 'professional', label: 'Professional', desc: 'Deep detailed insights.' },
];

const COUNTRIES = [
  "India", "USA", "UK", "Canada", "Australia", 
  "Germany", "France", "European Union", "Japan", "China", 
  "Singapore", "UAE", "Brazil", "South Africa", "Global"
];

const SECURITY_QUESTIONS = [
  "What is your favourite colour?",
  "What is your pet's name?",
  "What was the name of your first school?",
  "What is your favourite food?"
];

export const Settings: React.FC<SettingsProps> = ({ 
  settings, 
  user, 
  userState,
  onUpdateSettings, 
  onUpdateProfile, 
  onExportData, 
  onResetData,
  onNavigate,
  previousView,
  isDark,
  toggleTheme,
  themeColor
}) => {
  const [localColor, setLocalColor] = useState(settings.themePrimary);
  const [localAnimations, setLocalAnimations] = useState(settings.animationsEnabled);
  const [localDynamicTheme, setLocalDynamicTheme] = useState(settings.dynamicThemeEnabled);
  const [hasChanges, setHasChanges] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [identityForm, setIdentityForm] = useState<Partial<UserProfile>>(user || {});
  const [identityError, setIdentityError] = useState('');
  
  const [dobDay, setDobDay] = useState(user?.dob ? user.dob.split('-')[2] : '');
  const [dobMonth, setDobMonth] = useState(user?.dob ? user.dob.split('-')[1] : '');
  const [dobYear, setDobYear] = useState(user?.dob ? user.dob.split('-')[0] : '');

  const [calendarState, setCalendarState] = useState(settings.calendarConnections || {
    local: false,
    google: false,
    calendly: false
  });
  const [connectingCal, setConnectingCal] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = (targetView: AppView) => {
    setIsClosing(true);
    setTimeout(() => {
      onNavigate(targetView);
    }, 400); // Match animation duration
  };

  const handleApplyCalibration = () => {
    onUpdateSettings({ 
      themePrimary: localColor, 
      animationsEnabled: localAnimations,
      dynamicThemeEnabled: localDynamicTheme,
      calendarConnections: calendarState
    });
    setHasChanges(false);
  };

  const handleSaveIdentity = () => {
      setIdentityError('');
      if (identityForm.username && /\s/.test(identityForm.username)) {
          setIdentityError('Username cannot contain spaces.');
          return;
      }
      if (identityForm.password && /\s/.test(identityForm.password)) {
          setIdentityError('Password cannot contain spaces.');
          return;
      }

      if (dobDay || dobMonth || dobYear) {
          const d = parseInt(dobDay);
          const m = parseInt(dobMonth);
          const y = parseInt(dobYear);
          if (isNaN(d) || isNaN(m) || isNaN(y) || d < 1 || d > 31 || m < 1 || m > 12 || y < 1850 || y > new Date().getFullYear()) {
              setIdentityError('Invalid Date of Birth.');
              return;
          }
          const assembledDob = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
          identityForm.dob = assembledDob;
      }

      onUpdateProfile(identityForm);
      setIsEditingIdentity(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdentityForm(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCalendarToggle = (type: keyof typeof calendarState) => {
    if (calendarState[type]) {
      const newState = { ...calendarState, [type]: false };
      setCalendarState(newState);
      onUpdateSettings({ calendarConnections: newState });
    } else {
      setConnectingCal(type);
      setTimeout(() => {
        const newState = { ...calendarState, [type]: true };
        setCalendarState(newState);
        onUpdateSettings({ calendarConnections: newState });
        setConnectingCal(null);
      }, 1500);
    }
  };

  // The primary color used for accents, reflecting pending changes or current app theme
  const previewAccentColor = hasChanges ? localColor : themeColor;

  const personalizationSteps = [
    { label: 'Career Objective', status: !!userState.targetCareer, color: '#4f46e5' },
    { label: 'Interest Profile', status: !!userState.interestAnalysis, color: '#0ea5e9' },
    { label: 'Skill Matrix', status: !!userState.skillGap, color: '#2563eb' },
    { label: 'Evolution Plan', status: !!userState.roadmap, color: '#8b5cf6' },
    { label: 'Personality Core', status: !!userState.personalityResult, color: '#7c3aed' },
  ];

  return (
    <div className={`fixed inset-0 z-[100] transition-all duration-500 overflow-y-auto font-sans selection:bg-indigo-500/30 ${
      isClosing ? 'animate-out fade-out zoom-out-95 duration-400 pointer-events-none' : 'animate-in fade-in zoom-in-105 duration-500'
    } ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Immersive Glass Background FX */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div 
            className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[180px] animate-pulse opacity-40 transition-colors duration-1000`}
            style={{ backgroundColor: `${previewAccentColor}` }}
          ></div>
          <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[160px] animate-pulse opacity-20" style={{ animationDelay: '2s' }}></div>
          <div className={`absolute inset-0 opacity-[0.05] dark:opacity-20 mix-blend-overlay ${isDark ? "bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" : "bg-white/40"}`}></div>
      </div>

      <div className="relative max-w-7xl mx-auto min-h-screen flex flex-col p-6 md:p-12">
        
        {/* Navigation Bar */}
        <div className={`flex items-center justify-between mb-12 sticky top-0 z-20 py-4 backdrop-blur-xl transition-all`}>
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleClose(previousView)} 
                  className={`p-3 rounded-2xl border transition-all group ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 shadow-lg shadow-black/20' : 'bg-white/40 border-white/80 hover:bg-white/60 shadow-2xl shadow-gray-200/50'}`}
                >
                    <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => handleClose(AppView.DASHBOARD)} 
                  className={`p-3 rounded-2xl border transition-all ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 shadow-lg shadow-black/20' : 'bg-white/40 border-white/80 hover:bg-white/60 shadow-2xl shadow-gray-200/50'}`}
                >
                    <Home className="w-6 h-6" />
                </button>
            </div>
            <div className="text-right">
                <h1 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-3 justify-end drop-shadow-sm">
                    Settings <SettingsIcon className="w-8 h-8 animate-spin-slow" style={{ color: previewAccentColor }} />
                </h1>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mt-1">Core Architecture Control</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1">
            
            {/* Main Configuration Sections */}
            <div className="lg:col-span-8 space-y-10">
                
                {/* Visual Core Calibration */}
                <section className={`group relative border transition-all duration-500 rounded-[3rem] p-8 md:p-10 ${
                  isDark 
                  ? 'bg-white/5 border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] hover:border-white/20' 
                  : 'bg-white/60 border-white/80 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] hover:border-white hover:bg-white/80 backdrop-blur-3xl'
                }`}>
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-5">
                            <div className={`p-4 rounded-3xl shadow-xl transition-transform group-hover:rotate-6`} style={{ backgroundColor: `${previewAccentColor}22`, color: previewAccentColor }}>
                                <Palette className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-black tracking-tight">System Appearance</h2>
                        </div>
                        {hasChanges && (
                            <button onClick={handleApplyCalibration} className="px-8 py-3 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl animate-bounce hover:scale-105 active:scale-95" style={{ backgroundColor: previewAccentColor }}>
                                <Check className="w-4 h-4 inline mr-2" /> Commit Changes
                            </button>
                        )}
                    </div>

                    <div className="space-y-12">
                        {/* Theme Switcher */}
                        <div className={`p-8 rounded-[2.5rem] border transition-all ${isDark ? 'bg-black/20 border-white/5 hover:border-white/10 shadow-inner' : 'bg-white/30 border-white/50 hover:bg-white/50 shadow-xl shadow-gray-100'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className={`p-4 rounded-3xl shadow-inner ${isDark ? 'bg-white/5 text-amber-400' : 'bg-white text-indigo-600 shadow-gray-200'}`} style={{ color: !isDark ? previewAccentColor : undefined }}>
                                        {isDark ? <Moon className="w-7 h-7" /> : <Sun className="w-7 h-7" />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black">Interface Mode</h3>
                                        <p className="text-sm text-gray-500 font-medium">{isDark ? "Dark theme active for high-focus environments" : "Light theme active for maximum clarity"}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={toggleTheme}
                                    className={`w-20 h-11 rounded-full relative transition-all duration-500 overflow-hidden shadow-lg ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-1 w-9 h-9 rounded-full transition-all duration-500 flex items-center justify-center ${isDark ? 'right-1 text-white shadow-indigo-500/50' : 'left-1 bg-white text-amber-500 shadow-gray-400/50'}`} style={{ backgroundColor: isDark ? previewAccentColor : undefined }}>
                                        {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Color Signature */}
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] mb-8 block ml-2">Neural Visual Core</label>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
                                {THEME_COLORS.map(color => (
                                    <button 
                                      key={color.value} 
                                      onClick={() => { setLocalColor(color.value); setHasChanges(true); }} 
                                      className={`group relative flex flex-col items-center gap-5 p-5 rounded-[2.2rem] border-2 transition-all duration-300 ${localColor === color.value ? (isDark ? 'bg-white/5' : 'bg-white/80 shadow-2xl shadow-gray-200/50') : 'border-transparent hover:scale-105'}`} 
                                      style={{ borderColor: localColor === color.value ? color.value : 'transparent' }}
                                    >
                                        <div className="w-14 h-14 rounded-full shadow-2xl transition-transform group-hover:scale-110" style={{ backgroundColor: color.value, boxShadow: localColor === color.value ? `0 10px 40px ${color.value}88` : '' }}></div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${localColor === color.value ? (isDark ? 'text-white' : 'text-gray-900') : 'text-gray-400'}`}>{color.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Advanced Toggles */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className={`p-8 rounded-[2.5rem] border transition-all shadow-lg ${isDark ? 'bg-black/20 border-white/5' : 'bg-white/40 border-white/60 shadow-gray-100'}`}>
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`p-3 rounded-2xl shadow-inner ${isDark ? 'bg-white/5 text-cyan-400' : 'bg-white text-cyan-600 shadow-gray-200'}`} style={{ color: !isDark ? previewAccentColor : undefined }}>
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <button onClick={() => { setLocalAnimations(!localAnimations); setHasChanges(true); }} className={`w-14 h-8 rounded-full relative transition-all duration-500 shadow-md ${localAnimations ? 'bg-emerald-500' : 'bg-gray-400'}`} style={{ backgroundColor: localAnimations ? previewAccentColor : undefined }}>
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-500 shadow-sm ${localAnimations ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>
                                <h3 className="text-lg font-black">Motion Effects</h3>
                                <p className="text-xs text-gray-500 mt-2 font-medium">Fluid transitions and spatial UI interactions.</p>
                            </div>

                            <div className={`p-8 rounded-[2.5rem] border transition-all shadow-lg ${isDark ? 'bg-black/20 border-white/5' : 'bg-white/40 border-white/60 shadow-gray-100'}`}>
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`p-3 rounded-2xl shadow-inner ${isDark ? 'bg-white/5 text-fuchsia-400' : 'bg-white text-fuchsia-600 shadow-gray-200'}`} style={{ color: !isDark ? previewAccentColor : undefined }}>
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <button onClick={() => { setLocalDynamicTheme(!localDynamicTheme); setHasChanges(true); }} className={`w-14 h-8 rounded-full relative transition-all duration-500 shadow-md ${localDynamicTheme ? 'bg-emerald-500' : 'bg-gray-400'}`} style={{ backgroundColor: localDynamicTheme ? previewAccentColor : undefined }}>
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-500 shadow-sm ${localDynamicTheme ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>
                                <h3 className="text-lg font-black">Adaptive Core</h3>
                                <p className="text-xs text-gray-500 mt-2 font-medium">Automatic theme shifting based on profile evolution.</p>
                            </div>
                        </div>

                        {localDynamicTheme && (
                            <div className={`p-8 rounded-[2.5rem] border animate-in slide-in-from-bottom-4 transition-all duration-700 shadow-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/80 shadow-indigo-100/50'}`}>
                                <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em] mb-8 flex items-center">
                                    <ShieldCheck className="w-4 h-4 mr-2" style={{ color: previewAccentColor }} /> Progression Calibration
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
                                    {personalizationSteps.map((step, idx) => (
                                        <div key={idx} className="flex flex-col items-center gap-4 group">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-700 shadow-lg ${step.status ? '' : 'opacity-20 bg-gray-100/10 dark:bg-gray-900 border-gray-200 dark:border-white/10'}`} style={{ borderColor: step.status ? previewAccentColor : undefined, backgroundColor: step.status ? `${previewAccentColor}22` : undefined, color: step.status ? previewAccentColor : undefined }}>
                                                {step.status ? <Check className="w-6 h-6" /> : <Circle className="w-5 h-5" />}
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest text-center transition-colors ${step.status ? (isDark ? 'text-gray-300' : 'text-gray-800') : 'text-gray-400'}`}>{step.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Bot Voice Selection */}
                    <section className={`rounded-[3rem] p-8 border transition-all ${isDark ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white/40 border-white/80 shadow-2xl shadow-gray-200/50 backdrop-blur-2xl'}`}>
                        <div className="flex items-center gap-4 mb-10">
                            <div className={`p-4 rounded-2xl shadow-lg ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-600'}`} style={{ backgroundColor: !isDark ? `${previewAccentColor}11` : undefined, color: !isDark ? previewAccentColor : undefined }}>
                                <Bot className="w-7 h-7" />
                            </div>
                            <h2 className="text-2xl font-black">Neural Persona</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {PERSONALITIES.map(p => (
                                <button key={p.id} onClick={() => onUpdateSettings({ botPersonality: p.id })} className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all text-left group shadow-sm ${settings.botPersonality === p.id ? (isDark ? 'bg-white/5' : 'bg-white shadow-xl shadow-gray-200') : (isDark ? 'border-transparent bg-white/5 hover:bg-white/10' : 'border-transparent bg-white/40 hover:bg-white/60')}`} style={{ borderColor: settings.botPersonality === p.id ? previewAccentColor : 'transparent' }}>
                                    <div className="flex-1">
                                        <h3 className="font-black text-sm uppercase tracking-wide group-hover:text-indigo-500 transition-colors" style={{ '--hover-color': previewAccentColor } as any}>{p.label}</h3>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1 opacity-70">{p.desc}</p>
                                    </div>
                                    {settings.botPersonality === p.id && <Check className="w-5 h-5" style={{ color: previewAccentColor }} />}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Server Mode Selection */}
                    <section className={`rounded-[3rem] p-8 border transition-all ${isDark ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white/40 border-white/80 shadow-2xl shadow-gray-200/50 backdrop-blur-2xl'}`}>
                        <div className="flex items-center gap-4 mb-10">
                            <div className={`p-4 rounded-2xl shadow-lg ${isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-50 text-cyan-600'}`} style={{ backgroundColor: !isDark ? `${previewAccentColor}11` : undefined, color: !isDark ? previewAccentColor : undefined }}>
                                <Server className="w-7 h-7" />
                            </div>
                            <h2 className="text-2xl font-black">Protocol Mode</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {RESPONSE_TYPES.map(r => (
                                <button key={r.id} onClick={() => onUpdateSettings({ responseType: r.id })} className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all text-left group shadow-sm ${settings.responseType === r.id ? (isDark ? 'bg-white/5' : 'bg-white shadow-xl shadow-gray-200') : (isDark ? 'border-transparent bg-white/5 hover:bg-white/10' : 'border-transparent bg-white/40 hover:bg-white/60')}`} style={{ borderColor: settings.responseType === r.id ? previewAccentColor : 'transparent' }}>
                                    <div className="flex-1">
                                        <h3 className="font-black text-sm uppercase tracking-wide group-hover:text-cyan-500 transition-colors" style={{ '--hover-color': previewAccentColor } as any}>{r.label}</h3>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1 opacity-70">{r.desc}</p>
                                    </div>
                                    {settings.responseType === r.id && <Check className="w-5 h-5" style={{ color: previewAccentColor }} />}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
                
                {/* Calendar Connection Section */}
                <section className={`rounded-[3rem] p-8 border transition-all ${isDark ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white/40 border-white/80 shadow-2xl shadow-gray-200/50 backdrop-blur-2xl'}`}>
                    <div className="flex items-center gap-4 mb-8">
                        <div className={`p-4 rounded-2xl shadow-lg ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`} style={{ backgroundColor: !isDark ? `${previewAccentColor}11` : undefined, color: !isDark ? previewAccentColor : undefined }}>
                            <CalendarDays className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black">Calendar Connection</h2>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Sync roadmaps & daily routines</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        {/* Local Calendar */}
                        <div className={`flex items-center justify-between p-5 rounded-[2rem] border transition-all shadow-sm ${isDark ? 'bg-white/5 border-white/5' : 'bg-white/40 border-white/60'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${isDark ? 'bg-white/5 text-gray-400' : 'bg-white text-gray-600 shadow-sm'}`} style={{ color: !isDark ? previewAccentColor : undefined }}><Layout className="w-5 h-5" /></div>
                                <div>
                                    <h3 className="font-black text-sm uppercase tracking-widest">Local System</h3>
                                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Browser storage sync</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleCalendarToggle('local')}
                                className={`w-12 h-7 rounded-full relative transition-all duration-300 shadow-md ${calendarState.local ? 'bg-emerald-500' : 'bg-gray-400'}`}
                                style={{ backgroundColor: calendarState.local ? previewAccentColor : undefined }}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${calendarState.local ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>

                        {/* Google Calendar */}
                        <div className={`flex items-center justify-between p-5 rounded-[2rem] border transition-all shadow-sm ${isDark ? 'bg-white/5 border-white/5' : 'bg-white/40 border-white/60'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${isDark ? 'bg-white/5 text-blue-400' : 'bg-white text-blue-600 shadow-sm'}`} style={{ color: !isDark ? previewAccentColor : undefined }}><Globe className="w-5 h-5" /></div>
                                <div>
                                    <h3 className="font-black text-sm uppercase tracking-widest">Google Calendar</h3>
                                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Neural event injection</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleCalendarToggle('google')}
                                disabled={connectingCal === 'google'}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${calendarState.google ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'text-white shadow-lg'}`}
                                style={{ 
                                  backgroundColor: !calendarState.google ? previewAccentColor : undefined,
                                  color: calendarState.google ? previewAccentColor : 'white',
                                  borderColor: calendarState.google ? `${previewAccentColor}33` : 'transparent'
                                }}
                            >
                                {connectingCal === 'google' ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : calendarState.google ? 'Connected' : 'Connect'}
                            </button>
                        </div>

                        {/* Calendly */}
                        <div className={`flex items-center justify-between p-5 rounded-[2rem] border transition-all shadow-sm ${isDark ? 'bg-white/5 border-white/5' : 'bg-white/40 border-white/60'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${isDark ? 'bg-white/5 text-sky-400' : 'bg-white text-sky-600 shadow-sm'}`} style={{ color: !isDark ? previewAccentColor : undefined }}><Link className="w-5 h-5" /></div>
                                <div>
                                    <h3 className="font-black text-sm uppercase tracking-widest">Calendly API</h3>
                                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Automated scheduling</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleCalendarToggle('calendly')}
                                disabled={connectingCal === 'calendly'}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${calendarState.calendly ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'text-white shadow-lg'}`}
                                style={{ 
                                  backgroundColor: !calendarState.calendly ? previewAccentColor : undefined,
                                  color: calendarState.calendly ? previewAccentColor : 'white',
                                  borderColor: calendarState.calendly ? `${previewAccentColor}33` : 'transparent'
                                }}
                            >
                                {connectingCal === 'calendly' ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : calendarState.calendly ? 'Connected' : 'Connect'}
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {/* Sidebar Identity Panel */}
            <div className="lg:col-span-4 space-y-10">
                <section className={`relative overflow-hidden group border transition-all duration-500 rounded-[3rem] p-8 md:p-10 ${
                  isDark 
                  ? 'bg-gray-900/40 border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] hover:border-white/20' 
                  : 'bg-white/60 border-white/80 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] hover:border-white hover:bg-white/80 shadow-2xl shadow-gray-200/30 backdrop-blur-3xl'
                }`}>
                     <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[80px] group-hover:opacity-100 transition-all duration-1000 opacity-20" style={{ backgroundColor: `${previewAccentColor}` }}></div>
                     
                     <div className="flex justify-between items-center mb-10 relative z-10">
                        <h2 className="text-xl font-black uppercase tracking-[0.25em] flex items-center gap-3 text-gray-400">
                            <User className="w-6 h-6" style={{ color: previewAccentColor }} /> Neural ID
                        </h2>
                        {!isEditingIdentity && user && (
                            <button 
                                onClick={() => { setIsEditingIdentity(true); setIdentityForm(user); }} 
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white' : 'bg-white border border-gray-100 hover:bg-gray-50'}`}
                                style={{ color: !isDark ? previewAccentColor : undefined }}
                            >Edit Profile</button>
                        )}
                     </div>

                     {user ? (
                        isEditingIdentity ? (
                            <div className="space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
                                <div className="flex justify-center">
                                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center text-4xl font-black overflow-hidden shadow-2xl transition-all ${isDark ? 'bg-white/10 border-white/20' : 'bg-white border-white/80 border'}`}>
                                            {identityForm.avatarUrl ? <img src={identityForm.avatarUrl} className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-gray-400" />}
                                        </div>
                                        <div className="absolute inset-0 bg-black/60 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                                            <Camera className="w-8 h-8" />
                                        </div>
                                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">First Name</label>
                                        <input value={identityForm.firstName || ''} onChange={e => setIdentityForm({...identityForm, firstName: e.target.value})} className={`w-full rounded-2xl p-4 text-sm outline-none transition-all ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white/60 border-white/80 focus:bg-white focus:shadow-xl'}`} style={{ '--tw-ring-color': previewAccentColor } as any} placeholder="John" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Last Name</label>
                                        <input value={identityForm.lastName || ''} onChange={e => setIdentityForm({...identityForm, lastName: e.target.value})} className={`w-full rounded-2xl p-4 text-sm outline-none transition-all ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white/60 border-white/80 focus:bg-white focus:shadow-xl'}`} style={{ '--tw-ring-color': previewAccentColor } as any} placeholder="Doe" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Username</label>
                                    <input value={identityForm.username || ''} onChange={e => setIdentityForm({...identityForm, username: e.target.value.replace(/\s/g, '')})} className={`w-full rounded-2xl p-4 text-sm outline-none transition-all ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white/60 border-white/80 focus:bg-white focus:shadow-xl'}`} style={{ '--tw-ring-color': previewAccentColor } as any} placeholder="johndoe" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Email Address</label>
                                    <input value={identityForm.email || ''} onChange={e => setIdentityForm({...identityForm, email: e.target.value})} className={`w-full rounded-2xl p-4 text-sm outline-none transition-all ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white/60 border-white/80 focus:bg-white focus:shadow-xl'}`} style={{ '--tw-ring-color': previewAccentColor } as any} placeholder="john@neural.com" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Account Passkey</label>
                                    <input type="password" value={identityForm.password || ''} onChange={e => setIdentityForm({...identityForm, password: e.target.value.replace(/\s/g, '')})} className={`w-full rounded-2xl p-4 text-sm outline-none transition-all ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white/60 border-white/80 focus:bg-white focus:shadow-xl'}`} style={{ '--tw-ring-color': previewAccentColor } as any} placeholder="Keep it secret" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 block">Birth Timeline</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['Day', 'Month', 'Year'].map((label, idx) => (
                                            <div key={idx} className="flex flex-col gap-2">
                                                <span className="text-[9px] uppercase font-black text-gray-500 text-center">{label}</span>
                                                <input 
                                                    type="number" 
                                                    placeholder={idx === 0 ? "DD" : idx === 1 ? "MM" : "YYYY"} 
                                                    value={idx === 0 ? dobDay : idx === 1 ? dobMonth : dobYear} 
                                                    onChange={e => idx === 0 ? setDobDay(e.target.value) : idx === 1 ? setDobMonth(e.target.value) : setDobYear(e.target.value)} 
                                                    className={`w-full rounded-2xl p-4 text-sm outline-none text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white/60 border-white/80'}`} 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {identityError && <p className="text-rose-500 text-[11px] font-black text-center uppercase tracking-widest animate-pulse">{identityError}</p>}

                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => setIsEditingIdentity(false)} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400 border border-white/5' : 'bg-white border border-white/80 hover:bg-gray-50 text-gray-600'}`}>Cancel</button>
                                    <button onClick={handleSaveIdentity} className="flex-1 py-4 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl hover:scale-[1.02]" style={{ backgroundColor: previewAccentColor }}>Commit ID</button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-center gap-6">
                                    <div className={`w-24 h-24 rounded-[2.2rem] flex items-center justify-center text-4xl font-black overflow-hidden shadow-2xl transition-all duration-500 group-hover:scale-105 ${isDark ? 'bg-white/10 border border-white/20' : 'bg-white border-white shadow-xl'}`}>
                                        {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : user.username[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className={`text-2xl font-black tracking-tighter transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.firstName || user.username} {user.lastName || ''}</p>
                                        <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mt-3 shadow-sm ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-white/80'}`} style={{ color: previewAccentColor }}>
                                            <div className="w-1.5 h-1.5 rounded-full mr-2 animate-ping" style={{ backgroundColor: previewAccentColor }}></div>
                                            Authenticated Level 1
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { icon: Mail, label: user.email || 'link_unassigned' },
                                        { icon: Calendar, label: user.dob ? new Date(user.dob).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Unset Temporal ID' },
                                        { icon: Globe, label: `${settings.region} Node`, type: 'region' },
                                        { icon: ShieldQuestion, label: user.securityQuestion || 'Unprotected', type: 'security' }
                                    ].map((item, i) => (
                                        <div key={i} className={`p-5 rounded-3xl border transition-all flex items-center gap-5 shadow-sm relative ${isDark ? 'bg-white/5 border-white/5' : 'bg-white/30 border-white/60 hover:bg-white/50'}`}>
                                            <div className="p-3 rounded-2xl bg-white/10 shadow-inner" style={{ color: previewAccentColor }}><item.icon className="w-5 h-5" /></div>
                                            <div className="flex-1 min-w-0">
                                                <span className={`text-sm font-bold truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                                            </div>
                                            {item.type === 'region' && (
                                                <>
                                                    <ChevronDown className="w-4 h-4 opacity-50" />
                                                    <select value={settings.region} onChange={(e) => onUpdateSettings({ region: e.target.value })} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                                                        {COUNTRIES.map(r => <option key={r} value={r} className="bg-gray-900 text-white">{r}</option>)}
                                                    </select>
                                                </>
                                            )}
                                            {item.type === 'security' && user.securityAnswer && <Check className="w-6 h-6 text-emerald-500" />}
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 space-y-5">
                                    <div className={`w-full py-6 rounded-3xl font-black text-[11px] tracking-[0.3em] flex flex-col items-center justify-center gap-2 border-2 border-dashed transition-all cursor-not-allowed shadow-inner ${isDark ? 'bg-white/5 text-gray-500 border-white/10' : 'bg-white/30 text-gray-400 border-white/80'}`}>
                                        <Sparkles className="w-6 h-6 mb-1 opacity-40" />
                                        <span className="uppercase">Pro Architecture</span>
                                        <span className="text-[9px] animate-pulse" style={{ color: previewAccentColor }}>DEPLOYING SOON</span>
                                    </div>
                                    
                                    <button onClick={onResetData} className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border shadow-2xl ${isDark ? 'bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-white border-white hover:bg-rose-50 text-rose-600 shadow-rose-100'}`}>
                                        <RotateCcw className="w-5 h-5" /> Purge Cache
                                    </button>
                                </div>
                            </div>
                        )
                     ) : (
                        <div className="text-center py-20 relative z-10 animate-pulse">
                            <p className="text-gray-400 font-black mb-6 uppercase tracking-[0.3em] text-xs">Offline Module Detected</p>
                            <button onClick={() => handleClose(AppView.DASHBOARD)} className="px-10 py-4 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl" style={{ backgroundColor: previewAccentColor }}>Initialize Identity</button>
                        </div>
                     )}
                </section>

                {/* Data Control Section */}
                <section className={`rounded-[3rem] p-8 border transition-all ${isDark ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white/40 border-white/80 shadow-2xl shadow-gray-200/50 backdrop-blur-2xl'}`}>
                    <h2 className="text-xl font-black uppercase tracking-[0.3em] mb-10 flex items-center gap-4 text-cyan-600 dark:text-cyan-400" style={{ color: !isDark ? previewAccentColor : undefined }}>
                        <Cloud className="w-7 h-7" /> Data Control
                    </h2>
                    <div className="space-y-5">
                        <button className={`w-full flex items-center justify-between p-6 rounded-[2rem] border transition-all group shadow-sm ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white/30 border-white/60 hover:bg-white/60'}`}>
                            <div className="flex items-center gap-5">
                                <div className={`p-3 rounded-2xl shadow-lg ${isDark ? 'bg-white/5 text-indigo-400 shadow-inner' : 'bg-white shadow-sm shadow-gray-200'}`} style={{ color: !isDark ? previewAccentColor : undefined }}><HardDrive className="w-6 h-6" /></div>
                                <span className={`font-black text-sm uppercase tracking-widest ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>Cloud Uplink</span>
                            </div>
                            <ArrowRight className="w-5 h-5 opacity-40 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                        </button>
                        <button onClick={onExportData} className={`w-full flex items-center justify-between p-6 rounded-[2rem] border transition-all group shadow-sm ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white/30 border-white/60 hover:bg-white/60'}`}>
                            <div className="flex items-center gap-5">
                                <div className={`p-3 rounded-2xl shadow-lg ${isDark ? 'bg-white/5 text-gray-400 shadow-inner' : 'bg-white shadow-sm shadow-gray-200'}`} style={{ color: !isDark ? previewAccentColor : undefined }}><Download className="w-6 h-6" /></div>
                                <span className={`font-black text-sm uppercase tracking-widest ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>Export Data</span>
                            </div>
                            <ChevronRight className="w-5 h-5 opacity-40 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                        </button>
                        
                        <div className="h-px bg-gray-100 dark:bg-white/5 mx-4"></div>
                        
                        <button 
                            onClick={onResetData}
                            className={`w-full flex items-center justify-between p-5 rounded-3xl border border-transparent transition-all group ${isDark ? 'hover:bg-rose-500/10' : 'hover:bg-rose-50'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl shadow-md ${isDark ? 'bg-rose-500/10 text-rose-500' : 'bg-rose-100 text-rose-600'}`}><Trash2 className="w-5 h-5" /></div>
                                <div className="text-left">
                                    <span className="font-black text-xs uppercase tracking-widest text-rose-600 dark:text-rose-500">Delete All Data</span>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Permanent erasure of progress</p>
                                </div>
                            </div>
                            <ShieldAlert className="w-4 h-4 text-rose-300 opacity-0 group-hover:opacity-100 transition-all" />
                        </button>
                    </div>
                </section>

                {/* Footer Metadata */}
                <div className="px-8 flex flex-col gap-6 mb-12">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between text-gray-400/60 font-black italic">
                            <div className="flex items-center gap-2">
                                <Cpu className="w-4 h-4" />
                                <span className="text-[10px] uppercase tracking-[0.3em]">V1.6.5-NEURAL</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-[10px] uppercase tracking-[0.3em]">AES-256-ENCRYPTION</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-gray-400/40 font-black uppercase text-[8px] tracking-[0.2em] px-1">
                            <div className="flex items-center gap-1.5">
                                <Fingerprint className="w-3 h-3" />
                                <span>RELIABLE RESULTS</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <RotateCcw className="w-3 h-3" />
                                <span>PRIVACY CONTROL</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      <style>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input:focus {
           border-color: ${previewAccentColor} !important;
        }
      `}</style>
    </div>
  );
};
