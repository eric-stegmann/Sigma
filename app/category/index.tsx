import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { IconPicker } from '../../components/IconPicker';
import { ColorSwatchPicker } from '../../components/ColorSwatchPicker';
import { DEFAULT_ICON, type IconName } from '../../constants/icons';
import { DEFAULT_CATEGORY_PALETTE } from '../../lib/colors';
import { useRoutinesStore } from '../../store/useRoutinesStore';
import * as categoryRepository from '../../repositories/categoryRepository';
import type { Category } from '../../types/models';

export default function CategoryManagerScreen() {
  const { categories, refreshCategories } = useRoutinesStore();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<IconName>(DEFAULT_ICON);
  const [color, setColor] = useState<string>(DEFAULT_CATEGORY_PALETTE[0]);

  useEffect(() => {
    refreshCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreate = async () => {
    if (!name.trim()) return;
    await categoryRepository.createCategory({ name: name.trim(), icon, color });
    setName('');
    refreshCategories();
  };

  const onDelete = (category: Category) => {
    Alert.alert('Delete category?', category.name, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await categoryRepository.deleteCategory(category.id);
          refreshCategories();
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Categories' }} />
      <View style={styles.container}>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="New category name"
              />
              <Text style={styles.label}>Icon</Text>
              <IconPicker value={icon} color={color} onChange={setIcon} />
              <Text style={styles.label}>Color</Text>
              <ColorSwatchPicker value={color} onChange={setColor} />
              <Pressable onPress={onCreate} style={styles.addButton}>
                <Text style={styles.addButtonText}>Add category</Text>
              </Pressable>
              <Text style={styles.sectionLabel}>Existing</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Ionicons name={item.icon as IconName} size={18} color={item.color} />
              <Text style={styles.rowText}>{item.name}</Text>
              <Pressable onPress={() => onDelete(item)} hitSlop={8}>
                <Ionicons name="trash-outline" size={18} color="#E74C3C" />
              </Pressable>
            </View>
          )}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  listContent: { padding: 16, paddingBottom: 48 },
  form: { gap: 8, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  label: { fontSize: 13, fontWeight: '600', color: '#888', marginTop: 8 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#888', marginTop: 16 },
  addButton: {
    marginTop: 8,
    backgroundColor: '#4F8EF7',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F7F7F8',
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
  },
  rowText: { flex: 1, fontSize: 15, color: '#222', fontWeight: '500' },
});
