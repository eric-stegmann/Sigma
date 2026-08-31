import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { parseLocalDate } from '../lib/recurrence';

interface DateHeaderProps {
  dateKey: string;
  isToday: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function DateHeader({ dateKey, isToday, onPrevious, onNext, onToday }: DateHeaderProps) {
  const label = parseLocalDate(dateKey).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <Pressable onPress={onPrevious} hitSlop={10} style={styles.arrow}>
        <Ionicons name="chevron-back" size={22} color="#444" />
      </Pressable>
      <Pressable onPress={onToday} style={styles.titleWrap}>
        <Text style={styles.title}>{isToday ? 'Today' : label}</Text>
        {!isToday && <Text style={styles.subtitle}>Tap to return to today</Text>}
      </Pressable>
      <Pressable onPress={onNext} hitSlop={10} style={styles.arrow}>
        <Ionicons name="chevron-forward" size={22} color="#444" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  arrow: { padding: 4 },
  titleWrap: { alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#222' },
  subtitle: { fontSize: 11, color: '#999' },
});
