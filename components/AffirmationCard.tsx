import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Copy, Check, Quote, Heart } from 'lucide-react';

interface QuoteItem {
  text: string;
  author: string;
  category: 'Growth' | 'Perseverance' | 'Mastery' | 'Vision' | 'Action';
}

const CAREER_QUOTES: QuoteItem[] = [
  {
    text: "Your career is a marathon, not a sprint. Pace yourself, learn continuously, and find joy in the climb.",
    author: "Career Whisperer",
    category: "Growth"
  },
  {
    text: "Every industry giant and technical expert was once a beginner. Embrace the friction of learning something new today.",
    author: "Growth Mentors",
    category: "Mastery"
  },
  {
    text: "Do not wait for the perfect opportunities to drop. Create them through your daily dedication, relentless curiosity, and active building.",
    author: "Product Strategy Collective",
    category: "Action"
  },
  {
    text: "The best way to predict your professional future is to actively design and build it block by block.",
    author: "Peter Drucker",
    category: "Vision"
  },
  {
    text: "Belief in your capacity to learn, adapt, and reconstruct your skillset is your ultimate evergreen competitive advantage.",
    author: "Mindset Pioneers",
    category: "Growth"
  },
  {
    text: "Your individual skills are your professional currency. Invest in sharpening them daily through disciplined, deliberate practice.",
    author: "Career Analytics",
    category: "Mastery"
  },
  {
    text: "Great career landmarks are made by a series of small, consistent learning sprints brought together over time.",
    author: "Vincent van Gogh (Adapted)",
    category: "Perseverance"
  },
  {
    text: "Mistakes are not dead ends; they are high-value data points on your path to mastery. Analyze the friction, adjust the code, and press on.",
    author: "Systems Architecture Wisdom",
    category: "Perseverance"
  },
  {
    text: "Success is the sum of tiny cumulative efforts, repeated day in and day out with unwavering intent.",
    author: "Robert Collier",
    category: "Action"
  },
  {
    text: "You are never too deep into one track to set a brand new professional goal, or pivot toward a more fulfilling dream.",
    author: "C.S. Lewis (Adapted)",
    category: "Vision"
  },
  {
    text: "Action precedes motivation. If you want to feel inspired to learn tomorrow, start building something small today.",
    author: "Behavioral Science Group",
    category: "Action"
  },
  {
    text: "A master class is not taught; it is lived by those who refuse to let temporary setbacks define their capability ceiling.",
    author: "Aviation Mindset",
    category: "Mastery"
  }
];

export const AffirmationCard: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [dailyIntent, setDailyIntent] = useState<string>(() => {
    return localStorage.getItem('pathfinder_daily_intent') || '';
  });
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [animating, setAnimating] = useState<boolean>(false);

  // Set initial random quote on load or tie it to the day of the year for a true "daily" feel
  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    setCurrentIndex(dayOfYear % CAREER_QUOTES.length);
  }, []);

  const handleNextQuote = () => {
    setAnimating(true);
    setTimeout(() => {
      let nextIdx = Math.floor(Math.random() * CAREER_QUOTES.length);
      while (nextIdx === currentIndex && CAREER_QUOTES.length > 1) {
        nextIdx = Math.floor(Math.random() * CAREER_QUOTES.length);
      }
      setCurrentIndex(nextIdx);
      setCopied(false);
      setIsLiked(false);
      setAnimating(false);
    }, 250);
  };

  const handleCopy = async () => {
    const current = CAREER_QUOTES[currentIndex];
    const textToCopy = `"${current.text}" — ${current.author} [Category: ${current.category}]`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleIntentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDailyIntent(val);
    localStorage.setItem('pathfinder_daily_intent', val);
  };

  const currentQuote = CAREER_QUOTES[currentIndex];

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Growth': return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30';
      case 'Perseverance': return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30';
      case 'Mastery': return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/30';
      case 'Vision': return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30';
      case 'Action': return 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30';
      default: return 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quote & Author Section */}
        <div className="lg:col-span-2 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-pink-100 dark:bg-pink-950/20 rounded-xl text-pink-600 dark:text-pink-400">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">
                    Daily Guidance
                  </h3>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                    Morning affirmation card & goal setting
                  </p>
                </div>
              </div>

              {/* Badges/Category */}
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${getCategoryColor(currentQuote.category)}`}>
                  {currentQuote.category}
                </span>
              </div>
            </div>

            {/* Quote display */}
            <div className={`relative px-4 py-2 transition-all duration-300 ${animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              <Quote className="absolute top-0 left-0 w-8 h-8 text-gray-100 dark:text-gray-700/80 -translate-x-1 -translate-y-2 pointer-events-none" />
              <p className="text-sm md:text-base font-semibold italic text-gray-700 dark:text-gray-300 relative z-10 leading-relaxed tracking-tight">
                {currentQuote.text}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">
                  — {currentQuote.author}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive controls */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleNextQuote}
              title="Next Affirmation"
              className="p-2.5 rounded-xl border border-gray-150 dark:border-gray-700 text-gray-500 hover:text-pink-600 hover:border-pink-200 dark:text-gray-400 dark:hover:text-pink-400 dark:hover:border-pink-900/35 transition active:scale-95 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${animating ? 'animate-spin' : ''}`} />
              <span className="text-[10px] font-black uppercase tracking-wider px-0.5">Refresh</span>
            </button>

            <button
              onClick={handleCopy}
              title="Copy Affirmation"
              className="p-2.5 rounded-xl border border-gray-150 dark:border-gray-700 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:border-indigo-900/35 transition active:scale-95 flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[10px] font-black uppercase tracking-wider px-0.5">
                {copied ? 'Copied' : 'Copy Share'}
              </span>
            </button>

            <button
              onClick={() => setIsLiked(!isLiked)}
              title="Bookmark Affirmation"
              className={`p-2.5 rounded-xl border transition active:scale-95 flex items-center gap-1.5 ${
                isLiked
                  ? 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/25 dark:border-rose-900/40 dark:text-rose-400'
                  : 'border-gray-150 dark:border-gray-700 text-gray-500 hover:text-rose-500 hover:border-rose-200 dark:text-gray-400 dark:hover:text-rose-400'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current animate-bounce' : ''}`} />
              <span className="text-[10px] font-black uppercase tracking-wider px-0.5">
                {isLiked ? 'Saved' : 'Love'}
              </span>
            </button>
          </div>
        </div>

        {/* Actionable Focus / Mindset Intent scratchpad */}
        <div className="bg-gradient-to-br from-indigo-50/50 via-gray-50/40 to-pink-50/20 dark:from-indigo-950/10 dark:via-gray-900/10 dark:to-pink-950/5 p-5 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/25 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black uppercase text-indigo-900 dark:text-indigo-300 tracking-wider flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              My Daily Career Intent
            </h4>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider leading-tight mb-4">
              Write one commitment or goal for today to ground your career journey.
            </p>
            <input
              type="text"
              slot="intent"
              value={dailyIntent}
              onChange={handleIntentChange}
              placeholder="e.g. Code for 30 minutes, update LinkedIn, learn React..."
              className="w-full bg-white dark:bg-gray-800 text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-505 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner"
            />
          </div>
          <div className="mt-4 pt-3 border-t border-indigo-100/30 dark:border-indigo-900/20 flex items-center justify-between text-[10px] text-gray-400 font-black uppercase tracking-wider">
            <span>Progress Lock-in</span>
            <span className="text-indigo-600 dark:text-indigo-400">
              {dailyIntent.trim() ? "Intent Locked" : "Awaiting Input"}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
