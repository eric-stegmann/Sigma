import { and, eq } from 'drizzle-orm';
import { db } from '../db/client';
import { taskCompletions } from '../db/schema';
import { generateId } from '../lib/id';
import type { TaskCompletion } from '../types/models';

export async function listCompletionsForDate(date: string): Promise<TaskCompletion[]> {
  return db.select().from(taskCompletions).where(eq(taskCompletions.date, date));
}

async function getCompletion(taskId: string, date: string): Promise<TaskCompletion | undefined> {
  const [completion] = await db
    .select()
    .from(taskCompletions)
    .where(and(eq(taskCompletions.taskId, taskId), eq(taskCompletions.date, date)));
  return completion;
}

/** Toggles a task's completion for a given date; returns the new completed state. */
export async function toggleTaskCompletion(taskId: string, date: string): Promise<boolean> {
  const existing = await getCompletion(taskId, date);
  if (existing) {
    await db.delete(taskCompletions).where(eq(taskCompletions.id, existing.id));
    return false;
  }
  await db.insert(taskCompletions).values({
    id: generateId(),
    taskId,
    date,
    completedAt: Date.now(),
  });
  return true;
}
