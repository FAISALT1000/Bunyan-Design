import React, { memo } from 'react';
import { Pressable, View } from '../RNTheme';
import { useTheme } from '../../hooks';
import { useText, type TextValue } from '../../i18n';
import { logicalRow } from '../../utilities/styles';
import { Icon } from '../Icon';

export interface SwatchOption {
  /** Stored value (defaults to `color`). */
  value?: string;
  /** Any CSS/RN colour. */
  color: string;
  label?: TextValue;
  disabled?: boolean;
}

export interface SwatchGroupProps {
  options: readonly (string | SwatchOption)[];
  value?: string | null;
  onChange?: (value: string) => void;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  accessibilityLabel?: TextValue;
  testID?: string;
}

/** Relative luminance of a #RGB / #RRGGBB colour (0 = black, 1 = white). Unknown formats → 0.5. */
export const colorLuminance = (color: string) => {
  const hex = color.trim().replace('#', '');
  const full = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex;
  if (!/^[0-9a-f]{6}$/i.test(full)) return 0.5;
  const channel = (i: number) => {
    const v = parseInt(full.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
};

/** Colour picker made of round swatches. */
export const SwatchGroup = memo(function SwatchGroup({
  options,
  value,
  onChange,
  size = 'medium',
  disabled = false,
  accessibilityLabel,
  testID,
}: SwatchGroupProps) {
  const { theme, direction } = useTheme();
  const t = useText();
  const dimension = { small: theme.componentHeight.xs, medium: theme.componentHeight.sm, large: theme.componentHeight.md }[size];
  return (
    <View
      testID={testID}
      accessibilityRole="radiogroup"
      accessibilityLabel={t(accessibilityLabel)}
      style={[logicalRow(direction), { flexWrap: 'wrap', gap: theme.spacing.md }]}
    >
      {options.map(item => {
        const option = typeof item === 'string' ? { color: item } : item;
        const optionValue = option.value ?? option.color;
        const selected = optionValue === value;
        const isDisabled = disabled || Boolean(option.disabled);
        return (
          <Pressable
            key={optionValue}
            accessibilityRole="radio"
            accessibilityLabel={t(option.label) ?? optionValue}
            accessibilityState={{ checked: selected, disabled: isDisabled }}
            disabled={isDisabled}
            hitSlop={Math.max(0, (theme.componentHeight.md - dimension) / 2)}
            onPress={() => {
              if (!selected) onChange?.(optionValue);
            }}
            style={{
              width: dimension + theme.spacing.sm,
              height: dimension + theme.spacing.sm,
              borderRadius: theme.radius.pill,
              borderWidth: theme.borderWidth.medium,
              borderColor: selected ? theme.color.border.focus : theme.color.overlay.transparent,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isDisabled ? theme.opacity.disabled : theme.opacity.opaque,
            }}
          >
            <View style={{ width: dimension, height: dimension, borderRadius: theme.radius.pill, backgroundColor: option.color, borderWidth: theme.borderWidth.thin, borderColor: theme.color.border.primary, alignItems: 'center', justifyContent: 'center' }}>
              {selected ? <Icon name="check" size={size === 'small' ? 'xs' : 'sm'} color={colorLuminance(option.color) > 0.45 ? '#0F172A' : '#FFFFFF'} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
});
