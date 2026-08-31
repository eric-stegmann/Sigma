import { DAY_BIT, type Routine } from '../types/models';

const WEEKDAY_BITS = [
  DAY_BIT.SUN,
  DAY_BIT.MON,
  DAY_BIT.TUE,
  DAY_BIT.WED,
  DAY_BIT.THU,
  DAY_BIT.FRI,
  DAY_BIT.SAT,
];

/** JS Date#getDay() (0=Sun) -> our Mon-first bitmask bit. */
export function dayOfWeekBit(date: Date): number {
  return WEEKDAY_BITS[date.getDay()];
}

/** "YYYY-MM-DD" parsed as a local calendar date (not UTC). */
export function parseLocalDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function routineAppliesOnDate(routine: Routine, dateKey: string): boolean {
  if (!routine.active) return false;
  if (routine.startDate && dateKey < routine.startDate) return false;
  if (routine.endDate && dateKey > routine.endDate) return false;

  const date = parseLocalDate(dateKey);
  return (dayOfWeekBit(date) & routine.daysOfWeek) !== 0;
}

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const LABEL_BITS = [DAY_BIT.MON, DAY_BIT.TUE, DAY_BIT.WED, DAY_BIT.THU, DAY_BIT.FRI, DAY_BIT.SAT, DAY_BIT.SUN];

export function daysOfWeekLabels(mask: number): { label: string; active: boolean }[] {
  return LABEL_BITS.map((bit, i) => ({ label: WEEKDAY_LABELS[i], active: (mask & bit) !== 0 }));
}
