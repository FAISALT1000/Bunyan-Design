import React, { forwardRef, memo } from 'react';
import { Linking, Pressable, type PressableProps, type View } from 'react-native';
import { useTheme } from '../../hooks';
import { Text } from '../Text';

export interface LinkProps extends Omit<PressableProps, 'children' | 'style'> {
  children: React.ReactNode;
  href?: string;
  external?: boolean;
}

export const Link = memo(forwardRef<View, LinkProps>(function Link(
  { children, href, external = false, onPress, accessibilityLabel, ...props },
  ref,
) {
  const { theme } = useTheme();
  return (
    <Pressable
      ref={ref}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel}
      onPress={event => {
        onPress?.(event);
        if (!event.defaultPrevented && href) void Linking.openURL(href);
      }}
      {...props}
      style={({ pressed }) => ({
        alignSelf: 'flex-start',
        borderRadius: theme.radius.sm,
        borderWidth: theme.borderWidth.none,
        borderColor: theme.color.border.focus,
        opacity: pressed ? theme.opacity.strong : theme.opacity.opaque,
      })}
    >
      <Text tone="link" weight="semibold">
        {children}{external ? ' ↗' : ''}
      </Text>
    </Pressable>
  );
}));
