import React, { forwardRef, memo } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  type PressableProps,
  type TextStyle,
  type ViewRef,
  type ViewStyle,
} from '../RNTheme';
import { useTheme } from '../../hooks';
import {
  heightForSize,
  horizontalPaddingForSize,
  iconTokenForSize,
  logicalRow,
  type ComponentSize,
} from '../../utilities/styles';
import { Icon, type IconName } from '../Icon';
import { Text, type TextTone, type TextVariant } from '../Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  children: React.ReactNode;
  /** `link` renders inline link text (no container); every other variant is a filled/outlined button. */
  variant?: ButtonVariant;
  size?: ComponentSize;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  /** URL opened with `Linking.openURL` after `onPress` (unless the event was `preventDefault`-ed). Gives the control the link role. */
  href?: string;
  /** Marks the destination as outside the app: shows ↗ and announces `externalHint`. */
  external?: boolean;
  /** Screen-reader hint for external destinations. */
  externalHint?: string;
  /** Called when `href` cannot be opened. */
  onOpenError?: (error: unknown) => void;
}

interface VariantStyle {
  background: string;
  pressedBackground: string;
  border: string;
  text: TextTone;
}

const linkTextVariant: Record<ComponentSize, TextVariant> = {
  small: 'bodySmall',
  medium: 'body',
  large: 'body',
};

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
    href,
    external = false,
    externalHint = 'Opens in another app',
    onOpenError,
    onPress,
    accessibilityLabel,
    accessibilityHint,
    accessibilityState,
    hitSlop,
    ...props
  },
  ref,
) {
  const { theme, direction } = useTheme();
  const isLink = variant === 'link';
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
    link: {
      background: theme.color.overlay.transparent,
      pressedBackground: theme.color.overlay.transparent,
      border: theme.color.overlay.transparent,
      text: 'link',
    },
  };
  const current = variants[variant];
  // Links keep their link colour when disabled (opacity carries the state), buttons go grey.
  const textTone: TextTone = isDisabled && !isLink ? 'tertiary' : current.text;
  const contentColor = isDisabled && !isLink
    ? theme.color.text.tertiary
    : current.text === 'inverse'
    ? theme.color.text.inverse
    : current.text === 'link'
    ? theme.color.text.link
    : theme.color.text.primary;
  const height = heightForSize(theme, size);
  // Keep at least a 44pt touch target (WCAG 2.5.8): compact buttons and inline links get hitSlop.
  const touchSlop = isLink ? theme.spacing.sm : Math.max(0, (theme.componentHeight.md - height) / 2);

  const resolveStyle = ({ pressed, focused }: { pressed: boolean; focused?: boolean }): ViewStyle => {
    if (isLink) {
      return {
        ...logicalRow(direction),
        alignItems: 'center',
        alignSelf: fullWidth ? 'stretch' : 'flex-start',
        gap: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        borderWidth: focused ? theme.borderWidth.medium : theme.borderWidth.none,
        borderColor: theme.color.border.focus,
        opacity: isDisabled ? theme.opacity.disabled : pressed ? theme.opacity.strong : theme.opacity.opaque,
      };
    }
    return {
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
    };
  };
  const iconSize = isLink ? (size === 'small' ? 'sm' : 'md') : iconTokenForSize(size);
  const labelStyle: TextStyle | undefined = isLink ? { textDecorationLine: 'underline' } : undefined;

  return (
    <Pressable
      ref={ref}
      accessibilityRole={isLink || href ? 'link' : 'button'}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint ?? (external ? externalHint : undefined)}
      accessibilityState={{ ...accessibilityState, disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      hitSlop={hitSlop ?? (touchSlop > 0 ? touchSlop : undefined)}
      {...props}
      onPress={event => {
        onPress?.(event);
        if (href && !event.defaultPrevented) {
          // Linking.openURL rejects for unsupported URLs; never leave it unhandled.
          Linking.openURL(href).catch((error: unknown) => onOpenError?.(error));
        }
      }}
      style={resolveStyle}
    >
      {loading ? (
        <ActivityIndicator size="small" color={contentColor} accessibilityLabel="Loading" />
      ) : leadingIcon ? (
        <Icon name={leadingIcon} size={iconSize} color={contentColor} />
      ) : null}
      <Text
        variant={isLink ? linkTextVariant[size] : 'label'}
        weight="semibold"
        tone={textTone}
        {...(labelStyle ? { style: labelStyle } : {})}
      >
        {children}{external ? ' ↗' : ''}
      </Text>
      {!loading && trailingIcon ? <Icon name={trailingIcon} size={iconSize} color={contentColor} /> : null}
    </Pressable>
  );
}));
