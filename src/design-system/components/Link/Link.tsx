import React, { forwardRef, memo } from 'react';
import { Linking, Pressable, type PressableProps, type ViewRef } from '../RNTheme';
import { useTheme } from '../../hooks';
import { Text } from '../Text';

export interface LinkProps extends Omit<PressableProps, 'children' | 'style'> {
  children: React.ReactNode;
  href?: string;
  external?: boolean;
  /** Announced to screen readers for external links. */
  externalHint?: string;
  /** Called when `href` cannot be opened. */
  onOpenError?: (error: unknown) => void;
}

export const Link = memo(forwardRef<ViewRef, LinkProps>(function Link(
  {
    children,
    href,
    external = false,
    externalHint = 'Opens in another app',
    onOpenError,
    onPress,
    disabled = false,
    accessibilityLabel,
    accessibilityHint,
    accessibilityState,
    ...props
  },
  ref,
) {
  const { theme } = useTheme();
  const isDisabled = Boolean(disabled);
  return (
    <Pressable
      ref={ref}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint ?? (external ? externalHint : undefined)}
      accessibilityState={{ ...accessibilityState, disabled: isDisabled }}
      disabled={isDisabled}
      hitSlop={theme.spacing.sm}
      {...props}
      onPress={event => {
        onPress?.(event);
        if (!event.defaultPrevented && href) {
          // Linking.openURL rejects for unsupported URLs; never leave it unhandled.
          Linking.openURL(href).catch((error: unknown) => onOpenError?.(error));
        }
      }}
      style={({ pressed }) => ({
        alignSelf: 'flex-start',
        borderRadius: theme.radius.sm,
        opacity: isDisabled ? theme.opacity.disabled : pressed ? theme.opacity.strong : theme.opacity.opaque,
      })}
    >
      <Text tone="link" weight="semibold" style={{ textDecorationLine: 'underline' }}>
        {children}{external ? ' ↗' : ''}
      </Text>
    </Pressable>
  );
}));
