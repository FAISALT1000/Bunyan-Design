import type { AccessibilityState } from 'react-native';

export interface ComponentAccessibilityState {
  disabled?: boolean;
  selected?: boolean;
  checked?: boolean | 'mixed';
  expanded?: boolean;
  busy?: boolean;
}

export const createAccessibilityState = ({
  disabled,
  selected,
  checked,
  expanded,
  busy,
}: ComponentAccessibilityState): AccessibilityState => ({
  ...(disabled !== undefined ? { disabled } : {}),
  ...(selected !== undefined ? { selected } : {}),
  ...(checked !== undefined ? { checked } : {}),
  ...(expanded !== undefined ? { expanded } : {}),
  ...(busy !== undefined ? { busy } : {}),
});

export const createAccessibilityLabel = (
  values: readonly (string | number | null | undefined | false)[],
): string | undefined => {
  const label = values
    .filter((value): value is string | number => (
      typeof value === 'string' || typeof value === 'number'
    ))
    .map(String)
    .filter(Boolean)
    .join(', ');

  return label || undefined;
};
