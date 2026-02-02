import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, Priority, Note, Theme, PomodoroSession, AppState } from './types';
import * as storage from './services/storageService';
import TaskBoard from './components/TaskBoard';
import Stats from './components/Stats';
import ZenArea from './components/ZenArea';
import NotesArea from './components/NotesArea';
import Clock from './components/Clock';
import { 
  Moon, Cpu, Layout, Settings, PanelLeft, Menu, X, Coffee, StickyNote, 
  Download, Upload, Database, Palette, Check, Zap, Image as ImageIcon, 
  RefreshCw, Globe, Sun
} from 'lucide-react';

const THEMES: Record<Theme, Record<string, string>> = {
  cyberpunk: {
    '--color-night-950': '#050505',
    '--color-night-900': '#0a0a0c',
    '--color-night-800': '#121214',
    '--color-night-700': '#1c1c1f',
    '--color-neon-green': '#00ff9d',
    '--color-neon-purple': '#bd00ff',
    '--color-neon-blue': '#00d0ff',
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
  gamer: {
    '--color-night-950': '#000000',
    '--color-night-900': '#050505',
    '--color-night-800': '#0a0a0a',
    '--color-night-700': '#111111',
    '--color-neon-green': '#39ff14',
    '--color-neon-purple': '#ff00ff',
    '--color-neon-blue': '#00ffff',
    '--color-neon-red': '#ff0000',
    '--text-main': '#ffffff',
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
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([]);
  const [theme, setTheme] = useState<Theme>('cyberpunk');
  const [bgConfig, setBgConfig] = useState<AppState['backgroundConfig']>({ url: '', opacity: 0.3, blur: 0, showRadialGradient: true });
  const [activeTab, setActiveTab] = useState<'board' | 'stats' | 'zen' | 'notes' | 'config'>('board');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loaded = storage.loadFromLocal();
    setTasks(loaded.tasks);
    setNotes(loaded.notes);
    setTheme(loaded.theme);
    setPomodoroSessions(loaded.pomodoroSessions);
    setBgConfig(loaded.backgroundConfig);
  }, []);

  useEffect(() => {
    storage.saveToLocal(tasks, notes, theme, pomodoroSessions, bgConfig);
  }, [tasks, notes, theme, pomodoroSessions, bgConfig]);

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

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
  };

  const handleSessionComplete = (durationMinutes: number) => {
    const newSession: PomodoroSession = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      durationMinutes,
    };
    setPomodoroSessions(prev => [...prev, newSession]);
  };

  const fetchRandomBg = async () => {
    try {
      const randomId = Math.floor(Math.random() * 1000);
      const url = `https://picsum.photos/seed/${randomId}/1920/1080?grayscale`;
      setBgConfig(prev => ({ ...prev, url }));
    } catch (err) {
      console.error("Failed to fetch random wallpaper", err);
    }
  };

  const handleBgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBgConfig(prev => ({ ...prev, url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await storage.importFromJson(file);
      if (imported.tasks) setTasks(imported.tasks);
      if (imported.notes) setNotes(imported.notes);
      if (imported.theme) setTheme(imported.theme as Theme);
      if (imported.backgroundConfig) setBgConfig(imported.backgroundConfig);
      e.target.value = '';
    } catch (err) {
      alert('Invalid backup file.');
    }
  };

  const SidebarContent = () => (
    <div className="w-72 flex flex-col h-full shrink-0">
      <div className="p-6 border-b border-gray-800 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-xl font-mono font-bold text-[var(--text-main)] tracking-tighter flex items-center gap-2">
            <Moon className="text-neon-blue" size={20} />
            <span>NIGHT_SHIFT</span>
          </h1>
          <p className="text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-widest">System Online</p>
        </div>
        <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>
      
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
        {[
          { id: 'board', label: 'Work Board', icon: Layout, color: 'border-neon-green' },
          { id: 'notes', label: 'Notepad', icon: StickyNote, color: 'border-neon-blue' },
          { id: 'stats', label: 'Metrics', icon: Cpu, color: 'border-neon-purple' },
          { id: 'zen', label: 'Zen Area', icon: Coffee, color: 'border-neon-red' },
          { id: 'config', label: 'Config', icon: Settings, color: 'border-gray-400' },
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
            Dev: <span className="text-neon-blue">@Davi.develop</span>
          </p>
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen bg-night-950 text-[var(--text-main)] font-sans selection:bg-neon-green/30 selection:text-white overflow-hidden transition-colors duration-500 relative`}>
      
      {/* 1. Background Image Layer */}
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

      {/* 2. Ambient Radial Glow Layer - Fixed logic for toggle */}
      <div 
        className="fixed inset-0 pointer-events-none z-1 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% -10%, var(--color-neon-blue) 0%, transparent 70%)`,
          mixBlendMode: 'screen',
          opacity: bgConfig.showRadialGradient ? 0.15 : 0
        }}
      />

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-night-900/90 md:bg-night-900/95 border-r border-gray-800 flex flex-col transition-all duration-300 backdrop-blur-sm overflow-hidden ${isMobileMenuOpen ? 'w-72 translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 ${isSidebarOpen ? 'md:w-72' : 'md:w-0 md:border-r-0'}`}>
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
          <Clock />
        </header>

        {/* 3. Main Content Wrapper */}
        <div className="flex-1 overflow-hidden p-4 md:p-6 relative z-0">
           {activeTab === 'board' && <TaskBoard tasks={tasks} onAddTask={handleAddTask} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />}
           {activeTab === 'notes' && <NotesArea notes={notes} onAddNote={() => setNotes(prev => [{ id: crypto.randomUUID(), content: '', tags: [], color: 'neutral', createdAt: Date.now() }, ...prev])} onUpdateNote={handleUpdateNote} onDeleteNote={(id) => setNotes(prev => prev.filter(n => n.id !== id))} onReorderNotes={(s, e) => setNotes(prev => { const r = Array.from(prev); const [rem] = r.splice(s, 1); r.splice(e, 0, rem); return r; })} />}
           {activeTab === 'stats' && (
             <div className="max-w-4xl mx-auto space-y-6 overflow-y-auto h-full pr-2 custom-scrollbar pb-10">
               <h2 className="text-2xl font-bold text-[var(--text-main)]">Productivity Metrics</h2>
               <Stats tasks={tasks} pomodoroSessions={pomodoroSessions} />
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="p-4 bg-night-900/60 backdrop-blur-md rounded border border-gray-800">
                    <h3 className="text-gray-400 font-mono text-[10px] uppercase mb-1">Tasks Pending</h3>
                    <p className="text-2xl text-neon-blue font-mono">{tasks.filter(t => t.status !== TaskStatus.DONE).length}</p>
                 </div>
                 <div className="p-4 bg-night-900/60 backdrop-blur-md rounded border border-gray-800">
                    <h3 className="text-gray-400 font-mono text-[10px] uppercase mb-1">Tasks Completed</h3>
                    <p className="text-2xl text-neon-green font-mono">{tasks.filter(t => t.status === TaskStatus.DONE).length}</p>
                 </div>
                 <div className="p-4 bg-night-900/60 backdrop-blur-md rounded border border-gray-800 flex justify-between items-center">
                    <div>
                      <h3 className="text-gray-400 font-mono text-[10px] uppercase mb-1">Total Focus</h3>
                      <p className="text-2xl text-neon-purple font-mono">{pomodoroSessions.reduce((a, b) => a + b.durationMinutes, 0)} min</p>
                    </div>
                    <Zap className="text-neon-purple opacity-30" />
                 </div>
               </div>
             </div>
           )}
           {activeTab === 'zen' && <ZenArea onSessionComplete={handleSessionComplete} />}
           {activeTab === 'config' && (
             <div className="max-w-3xl mx-auto space-y-8 p-6 overflow-y-auto h-full custom-scrollbar pb-20">
                <div className="bg-night-900/60 backdrop-blur-md border border-gray-800 rounded-lg p-6 space-y-6">
                  <div className="flex items-center gap-3 border-b border-gray-800 pb-4"><Palette className="text-neon-purple" size={20} /><h3 className="font-bold text-[var(--text-main)]">Interface Theme</h3></div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                     {(Object.keys(THEMES) as Theme[]).map(t => (
                       <button 
                        key={t} 
                        onClick={() => setTheme(t)} 
                        className={`group relative p-3 rounded border transition-all flex flex-col gap-2 ${theme === t ? 'bg-night-800/80 border-neon-blue shadow-[0_0_15px_rgba(0,208,255,0.05)]' : 'bg-night-800/20 border-gray-800/20 hover:border-gray-700'}`}
                       >
                         <div className="flex justify-between items-center">
                            <span className={`font-mono text-[9px] uppercase tracking-[0.2em] ${theme === t ? 'text-neon-blue' : 'text-gray-500 group-hover:text-gray-400'}`}>{t}</span>
                            {theme === t && <div className="w-1 h-1 rounded-full bg-neon-blue" />}
                         </div>
                         {/* Ultra-minimalist 2px thin line colors */}
                         <div className="flex gap-[1px] h-[2px] w-full bg-black/40 overflow-hidden rounded-full">
                           <div className="flex-1 opacity-80" style={{ background: THEMES[t]['--color-neon-green'] }} />
                           <div className="flex-1 opacity-80" style={{ background: THEMES[t]['--color-neon-purple'] }} />
                           <div className="flex-1 opacity-80" style={{ background: THEMES[t]['--color-neon-blue'] }} />
                         </div>
                       </button>
                     ))}
                  </div>
                </div>

                <div className="bg-night-900/60 backdrop-blur-md border border-gray-800 rounded-lg p-6 space-y-6">
                  <div className="flex items-center gap-3 border-b border-gray-800 pb-4"><ImageIcon className="text-neon-blue" size={20} /><h3 className="font-bold text-[var(--text-main)]">Background Customizer</h3></div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-500 uppercase flex items-center gap-2"><Globe size={12}/> Image URL</label>
                        <input type="text" value={bgConfig.url} onChange={e => setBgConfig(prev => ({ ...prev, url: e.target.value }))} className="w-full bg-night-950/50 border border-gray-800 rounded px-3 py-2 text-xs focus:border-neon-blue focus:outline-none placeholder-gray-700" placeholder="https://..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-500 uppercase flex items-center gap-2"><RefreshCw size={12}/> Library</label>
                        <button onClick={fetchRandomBg} className="w-full flex items-center justify-center gap-2 bg-night-800 border border-gray-700 py-2 rounded text-xs hover:border-neon-green transition-all"><RefreshCw size={14}/> Randomize from Library</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-500 uppercase flex items-center gap-2"><ImageIcon size={12}/> Physical Upload</label>
                        <div className="relative h-9">
                          <input type="file" accept="image/*" onChange={handleBgFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <div className="w-full h-full bg-night-800 border border-gray-700 flex items-center justify-center rounded text-xs font-mono text-gray-400">Select Local Image</div>
                        </div>
                      </div>
                      <div className="space-y-2 flex flex-col justify-end">
                        <button onClick={() => setBgConfig({ ...bgConfig, url: '' })} className="w-full py-2 bg-red-900/20 text-red-500 text-xs rounded border border-red-900/30 hover:bg-red-900/40 transition-all font-mono">CLEAR_BACKGROUND</button>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-800/50 space-y-4">
                      <div className="flex items-center justify-between p-3 bg-night-800/30 border border-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Sun size={18} className={bgConfig.showRadialGradient ? "text-neon-blue" : "text-gray-600"} />
                          <div>
                            <p className="text-xs font-bold text-white uppercase font-mono">Ambient Glow (Radial)</p>
                            <p className="text-[10px] text-gray-500 font-mono">Enable soft atmospheric lighting</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setBgConfig(prev => ({ ...prev, showRadialGradient: !prev.showRadialGradient }))}
                          className={`w-12 h-6 rounded-full transition-all relative ${bgConfig.showRadialGradient ? 'bg-neon-blue' : 'bg-gray-700'}`}
                        >
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${bgConfig.showRadialGradient ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-[10px] font-mono uppercase text-gray-500"><span>Opacity</span><span>{Math.round(bgConfig.opacity * 100)}%</span></div>
                        <input type="range" min="0" max="1" step="0.01" value={bgConfig.opacity} onChange={e => setBgConfig(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))} className="w-full h-1 bg-night-800 rounded-lg appearance-none cursor-pointer accent-neon-blue" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-[10px] font-mono uppercase text-gray-500"><span>Blur</span><span>{bgConfig.blur}px</span></div>
                        <input type="range" min="0" max="20" step="1" value={bgConfig.blur} onChange={e => setBgConfig(prev => ({ ...prev, blur: parseInt(e.target.value) }))} className="w-full h-1 bg-night-800 rounded-lg appearance-none cursor-pointer accent-neon-blue" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-night-900/60 backdrop-blur-md border border-gray-800 rounded-lg p-6 space-y-6">
                  <div className="flex items-center gap-3 border-b border-gray-800 pb-4"><Database className="text-neon-blue" size={20} /><h3 className="font-bold text-[var(--text-main)]">Data Management</h3></div>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => storage.exportToJson({ tasks, notes, pomodoroSessions, theme, backgroundConfig: bgConfig })} className="flex items-center justify-center gap-2 py-4 bg-night-800 border border-gray-700 rounded hover:border-neon-green text-xs font-mono transition-colors"><Download size={18}/> Export Backup</button>
                    <div className="relative group"><input type="file" onChange={handleImport} className="absolute inset-0 opacity-0 cursor-pointer" /><div className="h-full flex items-center justify-center gap-2 py-4 bg-night-800 border border-gray-700 rounded group-hover:border-neon-red text-xs font-mono transition-colors"><Upload size={18}/> Import Backup</div></div>
                  </div>
                </div>
             </div>
           )}
        </div>
        
        {/* Vignette Shadow Overlay */}
        <div className="absolute pointer-events-none inset-0 bg-gradient-to-t from-night-950 via-transparent to-transparent opacity-40 z-10" />
      </main>
    </div>
  );
};

export default App;