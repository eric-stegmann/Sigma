import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface ProgressBarProps {
  percent: number; // 0-1
  completedTasks: number;
  totalTasks: number;
}

export function ProgressBar({ percent, completedTasks, totalTasks }: ProgressBarProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percent,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [percent, widthAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>
          {totalTasks === 0 ? 'No tasks today' : `${completedTasks} of ${totalTasks} done`}
        </Text>
        <Text style={styles.percent}>{Math.round(percent * 100)}%</Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { color: '#555', fontSize: 13 },
  percent: { color: '#333', fontSize: 13, fontWeight: '600' },
  track: { height: 8, borderRadius: 4, backgroundColor: '#EAEAEA', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4, backgroundColor: '#4F8EF7' },
});
