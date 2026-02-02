import { AppState, Task, Note, Theme, PomodoroSession } from '../types';

const STORAGE_KEY = 'night_shift_db';

export const saveToLocal = (
  tasks: Task[], 
  notes: Note[], 
  theme: Theme, 
  pomodoroSessions: PomodoroSession[],
  backgroundConfig: AppState['backgroundConfig']
): void => {
  const state: AppState = {
    tasks,
    notes,
    theme,
    pomodoroSessions,
    backgroundConfig,
    lastSaved: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadFromLocal = (): { 
  tasks: Task[], 
  notes: Note[], 
  theme: Theme, 
  pomodoroSessions: PomodoroSession[],
  backgroundConfig: AppState['backgroundConfig']
} => {
  const raw = localStorage.getItem(STORAGE_KEY);
  const defaultConfig: AppState['backgroundConfig'] = { 
    url: '', 
    opacity: 0.3, 
    blur: 0, 
    showRadialGradient: true 
  };
  
  if (!raw) return { tasks: [], notes: [], theme: 'cyberpunk', pomodoroSessions: [], backgroundConfig: defaultConfig };
  try {
    const state = JSON.parse(raw) as AppState;
    return { 
      tasks: state.tasks || [], 
      notes: state.notes || [],
      theme: state.theme || 'cyberpunk',
      pomodoroSessions: state.pomodoroSessions || [],
      backgroundConfig: state.backgroundConfig || defaultConfig
    };
  } catch (e) {
    console.error('Failed to load local data', e);
    return { tasks: [], notes: [], theme: 'cyberpunk', pomodoroSessions: [], backgroundConfig: defaultConfig };
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