import { Pressable, StyleSheet, Text, View } from 'react-native';
import { daysOfWeekLabels } from '../lib/recurrence';
import { DAY_BIT, type DaysOfWeekMask } from '../types/models';

const BITS = [DAY_BIT.MON, DAY_BIT.TUE, DAY_BIT.WED, DAY_BIT.THU, DAY_BIT.FRI, DAY_BIT.SAT, DAY_BIT.SUN];

interface DayOfWeekPickerProps {
  mask: DaysOfWeekMask;
  onChange: (mask: DaysOfWeekMask) => void;
}

export function DayOfWeekPicker({ mask, onChange }: DayOfWeekPickerProps) {
  const days = daysOfWeekLabels(mask);

  return (
    <View style={styles.row}>
      {days.map((day, index) => {
        const bit = BITS[index];
        return (
          <Pressable
            key={index}
            onPress={() => onChange(day.active ? mask & ~bit : mask | bit)}
            style={[styles.chip, day.active && styles.chipActive]}
          >
            <Text style={[styles.chipText, day.active && styles.chipTextActive]}>{day.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  chip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
  },
  chipActive: { backgroundColor: '#4F8EF7' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#888' },
  chipTextActive: { color: '#fff' },
});
