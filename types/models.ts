export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: number;
}

/** Bitmask, bit 0 = Monday ... bit 6 = Sunday. */
export type DaysOfWeekMask = number;

export const DAY_BIT = {
  MON: 1 << 0,
  TUE: 1 << 1,
  WED: 1 << 2,
  THU: 1 << 3,
  FRI: 1 << 4,
  SAT: 1 << 5,
  SUN: 1 << 6,
} as const;

export const ALL_DAYS_MASK = Object.values(DAY_BIT).reduce((a, b) => a | b, 0);

export interface Routine {
  id: string;
  name: string;
  active: boolean;
  daysOfWeek: DaysOfWeekMask;
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id: string;
  routineId: string;
  title: string;
  startTime: string; // HH:mm, 24h
  durationMinutes: number;
  categoryId: string | null;
  icon: string | null;
  color: string | null;
  notes: string | null;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface TaskCompletion {
  id: string;
  taskId: string;
  date: string; // YYYY-MM-DD
  completedAt: number | null;
}

/** A task placed on a specific calendar date, joined with its completion state. */
export interface TaskInstance {
  task: Task;
  category: Category | null;
  date: string;
  completed: boolean;
  completedAt: number | null;
}

/** A TaskInstance with computed timeline geometry. */
export interface PositionedTaskInstance extends TaskInstance {
  top: number;
  height: number;
  columnIndex: number;
  columnCount: number;
}

export interface DailyProgress {
  totalTasks: number;
  completedTasks: number;
  percent: number; // 0-1
}
