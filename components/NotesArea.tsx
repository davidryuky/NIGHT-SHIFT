import React, { useState } from 'react';
import { Note } from '../types';
import { Plus, X, GripHorizontal, Tag, Trash2, StickyNote, Palette, Check } from 'lucide-react';

interface NotesAreaProps {
  notes: Note[];
  onAddNote: () => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onReorderNotes: (startIndex: number, endIndex: number) => void;
}

// Notion-inspired dark mode colors
const NOTE_COLORS: Record<string, { bg: string; border: string; indicator: string }> = {
  neutral: { 
    bg: 'bg-night-800', 
    border: 'border-gray-700', 
    indicator: 'bg-gray-600' 
  },
  red: { 
    bg: 'bg-red-950/30', 
    border: 'border-red-900/50', 
    indicator: 'bg-red-500' 
  },
  blue: { 
    bg: 'bg-blue-950/30', 
    border: 'border-blue-900/50', 
    indicator: 'bg-blue-500' 
  },
  green: { 
    bg: 'bg-green-950/30', 
    border: 'border-green-900/50', 
    indicator: 'bg-green-500' 
  },
  yellow: { 
    bg: 'bg-yellow-950/20', 
    border: 'border-yellow-900/50', 
    indicator: 'bg-yellow-500' 
  },
  purple: { 
    bg: 'bg-purple-950/30', 
    border: 'border-purple-900/50', 
    indicator: 'bg-purple-500' 
  },
};

const NotesArea: React.FC<NotesAreaProps> = ({ notes, onAddNote, onUpdateNote, onDeleteNote, onReorderNotes }) => {
  const [draggedNoteIndex, setDraggedNoteIndex] = useState<number | null>(null);
  const [activeColorPickerId, setActiveColorPickerId] = useState<string | null>(null);
  const [activeTagInputId, setActiveTagInputId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedNoteIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedNoteIndex === null) return;
    if (draggedNoteIndex !== targetIndex) {
      onReorderNotes(draggedNoteIndex, targetIndex);
    }
    setDraggedNoteIndex(null);
  };

  const handleAddTag = (note: Note, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = e.currentTarget.value.trim();
      if (val && !note.tags.includes(val)) {
        onUpdateNote({
          ...note,
          tags: [...note.tags, val]
        });
        e.currentTarget.value = '';
        setActiveTagInputId(null); // Close input after adding
      }
    }
  };

  const removeTag = (note: Note, tagToRemove: string) => {
    onUpdateNote({
      ...note,
      tags: note.tags.filter(t => t !== tagToRemove)
    });
  };

  const updateColor = (note: Note, colorKey: string) => {
    onUpdateNote({ ...note, color: colorKey });
    setActiveColorPickerId(null);
  };

  const closePopovers = () => {
    setActiveColorPickerId(null);
    setActiveTagInputId(null);
  };

  return (
    <div className="h-full flex flex-col p-2 md:p-0" onClick={closePopovers}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <StickyNote className="text-neon-green" />
            Scratchpad
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-1">Capture thoughts, snippets, and chaos.</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddNote();
          }}
          className="px-4 py-2 bg-neon-green/10 text-neon-green border border-neon-green/50 rounded hover:bg-neon-green hover:text-night-950 font-bold tracking-wider transition-all flex items-center gap-2"
        >
          <Plus size={16} /> NEW_NOTE
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {notes.map((note, index) => {
            const currentStyles = NOTE_COLORS[note.color] || NOTE_COLORS.neutral;
            
            return (
              <div
                key={note.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onClick={(e) => e.stopPropagation()} 
                className={`
                  relative border rounded-lg p-4 flex flex-col gap-3 group transition-all duration-300
                  hover:shadow-[0_0_15px_rgba(0,0,0,0.3)]
                  ${currentStyles.bg} ${currentStyles.border}
                  ${draggedNoteIndex === index ? 'opacity-50 scale-95 border-dashed border-neon-blue' : 'opacity-100'}
                `}
              >
                {/* Header / Drag Handle */}
                <div className="flex justify-between items-center border-b border-gray-700/50 pb-2 mb-1">
                  <div className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 p-1">
                    <GripHorizontal size={16} />
                  </div>
                  
                  <div className="flex items-center gap-1 relative">
                    <span className="text-[10px] text-gray-500 font-mono mr-2">
                        {new Date(note.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>

                    {/* Tag Button & Popover */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closePopovers();
                          setActiveTagInputId(activeTagInputId === note.id ? null : note.id);
                        }}
                        className={`p-1.5 rounded transition-colors ${activeTagInputId === note.id ? 'text-white bg-gray-700' : 'text-gray-500 hover:text-white'}`}
                        title="Add Tag"
                      >
                        <Tag size={14} />
                      </button>
                      
                      {activeTagInputId === note.id && (
                        <div className="absolute top-full right-0 mt-2 p-2 bg-night-900 border border-gray-700 rounded-lg shadow-xl z-20 w-48" onClick={(e) => e.stopPropagation()}>
                           <input
                            autoFocus
                            type="text"
                            onKeyDown={(e) => handleAddTag(note, e)}
                            placeholder="Type tag & Enter..."
                            className="w-full bg-black/40 rounded border border-gray-700 px-2 py-1 text-xs text-white focus:border-neon-blue focus:outline-none font-mono"
                          />
                        </div>
                      )}
                    </div>

                    {/* Color Picker Toggle */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closePopovers();
                          setActiveColorPickerId(activeColorPickerId === note.id ? null : note.id);
                        }}
                        className={`p-1.5 rounded transition-colors ${activeColorPickerId === note.id ? 'text-white bg-gray-700' : 'text-gray-500 hover:text-white'}`}
                        title="Change Color"
                      >
                        <Palette size={14} />
                      </button>

                      {activeColorPickerId === note.id && (
                        <div className="absolute top-full right-0 mt-2 p-2 bg-night-900 border border-gray-700 rounded-lg shadow-xl flex gap-2 z-20 w-max">
                          {Object.entries(NOTE_COLORS).map(([key, style]) => (
                            <button
                              key={key}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateColor(note, key);
                              }}
                              className={`w-5 h-5 rounded-full ${style.indicator} hover:scale-125 transition-transform flex items-center justify-center`}
                              title={key}
                            >
                              {note.color === key && <Check size={10} className="text-black/70 font-bold" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => onDeleteNote(note.id)}
                      className="text-gray-500 hover:text-red-500 transition-colors p-1.5"
                      title="Delete Note"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                <textarea
                  value={note.content}
                  onChange={(e) => onUpdateNote({ ...note, content: e.target.value })}
                  placeholder="// Type something..."
                  className="w-full h-40 bg-transparent text-gray-200 font-mono text-sm resize-none focus:outline-none placeholder-gray-600 leading-relaxed custom-scrollbar selection:bg-white/20"
                />

                {/* Tags Display Area */}
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-700/30 min-h-[24px]">
                    {note.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-black/30 border border-white/10 text-gray-300 font-mono group/tag">
                        #{tag}
                        <button onClick={() => removeTag(note, tag)} className="hover:text-red-400 opacity-0 group-hover/tag:opacity-100 transition-opacity"><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Empty State placeholder if no notes */}
          {notes.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-800 rounded-lg text-gray-600">
               <StickyNote size={48} className="mb-4 opacity-20" />
               <p className="font-mono text-sm">NO_DATA_FOUND</p>
               <button onClick={(e) => { e.stopPropagation(); onAddNote(); }} className="text-neon-green hover:underline text-xs mt-2 font-mono">
                 [ Initiate New Record ]
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesArea;