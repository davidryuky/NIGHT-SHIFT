
import { AppState, Task, Note, Theme, PomodoroSession, CaffeineEntry, CodeSnippet } from '../types';

const STORAGE_KEY = 'night_shift_db';

export const saveToLocal = (
  tasks: Task[], 
  notes: Note[], 
  snippets: CodeSnippet[],
  theme: Theme, 
  pomodoroSessions: PomodoroSession[],
  backgroundConfig: AppState['backgroundConfig'],
  caffeineLog: CaffeineEntry[],
  toolsConfig: AppState['toolsConfig']
): void => {
  const state: AppState = {
    tasks,
    notes,
    snippets,
    theme,
    pomodoroSessions,
    backgroundConfig,
    caffeineLog,
    toolsConfig,
    lastSaved: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadFromLocal = (): { 
  tasks: Task[], 
  notes: Note[], 
  snippets: CodeSnippet[],
  theme: Theme, 
  pomodoroSessions: PomodoroSession[],
  backgroundConfig: AppState['backgroundConfig'],
  caffeineLog: CaffeineEntry[],
  toolsConfig: AppState['toolsConfig']
} => {
  const raw = localStorage.getItem(STORAGE_KEY);
  const defaultConfig: AppState['backgroundConfig'] = { 
    url: '', 
    type: 'image',
    opacity: 0.3, 
    blur: 0, 
    showRadialGradient: true 
  };
  const defaultTools: AppState['toolsConfig'] = {
    showCaffeineCounter: false
  };
  
  if (!raw) return { tasks: [], notes: [], snippets: [], theme: 'night_shift', pomodoroSessions: [], backgroundConfig: defaultConfig, caffeineLog: [], toolsConfig: defaultTools };
  try {
    const state = JSON.parse(raw) as AppState;
    return { 
      tasks: state.tasks || [], 
      notes: state.notes || [],
      snippets: state.snippets || [],
      theme: state.theme || 'night_shift',
      pomodoroSessions: state.pomodoroSessions || [],
      backgroundConfig: state.backgroundConfig || defaultConfig,
      caffeineLog: state.caffeineLog || [],
      toolsConfig: state.toolsConfig || defaultTools
    };
  } catch (e) {
    console.error('Failed to load local data', e);
    return { tasks: [], notes: [], snippets: [], theme: 'night_shift', pomodoroSessions: [], backgroundConfig: defaultConfig, caffeineLog: [], toolsConfig: defaultTools };
  }
};

export const exportToJson = (state: Partial<AppState>): void => {
  const dataStr = JSON.stringify(state, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  const exportFileDefaultName = `night_shift_backup_${new Date().toISOString().slice(0,10)}.json`;
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const importFromJson = (file: File): Promise<Partial<AppState>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};
