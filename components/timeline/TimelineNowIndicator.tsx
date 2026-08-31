import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { topForNow } from '../../lib/time';
import { TIMELINE_LEFT_INSET } from './TimelineHourGrid';

export function TimelineNowIndicator() {
  const [top, setTop] = useState(() => topForNow());

  useEffect(() => {
    const interval = setInterval(() => setTop(topForNow()), 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.container, { top }]} pointerEvents="none">
      <View style={styles.dot} />
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: TIMELINE_LEFT_INSET - 5,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E74C3C' },
  line: { flex: 1, height: 1.5, backgroundColor: '#E74C3C' },
});
