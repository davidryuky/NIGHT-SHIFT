import { AppState, Task } from '../types';

const STORAGE_KEY = 'night_shift_db';

export const saveToLocal = (tasks: Task[]): void => {
  const state: AppState = {
    tasks,
    lastSaved: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadFromLocal = (): Task[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const state = JSON.parse(raw) as AppState;
    return state.tasks || [];
  } catch (e) {
    console.error('Failed to load local data', e);
    return [];
  }
};

export const exportToJson = (tasks: Task[]): void => {
  const dataStr = JSON.stringify(tasks, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `night_shift_backup_${new Date().toISOString().slice(0,10)}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const importFromJson = (file: File): Promise<Task[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          resolve(json as Task[]);
        } else {
          reject(new Error("Invalid JSON format: Expected an array of tasks"));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};
