import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  color?: string;
  size?: number;
  testID?: string;
}

export function Checkbox({ checked, onToggle, color = '#4F8EF7', size = 26, testID }: CheckboxProps) {
  return (
    <Pressable
      onPress={onToggle}
      hitSlop={8}
      testID={testID}
      style={[
        styles.box,
        { width: size, height: size, borderRadius: size / 2, borderColor: color },
        checked && { backgroundColor: color },
      ]}
    >
      {checked && <Ionicons name="checkmark" size={size * 0.7} color="#fff" />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
