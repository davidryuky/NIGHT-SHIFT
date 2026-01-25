import React, { useState } from 'react';
import { Task, TaskStatus, Priority } from '../types';
import { Trash2, Hash, Clock, X, Save, Edit2, GripVertical, Maximize2, Circle, Loader2, Code2, CheckCircle2 } from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (task: Partial<Task>) => void;
}

const statusConfig = {
  [TaskStatus.TODO]: { 
    label: 'To Do', 
    icon: Circle,
    color: 'border-blue-500/50', 
    textColor: 'text-blue-500',
    bg: 'bg-blue-500/5' 
  },
  [TaskStatus.IN_PROGRESS]: { 
    label: 'In Progress', 
    icon: Loader2,
    color: 'border-yellow-500/50', 
    textColor: 'text-yellow-500',
    bg: 'bg-yellow-500/5' 
  },
  [TaskStatus.CODE_REVIEW]: { 
    label: 'Review', 
    icon: Code2,
    color: 'border-purple-500/50', 
    textColor: 'text-purple-500',
    bg: 'bg-purple-500/5' 
  },
  [TaskStatus.DONE]: { 
    label: 'Done', 
    icon: CheckCircle2,
    color: 'border-green-500/50', 
    textColor: 'text-green-500',
    bg: 'bg-green-500/5' 
  },
};

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onUpdateTask, onDeleteTask, onAddTask }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  
  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask({
      title: newTaskTitle,
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
    });
    setNewTaskTitle('');
  };

  const togglePriority = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    const priorities = [Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.CRITICAL];
    const currentIndex = priorities.indexOf(task.priority);
    const nextIndex = (currentIndex + 1) % priorities.length;
    onUpdateTask({ ...task, priority: priorities[nextIndex] });
  };

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case Priority.CRITICAL: return 'text-neon-red border-neon-red/50 bg-neon-red/10';
      case Priority.HIGH: return 'text-orange-400 border-orange-400/50 bg-orange-400/10';
      case Priority.MEDIUM: return 'text-blue-400 border-blue-400/50 bg-blue-400/10';
      case Priority.LOW: return 'text-gray-400 border-gray-400/50 bg-gray-400/10';
      default: return 'text-gray-400';
    }
  };

  const handleEditClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask({ ...task });
  };

  const handleSaveEdit = () => {
    if (editingTask) {
      onUpdateTask(editingTask);
      setEditingTask(null);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDraggedTaskId(null);
    const taskId = e.dataTransfer.getData('text/plain');
    const task = tasks.find(t => t.id === taskId);
    
    if (task && task.status !== status) {
      onUpdateTask({ ...task, status });
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Quick Add Bar */}
      <div className="mb-6 p-1">
        <form onSubmit={handleAddNew} className="flex gap-4">
           <div className="relative flex-1">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Hash size={16} className="text-gray-500" />
             </div>
             <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Initialize new task protocol..."
              className="w-full bg-night-800 text-gray-100 pl-10 pr-4 py-3 rounded border border-gray-700 focus:border-neon-green focus:outline-none focus:ring-1 focus:ring-neon-green/50 font-mono transition-all"
             />
           </div>
           <button 
            type="submit"
            className="px-6 py-3 bg-neon-green/10 text-neon-green border border-neon-green/50 rounded hover:bg-neon-green hover:text-night-950 font-bold tracking-wider transition-all"
           >
             ADD_TASK
           </button>
        </form>
      </div>

      {/* Columns */}
      <div className="flex-1 md:overflow-x-auto md:overflow-y-hidden overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col md:flex-row gap-4 md:min-w-[1000px] md:h-full pb-4">
          {(Object.keys(statusConfig) as TaskStatus[]).map((status) => {
            const config = statusConfig[status];
            const StatusIcon = config.icon;
            const columnTasks = tasks.filter(t => t.status === status);

            return (
              <div 
                key={status} 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
                className={`flex-shrink-0 md:flex-1 flex flex-col w-full md:w-1/4 md:min-w-[280px] rounded-lg border border-gray-800 bg-night-900/50 backdrop-blur-sm transition-colors ${draggedTaskId ? 'border-dashed border-gray-700' : ''}`}
              >
                <div className={`p-3 border-b border-gray-800 ${config.bg} flex justify-between items-center`}>
                   <h3 className={`font-mono font-bold text-sm tracking-wider uppercase text-gray-300 flex items-center gap-2`}>
                     <StatusIcon size={16} className={config.textColor} />
                     {config.label} <span className="text-gray-600 ml-2">[{columnTasks.length}]</span>
                   </h3>
                </div>
                
                <div className="md:flex-1 md:overflow-y-auto p-3 space-y-3 custom-scrollbar">
                  {columnTasks.map(task => {
                    return (
                      <div 
                        key={task.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="group bg-night-800 border border-gray-700 p-4 rounded hover:border-gray-500 transition-all shadow-sm relative cursor-grab active:cursor-grabbing hover:bg-night-800/80 w-full select-none"
                      >
                        
                        <div className="flex justify-between items-start mb-2">
                          <span 
                            onClick={(e) => togglePriority(task, e)}
                            className={`text-[10px] font-mono border px-2 py-0.5 rounded cursor-pointer select-none hover:opacity-80 transition-opacity ${getPriorityColor(task.priority)}`}
                            title="Click to cycle priority"
                          >
                            {task.priority}
                          </span>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => handleEditClick(task, e)}
                              className="text-gray-600 hover:text-neon-blue"
                              title="Edit Task"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteTask(task.id);
                              }}
                              className="text-gray-600 hover:text-red-500"
                              title="Delete Task"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-2 items-start">
                           <GripVertical size={16} className="text-gray-700 mt-0.5 shrink-0" />
                           <div className="flex-1 min-w-0 w-0">
                              <h4 className="text-gray-200 font-medium mb-1 leading-snug truncate">{task.title}</h4>
                              {task.description && (
                                <p 
                                  className="text-xs text-gray-500 mb-3 font-mono break-words w-full line-clamp-2"
                                >
                                  {task.description.length > 140 ? task.description.slice(0, 140) + '...' : task.description}
                                </p>
                              )}
                           </div>
                        </div>

                        <div className="flex items-center justify-between mt-2 border-t border-gray-700/50 pt-3">
                          <span className="text-xs text-gray-600 font-mono flex items-center gap-1">
                            <Clock size={10} />
                            {formatDate(task.createdAt)}
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingTask(task);
                            }}
                            className="text-gray-600 hover:text-neon-purple opacity-0 group-hover:opacity-100 transition-all"
                            title="View Full Details"
                          >
                            <Maximize2 size={18} />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                  {columnTasks.length === 0 && (
                     <div className="text-center py-10 text-gray-700 text-xs font-mono border-2 border-dashed border-gray-800 rounded pointer-events-none">
                       DROP_HERE
                     </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* View Modal */}
      {viewingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-night-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono break-all pr-4">
                <Hash size={18} className="text-neon-purple shrink-0"/> {viewingTask.title}
              </h2>
              <button 
                onClick={() => setViewingTask(null)}
                className="text-gray-500 hover:text-white shrink-0"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-800 pb-4">
                 <span className={`px-2 py-1 rounded text-xs border ${statusConfig[viewingTask.status].color} ${statusConfig[viewingTask.status].bg} text-gray-300`}>
                    {statusConfig[viewingTask.status].label}
                 </span>
                 <span className={`px-2 py-1 rounded text-xs border ${getPriorityColor(viewingTask.priority)}`}>
                    {viewingTask.priority}
                 </span>
                 <span className="text-xs text-gray-500 flex items-center font-mono ml-auto">
                    <Clock size={12} className="mr-1"/> {formatDate(viewingTask.createdAt)}
                 </span>
              </div>
              
              <div className="prose prose-invert max-w-none">
                  <h3 className="text-xs font-mono text-gray-500 uppercase mb-2">Description</h3>
                  <p className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed break-words bg-night-950/50 p-4 rounded border border-gray-800">
                      {viewingTask.description || <span className="text-gray-600 italic">No description provided.</span>}
                  </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-night-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 size={18} className="text-neon-blue"/> Edit Task
              </h2>
              <button 
                onClick={() => setEditingTask(null)}
                className="text-gray-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-500 uppercase">Task Title</label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full bg-night-950 border border-gray-700 rounded px-3 py-2 text-white focus:border-neon-blue focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-500 uppercase">Description</label>
                <textarea
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  rows={6}
                  className="w-full bg-night-950 border border-gray-700 rounded px-3 py-2 text-white focus:border-neon-blue focus:outline-none resize-none"
                  placeholder="Enter task details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-500 uppercase">Priority</label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as Priority })}
                    className="w-full bg-night-950 border border-gray-700 rounded px-3 py-2 text-white focus:border-neon-blue focus:outline-none appearance-none"
                  >
                    {Object.values(Priority).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-500 uppercase">Status</label>
                  <select
                    value={editingTask.status}
                    onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })}
                    className="w-full bg-night-950 border border-gray-700 rounded px-3 py-2 text-white focus:border-neon-blue focus:outline-none appearance-none"
                  >
                     {Object.values(TaskStatus).map(s => (
                      <option key={s} value={s}>{statusConfig[s].label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-800 flex justify-end gap-2">
              <button 
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-neon-blue/10 text-neon-blue border border-neon-blue/50 rounded hover:bg-neon-blue hover:text-night-950 font-bold flex items-center gap-2 transition-all"
              >
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;