import React, { forwardRef, memo } from 'react';
import { Pressable, type PressableProps, type View } from 'react-native';
import { useTheme } from '../../hooks';
import { heightForSize, type ComponentSize } from '../../utilities/styles';
import { Icon, type IconName, type IconTone } from '../Icon';

export interface IconButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  icon: IconName;
  accessibilityLabel: string;
  variant?: 'filled' | 'outline' | 'ghost';
  size?: ComponentSize;
  tone?: IconTone;
  selected?: boolean;
}

export const IconButton = memo(forwardRef<View, IconButtonProps>(function IconButton(
  {
    icon,
    accessibilityLabel,
    variant = 'ghost',
    size = 'medium',
    tone = 'primary',
    selected = false,
    disabled = false,
    ...props
  },
  ref,
) {
  const { theme } = useTheme();
  const dimension = heightForSize(theme, size);
  const iconSize = size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'md';

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: Boolean(disabled), selected }}
      disabled={disabled}
      {...props}
      style={({ pressed }) => ({
        width: dimension,
        height: dimension,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radius.pill,
        borderWidth: variant === 'outline' ? theme.borderWidth.thin : theme.borderWidth.none,
        borderColor: theme.color.border.primary,
        backgroundColor: selected
          ? theme.color.primary.subtle
          : variant === 'filled'
          ? theme.color.neutral.subtle
          : pressed
          ? theme.color.overlay.subtle
          : theme.color.overlay.transparent,
        opacity: disabled ? theme.opacity.disabled : theme.opacity.opaque,
      })}
    >
      <Icon name={icon} size={iconSize} tone={tone} mirroredInRTL />
    </Pressable>
  );
}));
