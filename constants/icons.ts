import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/** Curated subset of Ionicons offered in the icon picker. */
export const ICON_CHOICES: IconName[] = [
  'briefcase-outline',
  'heart-outline',
  'person-outline',
  'barbell-outline',
  'book-outline',
  'cafe-outline',
  'bed-outline',
  'restaurant-outline',
  'walk-outline',
  'water-outline',
  'musical-notes-outline',
  'school-outline',
  'code-slash-outline',
  'basket-outline',
  'paw-outline',
  'sunny-outline',
  'moon-outline',
  'call-outline',
  'mail-outline',
  'checkmark-circle-outline',
];

export const DEFAULT_ICON: IconName = 'checkmark-circle-outline';
