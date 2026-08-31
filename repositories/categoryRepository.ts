import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { categories } from '../db/schema';
import { generateId } from '../lib/id';
import { DEFAULT_CATEGORY_PALETTE } from '../lib/colors';
import type { Category } from '../types/models';

export async function listCategories(): Promise<Category[]> {
  return db.select().from(categories).orderBy(categories.createdAt);
}

export async function createCategory(input: {
  name: string;
  color: string;
  icon: string;
}): Promise<Category> {
  const category: Category = {
    id: generateId(),
    name: input.name,
    color: input.color,
    icon: input.icon,
    createdAt: Date.now(),
  };
  await db.insert(categories).values(category);
  return category;
}

export async function updateCategory(
  id: string,
  input: Partial<Pick<Category, 'name' | 'color' | 'icon'>>,
): Promise<void> {
  await db.update(categories).set(input).where(eq(categories.id, id));
}

export async function deleteCategory(id: string): Promise<void> {
  await db.delete(categories).where(eq(categories.id, id));
}

const DEFAULT_CATEGORIES = [
  { name: 'Work', color: DEFAULT_CATEGORY_PALETTE[0], icon: 'briefcase-outline' },
  { name: 'Health', color: DEFAULT_CATEGORY_PALETTE[1], icon: 'heart-outline' },
  { name: 'Personal', color: DEFAULT_CATEGORY_PALETTE[2], icon: 'person-outline' },
];

export async function seedDefaultCategoriesIfNeeded(): Promise<void> {
  const existing = await listCategories();
  if (existing.length > 0) return;
  for (const category of DEFAULT_CATEGORIES) {
    await createCategory(category);
  }
}
