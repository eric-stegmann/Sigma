import { create } from 'zustand';
import * as routineRepository from '../repositories/routineRepository';
import * as taskRepository from '../repositories/taskRepository';
import * as categoryRepository from '../repositories/categoryRepository';
import type { Category, Routine, Task } from '../types/models';

interface RoutinesState {
  routines: Routine[];
  tasksByRoutineId: Record<string, Task[]>;
  categories: Category[];
  loading: boolean;
  refresh: () => Promise<void>;
  refreshCategories: () => Promise<void>;
}

export const useRoutinesStore = create<RoutinesState>((set, get) => ({
  routines: [],
  tasksByRoutineId: {},
  categories: [],
  loading: true,

  refresh: async () => {
    set({ loading: true });
    const routines = await routineRepository.listRoutines();
    const taskLists = await Promise.all(
      routines.map((routine) => taskRepository.listTasksForRoutine(routine.id)),
    );
    const tasksByRoutineId: Record<string, Task[]> = {};
    routines.forEach((routine, index) => {
      tasksByRoutineId[routine.id] = taskLists[index];
    });
    const categories = await categoryRepository.listCategories();
    set({ routines, tasksByRoutineId, categories, loading: false });
  },

  refreshCategories: async () => {
    const categories = await categoryRepository.listCategories();
    set({ categories });
  },
}));
