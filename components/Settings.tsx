
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { UserSettings, UserProfile, BotPersonality, ResponseType, AppView, UserState } from '../types';
import { 
  Settings as SettingsIcon, Palette, Bot, ShieldCheck, Download, Trash2, 
  RotateCcw, Sparkles, Check, ChevronLeft, Zap, Cloud, Cpu, Globe, 
  User, Mail, Home, HardDrive, Layout, Server, ArrowRight,
  ChevronRight, Circle, Camera, Calendar, ShieldQuestion,
  ChevronDown, Moon, Sun, Link, CalendarDays,
  ShieldAlert, Fingerprint, Loader2
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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

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
    }, 350); 
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

  const previewAccentColor = hasChanges ? localColor : themeColor;

  const personalizationSteps = useMemo(() => [
    { label: 'Career Objective', status: !!userState.targetCareer },
    { label: 'Interest Profile', status: !!userState.interestAnalysis },
    { label: 'Skill Matrix', status: !!userState.skillGap },
    { label: 'Evolution Plan', status: !!userState.roadmap },
    { label: 'Personality Core', status: !!userState.personalityResult },
  ], [userState]);

  return (
    <div 
      className={`fixed inset-0 z-[100] font-sans selection:bg-indigo-500/30 overflow-hidden ${
        isClosing ? 'animate-zoom-out' : 'animate-zoom-in'
      } ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}
    >
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 z-0 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
          <div 
            className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] transition-colors duration-1000 opacity-30 animate-pulse"
            style={{ backgroundColor: previewAccentColor }}
          ></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[150px] animate-pulse-slow"></div>
          <div className={`absolute inset-0 opacity-[0.03] dark:opacity-[0.08] mix-blend-overlay ${isDark ? "bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" : ""}`}></div>
      </div>

      <div className="relative h-full overflow-y-auto overflow-x-hidden z-10 custom-scrollbar overscroll-contain">
        <div className="max-w-7xl mx-auto min-h-screen p-6 md:p-12 flex flex-col transform-gpu">
          
          <div className="sticky top-4 z-50 mb-12">
              <div className={`flex items-center justify-between px-6 py-4 md:px-8 md:py-5 rounded-[2.5rem] border backdrop-blur-3xl transition-all duration-500 shadow-2xl ${
                isDark 
                ? 'bg-white/5 border-white/10 shadow-black/40' 
                : 'bg-white/40 border-white/80 shadow-indigo-100/50'
              }`}>
                <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleClose(previousView)} 
                      className={`p-3 rounded-2xl border transition-all group ${
                        isDark 
                        ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' 
                        : 'bg-white/60 border-white text-gray-800 shadow-sm hover:shadow-md'
                      }`}
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <button 
                      onClick={() => handleClose(AppView.DASHBOARD)} 
                      className={`p-3 rounded-2xl border transition-all ${
                        isDark 
                        ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' 
                        : 'bg-white/60 border-white text-gray-800 shadow-sm hover:shadow-md'
                      }`}
                    >
                        <Home className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-right">
                    <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic flex items-center gap-3 justify-end leading-none">
                        Settings <SettingsIcon className="w-6 h-6 md:w-8 md:h-8 animate-spin-slow" style={{ color: previewAccentColor }} />
                    </h1>
                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] mt-1">Core Architecture Control</p>
                </div>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1 pb-12">
              
              <div className="lg:col-span-8 space-y-10">
                  
                  {/* Interface Calibration Section */}
                  <section className={`card-base p-8 md:p-10 ${isDark ? 'dark-card' : 'light-card'}`}>
                      <div className="flex justify-between items-center mb-10">
                          <div className="flex items-center gap-5">
                              <div className="p-4 rounded-3xl transition-transform group-hover:rotate-6" style={{ backgroundColor: `${previewAccentColor}15`, color: previewAccentColor }}>
                                  <Palette className="w-8 h-8" />
                              </div>
                              <h2 className="text-3xl font-black tracking-tight">Interface Calibration</h2>
                          </div>
                          {hasChanges && (
                              <button onClick={handleApplyCalibration} className="px-8 py-3 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95 animate-bounce-subtle" style={{ backgroundColor: previewAccentColor }}>
                                  <Check className="w-4 h-4 inline mr-1" /> Commit
                              </button>
                          )}
                      </div>

                      <div className="space-y-12">
                          <div className={`p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 ${isDark ? 'bg-black/20' : 'bg-gray-50'}`}>
                              <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-5">
                                      <div className={`p-4 rounded-3xl shadow-inner ${isDark ? 'bg-white/5 text-amber-400' : 'bg-white text-indigo-600 shadow-gray-200'}`} style={{ color: !isDark ? previewAccentColor : undefined }}>
                                          {isDark ? <Moon className="w-7 h-7" /> : <Sun className="w-7 h-7" />}
                                      </div>
                                      <div>
                                          <h3 className="text-xl font-black">Theme Mode</h3>
                                          <p className="text-sm text-gray-500 font-medium">{isDark ? "High-focus environment" : "Maximum clarity mode"}</p>
                                      </div>
                                  </div>
                                  <button 
                                      onClick={toggleTheme}
                                      className={`w-20 h-11 rounded-full relative transition-all duration-300 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}
                                  >
                                      <div className={`absolute top-1 w-9 h-9 rounded-full transition-all duration-500 flex items-center justify-center ${isDark ? 'right-1 text-white' : 'left-1 bg-white text-amber-500 shadow-gray-400/50'}`} style={{ backgroundColor: isDark ? previewAccentColor : undefined }}>
                                          {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                      </div>
                                  </button>
                              </div>
                          </div>

                          <div>
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] mb-8 block ml-2">Neural Visual Core</label>
                              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                                  {THEME_COLORS.map(color => (
                                      <button 
                                        key={color.value} 
                                        onClick={() => { setLocalColor(color.value); setHasChanges(true); }} 
                                        className={`group flex flex-col items-center gap-4 p-4 rounded-[2rem] border-2 transition-all duration-200 ${localColor === color.value ? 'border-indigo-500 bg-white dark:bg-white/5' : 'border-transparent hover:bg-gray-100 dark:hover:bg-white/5'}`} 
                                        style={{ borderColor: localColor === color.value ? color.value : 'transparent' }}
                                      >
                                          <div className="w-12 h-12 rounded-full shadow-lg transition-transform group-hover:scale-110" style={{ backgroundColor: color.value, boxShadow: localColor === color.value ? `0 8px 24px ${color.value}50` : '' }}></div>
                                          <span className={`text-[10px] font-black uppercase tracking-widest ${localColor === color.value ? (isDark ? 'text-white' : 'text-gray-900') : 'text-gray-400'}`}>{color.name}</span>
                                      </button>
                                  ))}
                              </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className={`p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/5 ${isDark ? 'bg-black/20' : 'bg-gray-50'}`}>
                                  <div className="flex items-center justify-between mb-4">
                                      <div className={`p-3 rounded-2xl ${isDark ? 'bg-white/5 text-cyan-400' : 'bg-white text-cyan-600 shadow-sm'}`} style={{ color: !isDark ? previewAccentColor : undefined }}>
                                          <Zap className="w-6 h-6" />
                                      </div>
                                      <button onClick={() => { setLocalAnimations(!localAnimations); setHasChanges(true); }} className={`w-14 h-8 rounded-full relative transition-all duration-300 ${localAnimations ? 'bg-emerald-500' : 'bg-gray-300'}`} style={{ backgroundColor: localAnimations ? previewAccentColor : undefined }}>
                                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${localAnimations ? 'right-1' : 'left-1'}`}></div>
                                      </button>
                                  </div>
                                  <h3 className="text-lg font-black">Motion FX</h3>
                                  <p className="text-xs text-gray-500 mt-1 font-medium">Spatial interactions.</p>
                              </div>

                              <div className={`p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/5 ${isDark ? 'bg-black/20' : 'bg-gray-50'}`}>
                                  <div className="flex items-center justify-between mb-4">
                                      <div className={`p-3 rounded-2xl ${isDark ? 'bg-white/5 text-fuchsia-400' : 'bg-white text-fuchsia-600 shadow-sm'}`} style={{ color: !isDark ? previewAccentColor : undefined }}>
                                          <Sparkles className="w-6 h-6" />
                                      </div>
                                      <button onClick={() => { setLocalDynamicTheme(!localDynamicTheme); setHasChanges(true); }} className={`w-14 h-8 rounded-full relative transition-all duration-300 ${localDynamicTheme ? 'bg-emerald-500' : 'bg-gray-300'}`} style={{ backgroundColor: localDynamicTheme ? previewAccentColor : undefined }}>
                                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${localDynamicTheme ? 'right-1' : 'left-1'}`}></div>
                                      </button>
                                  </div>
                                  <h3 className="text-lg font-black">Adaptive</h3>
                                  <p className="text-xs text-gray-500 mt-1 font-medium">Automatic theme shifting.</p>
                              </div>
                          </div>

                          {localDynamicTheme && (
                              <div className={`p-8 rounded-[2.5rem] border border-indigo-100 dark:border-white/10 ${isDark ? 'bg-white/5' : 'bg-indigo-50/50'}`}>
                                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] mb-8 flex items-center">
                                      <ShieldCheck className="w-4 h-4 mr-2" style={{ color: previewAccentColor }} /> Sync Progression
                                  </h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
                                      {personalizationSteps.map((step, idx) => (
                                          <div key={idx} className="flex flex-col items-center gap-3">
                                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all ${step.status ? 'bg-white dark:bg-white/10' : 'opacity-20 border-gray-200 grayscale'}`} style={{ borderColor: step.status ? previewAccentColor : 'transparent', color: step.status ? previewAccentColor : undefined }}>
                                                  {step.status ? <Check className="w-6 h-6" /> : <Circle className="w-5 h-5" />}
                                              </div>
                                              <span className={`text-[9px] font-black uppercase tracking-widest text-center ${step.status ? '' : 'text-gray-400'}`}>{step.label}</span>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          )}
                      </div>
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <section className={`card-base p-8 ${isDark ? 'dark-card' : 'light-card'}`}>
                          <div className="flex items-center gap-4 mb-10">
                              <div className="p-4 rounded-2xl shadow-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                  <Bot className="w-7 h-7" />
                              </div>
                              <h2 className="text-2xl font-black">Persona</h2>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                              {PERSONALITIES.map(p => (
                                  <button key={p.id} onClick={() => onUpdateSettings({ botPersonality: p.id })} className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all text-left ${settings.botPersonality === p.id ? 'border-purple-500 bg-white dark:bg-white/5' : 'border-transparent bg-gray-50 dark:bg-white/5 hover:border-gray-200'}`} style={{ borderColor: settings.botPersonality === p.id ? previewAccentColor : '' }}>
                                      <div>
                                          <h3 className="font-black text-sm uppercase tracking-wide">{p.label}</h3>
                                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">{p.desc}</p>
                                      </div>
                                      {settings.botPersonality === p.id && <Check className="w-5 h-5" style={{ color: previewAccentColor }} />}
                                  </button>
                              ))}
                          </div>
                      </section>

                      <section className={`card-base p-8 ${isDark ? 'dark-card' : 'light-card'}`}>
                          <div className="flex items-center gap-4 mb-10">
                              <div className="p-4 rounded-2xl shadow-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                                  <Server className="w-7 h-7" />
                              </div>
                              <h2 className="text-2xl font-black">Mode</h2>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                              {RESPONSE_TYPES.map(r => (
                                  <button key={r.id} onClick={() => onUpdateSettings({ responseType: r.id })} className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all text-left ${settings.responseType === r.id ? 'border-cyan-500 bg-white dark:bg-white/5' : 'border-transparent bg-gray-50 dark:bg-white/5 hover:border-gray-200'}`} style={{ borderColor: settings.responseType === r.id ? previewAccentColor : '' }}>
                                      <div>
                                          <h3 className="font-black text-sm uppercase tracking-wide">{r.label}</h3>
                                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">{r.desc}</p>
                                      </div>
                                      {settings.responseType === r.id && <Check className="w-5 h-5" style={{ color: previewAccentColor }} />}
                                  </button>
                              ))}
                          </div>
                      </section>
                  </div>
                  
                  <section className={`card-base p-8 ${isDark ? 'dark-card' : 'light-card'}`}>
                      <div className="flex items-center gap-4 mb-8">
                          <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                              <CalendarDays className="w-7 h-7" />
                          </div>
                          <div>
                              <h2 className="text-2xl font-black">Calendar Sync</h2>
                              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Sync daily routines</p>
                          </div>
                      </div>
                      
                      <div className="space-y-4">
                          {[
                            { id: 'local', label: 'Local Storage', desc: 'Browser sync', icon: Layout },
                            { id: 'google', label: 'Google Calendar', desc: 'Neural injection', icon: Globe },
                            { id: 'calendly', label: 'Calendly API', desc: 'Auto scheduling', icon: Link }
                          ].map((cal) => (
                            <div key={cal.id} className={`flex items-center justify-between p-5 rounded-[2rem] border border-gray-100 dark:border-white/5 ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400">
                                      <cal.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-sm uppercase tracking-widest">{cal.label}</h3>
                                        <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">{cal.desc}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleCalendarToggle(cal.id as any)}
                                    disabled={connectingCal === cal.id}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${calendarState[cal.id as keyof typeof calendarState] ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}
                                    style={{ backgroundColor: calendarState[cal.id as keyof typeof calendarState] ? previewAccentColor : '' }}
                                >
                                    {connectingCal === cal.id ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : calendarState[cal.id as keyof typeof calendarState] ? 'Linked' : 'Link Account'}
                                </button>
                            </div>
                          ))}
                      </div>
                  </section>
              </div>

              <div className="lg:col-span-4 space-y-10">
                  <section className={`card-base p-8 relative overflow-hidden group ${isDark ? 'dark-card' : 'light-card'}`}>
                       <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[60px] group-hover:opacity-40 transition-opacity opacity-10" style={{ backgroundColor: previewAccentColor }}></div>
                       
                       <div className="flex justify-between items-center mb-10 relative z-10">
                          <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 text-gray-400">
                              <User className="w-6 h-6" style={{ color: previewAccentColor }} /> Neural ID
                          </h2>
                          {!isEditingIdentity && user && (
                              <button 
                                  onClick={() => { setIsEditingIdentity(true); setIdentityForm(user); }} 
                                  className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                              >Edit</button>
                          )}
                       </div>

                       {user ? (
                          isEditingIdentity ? (
                              <div className="space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
                                  <div className="flex justify-center">
                                      <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                          <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center text-4xl font-black overflow-hidden border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5`}>
                                              {identityForm.avatarUrl ? <img src={identityForm.avatarUrl} className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-gray-400" />}
                                          </div>
                                          <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                                              <Camera className="w-8 h-8" />
                                          </div>
                                          <input type="file" onChange={handleFileChange} ref={fileInputRef} className="hidden" accept="image/*" />
                                      </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                          <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">First Name</label>
                                          <input value={identityForm.firstName || ''} onChange={e => setIdentityForm({...identityForm, firstName: e.target.value})} className="input-base" placeholder="John" />
                                      </div>
                                      <div className="space-y-1">
                                          <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Last Name</label>
                                          <input value={identityForm.lastName || ''} onChange={e => setIdentityForm({...identityForm, lastName: e.target.value})} className="input-base" placeholder="Doe" />
                                      </div>
                                  </div>

                                  <div className="space-y-1">
                                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Username</label>
                                      <input value={identityForm.username || ''} onChange={e => setIdentityForm({...identityForm, username: e.target.value.replace(/\s/g, '')})} className="input-base" placeholder="johndoe" />
                                  </div>

                                  <div className="space-y-1">
                                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Email Address</label>
                                      <input value={identityForm.email || ''} onChange={e => setIdentityForm({...identityForm, email: e.target.value})} className="input-base" placeholder="john@neural.com" />
                                  </div>

                                  {identityError && <p className="text-rose-500 text-[10px] font-bold text-center uppercase">{identityError}</p>}

                                  <div className="flex gap-4 pt-4">
                                      <button onClick={() => setIsEditingIdentity(false)} className="flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-gray-100 dark:bg-white/5">Cancel</button>
                                      <button onClick={handleSaveIdentity} className="flex-1 py-3.5 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg" style={{ backgroundColor: previewAccentColor }}>Update</button>
                                  </div>
                              </div>
                          ) : (
                              <div className="space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                  <div className="flex items-center gap-6">
                                      <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl font-black overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm">
                                          {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : user.username[0].toUpperCase()}
                                      </div>
                                      <div>
                                          <p className="text-xl font-black tracking-tight">{user.firstName || user.username} {user.lastName || ''}</p>
                                          <div className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mt-2 bg-gray-100 dark:bg-white/5" style={{ color: previewAccentColor }}>
                                              Authenticated Core
                                          </div>
                                      </div>
                                  </div>

                                  <div className="space-y-3">
                                      {[
                                          { icon: Mail, label: user.email || 'not_linked' },
                                          { icon: Globe, label: `${settings.region} Region`, type: 'region' },
                                          { icon: ShieldQuestion, label: user.securityQuestion || 'Unprotected' }
                                      ].map((item, i) => (
                                          <div key={i} className={`p-4 rounded-3xl border border-gray-50 dark:border-white/5 bg-gray-50 dark:bg-white/5 flex items-center gap-4 transition-colors relative`}>
                                              <div className="p-2.5 rounded-2xl bg-white dark:bg-white/5 shadow-sm" style={{ color: previewAccentColor }}><item.icon className="w-4 h-4" /></div>
                                              <div className="flex-1 min-w-0">
                                                  <span className="text-xs font-bold truncate block">{item.label}</span>
                                              </div>
                                              {item.type === 'region' && (
                                                  <>
                                                      <ChevronDown className="w-3 h-3 opacity-30" />
                                                      <select value={settings.region} onChange={(e) => onUpdateSettings({ region: e.target.value })} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                                                          {COUNTRIES.map(r => <option key={r} value={r} className="bg-gray-900 text-white">{r}</option>)}
                                                      </select>
                                                  </>
                                              )}
                                          </div>
                                      ))}
                                  </div>

                                  <div className="pt-6 space-y-4">
                                      <div className="w-full py-6 rounded-3xl font-black text-[9px] tracking-[0.3em] flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-100 dark:border-white/5 opacity-50 grayscale">
                                          <span className="uppercase">Professional Tier</span>
                                          <span className="animate-pulse" style={{ color: previewAccentColor }}>RESTRICTED</span>
                                      </div>
                                      
                                      <button onClick={onResetData} className="w-full py-4 rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest border border-rose-500/20 text-rose-500 hover:bg-rose-500/5 transition-colors flex items-center justify-center gap-3">
                                          <RotateCcw className="w-4 h-4" /> Reset Factory Settings
                                      </button>
                                  </div>
                              </div>
                          )
                       ) : (
                          <div className="text-center py-20 relative z-10">
                              <p className="text-gray-400 font-black mb-6 uppercase tracking-widest text-[10px]">Disconnected Core</p>
                              <button onClick={() => handleClose(AppView.DASHBOARD)} className="px-10 py-3.5 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl" style={{ backgroundColor: previewAccentColor }}>Initialize</button>
                          </div>
                       )}
                  </section>

                  {/* Data Module Section */}
                  <section className={`card-base p-8 ${isDark ? 'dark-card' : 'light-card'}`}>
                      <h2 className="text-xl font-black uppercase tracking-widest mb-10 flex items-center gap-4 text-cyan-600 dark:text-cyan-400" style={{ color: !isDark ? previewAccentColor : undefined }}>
                          <Cloud className="w-7 h-7" /> Data Module
                      </h2>
                      <div className="space-y-4">
                          <button className="w-full flex items-center justify-between p-5 rounded-3xl border border-gray-50 dark:border-white/5 bg-gray-50 dark:bg-white/5 group transition-colors hover:bg-gray-100 dark:hover:bg-white/10">
                              <div className="flex items-center gap-4">
                                  <div className="p-2.5 rounded-2xl bg-white dark:bg-white/5 shadow-sm text-indigo-500"><HardDrive className="w-5 h-5" /></div>
                                  <span className="font-black text-[11px] uppercase tracking-widest">Cloud Uplink</span>
                              </div>
                              <ArrowRight className="w-4 h-4 opacity-30 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                          </button>
                          <button onClick={onExportData} className="w-full flex items-center justify-between p-5 rounded-3xl border border-gray-50 dark:border-white/5 bg-gray-50 dark:bg-white/5 group transition-colors hover:bg-gray-100 dark:hover:bg-white/10">
                              <div className="flex items-center gap-4">
                                  <div className="p-2.5 rounded-2xl bg-white dark:bg-white/5 shadow-sm text-gray-500"><Download className="w-5 h-5" /></div>
                                  <span className="font-black text-[11px] uppercase tracking-widest">Save Data (JSON)</span>
                              </div>
                              <ChevronRight className="w-4 h-4 opacity-30 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                          </button>
                          
                          <div className="h-px bg-gray-100 dark:bg-white/5 mx-4"></div>
                          
                          <button onClick={onResetData} className="w-full flex items-center justify-between p-5 rounded-3xl group transition-colors hover:bg-rose-500/5">
                              <div className="flex items-center gap-4">
                                  <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 shadow-sm"><Trash2 className="w-5 h-5" /></div>
                                  <div className="text-left">
                                      <span className="font-black text-[11px] uppercase tracking-widest text-rose-600">Purge Memory</span>
                                      <p className="text-[8px] font-bold text-gray-400 uppercase">Irreversible erasure</p>
                                  </div>
                              </div>
                              <ShieldAlert className="w-4 h-4 text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                      </div>
                  </section>

                  <div className="px-8 flex flex-col gap-8 opacity-40">
                        <div className="flex items-center justify-between text-gray-500 font-black">
                            <div className="flex items-center gap-2">
                                <Cpu className="w-4 h-4" />
                                <span className="text-[10px] uppercase tracking-widest">NEURAL_V1.6</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-[10px] uppercase tracking-widest">ENCRYPTED</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-4 text-gray-400 font-black uppercase text-[8px] tracking-[0.4em]">
                            <Fingerprint className="w-3 h-3" />
                            <span>Pathfinder AI Core System</span>
                        </div>
                  </div>
              </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .animate-spin-slow { animation: spin 10s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
        }
        .animate-bounce-subtle { animation: bounce-subtle 2s infinite ease-in-out; }

        .animate-pulse-slow {
            animation: pulse-slow 6s ease-in-out infinite;
        }
        @keyframes pulse-slow {
            0%, 100% { opacity: 0.1; transform: scale(1); }
            50% { opacity: 0.2; transform: scale(1.05); }
        }

        .card-base {
            position: relative;
            border-radius: 3rem;
            border-width: 1px;
            transition-property: all;
            transition-duration: 400ms;
            contain: layout;
        }
        .dark-card {
            background-color: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.08);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .light-card {
            background-color: rgba(255, 255, 255, 0.7);
            border-color: #f1f5f9;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
            backdrop-filter: blur(20px);
        }
        .input-base {
            width: 100%;
            padding: 0.875rem 1rem;
            border-radius: 1rem;
            font-size: 0.875rem;
            outline: none;
            transition: all 200ms;
            background-color: rgba(0,0,0,0.03);
            border: 1px solid rgba(0,0,0,0.05);
        }
        .dark .input-base {
            background-color: rgba(255,255,255,0.03);
            border-color: rgba(255,255,255,0.08);
            color: white;
        }
        .input-base:focus {
            background-color: white;
            border-color: ${previewAccentColor};
            box-shadow: 0 0 0 4px ${previewAccentColor}15;
        }
        .dark .input-base:focus {
            background-color: rgba(255,255,255,0.08);
        }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
            background: rgba(128, 128, 128, 0.1); 
            border-radius: 10px; 
            transition: background 200ms;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(128, 128, 128, 0.3); }

        .animate-zoom-in { animation: zoom-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-zoom-out { animation: zoom-out 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};
