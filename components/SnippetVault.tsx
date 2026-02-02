import React, { useState } from 'react';
import { CodeSnippet } from '../types';
import { Plus, Search, Copy, Check, Trash2, Code2, Tag, Terminal, Save, X } from 'lucide-react';

interface SnippetVaultProps {
  snippets: CodeSnippet[];
  onAddSnippet: (s: Partial<CodeSnippet>) => void;
  onUpdateSnippet: (s: CodeSnippet) => void;
  onDeleteSnippet: (id: string) => void;
}

const SnippetVault: React.FC<SnippetVaultProps> = ({ snippets, onAddSnippet, onUpdateSnippet, onDeleteSnippet }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [newSnippet, setNewSnippet] = useState<Partial<CodeSnippet>>({
    title: '',
    code: '',
    language: 'typescript',
    tags: []
  });

  const handleCopy = (snippet: CodeSnippet) => {
    navigator.clipboard.writeText(snippet.code);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = () => {
    if (!newSnippet.title || !newSnippet.code) return;
    onAddSnippet(newSnippet);
    setNewSnippet({ title: '', code: '', language: 'typescript', tags: [] });
    setIsAdding(false);
  };

  const filteredSnippets = snippets.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Terminal className="text-white" size={24} />
            Snippet Vault
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-1">Version control for your mental stack.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-bold rounded hover:bg-gray-200 transition-all uppercase tracking-widest"
        >
          <Plus size={16} /> NEW_SNIPPET
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
        <input 
          type="text" 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search by title, language or tag..."
          className="w-full bg-night-900 border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-white transition-all font-mono"
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        <div className="grid grid-cols-1 gap-6 pb-12">
          {isAdding && (
            <div className="bg-night-900 border border-white/20 rounded-lg p-6 space-y-4 animate-in fade-in slide-in-from-top-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest">Initialize_Snippet</h3>
                <button onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Snippet Title"
                  value={newSnippet.title}
                  onChange={e => setNewSnippet(prev => ({...prev, title: e.target.value}))}
                  className="bg-night-950 border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-white"
                />
                <input 
                  type="text" 
                  placeholder="Language (e.g. typescript, python)"
                  value={newSnippet.language}
                  onChange={e => setNewSnippet(prev => ({...prev, language: e.target.value}))}
                  className="bg-night-950 border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-white"
                />
              </div>
              <textarea 
                placeholder="// Paste code here..."
                value={newSnippet.code}
                onChange={e => setNewSnippet(prev => ({...prev, code: e.target.value}))}
                className="w-full h-40 bg-night-950 border border-gray-800 rounded p-4 text-xs font-mono focus:outline-none focus:border-white resize-none"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-xs text-gray-500 hover:text-white font-mono uppercase">Cancel</button>
                <button onClick={handleSave} className="px-6 py-2 bg-white text-black text-xs font-bold rounded uppercase tracking-widest flex items-center gap-2"><Save size={14} /> Commit_Vault</button>
              </div>
            </div>
          )}

          {filteredSnippets.map(snippet => (
            <div key={snippet.id} className="group bg-night-900 border border-gray-800 rounded-lg overflow-hidden transition-all hover:border-gray-500">
              <div className="p-4 border-b border-gray-800 bg-night-950/50 flex justify-between items-center">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 bg-gray-800 rounded text-gray-400 group-hover:text-white transition-colors">
                    <Code2 size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{snippet.title}</h3>
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{snippet.language}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => handleCopy(snippet)}
                    className={`p-2 rounded transition-all ${copiedId === snippet.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                  >
                    {copiedId === snippet.id ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                  <button 
                    onClick={() => onDeleteSnippet(snippet.id)}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/5 rounded transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="bg-night-950 p-4 relative">
                <pre className="text-xs font-mono text-gray-300 overflow-x-auto custom-scrollbar max-h-60 leading-relaxed">
                  <code>{snippet.code}</code>
                </pre>
                {snippet.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {snippet.tags.map(tag => (
                      <span key={tag} className="text-[8px] font-mono border border-gray-800 px-2 py-0.5 rounded text-gray-500">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredSnippets.length === 0 && !isAdding && (
            <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-lg text-gray-700">
              <Terminal size={40} className="mb-4 opacity-10" />
              <p className="text-xs font-mono uppercase tracking-[0.2em]">Vault_Empty</p>
              <button onClick={() => setIsAdding(true)} className="mt-4 text-[10px] text-white hover:underline font-mono">[ Initialize New Record ]</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnippetVault;