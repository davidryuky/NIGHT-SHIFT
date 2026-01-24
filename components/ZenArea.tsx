import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Quote, Coffee, Brain, Zap, Maximize, Minimize } from 'lucide-react';

const TECH_QUOTES = [
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson" },
  { text: "The most damaging phrase in the language is 'We've always done it this way'.", author: "Grace Hopper" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", author: "Cory House" },
  { text: "It’s not a bug – it’s an undocumented feature.", author: "Anonymous" },
  { text: "One of the best programming skills you can have is knowing when to walk away for a while.", author: "Oscar Godson" }
];

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const TIMER_MODES: Record<TimerMode, { label: string; minutes: number; color: string; icon: any }> = {
  focus: { label: 'Deep Focus', minutes: 25, color: 'text-neon-red', icon: Zap },
  shortBreak: { label: 'Short Break', minutes: 5, color: 'text-neon-green', icon: Coffee },
  longBreak: { label: 'Long Break', minutes: 15, color: 'text-neon-blue', icon: Brain },
};

const ZenArea: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(TIMER_MODES.focus.minutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Optional: Play a sound here
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(TIMER_MODES[newMode].minutes * 60);
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(TIMER_MODES[mode].minutes * 60);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const nextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % TECH_QUOTES.length);
  };

  const CurrentIcon = TIMER_MODES[mode].icon;

  // Layout classes based on fullscreen state
  const containerClasses = isFullscreen
    ? "fixed inset-0 z-[100] bg-night-950 flex flex-col items-center justify-center p-6 space-y-12 transition-all duration-300 overflow-y-auto"
    : "max-w-4xl mx-auto h-full flex flex-col items-center justify-center p-6 space-y-12 transition-all duration-300";

  return (
    <div className={containerClasses}>
      
      {/* Pomodoro Section */}
      <div className="w-full max-w-md bg-night-900/50 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden group">
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${TIMER_MODES[mode].color.replace('text-', '')} to-transparent opacity-50`}></div>
        
        <div className="flex justify-center gap-4 mb-8">
          {(Object.keys(TIMER_MODES) as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-4 py-2 rounded-full text-xs font-mono transition-all border ${
                mode === m 
                  ? `bg-gray-800 text-white border-gray-600 shadow-[0_0_10px_rgba(255,255,255,0.1)]` 
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              {TIMER_MODES[m].label}
            </button>
          ))}
        </div>

        <div className="text-center mb-8 relative">
           <CurrentIcon size={24} className={`mx-auto mb-4 ${TIMER_MODES[mode].color} opacity-80`} />
           <div className={`text-8xl font-mono font-bold tracking-tighter ${TIMER_MODES[mode].color} drop-shadow-2xl`}>
             {formatTime(timeLeft)}
           </div>
           <p className="text-gray-500 text-sm font-mono mt-2 tracking-widest uppercase">
             {isActive ? 'System Active' : 'System Paused'}
           </p>
        </div>

        <div className="flex justify-center gap-6">
          <button 
            onClick={toggleTimer}
            className="p-4 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-all hover:scale-110 active:scale-95 border border-gray-700"
            title={isActive ? "Pause Timer" : "Start Timer"}
          >
            {isActive ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>
          
          <button 
            onClick={resetTimer}
            className="p-4 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95 border border-gray-700"
            title="Reset Timer"
          >
            <RotateCcw size={24} />
          </button>

          <button 
            onClick={toggleFullscreen}
            className="p-4 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95 border border-gray-700"
            title={isFullscreen ? "Exit Focus Mode" : "Enter Focus Mode"}
          >
            {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>
        </div>
      </div>

      {/* Quote Section */}
      <div className="w-full max-w-2xl text-center space-y-6">
        <div className="relative p-8 rounded-xl bg-night-800/30 border border-dashed border-gray-800 hover:border-gray-700 transition-colors">
          <Quote className="absolute top-4 left-4 text-gray-700 opacity-50" size={32} />
          <p className="text-xl md:text-2xl font-light text-gray-300 leading-relaxed font-sans italic">
            "{TECH_QUOTES[quoteIndex].text}"
          </p>
          <p className="mt-4 text-neon-purple font-mono text-sm tracking-wider">
            — {TECH_QUOTES[quoteIndex].author}
          </p>
        </div>
        
        <button 
          onClick={nextQuote}
          className="text-xs text-gray-600 hover:text-neon-green transition-colors font-mono uppercase tracking-widest"
        >
          [ Generate New Wisdom ]
        </button>
      </div>

    </div>
  );
};

export default ZenArea;