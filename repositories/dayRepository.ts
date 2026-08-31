import { routineAppliesOnDate } from '../lib/recurrence';
import { listRoutines } from './routineRepository';
import { listAllTasks } from './taskRepository';
import { listCategories } from './categoryRepository';
import { listCompletionsForDate } from './completionRepository';
import type { DailyProgress, TaskInstance } from '../types/models';

export async function getTaskInstancesForDate(date: string): Promise<TaskInstance[]> {
  const [routines, tasks, categories, completions] = await Promise.all([
    listRoutines(),
    listAllTasks(),
    listCategories(),
    listCompletionsForDate(date),
  ]);

  const applicableRoutineIds = new Set(
    routines.filter((routine) => routineAppliesOnDate(routine, date)).map((routine) => routine.id),
  );
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const completionByTaskId = new Map(completions.map((completion) => [completion.taskId, completion]));

  return tasks
    .filter((task) => applicableRoutineIds.has(task.routineId))
    .map((task) => {
      const completion = completionByTaskId.get(task.id);
      return {
        task,
        category: task.categoryId ? categoryById.get(task.categoryId) ?? null : null,
        date,
        completed: Boolean(completion),
        completedAt: completion?.completedAt ?? null,
      };
    });
}

export function computeDailyProgress(instances: TaskInstance[]): DailyProgress {
  const totalTasks = instances.length;
  const completedTasks = instances.filter((instance) => instance.completed).length;
  return {
    totalTasks,
    completedTasks,
    percent: totalTasks === 0 ? 0 : completedTasks / totalTasks,
  };
}
