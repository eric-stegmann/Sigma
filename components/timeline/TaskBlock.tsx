import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Checkbox } from '../Checkbox';
import { TIMELINE_LEFT_INSET } from './TimelineHourGrid';
import type { IconName } from '../../constants/icons';
import type { PositionedTaskInstance } from '../../types/models';

interface TaskBlockProps {
  instance: PositionedTaskInstance;
  onToggle: (taskId: string) => void;
  containerWidth: number;
}

const GAP = 4;

export function TaskBlock({ instance, onToggle, containerWidth }: TaskBlockProps) {
  const { task, category, completed, top, height, columnIndex, columnCount } = instance;
  const color = task.color ?? category?.color ?? '#4F8EF7';
  const icon = (task.icon ?? category?.icon ?? 'checkmark-circle-outline') as IconName;

  const availableWidth = containerWidth - TIMELINE_LEFT_INSET;
  const columnWidth = availableWidth / columnCount;
  const left = TIMELINE_LEFT_INSET + columnIndex * columnWidth;
  const width = columnWidth - GAP;

  return (
    <View style={[styles.container, { top, height, left, width, borderLeftColor: color }]}>
      <Pressable
        style={styles.pressable}
        onPress={() => router.push(`/task/${task.id}`)}
        onLongPress={() => onToggle(task.id)}
      >
        <View style={styles.textBlock}>
          <View style={styles.titleRow}>
            <Ionicons name={icon} size={14} color={color} style={styles.icon} />
            <Text style={[styles.title, completed && styles.titleCompleted]} numberOfLines={1}>
              {task.title}
            </Text>
          </View>
          <Text style={styles.time} numberOfLines={1}>
            {task.startTime} · {task.durationMinutes}m
          </Text>
        </View>
        <Checkbox
          checked={completed}
          onToggle={() => onToggle(task.id)}
          color={color}
          size={22}
          testID={`task-checkbox-${task.id}`}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    overflow: 'hidden',
  },
  pressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  textBlock: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  icon: { marginTop: 1 },
  title: { fontSize: 14, fontWeight: '600', color: '#222', flexShrink: 1 },
  titleCompleted: { textDecorationLine: 'line-through', color: '#999' },
  time: { fontSize: 11, color: '#999' },
});
