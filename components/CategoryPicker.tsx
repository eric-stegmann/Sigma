import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { IconName } from '../constants/icons';
import type { Category } from '../types/models';

interface CategoryPickerProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onManage: () => void;
}

export function CategoryPicker({ categories, selectedId, onSelect, onManage }: CategoryPickerProps) {
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => onSelect(null)}
        style={[styles.chip, selectedId === null && styles.chipActiveNeutral]}
      >
        <Text style={styles.chipText}>None</Text>
      </Pressable>
      {categories.map((category) => {
        const active = category.id === selectedId;
        return (
          <Pressable
            key={category.id}
            onPress={() => onSelect(category.id)}
            style={[styles.chip, active && { backgroundColor: category.color }]}
          >
            <Ionicons
              name={category.icon as IconName}
              size={14}
              color={active ? '#fff' : category.color}
              style={styles.chipIcon}
            />
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{category.name}</Text>
          </Pressable>
        );
      })}
      <Pressable onPress={onManage} style={styles.manageChip}>
        <Ionicons name="add" size={14} color="#555" />
        <Text style={styles.chipText}>Manage</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  chipActiveNeutral: { backgroundColor: '#DDD' },
  chipIcon: { marginRight: 2 },
  chipText: { fontSize: 13, color: '#555', fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  manageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    borderStyle: 'dashed',
  },
});
