import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ICON_CHOICES, type IconName } from '../constants/icons';

interface IconPickerProps {
  value: IconName;
  color: string;
  onChange: (icon: IconName) => void;
}

export function IconPicker({ value, color, onChange }: IconPickerProps) {
  return (
    <View style={styles.row}>
      {ICON_CHOICES.map((icon) => {
        const active = icon === value;
        return (
          <Pressable
            key={icon}
            onPress={() => onChange(icon)}
            style={[styles.item, active && { backgroundColor: color }]}
          >
            <Ionicons name={icon} size={20} color={active ? '#fff' : '#555'} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
  },
});
