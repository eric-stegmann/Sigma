import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CategoryPicker } from '../../components/CategoryPicker';
import { IconPicker } from '../../components/IconPicker';
import { ColorSwatchPicker } from '../../components/ColorSwatchPicker';
import { DEFAULT_ICON, type IconName } from '../../constants/icons';
import { DEFAULT_CATEGORY_PALETTE } from '../../lib/colors';
import { minutesToTime, timeToMinutes } from '../../lib/time';
import { useRoutinesStore } from '../../store/useRoutinesStore';
import * as taskRepository from '../../repositories/taskRepository';

const DURATION_PRESETS = [5, 10, 15, 30, 60];

const isNew = (id: string) => id === 'new';

export default function TaskEditorScreen() {
  const { id, routineId } = useLocalSearchParams<{ id: string; routineId?: string }>();
  const { categories, refreshCategories } = useRoutinesStore();

  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [overrideStyle, setOverrideStyle] = useState(false);
  const [icon, setIcon] = useState<IconName>(DEFAULT_ICON);
  const [color, setColor] = useState<string>(DEFAULT_CATEGORY_PALETTE[0]);
  const [notes, setNotes] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(Platform.OS === 'ios');

  useEffect(() => {
    refreshCategories();
    if (isNew(id)) return;
    (async () => {
      const task = await taskRepository.getTask(id);
      if (!task) return;
      setTitle(task.title);
      setStartTime(task.startTime);
      setDurationMinutes(task.durationMinutes);
      setCategoryId(task.categoryId);
      setNotes(task.notes ?? '');
      if (task.icon || task.color) {
        setOverrideStyle(true);
        setIcon((task.icon ?? DEFAULT_ICON) as IconName);
        setColor(task.color ?? DEFAULT_CATEGORY_PALETTE[0]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSave = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Give the task a name.');
      return;
    }
    const payload = {
      title: title.trim(),
      startTime,
      durationMinutes,
      categoryId,
      icon: overrideStyle ? icon : null,
      color: overrideStyle ? color : null,
      notes: notes.trim() || null,
    };

    if (isNew(id)) {
      if (!routineId) {
        Alert.alert('Missing routine', 'Save the routine first.');
        return;
      }
      await taskRepository.createTask({ routineId, ...payload });
    } else {
      await taskRepository.updateTask(id, payload);
    }
    router.back();
  };

  const onDelete = () => {
    if (isNew(id)) {
      router.back();
      return;
    }
    Alert.alert('Delete task?', title, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await taskRepository.deleteTask(id);
          router.back();
        },
      },
    ]);
  };

  const timeDate = (() => {
    const date = new Date();
    date.setHours(0, timeToMinutes(startTime), 0, 0);
    return date;
  })();

  return (
    <>
      <Stack.Screen options={{ title: isNew(id) ? 'New Task' : 'Edit Task' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Task name" />

        <Text style={styles.label}>Start time</Text>
        {Platform.OS === 'android' && !showTimePicker && (
          <Pressable style={styles.input} onPress={() => setShowTimePicker(true)}>
            <Text style={styles.timeText}>{startTime}</Text>
          </Pressable>
        )}
        {showTimePicker && (
          <DateTimePicker
            value={timeDate}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_event, date) => {
              if (Platform.OS === 'android') setShowTimePicker(false);
              if (!date) return;
              setStartTime(minutesToTime(date.getHours() * 60 + date.getMinutes()));
            }}
          />
        )}

        <Text style={styles.label}>Duration</Text>
        <View style={styles.presetRow}>
          {DURATION_PRESETS.map((preset) => (
            <Pressable
              key={preset}
              onPress={() => setDurationMinutes(preset)}
              style={[styles.presetChip, durationMinutes === preset && styles.presetChipActive]}
            >
              <Text
                style={[styles.presetText, durationMinutes === preset && styles.presetTextActive]}
              >
                {preset}m
              </Text>
            </Pressable>
          ))}
          <TextInput
            style={[styles.input, styles.durationInput]}
            keyboardType="number-pad"
            value={String(durationMinutes)}
            onChangeText={(text) => setDurationMinutes(Math.max(1, Number(text.replace(/\D/g, '')) || 1))}
          />
        </View>

        <Text style={styles.label}>Category</Text>
        <CategoryPicker
          categories={categories}
          selectedId={categoryId}
          onSelect={setCategoryId}
          onManage={() => router.push('/category')}
        />

        <Pressable style={styles.overrideToggle} onPress={() => setOverrideStyle((v) => !v)}>
          <Text style={styles.overrideToggleText}>
            {overrideStyle ? 'Using custom icon/color' : 'Use custom icon/color instead of category default'}
          </Text>
        </Pressable>

        {overrideStyle && (
          <>
            <Text style={styles.label}>Icon</Text>
            <IconPicker value={icon} color={color} onChange={setIcon} />
            <Text style={styles.label}>Color</Text>
            <ColorSwatchPicker value={color} onChange={setColor} />
          </>
        )}

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional notes"
          multiline
        />

        <Pressable onPress={onSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
        <Pressable onPress={onDelete} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Delete task</Text>
        </Pressable>
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
  timeText: { fontSize: 16, color: '#222' },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  presetChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: '#F0F0F0' },
  presetChipActive: { backgroundColor: '#4F8EF7' },
  presetText: { fontSize: 13, color: '#555', fontWeight: '600' },
  presetTextActive: { color: '#fff' },
  durationInput: { width: 70, paddingVertical: 8, textAlign: 'center' },
  overrideToggle: { marginTop: 16 },
  overrideToggleText: { color: '#4F8EF7', fontSize: 13, fontWeight: '600' },
  notesInput: { minHeight: 70, textAlignVertical: 'top' },
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
