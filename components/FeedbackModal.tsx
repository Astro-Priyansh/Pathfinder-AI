
import React, { useState, useEffect } from 'react';
import { X, MessageSquare, AlertCircle, Sparkles, Send, CheckCircle2, Loader2, Sparkle } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeColor?: string;
}

type FeedbackType = 'suggestion' | 'issue' | 'other';

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, themeColor = '#4f46e5' }) => {
  const [type, setType] = useState<FeedbackType>('suggestion');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else {
      // Allow parent to force close if needed, but usually we handle it via handleClose
      setShouldRender(false);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const handleClose = () => {
    setIsClosing(true);
    // Wait for the duration of the zoom-out/fade-out animation (defined in index.html as 0.3s/0.4s)
    setTimeout(() => {
      setIsClosing(false);
      setShouldRender(false);
      onClose();
    }, 350);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus('submitting');
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
        handleClose();
      }, 2500);
    }, 1200);
  };

  return (
    <div 
      className={`fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md ${
        isClosing ? 'animate-fade-out' : 'animate-fade-in'
      }`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className={`relative w-full max-w-lg overflow-hidden rounded-[2.5rem] shadow-2xl ${
        isClosing ? 'animate-zoom-out' : 'animate-zoom-in'
      }`}>
        
        {/* Futuristic Glass Background */}
        <div className="absolute inset-0 bg-white/70 dark:bg-gray-950/80 backdrop-blur-3xl z-0"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-30 animate-pulse-slow" style={{ backgroundColor: themeColor }}></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-[80px] opacity-20 bg-purple-500 animate-pulse-slow"></div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col min-h-[500px]">
          
          {/* Vibrant Header */}
          <div className="p-8 pb-4 flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl shadow-lg flex items-center justify-center" style={{ backgroundColor: `${themeColor}22`, color: themeColor }}>
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold font-brand tracking-tight text-gray-900 dark:text-white">Feedback & Suggestions</h3>
              </div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Help us optimize your experience</p>
            </div>
            <button 
              onClick={handleClose}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-gray-200 dark:hover:border-white/10 group"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
            </button>
          </div>

          {status === 'success' ? (
            <div className="flex-1 p-12 text-center flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4">
              <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl animate-bounce-subtle" style={{ backgroundColor: `${themeColor}15` }}>
                <CheckCircle2 className="w-12 h-12" style={{ color: themeColor }} />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-brand tracking-tight">Feedback Sent!</h4>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 max-w-xs mx-auto leading-relaxed">
                Your feedback has been successfully submitted. Thank you for helping us improve Pathfinder AI!
              </p>
              
              <div className="mt-8 flex gap-2">
                 <div className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: themeColor }}></div>
                 <div className="w-1.5 h-1.5 rounded-full animate-ping delay-75" style={{ backgroundColor: themeColor }}></div>
                 <div className="w-1.5 h-1.5 rounded-full animate-ping delay-150" style={{ backgroundColor: themeColor }}></div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex-1 p-8 pt-4 space-y-8 flex flex-col">
              {/* Type Selection */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 ml-1">Category</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'suggestion', label: 'Feature', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { id: 'issue', label: 'Bug/Error', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                    { id: 'other', label: 'Other', icon: MessageSquare, color: 'text-sky-500', bg: 'bg-sky-500/10' }
                  ].map((t) => {
                    const isActive = type === t.id;
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setType(t.id as FeedbackType)}
                        className={`flex flex-col items-center justify-center p-4 rounded-[1.8rem] border-2 transition-all gap-2 relative group overflow-hidden ${
                          isActive 
                          ? 'bg-white dark:bg-white/5 border-indigo-500 shadow-xl' 
                          : 'border-transparent bg-gray-50/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10'
                        }`}
                        style={{ borderColor: isActive ? themeColor : undefined }}
                      >
                        <div className={`p-2.5 rounded-xl ${t.bg} ${t.color} group-hover:scale-110 transition-transform`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: isActive ? themeColor : undefined }}>{t.label}</span>
                        {isActive && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }}></div>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Area */}
              <div className="flex-1 flex flex-col">
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 ml-1">Your Message</label>
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={type === 'suggestion' ? "What features should we add?" : "What's on your mind?"}
                    className="w-full h-full p-6 bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-[2rem] focus:ring-4 outline-none transition font-medium min-h-[160px] resize-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                    style={{ '--tw-ring-color': `${themeColor}22` } as React.CSSProperties}
                    required
                  />
                  <div className="absolute bottom-4 right-6 opacity-20 pointer-events-none">
                     <Sparkle className="w-8 h-8" style={{ color: themeColor }} />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'submitting' || !message.trim()}
                className="w-full py-5 text-white font-bold uppercase tracking-widest text-xs rounded-[1.8rem] transition disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-95 group relative overflow-hidden"
                style={{ backgroundColor: themeColor }}
              >
                {status === 'submitting' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    Send Feedback
                  </>
                )}
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse-slow {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.1); opacity: 0.4; }
        }
        .animate-pulse-slow { animation: pulse-slow 8s infinite ease-in-out; }
        @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle { animation: bounce-subtle 2.5s infinite ease-in-out; }
      `}</style>
    </div>
  );
};
