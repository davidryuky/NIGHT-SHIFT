import { AppState, Task, Note, Theme } from '../types';

const STORAGE_KEY = 'night_shift_db';

export const saveToLocal = (tasks: Task[], notes: Note[], theme: Theme): void => {
  const state: AppState = {
    tasks,
    notes,
    theme,
    lastSaved: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadFromLocal = (): { tasks: Task[], notes: Note[], theme: Theme } => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { tasks: [], notes: [], theme: 'cyberpunk' };
  try {
    const state = JSON.parse(raw) as AppState;
    // Handle migration/legacy where notes/theme might not exist
    return { 
      tasks: state.tasks || [], 
      notes: state.notes || [],
      theme: state.theme || 'cyberpunk'
    };
  } catch (e) {
    console.error('Failed to load local data', e);
    return { tasks: [], notes: [], theme: 'cyberpunk' };
  }
};

export const exportToJson = (tasks: Task[], notes: Note[]): void => {
  const exportData = { tasks, notes };
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `night_shift_backup_${new Date().toISOString().slice(0,10)}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const importFromJson = (file: File): Promise<{ tasks: Task[], notes: Note[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        // Support legacy import (array of tasks only) or new format (object)
        if (Array.isArray(json)) {
          resolve({ tasks: json as Task[], notes: [] });
        } else if (json.tasks || json.notes) {
           resolve({ 
             tasks: (json.tasks || []) as Task[], 
             notes: (json.notes || []) as Note[] 
           });
        } else {
          reject(new Error("Invalid JSON format"));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};