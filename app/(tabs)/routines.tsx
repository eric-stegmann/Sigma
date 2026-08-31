import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../../components/EmptyState';
import { daysOfWeekLabels } from '../../lib/recurrence';
import { useRoutinesStore } from '../../store/useRoutinesStore';
import { updateRoutine } from '../../repositories/routineRepository';
import type { Routine } from '../../types/models';

export default function RoutinesScreen() {
  const { routines, tasksByRoutineId, refresh } = useRoutinesStore();

  useFocusEffect(
    useCallback(() => {
      refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const onToggleActive = async (routine: Routine) => {
    await updateRoutine(routine.id, { active: !routine.active });
    refresh();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Routines</Text>
        <Pressable onPress={() => router.push('/routine/new')} hitSlop={10}>
          <Ionicons name="add-circle" size={30} color="#4F8EF7" />
        </Pressable>
      </View>
      {routines.length === 0 ? (
        <EmptyState
          icon="repeat-outline"
          title="No routines yet"
          subtitle="Tap + to build your first routine."
        />
      ) : (
        <FlatList
          data={routines}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <RoutineListItem
              routine={item}
              taskCount={tasksByRoutineId[item.id]?.length ?? 0}
              onPress={() => router.push(`/routine/${item.id}`)}
              onToggleActive={() => onToggleActive(item)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function RoutineListItem({
  routine,
  taskCount,
  onPress,
  onToggleActive,
}: {
  routine: Routine;
  taskCount: number;
  onPress: () => void;
  onToggleActive: () => void;
}) {
  const days = daysOfWeekLabels(routine.daysOfWeek);
  return (
    <Pressable onPress={onPress} style={styles.item}>
      <View style={styles.itemMain}>
        <Text style={styles.itemTitle}>{routine.name}</Text>
        <View style={styles.dayRow}>
          {days.map((day, index) => (
            <Text key={index} style={[styles.dayLabel, day.active && styles.dayLabelActive]}>
              {day.label}
            </Text>
          ))}
        </View>
        <Text style={styles.itemMeta}>
          {taskCount} task{taskCount === 1 ? '' : 's'}
        </Text>
      </View>
      <Switch value={routine.active} onValueChange={onToggleActive} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#222' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F7F8',
    borderRadius: 12,
    padding: 14,
  },
  itemMain: { flex: 1, gap: 6 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#222' },
  dayRow: { flexDirection: 'row', gap: 4 },
  dayLabel: {
    fontSize: 11,
    width: 18,
    height: 18,
    lineHeight: 18,
    textAlign: 'center',
    borderRadius: 9,
    color: '#AAA',
    backgroundColor: '#EDEDED',
  },
  dayLabelActive: { color: '#fff', backgroundColor: '#4F8EF7' },
  itemMeta: { fontSize: 12, color: '#999' },
});
