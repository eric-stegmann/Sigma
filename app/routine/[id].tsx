import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DayOfWeekPicker } from '../../components/DayOfWeekPicker';
import { ALL_DAYS_MASK, type Task } from '../../types/models';
import * as routineRepository from '../../repositories/routineRepository';
import * as taskRepository from '../../repositories/taskRepository';

const isNew = (id: string) => id === 'new';

export default function RoutineEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [name, setName] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState(ALL_DAYS_MASK);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [routineId, setRoutineId] = useState<string | null>(isNew(id) ? null : id);

  const load = useCallback(async () => {
    if (!routineId) return;
    const routine = await routineRepository.getRoutine(routineId);
    if (routine) {
      setName(routine.name);
      setDaysOfWeek(routine.daysOfWeek);
    }
    setTasks(await taskRepository.listTasksForRoutine(routineId));
  }, [routineId]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const ensureRoutineSaved = async (): Promise<string | null> => {
    if (routineId) {
      await routineRepository.updateRoutine(routineId, { name: name.trim() || 'Untitled routine', daysOfWeek });
      return routineId;
    }
    if (!name.trim()) {
      Alert.alert('Name required', 'Give your routine a name before adding tasks.');
      return null;
    }
    const routine = await routineRepository.createRoutine({ name: name.trim(), daysOfWeek });
    setRoutineId(routine.id);
    return routine.id;
  };

  const onSave = async () => {
    const savedId = await ensureRoutineSaved();
    if (savedId) router.back();
  };

  const onAddTask = async () => {
    const savedId = await ensureRoutineSaved();
    if (savedId) router.push({ pathname: '/task/[id]', params: { id: 'new', routineId: savedId } });
  };

  const onDeleteRoutine = () => {
    if (!routineId) {
      router.back();
      return;
    }
    Alert.alert('Delete routine?', 'This removes the routine and all its tasks.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await routineRepository.deleteRoutine(routineId);
          router.back();
        },
      },
    ]);
  };

  const moveTask = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= tasks.length) return;
    const reordered = [...tasks];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setTasks(reordered);
    await taskRepository.reorderTasks(reordered.map((task) => task.id));
  };

  const onDeleteTask = (task: Task) => {
    Alert.alert('Delete task?', task.title, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await taskRepository.deleteTask(task.id);
          load();
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: routineId ? 'Edit Routine' : 'New Routine' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Morning Routine"
          onBlur={ensureRoutineSaved}
        />

        <Text style={styles.label}>Repeats on</Text>
        <DayOfWeekPicker
          mask={daysOfWeek}
          onChange={async (mask) => {
            setDaysOfWeek(mask);
            if (routineId) await routineRepository.updateRoutine(routineId, { daysOfWeek: mask });
          }}
        />

        <View style={styles.taskHeader}>
          <Text style={styles.label}>Tasks</Text>
          <Pressable onPress={onAddTask} style={styles.addTaskButton}>
            <Ionicons name="add" size={16} color="#4F8EF7" />
            <Text style={styles.addTaskText}>Add task</Text>
          </Pressable>
        </View>

        {tasks.map((task, index) => (
          <View key={task.id} style={styles.taskRow}>
            <Pressable
              style={styles.taskInfo}
              onPress={() => router.push({ pathname: '/task/[id]', params: { id: task.id } })}
            >
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskMeta}>
                {task.startTime} · {task.durationMinutes}m
              </Text>
            </Pressable>
            <View style={styles.taskActions}>
              <Pressable onPress={() => moveTask(index, -1)} hitSlop={8}>
                <Ionicons name="chevron-up" size={18} color="#888" />
              </Pressable>
              <Pressable onPress={() => moveTask(index, 1)} hitSlop={8}>
                <Ionicons name="chevron-down" size={18} color="#888" />
              </Pressable>
              <Pressable onPress={() => onDeleteTask(task)} hitSlop={8}>
                <Ionicons name="trash-outline" size={18} color="#E74C3C" />
              </Pressable>
            </View>
          </View>
        ))}

        <Pressable onPress={onSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Done</Text>
        </Pressable>

        {routineId && (
          <Pressable onPress={onDeleteRoutine} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete routine</Text>
          </Pressable>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, gap: 8, paddingBottom: 48 },
  label: { fontSize: 13, fontWeight: '600', color: '#888', marginTop: 12, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addTaskButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addTaskText: { color: '#4F8EF7', fontWeight: '600', fontSize: 13 },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F7F8',
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
  },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '600', color: '#222' },
  taskMeta: { fontSize: 12, color: '#999', marginTop: 2 },
  taskActions: { flexDirection: 'row', gap: 12, paddingLeft: 8 },
  saveButton: {
    marginTop: 24,
    backgroundColor: '#4F8EF7',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  deleteButton: { marginTop: 12, alignItems: 'center', paddingVertical: 10 },
  deleteButtonText: { color: '#E74C3C', fontWeight: '600' },
});
