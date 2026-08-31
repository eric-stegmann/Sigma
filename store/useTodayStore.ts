import { create } from 'zustand';
import { todayKey, watchForDateRollover } from '../lib/rollover';
import { getTaskInstancesForDate, computeDailyProgress } from '../repositories/dayRepository';
import { toggleTaskCompletion } from '../repositories/completionRepository';
import type { DailyProgress, TaskInstance } from '../types/models';

interface TodayState {
  selectedDate: string;
  instances: TaskInstance[];
  progress: DailyProgress;
  loading: boolean;
  isViewingToday: boolean;
  setSelectedDate: (date: string) => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToToday: () => void;
  refresh: () => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
}

function shiftDateKey(dateKey: string, deltaDays: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day + deltaDays);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const useTodayStore = create<TodayState>((set, get) => ({
  selectedDate: todayKey(),
  instances: [],
  progress: { totalTasks: 0, completedTasks: 0, percent: 0 },
  loading: true,
  isViewingToday: true,

  setSelectedDate: (date) => {
    set({ selectedDate: date, isViewingToday: date === todayKey() });
    get().refresh();
  },

  goToPreviousDay: () => get().setSelectedDate(shiftDateKey(get().selectedDate, -1)),
  goToNextDay: () => get().setSelectedDate(shiftDateKey(get().selectedDate, 1)),
  goToToday: () => get().setSelectedDate(todayKey()),

  refresh: async () => {
    set({ loading: true });
    const instances = await getTaskInstancesForDate(get().selectedDate);
    set({ instances, progress: computeDailyProgress(instances), loading: false });
  },

  toggleTask: async (taskId) => {
    await toggleTaskCompletion(taskId, get().selectedDate);
    await get().refresh();
  },
}));

let rolloverStarted = false;
export function startDateRolloverWatcher(): void {
  if (rolloverStarted) return;
  rolloverStarted = true;
  watchForDateRollover((newDateKey) => {
    const { isViewingToday, setSelectedDate } = useTodayStore.getState();
    if (isViewingToday) setSelectedDate(newDateKey);
  });
}
