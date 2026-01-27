export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  CODE_REVIEW = 'CODE_REVIEW',
  DONE = 'DONE',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  createdAt: number;
  tags: string[];
}

export interface Note {
  id: string;
  content: string;
  tags: string[];
  color: string;
  createdAt: number;
  x?: number; // For future absolute positioning if needed
  y?: number;
}

export type Theme = 'cyberpunk' | 'dracula' | 'amber';

export interface AppState {
  tasks: Task[];
  notes: Note[];
  theme: Theme;
  lastSaved: number;
}