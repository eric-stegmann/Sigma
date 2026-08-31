import { asc, eq } from 'drizzle-orm';
import { db } from '../db/client';
import { routines } from '../db/schema';
import { generateId } from '../lib/id';
import type { Routine } from '../types/models';

export async function listRoutines(): Promise<Routine[]> {
  return db.select().from(routines).orderBy(asc(routines.sortOrder));
}

export async function getRoutine(id: string): Promise<Routine | undefined> {
  const [routine] = await db.select().from(routines).where(eq(routines.id, id));
  return routine;
}

export async function createRoutine(input: {
  name: string;
  daysOfWeek: number;
  startDate?: string | null;
  endDate?: string | null;
}): Promise<Routine> {
  const existing = await listRoutines();
  const now = Date.now();
  const routine: Routine = {
    id: generateId(),
    name: input.name,
    active: true,
    daysOfWeek: input.daysOfWeek,
    startDate: input.startDate ?? null,
    endDate: input.endDate ?? null,
    sortOrder: existing.length,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(routines).values(routine);
  return routine;
}

export async function updateRoutine(
  id: string,
  input: Partial<Pick<Routine, 'name' | 'active' | 'daysOfWeek' | 'startDate' | 'endDate' | 'sortOrder'>>,
): Promise<void> {
  await db.update(routines).set({ ...input, updatedAt: Date.now() }).where(eq(routines.id, id));
}

export async function deleteRoutine(id: string): Promise<void> {
  await db.delete(routines).where(eq(routines.id, id));
}
