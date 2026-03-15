// Category Types
export interface Category {
  id: string;
  name: string;
  emoji: string;
  color?: string;
  createdAt: string;
}

// Time Entry Types
export interface TimeEntry {
  id: string;
  categoryId: string;
  startTime: string;
  endTime: string | null;
  date: string;
}

// Work Day Types
export interface WorkDay {
  date: string;
  startTime: string;
  endTime: string | null;
  isPaused: boolean;
  pauseStart: string | null;
  totalPauseMinutes: number;
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system';

// Settings Types
export interface Settings {
  theme: Theme;
}
