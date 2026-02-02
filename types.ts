
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

export interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  language: string;
  tags: string[];
  createdAt: number;
}

export interface PomodoroSession {
  id: string;
  timestamp: number;
  durationMinutes: number;
}

export interface CaffeineEntry {
  id: string;
  amount: number; // em mg
  timestamp: number;
}

export type Theme = 'night_shift' | 'cyberpunk' | 'dracula' | 'amber' | 'paper' | 'lofi';

export interface AppState {
  tasks: Task[];
  notes: Note[];
  snippets: CodeSnippet[];
  pomodoroSessions: PomodoroSession[];
  caffeineLog: CaffeineEntry[];
  theme: Theme;
  backgroundConfig: {
    url: string;
    type: 'image' | 'video';
    opacity: number;
    blur: number;
    showRadialGradient: boolean;
  };
  toolsConfig: {
    showCaffeineCounter: boolean;
  };
  lastSaved: number;
}
