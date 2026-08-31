import {
  heightForDuration,
  layoutTasksForDay,
  minutesToTime,
  timeToMinutes,
  topForStartTime,
} from '../../lib/time';
import type { Task, TaskInstance } from '../../types/models';

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: overrides.id ?? 'task-1',
    routineId: 'routine-1',
    title: 'Task',
    startTime: '08:00',
    durationMinutes: 30,
    categoryId: null,
    icon: null,
    color: null,
    notes: null,
    sortOrder: 0,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

function makeInstance(overrides: Partial<Task>): TaskInstance {
  return {
    task: makeTask(overrides),
    category: null,
    date: '2026-08-31',
    completed: false,
    completedAt: null,
  };
}

describe('timeToMinutes / minutesToTime', () => {
  it('converts HH:mm to minutes since midnight', () => {
    expect(timeToMinutes('00:00')).toBe(0);
    expect(timeToMinutes('07:30')).toBe(450);
    expect(timeToMinutes('23:59')).toBe(1439);
  });

  it('converts minutes back to HH:mm, wrapping past midnight', () => {
    expect(minutesToTime(0)).toBe('00:00');
    expect(minutesToTime(450)).toBe('07:30');
    expect(minutesToTime(1440)).toBe('00:00');
    expect(minutesToTime(1500)).toBe('01:00');
  });
});

describe('topForStartTime / heightForDuration', () => {
  it('positions proportionally to time of day', () => {
    expect(topForStartTime('00:00')).toBe(0);
    expect(topForStartTime('01:00')).toBeGreaterThan(topForStartTime('00:00'));
  });

  it('enforces a minimum tappable height for short tasks', () => {
    expect(heightForDuration(1)).toBeGreaterThanOrEqual(40);
  });

  it('grows with duration once above the minimum', () => {
    expect(heightForDuration(120)).toBeGreaterThan(heightForDuration(30));
  });
});

describe('layoutTasksForDay', () => {
  it('gives non-overlapping tasks a single shared column', () => {
    const instances = [
      makeInstance({ id: 'a', startTime: '08:00', durationMinutes: 30 }),
      makeInstance({ id: 'b', startTime: '09:00', durationMinutes: 30 }),
    ];
    const positioned = layoutTasksForDay(instances);
    expect(positioned.every((p) => p.columnCount === 1 && p.columnIndex === 0)).toBe(true);
  });

  it('splits overlapping tasks into side-by-side columns', () => {
    const instances = [
      makeInstance({ id: 'a', startTime: '08:00', durationMinutes: 60 }),
      makeInstance({ id: 'b', startTime: '08:30', durationMinutes: 30 }),
    ];
    const positioned = layoutTasksForDay(instances);
    const byId = Object.fromEntries(positioned.map((p) => [p.task.id, p]));
    expect(byId.a.columnCount).toBe(2);
    expect(byId.b.columnCount).toBe(2);
    expect(byId.a.columnIndex).not.toBe(byId.b.columnIndex);
  });

  it('gives a third, non-overlapping cluster its own single column', () => {
    const instances = [
      makeInstance({ id: 'a', startTime: '08:00', durationMinutes: 60 }),
      makeInstance({ id: 'b', startTime: '08:30', durationMinutes: 30 }),
      makeInstance({ id: 'c', startTime: '12:00', durationMinutes: 30 }),
    ];
    const positioned = layoutTasksForDay(instances);
    const c = positioned.find((p) => p.task.id === 'c')!;
    expect(c.columnCount).toBe(1);
  });
});
