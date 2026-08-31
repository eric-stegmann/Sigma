import { AppState, type AppStateStatus } from 'react-native';
import { formatLocalDate } from './recurrence';

export function todayKey(): string {
  return formatLocalDate(new Date());
}

function msUntilNextLocalMidnight(): number {
  const now = new Date();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
  return nextMidnight.getTime() - now.getTime();
}

/**
 * Calls onDateChanged whenever the local calendar date rolls over while the
 * app is open (foregrounded, or a scheduled timer fires past midnight).
 * There is no data to "reset" here (see task_completions table) - this only
 * keeps the "today" selection following the real date.
 */
export function watchForDateRollover(onDateChanged: (newDateKey: string) => void): () => void {
  let lastKey = todayKey();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const check = () => {
    const key = todayKey();
    if (key !== lastKey) {
      lastKey = key;
      onDateChanged(key);
    }
  };

  const scheduleNextCheck = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      check();
      scheduleNextCheck();
    }, msUntilNextLocalMidnight());
  };

  const handleAppStateChange = (state: AppStateStatus) => {
    if (state === 'active') check();
  };

  const subscription = AppState.addEventListener('change', handleAppStateChange);
  scheduleNextCheck();

  return () => {
    subscription.remove();
    if (timeoutId) clearTimeout(timeoutId);
  };
}
