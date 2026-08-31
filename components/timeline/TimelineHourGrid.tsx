import { StyleSheet, Text, View } from 'react-native';
import { PIXELS_PER_MINUTE } from '../../lib/time';

const HOUR_LABEL_WIDTH = 52;

export function TimelineHourGrid() {
  const hours = Array.from({ length: 24 }, (_, hour) => hour);
  return (
    <>
      {hours.map((hour) => (
        <View key={hour} style={[styles.row, { top: hour * 60 * PIXELS_PER_MINUTE }]}>
          <Text style={styles.label}>{formatHour(hour)}</Text>
          <View style={styles.line} />
        </View>
      ))}
    </>
  );
}

function formatHour(hour: number): string {
  const period = hour < 12 ? 'AM' : 'PM';
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display} ${period}`;
}

export const TIMELINE_LEFT_INSET = HOUR_LABEL_WIDTH;

const styles = StyleSheet.create({
  row: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'flex-start' },
  label: { width: HOUR_LABEL_WIDTH, fontSize: 11, color: '#999', paddingRight: 6, textAlign: 'right' },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: '#E3E3E3', marginTop: 6 },
});
