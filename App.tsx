import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, Priority, Note, Theme } from './types';
import * as storage from './services/storageService';
import TaskBoard from './components/TaskBoard';
import Stats from './components/Stats';
import ZenArea from './components/ZenArea';
import NotesArea from './components/NotesArea';
import Clock from './components/Clock';
import { Moon, Cpu, Layout, Settings, PanelLeft, Menu, X, Coffee, StickyNote, Download, Upload, Database, Palette, Check } from 'lucide-react';

// Define theme color mappings
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
  },
  dracula: {
    '--color-night-950': '#0F111A', // Darker background
    '--color-night-900': '#191B26',
    '--color-night-800': '#232532',
    '--color-night-700': '#2D2F3E',
    '--color-neon-green': '#89DDFF', // Cyan-ish for success
    '--color-neon-purple': '#C792EA', // Lavender
    '--color-neon-blue': '#82AAFF', // Soft Blue
    '--color-neon-red': '#F07178', // Soft Red
  },
  amber: {
    '--color-night-950': '#120f0a', // Brownish black
    '--color-night-900': '#1c1612',
    '--color-night-800': '#2b211a',
    '--color-night-700': '#3d2e24',
    '--color-neon-green': '#f59e0b', // Amber-500
    '--color-neon-purple': '#d97706', // Amber-600
    '--color-neon-blue': '#fbbf24', // Amber-400
    '--color-neon-red': '#ef4444', // Red stays red for error
  }
};

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [theme, setTheme] = useState<Theme>('cyberpunk');
  const [activeTab, setActiveTab] = useState<'board' | 'stats' | 'zen' | 'notes' | 'config'>('board');
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Desktop state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile state

  useEffect(() => {
    const loaded = storage.loadFromLocal();
    setTasks(loaded.tasks);
    setNotes(loaded.notes);
    setTheme(loaded.theme);
  }, []);

  useEffect(() => {
    storage.saveToLocal(tasks, notes, theme);
  }, [tasks, notes, theme]);

  // Apply Theme CSS Variables
  useEffect(() => {
    const root = document.documentElement;
    const themeColors = THEMES[theme];
    if (themeColors) {
      Object.entries(themeColors).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }, [theme]);

  // --- Task Handlers ---
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

  // --- Note Handlers ---
  const handleAddNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      content: '',
      tags: [],
      color: 'neutral',
      createdAt: Date.now(),
    };
    // Add to beginning of list
    setNotes(prev => [newNote, ...prev]);
  };

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleReorderNotes = (startIndex: number, endIndex: number) => {
    setNotes(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  // --- Data Handlers ---
  const handleExport = () => {
    storage.exportToJson(tasks, notes);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setFileError(null);
      const importedData = await storage.importFromJson(file);
      setTasks(importedData.tasks);
      setNotes(importedData.notes);
      // Reset input
      e.target.value = '';
      if (window.innerWidth < 768) setIsMobileMenuOpen(false); // Close mobile menu after import
    } catch (err) {
      setFileError('Invalid JSON file');
      console.error(err);
    }
  };

  const SidebarContent = () => (
    <>
      <div className="w-full shrink-0"> 
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-mono font-bold text-white tracking-tighter flex items-center gap-2">
              <Moon className="text-neon-blue" size={20} />
              <span>NIGHT_SHIFT</span>
            </h1>
            <p className="text-[10px] text-gray-500 mt-2 font-mono">v1.3.1 // SYSTEM_ACTIVE</p>
          </div>
          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          <button 
            onClick={() => { setActiveTab('board'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all ${activeTab === 'board' ? 'bg-gray-800 text-white border-l-2 border-neon-green' : 'text-gray-500 hover:text-white hover:bg-gray-800/50'}`}
          >
            <Layout size={18} />
            <span className="font-medium tracking-wide">Work Board</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('notes'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all ${activeTab === 'notes' ? 'bg-gray-800 text-white border-l-2 border-neon-blue' : 'text-gray-500 hover:text-white hover:bg-gray-800/50'}`}
          >
            <StickyNote size={18} />
            <span className="font-medium tracking-wide">Notepad</span>
          </button>

          <button 
            onClick={() => { setActiveTab('stats'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all ${activeTab === 'stats' ? 'bg-gray-800 text-white border-l-2 border-neon-purple' : 'text-gray-500 hover:text-white hover:bg-gray-800/50'}`}
          >
            <Cpu size={18} />
            <span className="font-medium tracking-wide">Metrics</span>
          </button>
          <button 
            onClick={() => { setActiveTab('zen'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all ${activeTab === 'zen' ? 'bg-gray-800 text-white border-l-2 border-neon-red' : 'text-gray-500 hover:text-white hover:bg-gray-800/50'}`}
          >
            <Coffee size={18} />
            <span className="font-medium tracking-wide">Zen Area</span>
          </button>

          <div className="pt-4 mt-4 border-t border-gray-800/50">
            <button 
              onClick={() => { setActiveTab('config'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all ${activeTab === 'config' ? 'bg-gray-800 text-white border-l-2 border-gray-400' : 'text-gray-500 hover:text-white hover:bg-gray-800/50'}`}
            >
              <Settings size={18} />
              <span className="font-medium tracking-wide">Config</span>
            </button>
          </div>
        </nav>
      </div>

      <div className="w-full shrink-0 p-6 border-t border-gray-800">
          <p className="text-xs text-gray-600 font-mono text-center opacity-70 hover:opacity-100 transition-opacity">
            Dev By: <span className="text-neon-blue">@Davi.develop</span>
          </p>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-night-950 text-gray-300 font-sans selection:bg-neon-green/30 selection:text-white overflow-hidden transition-colors duration-500">
      
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Responsive) */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 bg-night-900 border-r border-gray-800 flex flex-col justify-between transition-all duration-300 ease-in-out overflow-hidden
          w-72 
          ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl shadow-neon-green/10' : '-translate-x-full'}
          md:relative md:translate-x-0 md:shadow-none
          ${isSidebarOpen ? 'md:w-72' : 'md:w-0 md:border-r-0'}
        `}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative w-full">
        {/* Top Header */}
        <header className="h-16 border-b border-gray-800 bg-night-900/80 backdrop-blur flex items-center justify-between px-4 md:px-6 shrink-0 z-20 relative">
          <div className="flex items-center gap-4">
             {/* Desktop Toggle */}
             <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden md:flex p-2 -ml-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                title="Toggle Sidebar"
             >
               <PanelLeft size={20} />
             </button>

             {/* Mobile Menu Toggle */}
             <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 -ml-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
             >
               <Menu size={20} />
             </button>

             <div className="h-4 w-px bg-gray-700 hidden md:block"></div>
             <span className="text-sm text-gray-400 font-mono truncate uppercase">
               {activeTab === 'board' ? 'TASKS_OVERVIEW' : 
                activeTab === 'notes' ? 'DEV_SCRATCHPAD' : 
                activeTab === 'stats' ? 'SYSTEM_ANALYTICS' : 
                activeTab === 'config' ? 'SYSTEM_CONFIG' : 'ZEN_MODE_ACTIVE'}
             </span>
          </div>
          <Clock />
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden p-4 md:p-6 bg-night-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-night-800 via-night-950 to-night-950 relative z-0">
           {activeTab === 'board' && (
             <TaskBoard 
              tasks={tasks}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
             />
           )}
           
           {activeTab === 'notes' && (
             <NotesArea 
               notes={notes}
               onAddNote={handleAddNote}
               onUpdateNote={handleUpdateNote}
               onDeleteNote={handleDeleteNote}
               onReorderNotes={handleReorderNotes}
             />
           )}
           
           {activeTab === 'stats' && (
             <div className="max-w-4xl mx-auto space-y-6 overflow-y-auto h-full pr-2 custom-scrollbar">
               <h2 className="text-2xl font-bold text-white">Productivity Metrics</h2>
               <Stats tasks={tasks} />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-night-800 rounded border border-gray-800">
                    <h3 className="text-gray-400 font-mono text-xs uppercase mb-1">Pending</h3>
                    <p className="text-3xl text-blue-400 font-mono">{tasks.filter(t => t.status === TaskStatus.TODO).length}</p>
                  </div>
                  <div className="p-4 bg-night-800 rounded border border-gray-800">
                    <h3 className="text-gray-400 font-mono text-xs uppercase mb-1">Completed</h3>
                    <p className="text-3xl text-neon-green font-mono">{tasks.filter(t => t.status === TaskStatus.DONE).length}</p>
                  </div>
               </div>
             </div>
           )}

           {activeTab === 'zen' && <ZenArea />}

           {activeTab === 'config' && (
             <div className="max-w-3xl mx-auto space-y-8 p-6 overflow-y-auto h-full custom-scrollbar">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Settings className="text-gray-400" />
                    System Configuration
                  </h2>
                  <p className="text-gray-500 mt-2 font-mono text-sm">Manage your local data and system preferences.</p>
                </div>

                {/* Theme Selection */}
                <div className="bg-night-900 border border-gray-800 rounded-lg p-6 space-y-6">
                  <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
                    <Palette className="text-neon-purple" size={20} />
                    <h3 className="font-bold text-white">Interface Theme</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <button
                      onClick={() => setTheme('cyberpunk')}
                      className={`group relative p-4 rounded-lg border flex flex-col items-center gap-3 transition-all ${theme === 'cyberpunk' ? 'bg-night-800 border-neon-green shadow-[0_0_15px_rgba(0,255,157,0.1)]' : 'bg-night-800/50 border-gray-700 hover:bg-night-800 hover:border-gray-500'}`}
                     >
                       <div className="w-full h-12 rounded bg-[#050505] border border-gray-800 flex items-center justify-center gap-2 overflow-hidden">
                          <div className="w-2 h-2 rounded-full bg-[#00ff9d]"></div>
                          <div className="w-2 h-2 rounded-full bg-[#bd00ff]"></div>
                          <div className="w-2 h-2 rounded-full bg-[#00d0ff]"></div>
                       </div>
                       <span className="font-mono text-sm text-gray-300 group-hover:text-white">NIGHT_SHIFT</span>
                       {theme === 'cyberpunk' && <div className="absolute top-2 right-2 text-neon-green"><Check size={14} /></div>}
                     </button>

                     <button
                      onClick={() => setTheme('dracula')}
                      className={`group relative p-4 rounded-lg border flex flex-col items-center gap-3 transition-all ${theme === 'dracula' ? 'bg-[#191B26] border-neon-purple shadow-[0_0_15px_rgba(189,147,249,0.1)]' : 'bg-[#191B26]/50 border-gray-700 hover:bg-[#191B26] hover:border-gray-500'}`}
                     >
                       <div className="w-full h-12 rounded bg-[#0F111A] border border-gray-700 flex items-center justify-center gap-2 overflow-hidden">
                          <div className="w-2 h-2 rounded-full bg-[#89DDFF]"></div>
                          <div className="w-2 h-2 rounded-full bg-[#C792EA]"></div>
                          <div className="w-2 h-2 rounded-full bg-[#F07178]"></div>
                       </div>
                       <span className="font-mono text-sm text-gray-300 group-hover:text-white">DRACULA_VIBE</span>
                       {theme === 'dracula' && <div className="absolute top-2 right-2 text-neon-purple"><Check size={14} /></div>}
                     </button>

                     <button
                      onClick={() => setTheme('amber')}
                      className={`group relative p-4 rounded-lg border flex flex-col items-center gap-3 transition-all ${theme === 'amber' ? 'bg-[#1c1612] border-neon-green shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-[#1c1612]/50 border-gray-700 hover:bg-[#1c1612] hover:border-gray-500'}`}
                     >
                       <div className="w-full h-12 rounded bg-[#120f0a] border border-[#2b211a] flex items-center justify-center gap-2 overflow-hidden">
                          <div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div>
                          <div className="w-2 h-2 rounded-full bg-[#d97706]"></div>
                          <div className="w-2 h-2 rounded-full bg-[#fbbf24]"></div>
                       </div>
                       <span className="font-mono text-sm text-gray-300 group-hover:text-white">RETRO_AMBER</span>
                       {theme === 'amber' && <div className="absolute top-2 right-2 text-neon-green"><Check size={14} /></div>}
                     </button>
                  </div>
                </div>

                <div className="bg-night-900 border border-gray-800 rounded-lg p-6 space-y-6">
                  <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
                    <Database className="text-neon-blue" size={20} />
                    <h3 className="font-bold text-white">Data Management</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Export Section */}
                    <div className="space-y-3">
                      <label className="text-xs text-gray-400 uppercase font-mono tracking-wider">Backup Data</label>
                      <button 
                        onClick={handleExport}
                        className="w-full flex items-center justify-center gap-2 px-4 py-6 bg-night-800 border border-gray-700 hover:border-neon-green hover:bg-night-800/80 text-gray-300 hover:text-white rounded-lg transition-all group"
                      >
                        <Download size={24} className="text-gray-500 group-hover:text-neon-green transition-colors" />
                        <span className="font-mono">Export JSON</span>
                      </button>
                      <p className="text-[10px] text-gray-600">Download a local copy of all tasks and notes.</p>
                    </div>

                    {/* Import Section */}
                    <div className="space-y-3">
                      <label className="text-xs text-gray-400 uppercase font-mono tracking-wider">Restore Data</label>
                      <div className="relative group w-full">
                        <input 
                          type="file" 
                          accept=".json"
                          onChange={handleImport}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />
                        <button 
                          className="w-full flex items-center justify-center gap-2 px-4 py-6 bg-night-800 border border-gray-700 group-hover:border-neon-red group-hover:bg-night-800/80 text-gray-300 group-hover:text-white rounded-lg transition-all"
                        >
                          <Upload size={24} className="text-gray-500 group-hover:text-neon-red transition-colors" />
                          <span className="font-mono">Import JSON</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-600">
                        {fileError ? <span className="text-neon-red">{fileError}</span> : "Restore from a previously exported file."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-night-900 border border-gray-800 rounded-lg p-6">
                   <div className="text-center space-y-2">
                     <p className="text-xs font-mono text-gray-500 uppercase">Application Version</p>
                     <p className="text-white font-bold">NIGHT_SHIFT v1.3.1</p>
                     <p className="text-xs text-gray-600">Local Storage Only • No Cloud Sync</p>
                   </div>
                </div>
             </div>
           )}
        </div>
        
        {/* Overlay Gradients */}
        <div className="absolute pointer-events-none inset-0 bg-gradient-to-t from-night-950 via-transparent to-transparent opacity-50 z-10"></div>
      </main>
    </div>
  );
};

export default App;