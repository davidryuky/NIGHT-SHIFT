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
  x?: number;
  y?: number;
}

export interface PomodoroSession {
  id: string;
  timestamp: number;
  durationMinutes: number;
}

export type Theme = 'cyberpunk' | 'dracula' | 'amber' | 'gamer' | 'paper' | 'lofi';

export interface AppState {
  tasks: Task[];
  notes: Note[];
  pomodoroSessions: PomodoroSession[];
  theme: Theme;
  backgroundConfig: {
    url: string;
    opacity: number;
    blur: number;
    showRadialGradient: boolean;
  };
  lastSaved: number;
}