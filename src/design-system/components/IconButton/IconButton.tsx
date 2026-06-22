import React, { forwardRef, memo } from 'react';
import {
  BasePressable,
  type BasePressableHandle,
} from '../../base/Pressable';
import { useTheme } from '../../hooks';
import { createAccessibilityState } from '../../utilities/accessibility';
import { heightForSize, type ComponentSize } from '../../utilities/styles';
import { Icon, type IconName, type IconTone } from '../Icon';

export interface IconButtonProps {
  icon: IconName;
  accessibilityLabel: string;
  accessibilityHint?: string | undefined;
  onPress?: (() => void) | undefined;
  variant?: 'filled' | 'outline' | 'ghost';
  size?: ComponentSize;
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
      testID,
    },
    ref,
  ) {
    const { theme } = useTheme();
    const dimension = heightForSize(theme, size);
    const iconSize = size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'md';
    const selectedBackground = theme.color.primary.subtle;
    const defaultBackground = variant === 'filled'
      ? theme.color.neutral.subtle
      : theme.color.overlay.transparent;

    return (
      <BasePressable
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={createAccessibilityState({ disabled, selected })}
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
        <Icon name={icon} size={iconSize} tone={tone} mirroredInRTL />
      </BasePressable>
    );
  },
));
