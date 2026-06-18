
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { User, LogIn, LogOut, Settings, Trash2, Camera, Upload, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';

interface AuthWidgetProps {
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  themeColor?: string;
  isDark?: boolean;
}

export const AuthWidget: React.FC<AuthWidgetProps> = ({ currentUser, onLogin, onLogout, onDeleteAccount, onUpdateProfile, themeColor = '#4f46e5', isDark = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'menu' | 'login' | 'signup' | 'profile'>('menu');
  const [formData, setFormData] = useState<Partial<UserProfile>>({ username: '', password: '', email: '', avatarUrl: '', firstName: '', lastName: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetForm = () => {
    setFormData({ username: '', password: '', email: '', avatarUrl: '', firstName: '', lastName: '' });
    setError('');
    setShowPassword(false);
    setLoading(false);
  };

  const openModal = (initialView: 'login' | 'signup') => {
    setView(initialView);
    resetForm();
    setIsOpen(true);
  };

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score: 0, label: 'Enter Password', color: 'bg-gray-200' };
    
    // Criteria
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    // Map score 0-4
    let label = 'Weak';
    let color = 'bg-red-500';
    
    if (score >= 4) {
        label = 'Strong';
        color = 'bg-green-500';
    } else if (score >= 2) {
        label = 'Medium';
        color = 'bg-yellow-500';
    }
    
    return { score, label, color };
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    setTimeout(() => {
        const usersStr = localStorage.getItem('pathfinder_users');
        const users: UserProfile[] = usersStr ? JSON.parse(usersStr) : [];
        
        const user = users.find(u => u.username === formData.username && u.password === formData.password);
        
        if (user) {
          onLogin(user);
          setIsOpen(false);
        } else {
          setError('Invalid username or password.');
        }
        setLoading(false);
    }, 800);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.username || !formData.password) {
        setError("Username and password required");
        return;
    }

    if (/\s/.test(formData.username)) {
        setError("Username cannot contain spaces.");
        return;
    }

    if (/\s/.test(formData.password)) {
        setError("Password cannot contain spaces.");
        return;
    }

    const strength = getPasswordStrength(formData.password);
    if (strength.score < 2) {
        setError("Password is too weak. Try adding numbers or symbols.");
        return;
    }

    setLoading(true);

    setTimeout(() => {
        const usersStr = localStorage.getItem('pathfinder_users');
        const users: UserProfile[] = usersStr ? JSON.parse(usersStr) : [];
        
        if (users.find(u => u.username === formData.username)) {
          setError('Username already exists.');
          setLoading(false);
          return;
        }
        
        const newUser: UserProfile = {
          username: formData.username!,
          password: formData.password!,
          email: formData.email || '',
          firstName: formData.firstName || '',
          lastName: formData.lastName || '',
          joinDate: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('pathfinder_users', JSON.stringify(users));
        onLogin(newUser);
        setIsOpen(false);
        setLoading(false);
    }, 800);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
          setError("Image too large. Max 2MB.");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      
      if (formData.username && /\s/.test(formData.username)) {
          setError("Username cannot contain spaces.");
          setLoading(false);
          return;
      }

      if (currentUser && formData.username !== currentUser.username) {
          const usersStr = localStorage.getItem('pathfinder_users');
          const users: UserProfile[] = usersStr ? JSON.parse(usersStr) : [];
          if (users.find(u => u.username === formData.username)) {
              setError("Username already taken.");
              setLoading(false);
              return;
          }
      }

      setTimeout(() => {
          onUpdateProfile(formData);
          setLoading(false);
          setView('menu');
      }, 500);
  };

  const handleCancel = () => {
    resetForm();
    setView('menu');
  };

  if (!currentUser) {
    const strength = getPasswordStrength(formData.password || '');

    return (
      <div className="relative" ref={menuRef}>
        <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-gray-400 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 px-2.5 py-1.5 rounded-xl hidden md:inline-block uppercase tracking-widest">Guest</span>
            <button 
                onClick={() => openModal('login')} 
                className="px-4 py-2.5 text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition"
            >
                Log In
            </button>
            <button 
                onClick={() => openModal('signup')} 
                className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white rounded-xl transition shadow-xl hover:scale-105 active:scale-95 transform duration-200 group relative overflow-hidden"
                style={{ backgroundColor: themeColor }}
            >
                <span className="relative z-10">Sign Up</span>
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
        </div>

        <AnimatePresence>
        {isOpen && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="absolute right-0 mt-4 w-80 overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/10 z-50 origin-top-right"
            >
                {/* Futuristic Glass Background - Matching FeedbackModal */}
                <div className={`absolute inset-0 z-0 backdrop-blur-3xl transition-colors duration-500 ${isDark ? 'bg-gray-950 shadow-[0_0_40px_rgba(0,0,0,0.5)]' : 'bg-white/95 shadow-2xl'}`}></div>
                <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[60px] opacity-20 animate-pulse" style={{ backgroundColor: themeColor }}></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-[60px] opacity-10 animate-pulse" style={{ backgroundColor: themeColor }}></div>

                <div className="relative z-10">
                    {/* Refined Header - Like FeedbackModal */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-8 pb-4 flex justify-between items-start"
                    >
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl shadow-lg flex items-center justify-center" style={{ backgroundColor: `${themeColor}22`, color: themeColor }}>
                                    {view === 'login' ? <LogIn className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                                </div>
                                <h3 className="text-2xl font-bold font-brand tracking-tight text-gray-900 dark:text-white">
                                    {view === 'login' ? 'Welcome Back' : 'Join Pathfinder'}
                                </h3>
                            </div>
                            <p className="text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest ml-1">
                                {view === 'login' ? 'Initialize your session' : 'Create your neural identity'}
                            </p>
                        </div>
                    </motion.div>
                    
                    <div className="p-8 pt-2">
                        <form onSubmit={view === 'login' ? handleLogin : handleSignUp} className="space-y-5">
                            {view === 'signup' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="grid grid-cols-2 gap-3"
                                >
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ml-1">First Name</label>
                                        <input 
                                            className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-xl outline-none text-sm transition focus:ring-4 text-gray-900 dark:text-white font-medium placeholder-gray-400 dark:placeholder-gray-600"
                                            style={{'--tw-ring-color': `${themeColor}22`} as React.CSSProperties}
                                            value={formData.firstName}
                                            onChange={e => setFormData({...formData, firstName: e.target.value})}
                                            placeholder="John"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ml-1">Last Name</label>
                                        <input 
                                            className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-xl outline-none text-sm transition focus:ring-4 text-gray-900 dark:text-white font-medium placeholder-gray-400 dark:placeholder-gray-600"
                                            style={{'--tw-ring-color': `${themeColor}22`} as React.CSSProperties}
                                            value={formData.lastName}
                                            onChange={e => setFormData({...formData, lastName: e.target.value})}
                                            placeholder="Doe"
                                        />
                                    </div>
                                </motion.div>
                            )}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                            >
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ml-1">Username</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-xl outline-none transition font-semibold focus:ring-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                                    style={{'--tw-ring-color': `${themeColor}22`} as React.CSSProperties}
                                    value={formData.username}
                                    onChange={e => setFormData({...formData, username: e.target.value.replace(/\s/g, '')})}
                                    placeholder="johndoe"
                                />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ml-1">Password</label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        className="w-full px-4 py-3 bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-xl outline-none transition pr-10 font-semibold focus:ring-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                                        style={{'--tw-ring-color': `${themeColor}22`} as React.CSSProperties}
                                        value={formData.password}
                                        onChange={e => setFormData({...formData, password: e.target.value.replace(/\s/g, '')})}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {view === 'signup' && formData.password && (
                                    <div className="mt-4">
                                        <div className="flex justify-between items-center mb-2 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">
                                            <span>Security</span>
                                            <span className={strength.label === 'Weak' ? 'text-rose-500' : strength.label === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}>{strength.label}</span>
                                        </div>
                                        <div className="flex gap-1.5 h-1">
                                            {[0, 1, 2, 3].map((i) => (
                                                <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${i < strength.score ? strength.color : 'bg-gray-200 dark:bg-white/10'}`}></div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                            
                            {error && (
                                <motion.p 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-500/10 p-3 rounded-xl text-center border border-rose-500/20"
                                >
                                    {error}
                                </motion.p>
                            )}
                            
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit" 
                                disabled={loading}
                                className="w-full py-4 text-white font-black uppercase tracking-widest text-xs rounded-xl transition flex justify-center items-center shadow-2xl group relative overflow-hidden"
                                style={{ backgroundColor: themeColor }}
                            >
                                <span className="relative z-10">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (view === 'login' ? 'Initialize Session' : 'Create Identity')}
                                </span>
                                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            </motion.button>
                            
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-center text-[10px] text-gray-500 dark:text-gray-400 mt-4 font-black uppercase tracking-[0.2em]"
                            >
                                {view === 'login' ? (
                                    <p>New user? <button type="button" onClick={() => setView('signup')} className="hover:underline" style={{ color: themeColor }}>Register Core</button></p>
                                ) : (
                                    <p>Existing user? <button type="button" onClick={() => setView('login')} className="hover:underline" style={{ color: themeColor }}>Access Core</button></p>
                                )}
                            </motion.div>
                        </form>
                    </div>
                </div>
            </motion.div>
        )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
        <button 
            onClick={() => { setIsOpen(!isOpen); setView('menu'); }}
            className="flex items-center space-x-2 focus:outline-none group"
        >
            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 border-transparent transition shadow-sm" style={{ borderColor: isOpen ? themeColor : 'transparent', backgroundColor: `${themeColor}20` }}>
                {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="User" className="w-full h-full object-cover" />
                ) : (
                    <User className="w-5 h-5" style={{ color: themeColor }} />
                )}
            </div>
        </button>
        <AnimatePresence>
           {isOpen && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="absolute right-0 mt-4 w-72 md:w-80 overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/10 z-50 origin-top-right"
            >
                {/* Futuristic Glass Background - Matching FeedbackModal */}
                <div className={`absolute inset-0 z-0 backdrop-blur-3xl transition-colors duration-500 ${isDark ? 'bg-gray-950 shadow-[0_0_40px_rgba(0,0,0,0.5)]' : 'bg-white/95 shadow-2xl'}`}></div>
                <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[60px] opacity-20 animate-pulse" style={{ backgroundColor: themeColor }}></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-[60px] opacity-10 animate-pulse" style={{ backgroundColor: themeColor }}></div>

                <div className="relative z-10">
                    {view === 'menu' ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-0"
                        >
                            <div className="p-8 pb-4 flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-2xl shadow-lg flex items-center justify-center" style={{ backgroundColor: `${themeColor}22`, color: themeColor }}>
                                            <User className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-bold font-brand tracking-tight text-gray-900 dark:text-white truncate max-w-[160px]">
                                            {currentUser.firstName || currentUser.username}
                                        </h3>
                                    </div>
                                    <p className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-500 dark:text-gray-400 truncate ml-1">@{currentUser.username}</p>
                                </div>
                            </div>

                            <div className="p-4 pt-2 space-y-1.5">
                                <motion.button 
                                    whileHover={{ x: 5, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
                                    onClick={() => {
                                        setFormData({ ...currentUser });
                                        setView('profile');
                                    }}
                                    className="w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 rounded-2xl flex items-center transition group"
                                >
                                    <Settings className="w-4 h-4 mr-4 group-hover:rotate-90 transition-transform" /> Edit Profile
                                </motion.button>
                                <motion.button 
                                    whileHover={{ x: 5, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
                                    onClick={() => { onLogout(); setIsOpen(false); }}
                                    className="w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 rounded-2xl flex items-center transition group"
                                >
                                    <LogOut className="w-4 h-4 mr-4 group-hover:translate-x-1 transition-transform" /> Sign Out
                                </motion.button>
                                <div className="h-px bg-gray-100 dark:bg-white/5 my-2 mx-4"></div>
                                <AnimatePresence mode="wait">
                                    {!confirmDelete ? (
                                        <motion.button 
                                            key="delete-btn"
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            whileHover={{ x: 5, backgroundColor: 'rgba(244,63,94,0.1)' }}
                                            onClick={() => setConfirmDelete(true)}
                                            className="w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 rounded-2xl flex items-center transition group"
                                        >
                                            <Trash2 className="w-4 h-4 mr-4 group-hover:scale-110 transition-transform" /> Delete Account
                                        </motion.button>
                                    ) : (
                                        <motion.div 
                                            key="confirm-delete"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="mx-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-3"
                                        >
                                            <p className="text-[9px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 text-center">Confirm Permanent Deletion?</p>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => setConfirmDelete(false)}
                                                    className="flex-1 py-2 text-[8px] font-black uppercase tracking-widest bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    onClick={() => { onDeleteAccount(); setIsOpen(false); }}
                                                    className="flex-1 py-2 text-[8px] font-black uppercase tracking-widest bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-8 overflow-y-auto max-h-[80vh]"
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2.5 rounded-2xl shadow-lg flex items-center justify-center" style={{ backgroundColor: `${themeColor}22`, color: themeColor }}>
                                    <Settings className="w-6 h-6 animate-spin-slow" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold font-brand tracking-tight text-gray-900 dark:text-white">Identity Config</h3>
                                    <p className="text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest">Update your neural link</p>
                                </div>
                            </div>
                            <form onSubmit={handleUpdateSubmit} className="space-y-6">
                                
                                <div className="flex items-center space-x-6 mb-6">
                                    <div className="w-20 h-20 rounded-[2rem] bg-white dark:bg-white/5 overflow-hidden flex items-center justify-center border border-gray-200 dark:border-white/10 relative group shadow-2xl">
                                        {formData.avatarUrl ? (
                                            <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-10 h-10 text-gray-400" />
                                        )}
                                        <div 
                                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Camera className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black uppercase tracking-widest hover:underline" style={{ color: themeColor }}>Upload Cell</button>
                                        <p className="text-[8px] font-bold text-gray-500 dark:text-gray-400 uppercase mt-1 tracking-widest">Max 2MB Payload</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">First</label>
                                        <input className="w-full px-4 py-2.5 text-sm bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-xl outline-none focus:ring-4 text-gray-900 dark:text-white font-semibold" style={{'--tw-ring-color': `${themeColor}22`} as React.CSSProperties} value={formData.firstName || ''} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Last</label>
                                        <input className="w-full px-4 py-2.5 text-sm bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-xl outline-none focus:ring-4 text-gray-900 dark:text-white font-semibold" style={{'--tw-ring-color': `${themeColor}22`} as React.CSSProperties} value={formData.lastName || ''} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">User Handle</label>
                                    <input className="w-full px-4 py-3 text-sm bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-xl outline-none focus:ring-4 text-gray-900 dark:text-white font-semibold" style={{'--tw-ring-color': `${themeColor}22`} as React.CSSProperties} value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value.replace(/\s/g, '')})} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Neural Link (Email)</label>
                                    <input className="w-full px-4 py-3 text-sm bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-xl outline-none focus:ring-4 text-gray-900 dark:text-white font-semibold" style={{'--tw-ring-color': `${themeColor}22`} as React.CSSProperties} value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Pass-Key</label>
                                    <input type="password" placeholder="New Secret" className="w-full px-4 py-3 text-sm bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-xl outline-none focus:ring-4 text-gray-900 dark:text-white font-semibold" style={{'--tw-ring-color': `${themeColor}22`} as React.CSSProperties} value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value.replace(/\s/g, '')})} />
                                </div>

                                {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest text-center bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{error}</p>}

                                <div className="flex gap-3 pt-4">
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="button" 
                                        onClick={handleCancel} 
                                        className="flex-1 py-4 bg-gray-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit" 
                                        disabled={loading} 
                                        className="flex-1 py-4 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition shadow-2xl group relative overflow-hidden" 
                                        style={{ backgroundColor: themeColor }}
                                    >
                                        <span className="relative z-10">
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Update Core'}
                                        </span>
                                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        )}
        </AnimatePresence>
    </div>
  );
};
