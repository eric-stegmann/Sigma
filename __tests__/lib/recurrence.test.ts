import { daysOfWeekLabels, dayOfWeekBit, formatLocalDate, parseLocalDate, routineAppliesOnDate } from '../../lib/recurrence';
import { DAY_BIT, type Routine } from '../../types/models';

function makeRoutine(overrides: Partial<Routine>): Routine {
  return {
    id: 'r1',
    name: 'Routine',
    active: true,
    daysOfWeek: DAY_BIT.MON | DAY_BIT.WED | DAY_BIT.FRI,
    startDate: null,
    endDate: null,
    sortOrder: 0,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe('parseLocalDate / formatLocalDate', () => {
  it('round-trips a date key without UTC drift', () => {
    const key = '2026-08-31';
    expect(formatLocalDate(parseLocalDate(key))).toBe(key);
  });
});

describe('dayOfWeekBit', () => {
  it('maps JS Sunday-first getDay() to our bitmask', () => {
    // 2026-08-31 is a Monday.
    expect(dayOfWeekBit(parseLocalDate('2026-08-31'))).toBe(DAY_BIT.MON);
    expect(dayOfWeekBit(parseLocalDate('2026-09-06'))).toBe(DAY_BIT.SUN);
  });
});

describe('routineAppliesOnDate', () => {
  it('applies only on matching weekdays', () => {
    const routine = makeRoutine({ daysOfWeek: DAY_BIT.MON | DAY_BIT.WED | DAY_BIT.FRI });
    expect(routineAppliesOnDate(routine, '2026-08-31')).toBe(true); // Monday
    expect(routineAppliesOnDate(routine, '2026-09-01')).toBe(false); // Tuesday
    expect(routineAppliesOnDate(routine, '2026-09-02')).toBe(true); // Wednesday
  });

  it('never applies when inactive', () => {
    const routine = makeRoutine({ active: false, daysOfWeek: DAY_BIT.MON });
    expect(routineAppliesOnDate(routine, '2026-08-31')).toBe(false);
  });

  it('respects start/end date bounds', () => {
    const routine = makeRoutine({
      daysOfWeek: DAY_BIT.MON,
      startDate: '2026-09-01',
      endDate: '2026-09-30',
    });
    expect(routineAppliesOnDate(routine, '2026-08-31')).toBe(false); // before start
    expect(routineAppliesOnDate(routine, '2026-09-07')).toBe(true); // Monday within range
    expect(routineAppliesOnDate(routine, '2026-10-05')).toBe(false); // after end
  });
});

describe('daysOfWeekLabels', () => {
  it('reports active state for each weekday in Mon-Sun order', () => {
    const labels = daysOfWeekLabels(DAY_BIT.MON | DAY_BIT.FRI);
    expect(labels.map((l) => l.label)).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S']);
    expect(labels[0].active).toBe(true); // Mon
    expect(labels[4].active).toBe(true); // Fri
    expect(labels[1].active).toBe(false); // Tue
  });
});
