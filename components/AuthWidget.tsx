
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { User, LogIn, LogOut, Settings, Trash2, Camera, Upload, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';

interface AuthWidgetProps {
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  themeColor?: string;
}

export const AuthWidget: React.FC<AuthWidgetProps> = ({ currentUser, onLogin, onLogout, onDeleteAccount, onUpdateProfile, themeColor = '#4f46e5' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'menu' | 'login' | 'signup' | 'profile'>('menu');
  const [formData, setFormData] = useState<Partial<UserProfile>>({ username: '', password: '', email: '', avatarUrl: '', firstName: '', lastName: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
            <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded hidden md:inline-block uppercase tracking-widest">Guest</span>
            <button 
                onClick={() => openModal('login')} 
                className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
            >
                Log In
            </button>
            <button 
                onClick={() => openModal('signup')} 
                className="px-4 py-2 text-sm font-bold text-white rounded-xl transition shadow-lg hover:scale-105 transform duration-200"
                style={{ backgroundColor: themeColor }}
            >
                Sign Up
            </button>
        </div>

        {isOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 p-6 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 font-brand tracking-tight">
                    {view === 'login' ? 'Welcome Back' : 'Join Pathfinder'}
                </h3>
                
                <form onSubmit={view === 'login' ? handleLogin : handleSignUp} className="space-y-4">
                    {view === 'signup' && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">First Name</label>
                                <input 
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-xl outline-none text-sm"
                                    style={{'--tw-ring-color': themeColor} as React.CSSProperties}
                                    value={formData.firstName}
                                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Last Name</label>
                                <input 
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-xl outline-none text-sm"
                                    style={{'--tw-ring-color': themeColor} as React.CSSProperties}
                                    value={formData.lastName}
                                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                                    placeholder="Doe"
                                />
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Username (No Spaces)</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-xl outline-none transition font-medium"
                            style={{'--tw-ring-color': themeColor} as React.CSSProperties}
                            value={formData.username}
                            onChange={e => setFormData({...formData, username: e.target.value.replace(/\s/g, '')})}
                            placeholder="johndoe"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Password (No Spaces)</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-xl outline-none transition pr-10 font-medium"
                                style={{'--tw-ring-color': themeColor} as React.CSSProperties}
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value.replace(/\s/g, '')})}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {view === 'signup' && formData.password && (
                            <div className="mt-3">
                                <div className="flex justify-between items-center mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    <span>Security</span>
                                    <span className={strength.label === 'Weak' ? 'text-rose-500' : strength.label === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}>{strength.label}</span>
                                </div>
                                <div className="flex gap-1 h-1">
                                    {[0, 1, 2, 3].map((i) => (
                                        <div key={i} className={`flex-1 rounded-full ${i < strength.score ? strength.color : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {error && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest bg-rose-50 dark:bg-rose-900/10 p-2 rounded-lg text-center">{error}</p>}
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 text-white font-black uppercase tracking-widest text-xs rounded-xl transition flex justify-center items-center shadow-lg"
                        style={{ backgroundColor: themeColor }}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (view === 'login' ? 'Log In' : 'Create Account')}
                    </button>
                    
                    <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2 font-bold uppercase tracking-widest">
                        {view === 'login' ? (
                            <p>New? <button type="button" onClick={() => setView('signup')} className="hover:underline" style={{ color: themeColor }}>Create identity</button></p>
                        ) : (
                            <p>Active? <button type="button" onClick={() => setView('login')} className="hover:underline" style={{ color: themeColor }}>Log in</button></p>
                        )}
                    </div>
                </form>
            </div>
        )}
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

        {isOpen && (
            <div className="absolute right-0 mt-3 w-72 md:w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden origin-top-right">
                {view === 'menu' ? (
                    <>
                        <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                            <p className="font-bold text-gray-900 dark:text-white truncate text-lg" title={currentUser.username}>{currentUser.firstName || currentUser.username} {currentUser.lastName || ''}</p>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 truncate">@{currentUser.username}</p>
                        </div>
                        <div className="p-2 space-y-1">
                            <button 
                                onClick={() => {
                                    setFormData({ ...currentUser });
                                    setView('profile');
                                }}
                                className="w-full text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl flex items-center transition"
                            >
                                <Settings className="w-4 h-4 mr-3" /> Edit Profile
                            </button>
                            <button 
                                onClick={() => { onLogout(); setIsOpen(false); }}
                                className="w-full text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl flex items-center transition"
                            >
                                <LogOut className="w-4 h-4 mr-3" /> Sign Out
                            </button>
                            <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-2"></div>
                            <button 
                                onClick={() => { 
                                    if(confirm("Are you sure? This cannot be undone.")) {
                                        onDeleteAccount();
                                        setIsOpen(false);
                                    }
                                }}
                                className="w-full text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl flex items-center transition"
                            >
                                <Trash2 className="w-4 h-4 mr-3" /> Delete Account
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="p-6 overflow-y-auto max-h-[80vh]">
                         <h3 className="text-lg font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-6 font-brand flex items-center">
                            <Settings className="w-5 h-5 mr-2" style={{ color: themeColor }} /> Identity Config
                         </h3>
                         <form onSubmit={handleUpdateSubmit} className="space-y-4">
                            
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-700 relative group shadow-inner">
                                    {formData.avatarUrl ? (
                                        <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-8 h-8 text-gray-400" />
                                    )}
                                    <div 
                                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Camera className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-black uppercase tracking-widest hover:underline" style={{ color: themeColor }}>Upload Cell</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">First</label>
                                    <input className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none" value={formData.firstName || ''} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last</label>
                                    <input className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none" value={formData.lastName || ''} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">User Handle (No Spaces)</label>
                                <input className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none" value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value.replace(/\s/g, '')})} />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Neural Link (Email)</label>
                                <input className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pass-Key (No Spaces)</label>
                                <input type="password" placeholder="New Secret" className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value.replace(/\s/g, '')})} />
                            </div>
                            
                            {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>}

                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={handleCancel} className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-[10px] font-black uppercase tracking-widest rounded-xl">Cancel</button>
                                <button type="submit" disabled={loading} className="flex-1 py-2.5 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition shadow-md" style={{ backgroundColor: themeColor }}>
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Update'}
                                </button>
                            </div>
                         </form>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};
