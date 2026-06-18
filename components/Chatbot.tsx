
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Minimize2, Maximize2, Loader2, Bot, Trash2, GripHorizontal } from 'lucide-react';
import { ChatMessage, UserSettings } from '../types';
import { getChatResponse } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';

interface ChatbotProps {
    settings?: UserSettings;
    themeColor?: string;
}

export const Chatbot: React.FC<ChatbotProps> = ({ settings, themeColor = '#4f46e5' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm Pathfinder AI. How can I help you with your career journey today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await getChatResponse(messages, input, settings?.botPersonality);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([{
        id: Date.now().toString(),
        text: "Hi! I'm Pathfinder AI. How can I help you with your career journey today?",
        sender: 'bot',
        timestamp: new Date()
    }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            drag
            dragConstraints={{ left: typeof window !== 'undefined' ? -window.innerWidth + 100 : -1000, right: 0, top: typeof window !== 'undefined' ? -window.innerHeight + 100 : -1000, bottom: 0 }}
            dragElastic={0.2}
            dragMomentum={false}
            initial={{ scale: 0, opacity: 0, rotate: -90 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 90 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[100] cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'none' }}
          >
            <div className="relative group">
              <div 
                className="absolute inset-0 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                style={{ backgroundColor: themeColor }}
              />
              <button
                onClick={() => setIsOpen(true)}
                className="relative p-4 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.3)] backdrop-blur-xl border border-white/40 text-white flex items-center justify-center overflow-hidden transition-all duration-300"
                style={{ 
                  background: `linear-gradient(135deg, ${themeColor}cc, ${themeColor}66)`,
                  boxShadow: `0 8px 32px 0 ${themeColor}60, inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.2)`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <MessageSquare className="w-6 h-6 relative z-10 drop-shadow-md" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            drag
            dragHandle=".drag-handle"
            dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
            dragElastic={0}
            dragMomentum={false}
            initial={{ opacity: 0, y: 40, scale: 0.9, filter: 'blur(20px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 40, scale: 0.9, filter: 'blur(20px)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.8 }}
            className={`fixed z-[100] flex flex-col overflow-hidden
              /* Mobile: Full Screen */
              inset-0 w-full h-full rounded-none
              /* Desktop: Floating Popover */
              md:inset-auto md:top-24 md:left-[calc(100vw-450px)] md:w-[400px] md:h-[600px] md:rounded-[2rem]
              /* Glassmorphism */
              bg-white/20 dark:bg-black/30 backdrop-blur-3xl border border-white/40 dark:border-white/10 
            `}
            style={{
              boxShadow: `0 20px 40px -10px rgba(0,0,0,0.3), 0 0 40px -10px ${themeColor}50, inset 0 0 20px -5px ${themeColor}20`,
              resize: 'both'
            }}
          >
            
            {/* Header */}
            <div 
              className="drag-handle flex items-center justify-between p-4 border-b border-white/30 dark:border-white/10 relative overflow-hidden backdrop-blur-md shadow-sm cursor-move"
              style={{ background: `linear-gradient(135deg, ${themeColor}cc, ${themeColor}66)` }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
              <div className="flex items-center space-x-3 relative z-10">
                <div className="bg-white/30 p-2 rounded-2xl backdrop-blur-md border border-white/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)]">
                  <Bot className="w-5 h-5 text-white drop-shadow-md" />
                </div>
                <div>
                  <span className="font-bold font-brand text-white block leading-tight drop-shadow-sm">Pathfinder</span>
                  <span className="text-[10px] text-white/90 uppercase tracking-wider font-bold drop-shadow-sm">AI Assistant</span>
                </div>
              </div>
              <div className="flex items-center space-x-1 relative z-10">
                  <button 
                    onClick={handleClearChat}
                    className="p-2 hover:bg-white/30 rounded-xl transition-colors backdrop-blur-sm"
                    title="Clear Chat"
                  >
                    <Trash2 className="w-4 h-4 text-white drop-shadow-sm" />
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/30 rounded-xl transition-colors backdrop-blur-sm"
                  >
                    <X className="w-5 h-5 text-white drop-shadow-sm" />
                  </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative z-10">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed shadow-lg backdrop-blur-xl ${
                      msg.sender === 'user'
                        ? 'text-white rounded-3xl rounded-tr-sm border border-white/30'
                        : 'bg-white/40 dark:bg-black/40 text-gray-900 dark:text-gray-100 border border-white/40 dark:border-white/10 rounded-3xl rounded-tl-sm'
                    }`}
                    style={msg.sender === 'user' ? { 
                      background: `linear-gradient(135deg, ${themeColor}ee, ${themeColor}aa)`,
                      boxShadow: `0 8px 20px ${themeColor}40, inset 0 1px 2px rgba(255,255,255,0.4)`
                    } : {
                      boxShadow: `0 8px 20px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.4)`
                    }}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div 
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="flex justify-start"
                >
                   <div className="bg-white/40 dark:bg-black/40 p-4 rounded-3xl rounded-tl-sm border border-white/40 dark:border-white/10 shadow-lg backdrop-blur-xl">
                      <Loader2 className="w-5 h-5 animate-spin drop-shadow-sm" style={{ color: themeColor }} />
                   </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 relative z-10 rounded-b-[inherit]">
              <div className="flex items-end gap-2 bg-white/60 dark:bg-black/60 border border-white/50 dark:border-white/20 p-1.5 rounded-3xl shadow-inner transition-all focus-within:ring-2 focus-within:ring-opacity-50" style={{ '--tw-ring-color': themeColor } as any}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Pathfinder..."
                  className="flex-1 bg-transparent border-none outline-none focus:ring-0 focus:outline-none text-sm p-2.5 max-h-32 resize-none text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400"
                  rows={1}
                  style={{ minHeight: '44px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="p-3 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:scale-105 active:scale-95 flex items-center justify-center border border-white/30"
                  style={{ 
                    background: `linear-gradient(135deg, ${themeColor}ee, ${themeColor}aa)`
                  }}
                >
                  <Send className="w-4 h-4 drop-shadow-sm" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
