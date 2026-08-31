import { asc, eq } from 'drizzle-orm';
import { db } from '../db/client';
import { tasks } from '../db/schema';
import { generateId } from '../lib/id';
import type { Task } from '../types/models';

export async function listTasksForRoutine(routineId: string): Promise<Task[]> {
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.routineId, routineId))
    .orderBy(asc(tasks.sortOrder));
}

export async function listAllTasks(): Promise<Task[]> {
  return db.select().from(tasks).orderBy(asc(tasks.startTime));
}

export async function getTask(id: string): Promise<Task | undefined> {
  const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
  return task;
}

export async function createTask(input: {
  routineId: string;
  title: string;
  startTime: string;
  durationMinutes: number;
  categoryId?: string | null;
  icon?: string | null;
  color?: string | null;
  notes?: string | null;
}): Promise<Task> {
  const existing = await listTasksForRoutine(input.routineId);
  const now = Date.now();
  const task: Task = {
    id: generateId(),
    routineId: input.routineId,
    title: input.title,
    startTime: input.startTime,
    durationMinutes: input.durationMinutes,
    categoryId: input.categoryId ?? null,
    icon: input.icon ?? null,
    color: input.color ?? null,
    notes: input.notes ?? null,
    sortOrder: existing.length,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(tasks).values(task);
  return task;
}

export async function updateTask(
  id: string,
  input: Partial<
    Pick<
      Task,
      | 'title'
      | 'startTime'
      | 'durationMinutes'
      | 'categoryId'
      | 'icon'
      | 'color'
      | 'notes'
      | 'sortOrder'
    >
  >,
): Promise<void> {
  await db.update(tasks).set({ ...input, updatedAt: Date.now() }).where(eq(tasks.id, id));
}

export async function deleteTask(id: string): Promise<void> {
  await db.delete(tasks).where(eq(tasks.id, id));
}

export async function reorderTasks(orderedTaskIds: string[]): Promise<void> {
  await Promise.all(
    orderedTaskIds.map((id, index) => updateTask(id, { sortOrder: index })),
  );
}
