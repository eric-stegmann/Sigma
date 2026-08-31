import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { db } from '../db/client';
import migrations from '../db/migrations/migrations';
import { seedDefaultCategoriesIfNeeded } from '../repositories/categoryRepository';
import { startDateRolloverWatcher } from '../store/useTodayStore';

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (!success) return;
    seedDefaultCategoriesIfNeeded();
    startDateRolloverWatcher();
  }, [success]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Database error: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="routine/[id]" options={{ headerShown: true, presentation: 'modal' }} />
        <Stack.Screen name="task/[id]" options={{ headerShown: true, presentation: 'modal' }} />
        <Stack.Screen name="category/index" options={{ headerShown: true, presentation: 'modal' }} />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  errorText: { color: '#c0392b', padding: 16, textAlign: 'center' },
});
