import React, { forwardRef, memo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks';
import { heightForSize, horizontalPaddingForSize, iconSizeForComponent, logicalRow, type ComponentSize } from '../../utilities/styles';
import { Icon, type IconName } from '../Icon';
import { Text } from '../Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ComponentSize;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
}

export const Button = memo(forwardRef<View, ButtonProps>(function Button(
  {
    children,
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    fullWidth = false,
    leadingIcon,
    trailingIcon,
    accessibilityLabel,
    ...props
  },
  ref,
) {
  const { theme, direction } = useTheme();
  const isDisabled = disabled || loading;
  const variants: Record<ButtonVariant, { background: string; border: string; text: 'inverse' | 'primary' | 'link' }> = {
    primary: { background: theme.color.primary.default, border: theme.color.primary.default, text: 'inverse' },
    secondary: { background: theme.color.secondary.default, border: theme.color.secondary.default, text: 'inverse' },
    outline: { background: theme.color.overlay.transparent, border: theme.color.border.primary, text: 'primary' },
    ghost: { background: theme.color.overlay.transparent, border: theme.color.overlay.transparent, text: 'link' },
    danger: { background: theme.color.error.default, border: theme.color.error.default, text: 'inverse' },
  };
  const current = variants[variant];
  const resolveStyle = ({ pressed, focused }: { pressed: boolean; focused?: boolean }): ViewStyle => ({
    ...logicalRow(direction),
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    minHeight: heightForSize(theme, size),
    paddingHorizontal: horizontalPaddingForSize(theme, size),
    borderRadius: theme.radius.md,
    borderWidth: focused ? theme.borderWidth.medium : theme.borderWidth.thin,
    borderColor: focused ? theme.color.border.focus : current.border,
    backgroundColor: isDisabled
      ? theme.color.disabled.background
      : pressed
      ? theme.color.overlay.subtle
      : current.background,
    opacity: isDisabled ? theme.opacity.disabled : theme.opacity.opaque,
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
  });
  const iconSize = iconSizeForComponent(theme, size) === theme.iconSize.sm ? 'sm' : size === 'large' ? 'lg' : 'md';

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      {...props}
      style={resolveStyle}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={current.text === 'inverse' ? theme.color.text.inverse : theme.color.text.primary}
          accessibilityLabel="Loading"
        />
      ) : leadingIcon ? <Icon name={leadingIcon} size={iconSize} tone={current.text === 'inverse' ? 'inverse' : 'primary'} /> : null}
      <Text variant="label" weight="semibold" tone={isDisabled ? 'tertiary' : current.text}>
        {children}
      </Text>
      {!loading && trailingIcon ? <Icon name={trailingIcon} size={iconSize} tone={current.text === 'inverse' ? 'inverse' : 'primary'} mirroredInRTL /> : null}
    </Pressable>
  );
}));
