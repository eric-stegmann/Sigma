import type { Task, TaskInstance, PositionedTaskInstance } from '../types/models';

export const PIXELS_PER_MINUTE = 1.2;
export const MIN_BLOCK_HEIGHT = 40;
export const WINDOW_START_MINUTES = 0; // timeline covers the full 24h day, starting at 00:00

/** "07:30" -> 450 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/** 450 -> "07:30" */
export function minutesToTime(totalMinutes: number): string {
  const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function topForStartTime(startTime: string): number {
  return (timeToMinutes(startTime) - WINDOW_START_MINUTES) * PIXELS_PER_MINUTE;
}

export function heightForDuration(durationMinutes: number): number {
  return Math.max(durationMinutes * PIXELS_PER_MINUTE, MIN_BLOCK_HEIGHT);
}

export function topForNow(now: Date = new Date()): number {
  const minutes = now.getHours() * 60 + now.getMinutes();
  return (minutes - WINDOW_START_MINUTES) * PIXELS_PER_MINUTE;
}

function taskRange(task: Task): { start: number; end: number } {
  const start = timeToMinutes(task.startTime);
  return { start, end: start + task.durationMinutes };
}

function overlaps(a: Task, b: Task): boolean {
  const rangeA = taskRange(a);
  const rangeB = taskRange(b);
  return rangeA.start < rangeB.end && rangeB.start < rangeA.end;
}

/**
 * Groups overlapping tasks and assigns each a column index/count so they can
 * be laid out side-by-side, calendar-style, instead of stacking on top of
 * each other.
 */
export function layoutTasksForDay(instances: TaskInstance[]): PositionedTaskInstance[] {
  const sorted = [...instances].sort(
    (a, b) => timeToMinutes(a.task.startTime) - timeToMinutes(b.task.startTime),
  );

  const clusters: TaskInstance[][] = [];
  let currentCluster: TaskInstance[] = [];
  let clusterEnd = -Infinity;

  for (const instance of sorted) {
    const { start, end } = taskRange(instance.task);
    if (currentCluster.length === 0 || start < clusterEnd) {
      currentCluster.push(instance);
      clusterEnd = Math.max(clusterEnd, end);
    } else {
      clusters.push(currentCluster);
      currentCluster = [instance];
      clusterEnd = end;
    }
  }
  if (currentCluster.length > 0) clusters.push(currentCluster);

  const positioned: PositionedTaskInstance[] = [];
  for (const cluster of clusters) {
    const columns: TaskInstance[][] = [];
    for (const instance of cluster) {
      let placed = false;
      for (const column of columns) {
        if (!column.some((other) => overlaps(other.task, instance.task))) {
          column.push(instance);
          placed = true;
          break;
        }
      }
      if (!placed) columns.push([instance]);
    }
    const columnCount = columns.length;
    columns.forEach((column, columnIndex) => {
      for (const instance of column) {
        positioned.push({
          ...instance,
          top: topForStartTime(instance.task.startTime),
          height: heightForDuration(instance.task.durationMinutes),
          columnIndex,
          columnCount,
        });
      }
    });
  }

  return positioned;
}
