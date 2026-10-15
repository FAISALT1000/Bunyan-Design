import React, { forwardRef, memo } from 'react';
import {
  BasePressable,
  type BasePressableHandle,
} from '../../base/Pressable';
import type { AccessibilityState } from '../RNTheme/native';
import { useTheme } from '../../hooks';
import { createAccessibilityState } from '../../utilities/accessibility';
import { heightForSize, type ComponentSize } from '../../utilities/styles';
import { Icon, isDirectionalIcon, type IconName, type IconTone } from '../Icon';

export interface IconButtonProps {
  icon: IconName;
  accessibilityLabel: string;
  accessibilityHint?: string | undefined;
  onPress?: (() => void) | undefined;
  /** `'tonal'` = subtle primary background with a primary glyph. */
  variant?: 'filled' | 'outline' | 'ghost' | 'tonal';
  /** Component size, or the touch target side in points. */
  size?: ComponentSize | number;
  /** Flip the glyph in RTL. Default: only for directional icons (arrows, chevrons, send…). */
  mirroredInRTL?: boolean;
  /** Extra screen-reader state, e.g. `{ checked: true }` for a rating star. */
  accessibilityState?: AccessibilityState;
  accessibilityRole?: 'button' | 'radio' | 'checkbox' | 'switch' | 'tab' | 'link';
  tone?: IconTone;
  selected?: boolean;
  disabled?: boolean;
  testID?: string | undefined;
}

export const IconButton = memo(forwardRef<BasePressableHandle, IconButtonProps>(
  function IconButton(
    {
      icon,
      accessibilityLabel,
      accessibilityHint,
      onPress,
      variant = 'ghost',
      size = 'medium',
      tone = 'primary',
      selected = false,
      disabled = false,
      mirroredInRTL,
      accessibilityState,
      accessibilityRole = 'button',
      testID,
    },
    ref,
  ) {
    const { theme } = useTheme();
    const dimension = typeof size === 'number' ? size : heightForSize(theme, size);
    const iconSize = typeof size === 'number'
      ? Math.round(size * 0.5)
      : size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'md';
    const selectedBackground = theme.color.primary.subtle;
    const defaultBackground = variant === 'filled'
      ? theme.color.neutral.subtle
      : variant === 'tonal'
        ? theme.color.primary.subtle
        : theme.color.overlay.transparent;

    return (
      <BasePressable
        ref={ref}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ ...createAccessibilityState({ disabled, selected }), ...accessibilityState }}
        testID={testID}
        disabled={disabled}
        onPress={onPress}
        stopPropagation
        baseStyle={{
          width: dimension,
          height: dimension,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme.radius.pill,
          borderWidth: variant === 'outline'
            ? theme.borderWidth.thin
            : theme.borderWidth.none,
          borderColor: theme.color.border.primary,
          backgroundColor: selected ? selectedBackground : defaultBackground,
        }}
        pressedStyle={{ backgroundColor: theme.color.overlay.subtle }}
        hoveredStyle={{ backgroundColor: theme.color.overlay.subtle }}
        focusedStyle={{
          borderColor: theme.color.border.focus,
          borderWidth: theme.borderWidth.medium,
        }}
        disabledStyle={{ opacity: theme.opacity.disabled }}
      >
        <Icon name={icon} size={iconSize} tone={tone} {...(variant === 'tonal' && tone === 'primary' ? { color: theme.color.primary.default } : {})} mirroredInRTL={mirroredInRTL ?? isDirectionalIcon(icon)} />
      </BasePressable>
    );
  },
));
