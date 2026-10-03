import React, { forwardRef, memo } from 'react';
import { Pressable, View, type PressableProps, type ViewProps, type ViewRef, type ViewStyle } from '../RNTheme';
import { useTheme } from '../../hooks';

export type CardVariant = 'elevated' | 'outlined' | 'filled';

interface SharedCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export type CardProps =
  | (SharedCardProps & { onPress: NonNullable<PressableProps['onPress']>; accessibilityLabel: string } & Omit<PressableProps, 'children' | 'style' | 'onPress'>)
  | (SharedCardProps & { onPress?: never; accessibilityLabel?: string } & Omit<ViewProps, 'children' | 'style'>);

export const Card = memo(forwardRef<ViewRef, CardProps>(function Card(
  { children, variant = 'outlined', padding = 'medium', onPress, accessibilityLabel, ...props },
  ref,
) {
  const { theme } = useTheme();
  const paddingValue = {
    none: theme.spacing.none,
    small: theme.spacing.md,
    medium: theme.spacing.lg,
    large: theme.spacing.xxl,
  }[padding];
  const baseStyle: ViewStyle = {
    padding: paddingValue,
    borderRadius: theme.radius.lg,
    borderWidth: variant === 'outlined' ? theme.borderWidth.thin : theme.borderWidth.none,
    borderColor: theme.color.border.secondary,
    backgroundColor: variant === 'filled' ? theme.color.surface.secondary : theme.color.surface.primary,
    ...(variant === 'elevated' ? theme.shadow.md : theme.shadow.none),
  };

  if (onPress) {
    const pressableProps = props as Omit<PressableProps, 'children' | 'style' | 'onPress'>;
    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ ...pressableProps.accessibilityState, disabled: Boolean(pressableProps.disabled) }}
        {...pressableProps}
        onPress={onPress}
        style={({ pressed }) => [
          baseStyle,
          {
            opacity: pressableProps.disabled
              ? theme.opacity.disabled
              : pressed
              ? theme.opacity.strong
              : theme.opacity.opaque,
          },
        ]}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View ref={ref} accessibilityLabel={accessibilityLabel} {...(props as ViewProps)} style={baseStyle}>
      {children}
    </View>
  );
}));
