import React, { forwardRef, memo } from 'react';
import { ActivityIndicator, Pressable, type PressableProps, type ViewRef, type ViewStyle } from '../RNTheme';
import { useTheme } from '../../hooks';
import {
  heightForSize,
  horizontalPaddingForSize,
  iconTokenForSize,
  logicalRow,
  type ComponentSize,
} from '../../utilities/styles';
import { Icon, type IconName } from '../Icon';
import { Text, type TextTone } from '../Text';

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

interface VariantStyle {
  background: string;
  pressedBackground: string;
  border: string;
  text: TextTone;
}

export const Button = memo(forwardRef<ViewRef, ButtonProps>(function Button(
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
    accessibilityState,
    hitSlop,
    ...props
  },
  ref,
) {
  const { theme, direction } = useTheme();
  const isDisabled = Boolean(disabled) || loading;
  const variants: Record<ButtonVariant, VariantStyle> = {
    primary: {
      background: theme.color.primary.default,
      pressedBackground: theme.color.primary.pressed,
      border: theme.color.primary.default,
      text: 'inverse',
    },
    secondary: {
      background: theme.color.secondary.default,
      pressedBackground: theme.color.secondary.pressed,
      border: theme.color.secondary.default,
      text: 'inverse',
    },
    outline: {
      background: theme.color.overlay.transparent,
      pressedBackground: theme.color.overlay.subtle,
      border: theme.color.border.primary,
      text: 'primary',
    },
    ghost: {
      background: theme.color.overlay.transparent,
      pressedBackground: theme.color.overlay.subtle,
      border: theme.color.overlay.transparent,
      text: 'link',
    },
    danger: {
      background: theme.color.error.default,
      pressedBackground: theme.color.error.default,
      border: theme.color.error.default,
      text: 'inverse',
    },
  };
  const current = variants[variant];
  const textTone: TextTone = isDisabled ? 'tertiary' : current.text;
  const contentColor = isDisabled
    ? theme.color.text.tertiary
    : current.text === 'inverse'
    ? theme.color.text.inverse
    : current.text === 'link'
    ? theme.color.text.link
    : theme.color.text.primary;
  const height = heightForSize(theme, size);
  // Keep at least a 44pt touch target for compact buttons (WCAG 2.5.8).
  const touchSlop = Math.max(0, (theme.componentHeight.md - height) / 2);

  const resolveStyle = ({ pressed, focused }: { pressed: boolean; focused?: boolean }): ViewStyle => ({
    ...logicalRow(direction),
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    minHeight: height,
    paddingHorizontal: horizontalPaddingForSize(theme, size),
    borderRadius: theme.radius.md,
    borderWidth: focused ? theme.borderWidth.medium : theme.borderWidth.thin,
    borderColor: focused ? theme.color.border.focus : isDisabled ? theme.color.disabled.border : current.border,
    backgroundColor: isDisabled
      ? theme.color.disabled.background
      : pressed
      ? current.pressedBackground
      : current.background,
    opacity: isDisabled
      ? theme.opacity.disabled
      : pressed && variant === 'danger'
      ? theme.opacity.strong
      : theme.opacity.opaque,
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
  });
  const iconSize = iconTokenForSize(size);

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ ...accessibilityState, disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      hitSlop={hitSlop ?? (touchSlop > 0 ? touchSlop : undefined)}
      {...props}
      style={resolveStyle}
    >
      {loading ? (
        <ActivityIndicator size="small" color={contentColor} accessibilityLabel="Loading" />
      ) : leadingIcon ? (
        <Icon name={leadingIcon} size={iconSize} color={contentColor} />
      ) : null}
      <Text variant="label" weight="semibold" tone={textTone}>
        {children}
      </Text>
      {!loading && trailingIcon ? <Icon name={trailingIcon} size={iconSize} color={contentColor} /> : null}
    </Pressable>
  );
}));
