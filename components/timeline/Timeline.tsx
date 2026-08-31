import { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, View } from 'react-native';
import { layoutTasksForDay, PIXELS_PER_MINUTE, topForNow } from '../../lib/time';
import { TimelineHourGrid } from './TimelineHourGrid';
import { TimelineNowIndicator } from './TimelineNowIndicator';
import { TaskBlock } from './TaskBlock';
import type { TaskInstance } from '../../types/models';

const DAY_HEIGHT = 24 * 60 * PIXELS_PER_MINUTE;

interface TimelineProps {
  instances: TaskInstance[];
  onToggleTask: (taskId: string) => void;
  showNowIndicator: boolean;
}

export function Timeline({ instances, onToggleTask, showNowIndicator }: TimelineProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [width, setWidth] = useState(0);
  const positioned = layoutTasksForDay(instances);

  useEffect(() => {
    if (!showNowIndicator) return;
    const targetY = Math.max(topForNow() - 150, 0);
    const timeout = setTimeout(() => scrollRef.current?.scrollTo({ y: targetY, animated: true }), 50);
    return () => clearTimeout(timeout);
    // Only auto-scroll once when the "today" view mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNowIndicator]);

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  return (
    <ScrollView ref={scrollRef} style={styles.scroll} onLayout={onLayout} testID="timeline-scroll">
      <View style={[styles.canvas, { height: DAY_HEIGHT }]}>
        <TimelineHourGrid />
        {showNowIndicator && <TimelineNowIndicator />}
        {width > 0 &&
          positioned.map((instance) => (
            <TaskBlock
              key={instance.task.id}
              instance={instance}
              onToggle={onToggleTask}
              containerWidth={width}
            />
          ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  canvas: { position: 'relative' },
});
