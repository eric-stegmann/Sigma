import { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DateHeader } from '../../components/DateHeader';
import { ProgressBar } from '../../components/ProgressBar';
import { EmptyState } from '../../components/EmptyState';
import { Timeline } from '../../components/timeline/Timeline';
import { useTodayStore } from '../../store/useTodayStore';

export default function TodayScreen() {
  const {
    selectedDate,
    isViewingToday,
    instances,
    progress,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    toggleTask,
    refresh,
  } = useTodayStore();

  useFocusEffect(
    useCallback(() => {
      refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DateHeader
        dateKey={selectedDate}
        isToday={isViewingToday}
        onPrevious={goToPreviousDay}
        onNext={goToNextDay}
        onToday={goToToday}
      />
      <ProgressBar
        percent={progress.percent}
        completedTasks={progress.completedTasks}
        totalTasks={progress.totalTasks}
      />
      {instances.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No routines scheduled"
          subtitle="Create a routine and pick its days to see it here."
        />
      ) : (
        <Timeline instances={instances} onToggleTask={toggleTask} showNowIndicator={isViewingToday} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});
