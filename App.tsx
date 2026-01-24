import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, Priority } from './types';
import * as storage from './services/storageService';
import TaskBoard from './components/TaskBoard';
import Stats from './components/Stats';
import ZenArea from './components/ZenArea';
import Clock from './components/Clock';
import { Moon, Cpu, Layout, Terminal, PanelLeft, Menu, X, Coffee } from 'lucide-react';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'board' | 'stats' | 'zen'>('board');
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Desktop state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile state

  useEffect(() => {
    const loaded = storage.loadFromLocal();
    setTasks(loaded);
  }, []);

  useEffect(() => {
    storage.saveToLocal(tasks);
  }, [tasks]);

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

  const handleExport = () => {
    storage.exportToJson(tasks);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setFileError(null);
      const importedTasks = await storage.importFromJson(file);
      setTasks(importedTasks);
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
            <p className="text-[10px] text-gray-500 mt-2 font-mono">v1.2.0 // SYSTEM_ACTIVE</p>
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
            onClick={() => { setActiveTab('stats'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all ${activeTab === 'stats' ? 'bg-gray-800 text-white border-l-2 border-neon-purple' : 'text-gray-500 hover:text-white hover:bg-gray-800/50'}`}
          >
            <Cpu size={18} />
            <span className="font-medium tracking-wide">Metrics</span>
          </button>
          <button 
            onClick={() => { setActiveTab('zen'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all ${activeTab === 'zen' ? 'bg-gray-800 text-white border-l-2 border-neon-blue' : 'text-gray-500 hover:text-white hover:bg-gray-800/50'}`}
          >
            <Coffee size={18} />
            <span className="font-medium tracking-wide">Zen Area</span>
          </button>
        </nav>
      </div>

      <div className="w-full shrink-0 p-6 border-t border-gray-800 space-y-4">
          <div className="space-y-2 w-full">
            <label className="flex items-center gap-2 text-xs text-gray-500 uppercase font-mono tracking-widest mb-2">
              <Terminal size={12} /> Data Sync
            </label>
            
            <div className="flex gap-2">
              <button 
                onClick={handleExport}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-900 border border-gray-700 hover:border-neon-blue text-xs text-gray-300 rounded transition-colors font-mono hover:text-white"
              >
                EXPORT
              </button>
              
              <div className="relative flex-1">
                <input 
                  type="file" 
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button 
                  className="w-full flex items-center justify-center px-3 py-2 bg-gray-900 border border-gray-700 hover:border-neon-red text-xs text-gray-300 rounded transition-colors font-mono hover:text-white"
                >
                  IMPORT
                </button>
              </div>
            </div>
            {fileError && <p className="text-neon-red text-[10px]">{fileError}</p>}
          </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-night-950 text-gray-300 font-sans selection:bg-neon-green/30 selection:text-white overflow-hidden">
      
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
             <span className="text-sm text-gray-400 font-mono truncate">
               {activeTab === 'board' ? 'TASKS_OVERVIEW' : activeTab === 'stats' ? 'SYSTEM_ANALYTICS' : 'ZEN_MODE_ACTIVE'}
             </span>
          </div>
          <Clock />
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden p-4 md:p-6 bg-night-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-night-950 to-night-950 relative z-0">
           {activeTab === 'board' && (
             <TaskBoard 
              tasks={tasks}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
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
        </div>
        
        {/* Overlay Gradients */}
        <div className="absolute pointer-events-none inset-0 bg-gradient-to-t from-night-950 via-transparent to-transparent opacity-50 z-10"></div>
      </main>
    </div>
  );
};

export default App;