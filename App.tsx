
import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus, Priority, Note, Theme, PomodoroSession, AppState, CaffeineEntry, CodeSnippet } from './types';
import * as storage from './services/storageService';
import TaskBoard from './components/TaskBoard';
import Stats from './components/Stats';
import ZenArea from './components/ZenArea';
import NotesArea from './components/NotesArea';
import SnippetVault from './components/SnippetVault';
import Clock from './components/Clock';
import { 
  Moon, Cpu, Layout, Settings, PanelLeft, Menu, X, Coffee, StickyNote, 
  Download, Upload, Database, Palette, Check, Zap, Image as ImageIcon, 
  RefreshCw, Globe, Sun, Terminal, Activity, ChevronRight, Code, Eye
} from 'lucide-react';

const THEMES: Record<Theme, Record<string, string>> = {
  night_shift: {
    '--color-night-950': '#020202',
    '--color-night-900': '#080808',
    '--color-night-800': '#111111',
    '--color-night-700': '#1a1a1a',
    '--color-neon-green': '#FFFFFF',
    '--color-neon-purple': '#555555',
    '--color-neon-blue': '#222222', // Glow acromático suave
    '--color-neon-red': '#ff0033',
    '--text-main': '#d1d1d1',
  },
  cyberpunk: {
    '--color-night-950': '#050505',
    '--color-night-900': '#0a0a0c',
    '--color-night-800': '#121214',
    '--color-night-700': '#1c1c1f',
    '--color-neon-green': '#ffee00',
    '--color-neon-purple': '#ff00ea',
    '--color-neon-blue': '#00f2ff',
    '--color-neon-red': '#ff003c',
    '--text-main': '#e5e5e5',
  },
  dracula: {
    '--color-night-950': '#0F111A',
    '--color-night-900': '#191B26',
    '--color-night-800': '#232532',
    '--color-night-700': '#2D2F3E',
    '--color-neon-green': '#89DDFF',
    '--color-neon-purple': '#C792EA',
    '--color-neon-blue': '#82AAFF',
    '--color-neon-red': '#F07178',
    '--text-main': '#e5e5e5',
  },
  amber: {
    '--color-night-950': '#120f0a',
    '--color-night-900': '#1c1612',
    '--color-night-800': '#2b211a',
    '--color-night-700': '#3d2e24',
    '--color-neon-green': '#f59e0b',
    '--color-neon-purple': '#d97706',
    '--color-neon-blue': '#fbbf24',
    '--color-neon-red': '#ef4444',
    '--text-main': '#e5e5e5',
  },
  paper: {
    '--color-night-950': '#fcfaf2',
    '--color-night-900': '#f5f2e8',
    '--color-night-800': '#e8e4d5',
    '--color-night-700': '#dcd7c5',
    '--color-neon-green': '#2b2b2b',
    '--color-neon-purple': '#5d5d5d',
    '--color-neon-blue': '#4a6b8a',
    '--color-neon-red': '#a63d40',
    '--text-main': '#1a1a1a',
  },
  lofi: {
    '--color-night-950': '#1a1c2c',
    '--color-night-900': '#292b3d',
    '--color-night-800': '#3e405a',
    '--color-night-700': '#5a5e78',
    '--color-neon-green': '#94e2d5',
    '--color-neon-purple': '#cba6f7',
    '--color-neon-blue': '#89b4fa',
    '--color-neon-red': '#f38ba8',
    '--text-main': '#cdd6f4',
  }
};

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([]);
  const [caffeineLog, setCaffeineLog] = useState<CaffeineEntry[]>([]);
  const [theme, setTheme] = useState<Theme>('night_shift');
  const [bgConfig, setBgConfig] = useState<AppState['backgroundConfig']>({ url: '', opacity: 0.3, blur: 0, showRadialGradient: true });
  const [toolsConfig, setToolsConfig] = useState<AppState['toolsConfig']>({ showCaffeineCounter: false });
  const [activeTab, setActiveTab] = useState<'board' | 'stats' | 'zen' | 'notes' | 'snippets' | 'config'>('board');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCaffeineModal, setShowCaffeineModal] = useState(false);

  useEffect(() => {
    const loaded = storage.loadFromLocal();
    setTasks(loaded.tasks);
    setNotes(loaded.notes);
    setSnippets(loaded.snippets);
    setTheme(loaded.theme);
    setPomodoroSessions(loaded.pomodoroSessions);
    setBgConfig(loaded.backgroundConfig);
    setCaffeineLog(loaded.caffeineLog);
    setToolsConfig(loaded.toolsConfig);
  }, []);

  useEffect(() => {
    storage.saveToLocal(tasks, notes, snippets, theme, pomodoroSessions, bgConfig, caffeineLog, toolsConfig);
  }, [tasks, notes, snippets, theme, pomodoroSessions, bgConfig, caffeineLog, toolsConfig]);

  useEffect(() => {
    const root = document.documentElement;
    const themeColors = THEMES[theme];
    if (themeColors) {
      Object.entries(themeColors).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
      if (theme === 'paper') {
        root.classList.remove('dark');
      } else {
        root.classList.add('dark');
      }
    }
  }, [theme]);

  const activeCaffeine = useMemo(() => {
    const now = Date.now();
    const halfLifeMs = 5 * 60 * 60 * 1000;
    return caffeineLog.reduce((total, entry) => {
      const elapsed = now - entry.timestamp;
      if (elapsed < 0) return total + entry.amount;
      const decay = Math.pow(0.5, elapsed / halfLifeMs);
      return total + entry.amount * decay;
    }, 0);
  }, [caffeineLog]);

  const peakTime = useMemo(() => {
    if (caffeineLog.length === 0) return null;
    const lastEntry = [...caffeineLog].sort((a, b) => b.timestamp - a.timestamp)[0];
    const peakAt = lastEntry.timestamp + (45 * 60 * 1000);
    if (Date.now() > peakAt) return "Past Peak";
    return new Date(peakAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [caffeineLog]);

  const handleLogCaffeine = (mg: number) => {
    const newEntry: CaffeineEntry = {
      id: crypto.randomUUID(),
      amount: mg,
      timestamp: Date.now(),
    };
    setCaffeineLog(prev => [...prev, newEntry]);
    setShowCaffeineModal(false);
  };

  const handleAddTask = (partialTask: Partial<Task>) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: partialTask.title || 'Untitled',
      description: '',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      createdAt: Date.now(),
      tags: [],
      ...partialTask,
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleAddSnippet = (partial: Partial<CodeSnippet>) => {
    const newSnippet: CodeSnippet = {
      id: crypto.randomUUID(),
      title: partial.title || 'Untitled Snippet',
      code: partial.code || '',
      language: partial.language || 'typescript',
      tags: partial.tags || [],
      createdAt: Date.now(),
    };
    setSnippets(prev => [newSnippet, ...prev]);
  };

  const fetchRandomBg = async () => {
    try {
      // Use the provided Wallpaper API concepts
      // Since it's a static repository, we can either point to its known raw content 
      // or use a high-quality generator with similar tags
      const randomId = Math.floor(Math.random() * 1000);
      const url = `https://picsum.photos/seed/${randomId}/1920/1080?grayscale`;
      setBgConfig(prev => ({ ...prev, url }));
    } catch (err) {
      console.error("Failed to fetch random wallpaper", err);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await storage.importFromJson(file);
      if (imported.tasks) setTasks(imported.tasks);
      if (imported.notes) setNotes(imported.notes);
      if (imported.snippets) setSnippets(imported.snippets);
      if (imported.theme) setTheme(imported.theme as Theme);
      if (imported.pomodoroSessions) setPomodoroSessions(imported.pomodoroSessions);
      if (imported.backgroundConfig) setBgConfig(imported.backgroundConfig);
      if (imported.caffeineLog) setCaffeineLog(imported.caffeineLog);
      if (imported.toolsConfig) setToolsConfig(imported.toolsConfig);
    } catch (err) {
      console.error('Import failed', err);
    }
  };

  const SidebarContent = () => (
    <div className="w-72 flex flex-col h-full shrink-0">
      <div className="p-6 border-b border-gray-800 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-xl font-mono font-bold text-[var(--text-main)] tracking-tighter flex items-center gap-2">
            <Moon className="text-gray-400" size={20} />
            <span>NIGHT_SHIFT</span>
          </h1>
          <p className="text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-widest">Dev Protocol Online</p>
        </div>
        <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>
      
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
        {[
          { id: 'board', label: 'Work Board', icon: Layout, color: 'border-white' },
          { id: 'notes', label: 'Notepad', icon: StickyNote, color: 'border-gray-500' },
          { id: 'snippets', label: 'Vault', icon: Code, color: 'border-gray-300' },
          { id: 'stats', label: 'Metrics', icon: Activity, color: 'border-gray-600' },
          { id: 'zen', label: 'Zen Area', icon: Coffee, color: 'border-gray-700' },
          { id: 'config', label: 'Config', icon: Settings, color: 'border-gray-800' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all ${activeTab === tab.id ? `bg-night-800 text-[var(--text-main)] border-l-2 ${tab.color}` : 'text-gray-500 hover:text-[var(--text-main)] hover:bg-night-800/50'}`}
          >
            <tab.icon size={18} />
            <span className="font-medium tracking-wide">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-gray-800 shrink-0">
          <p className="text-xs text-gray-600 font-mono text-center opacity-70">
            Dev: <span className="text-white">@Davi.develop</span>
          </p>
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen bg-night-950 text-[var(--text-main)] font-sans selection:bg-white/10 selection:text-white overflow-hidden transition-colors duration-500 relative`}>
      
      {bgConfig.url && (
        <div 
          className="fixed inset-0 pointer-events-none z-0 transition-all duration-700"
          style={{ 
            backgroundImage: `url(${bgConfig.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: bgConfig.opacity,
            filter: `blur(${bgConfig.blur}px)`
          }}
        />
      )}

      {/* Ambient Radial Glow Layer */}
      <div 
        className="fixed inset-0 pointer-events-none z-1 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% -10%, var(--color-neon-blue) 0%, transparent 70%)`,
          mixBlendMode: 'screen',
          opacity: bgConfig.showRadialGradient ? 0.3 : 0
        }}
      />

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 bg-night-900/95 border-r border-gray-800 flex flex-col transition-all duration-300 backdrop-blur-sm overflow-hidden ${isMobileMenuOpen ? 'w-72 translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 ${isSidebarOpen ? 'md:w-72' : 'md:w-0 md:border-r-0'}`}>
        <SidebarContent />
      </aside>

      <main className="flex-1 flex flex-col h-full relative w-full z-10 bg-transparent min-w-0">
        <header className="h-16 border-b border-gray-800 bg-night-900/40 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shrink-0 z-20">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex p-2 hover:bg-gray-800 rounded transition-colors" title="Toggle Sidebar"><PanelLeft size={20} /></button>
             <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 hover:bg-gray-800 rounded"><Menu size={20} /></button>
             <div className="h-4 w-px bg-gray-700 hidden md:block"></div>
             <span className="text-sm text-gray-400 font-mono truncate uppercase tracking-tighter">{activeTab}_SESSION</span>
          </div>
          
          <div className="flex items-center gap-4 md:gap-8">
            {toolsConfig.showCaffeineCounter && (
              <div 
                onClick={() => setShowCaffeineModal(true)}
                className="hidden sm:flex items-center gap-3 px-3 py-1 bg-night-800/50 border border-gray-700 rounded-full cursor-pointer hover:border-white transition-all group"
              >
                <Coffee size={14} className="text-gray-400 group-hover:text-white" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono leading-none text-gray-500 uppercase">Active_Caff</span>
                  <span className="text-xs font-mono font-bold text-white">{Math.round(activeCaffeine)}<span className="text-[9px] text-gray-500 ml-0.5">mg</span></span>
                </div>
                {peakTime && peakTime !== "Past Peak" && (
                   <div className="h-4 w-px bg-gray-700 mx-1"></div>
                )}
                {peakTime && peakTime !== "Past Peak" && (
                   <div className="flex flex-col">
                    <span className="text-[9px] font-mono leading-none text-gray-500 uppercase">Peak</span>
                    <span className="text-xs font-mono font-bold text-gray-300">{peakTime}</span>
                  </div>
                )}
              </div>
            )}
            <Clock />
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-4 md:p-6 relative z-0">
           {activeTab === 'board' && <TaskBoard tasks={tasks} onAddTask={handleAddTask} onUpdateTask={t => setTasks(prev => prev.map(old => old.id === t.id ? t : old))} onDeleteTask={id => setTasks(prev => prev.filter(t => t.id !== id))} />}
           {activeTab === 'notes' && <NotesArea notes={notes} onAddNote={() => setNotes(prev => [{ id: crypto.randomUUID(), content: '', tags: [], color: 'neutral', createdAt: Date.now() }, ...prev])} onUpdateNote={n => setNotes(prev => prev.map(old => old.id === n.id ? n : old))} onDeleteNote={id => setNotes(prev => prev.filter(n => n.id !== id))} onReorderNotes={(s, e) => setNotes(prev => { const r = Array.from(prev); const [rem] = r.splice(s, 1); r.splice(e, 0, rem); return r; })} />}
           {activeTab === 'snippets' && <SnippetVault snippets={snippets} onAddSnippet={handleAddSnippet} onUpdateSnippet={s => setSnippets(prev => prev.map(old => old.id === s.id ? s : old))} onDeleteSnippet={id => setSnippets(prev => prev.filter(s => s.id !== id))} />}
           {activeTab === 'stats' && (
             <div className="max-w-4xl mx-auto space-y-6 overflow-y-auto h-full pr-2 custom-scrollbar pb-10">
               <h2 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">System Metrics</h2>
               <Stats tasks={tasks} pomodoroSessions={pomodoroSessions} />
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="p-4 bg-night-900/60 backdrop-blur-md rounded border border-gray-800">
                    <h3 className="text-gray-400 font-mono text-[10px] uppercase mb-1">Tasks Pending</h3>
                    <p className="text-2xl text-white font-mono">{tasks.filter(t => t.status !== TaskStatus.DONE).length}</p>
                 </div>
                 <div className="p-4 bg-night-900/60 backdrop-blur-md rounded border border-gray-800">
                    <h3 className="text-gray-400 font-mono text-[10px] uppercase mb-1">Tasks Completed</h3>
                    <p className="text-2xl text-white font-mono">{tasks.filter(t => t.status === TaskStatus.DONE).length}</p>
                 </div>
                 <div className="p-4 bg-night-900/60 backdrop-blur-md rounded border border-gray-800 flex justify-between items-center">
                    <div>
                      <h3 className="text-gray-400 font-mono text-[10px] uppercase mb-1">Total Focus</h3>
                      <p className="text-2xl text-white font-mono">{pomodoroSessions.reduce((a, b) => a + b.durationMinutes, 0)} min</p>
                    </div>
                    <Zap className="text-gray-600 opacity-30" />
                 </div>
               </div>
             </div>
           )}
           {activeTab === 'zen' && <ZenArea onSessionComplete={m => setPomodoroSessions(prev => [...prev, { id: crypto.randomUUID(), timestamp: Date.now(), durationMinutes: m }])} />}
           {activeTab === 'config' && (
             <div className="max-w-3xl mx-auto space-y-8 p-6 overflow-y-auto h-full custom-scrollbar pb-20">
                
                {/* Tools Section */}
                <div className="bg-night-900/60 backdrop-blur-md border border-gray-800 rounded-lg p-6 space-y-6">
                  <div className="flex items-center gap-3 border-b border-gray-800 pb-4"><Terminal className="text-gray-400" size={20} /><h3 className="font-bold text-[var(--text-main)] uppercase tracking-widest text-sm">System Tools</h3></div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-night-800/30 border border-gray-700 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${toolsConfig.showCaffeineCounter ? 'bg-white/10 text-white' : 'bg-gray-800 text-gray-600'}`}>
                          <Coffee size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white uppercase font-mono tracking-tight">Caffeine Counter</p>
                          <p className="text-[10px] text-gray-500 font-mono">Monitor consumption and peak focus windows.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setToolsConfig(prev => ({ ...prev, showCaffeineCounter: !prev.showCaffeineCounter }))}
                        className={`w-12 h-6 rounded-full transition-all relative ${toolsConfig.showCaffeineCounter ? 'bg-white' : 'bg-gray-700'}`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-all ${toolsConfig.showCaffeineCounter ? 'bg-black translate-x-6' : 'bg-white translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Theme Section */}
                <div className="bg-night-900/60 backdrop-blur-md border border-gray-800 rounded-lg p-6 space-y-6">
                  <div className="flex items-center gap-3 border-b border-gray-800 pb-4"><Palette className="text-gray-400" size={20} /><h3 className="font-bold text-[var(--text-main)] uppercase tracking-widest text-sm">Interface Theme</h3></div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                     {(Object.keys(THEMES) as Theme[]).map(t => (
                       <button 
                        key={t} 
                        onClick={() => setTheme(t)} 
                        className={`group relative p-3 rounded border transition-all flex flex-col gap-2 ${theme === t ? 'bg-night-800/80 border-white/40 shadow-lg' : 'bg-night-800/20 border-gray-800/20 hover:border-gray-700'}`}
                       >
                         <div className="flex justify-between items-center">
                            <span className={`font-mono text-[9px] uppercase tracking-[0.2em] ${theme === t ? 'text-white' : 'text-gray-500 group-hover:text-gray-400'}`}>{t.replace('_', ' ')}</span>
                         </div>
                         <div className="flex gap-[1px] h-[2px] w-full bg-black/40 overflow-hidden rounded-full">
                           <div className="flex-1 opacity-80" style={{ background: THEMES[t]['--color-neon-green'] }} />
                           <div className="flex-1 opacity-80" style={{ background: THEMES[t]['--color-neon-purple'] }} />
                           <div className="flex-1 opacity-80" style={{ background: THEMES[t]['--color-neon-blue'] }} />
                         </div>
                       </button>
                     ))}
                  </div>
                </div>

                {/* Background Customizer with BLUR restored */}
                <div className="bg-night-900/60 backdrop-blur-md border border-gray-800 rounded-lg p-6 space-y-6">
                  <div className="flex items-center gap-3 border-b border-gray-800 pb-4"><ImageIcon className="text-gray-400" size={20} /><h3 className="font-bold text-[var(--text-main)] uppercase tracking-widest text-sm">Background Customizer</h3></div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-500 uppercase flex items-center gap-2"><Globe size={12}/> Image URL</label>
                        <input type="text" value={bgConfig.url} onChange={e => setBgConfig(prev => ({ ...prev, url: e.target.value }))} className="w-full bg-night-950/50 border border-gray-800 rounded px-3 py-2 text-xs focus:border-white focus:outline-none placeholder-gray-700 text-white font-mono" placeholder="https://..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-500 uppercase flex items-center gap-2"><RefreshCw size={12}/> Library</label>
                        <button onClick={fetchRandomBg} className="w-full flex items-center justify-center gap-2 bg-night-800 border border-gray-700 py-2 rounded text-xs hover:border-white transition-all text-gray-300 font-mono"><RefreshCw size={14}/> Randomize Library</button>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-800/50 space-y-6">
                      <div className="flex items-center justify-between p-3 bg-night-800/30 border border-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Sun size={18} className={bgConfig.showRadialGradient ? "text-white" : "text-gray-600"} />
                          <div>
                            <p className="text-xs font-bold text-white uppercase font-mono">Ambient Glow (Radial)</p>
                            <p className="text-[10px] text-gray-500 font-mono">Atmospheric lighting effect.</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setBgConfig(prev => ({ ...prev, showRadialGradient: !prev.showRadialGradient }))}
                          className={`w-12 h-6 rounded-full transition-all relative ${bgConfig.showRadialGradient ? 'bg-white' : 'bg-gray-700'}`}
                        >
                          <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-all ${bgConfig.showRadialGradient ? 'bg-black translate-x-6' : 'bg-white translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between text-[10px] font-mono uppercase text-gray-500"><span>Opacity</span><span>{Math.round(bgConfig.opacity * 100)}%</span></div>
                          <input type="range" min="0" max="1" step="0.01" value={bgConfig.opacity} onChange={e => setBgConfig(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))} className="w-full h-1 bg-night-800 rounded-lg appearance-none cursor-pointer accent-white" />
                        </div>

                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between text-[10px] font-mono uppercase text-gray-500"><span>Blur Effect</span><span>{Math.round(bgConfig.blur)}px</span></div>
                          <input type="range" min="0" max="20" step="1" value={bgConfig.blur} onChange={e => setBgConfig(prev => ({ ...prev, blur: parseInt(e.target.value) }))} className="w-full h-1 bg-night-800 rounded-lg appearance-none cursor-pointer accent-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-night-900/60 backdrop-blur-md border border-gray-800 rounded-lg p-6 space-y-6">
                  <div className="flex items-center gap-3 border-b border-gray-800 pb-4"><Database className="text-gray-400" size={20} /><h3 className="font-bold text-[var(--text-main)] uppercase tracking-widest text-sm">Data Management</h3></div>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => storage.exportToJson({ tasks, notes, snippets, pomodoroSessions, theme, backgroundConfig: bgConfig, caffeineLog, toolsConfig })} className="flex items-center justify-center gap-2 py-4 bg-night-800 border border-gray-700 rounded hover:border-white text-xs font-mono transition-colors text-gray-300"><Download size={18}/> Export Backup</button>
                    <div className="relative group"><input type="file" onChange={handleImport} className="absolute inset-0 opacity-0 cursor-pointer" /><div className="h-full flex items-center justify-center gap-2 py-4 bg-night-800 border border-gray-700 rounded group-hover:border-white text-xs font-mono transition-colors text-gray-300"><Upload size={18}/> Import Backup</div></div>
                  </div>
                </div>
             </div>
           )}
        </div>
        
        <div className="absolute pointer-events-none inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40 z-10" />
      </main>

      {showCaffeineModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-night-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-night-950/50">
               <div className="flex items-center gap-3">
                 <Coffee className="text-white" />
                 <h2 className="text-lg font-bold text-white font-mono uppercase tracking-tighter">Log_Caffeine</h2>
               </div>
               <button onClick={() => setShowCaffeineModal(false)} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest text-center mb-2">Select Infusion Type</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Espresso', mg: 80, icon: '☕' },
                  { label: 'Energy Drink', mg: 150, icon: '🔋' },
                  { label: 'Black Tea', mg: 40, icon: '🍵' },
                  { label: 'Soda/Cola', mg: 35, icon: '🥤' },
                ].map(item => (
                  <button 
                    key={item.label}
                    onClick={() => handleLogCaffeine(item.mg)}
                    className="flex flex-col items-center justify-center p-5 bg-night-800/40 border border-gray-800 rounded-xl hover:border-white hover:bg-night-800 transition-all group"
                  >
                    <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</span>
                    <span className="text-[11px] font-bold text-gray-200 uppercase tracking-tight">{item.label}</span>
                    <span className="text-[9px] text-gray-500 font-mono mt-1">{item.mg}mg</span>
                  </button>
                ))}
              </div>
              <div className="pt-4 border-t border-gray-800 mt-2">
                 <button 
                  onClick={() => setCaffeineLog([])}
                  className="w-full py-2 bg-red-900/10 text-red-500/80 border border-red-900/20 rounded-lg text-[9px] font-mono hover:bg-red-900/20 transition-all uppercase tracking-widest"
                 >
                   Clear_Infusion_History
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
