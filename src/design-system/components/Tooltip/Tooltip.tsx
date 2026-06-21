import React, { cloneElement, memo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../../hooks';
import { Text } from '../Text';

export interface TooltipProps {
  content: string;
  children: React.ReactElement;
  placement?: 'top' | 'bottom';
}

export const Tooltip = memo(function Tooltip({ content, children, placement = 'top' }: TooltipProps) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ alignSelf: 'flex-start', alignItems: 'center' }}>
      {visible && placement === 'top' ? (
        <View accessible accessibilityLabel={content} style={{ marginBottom: theme.spacing.xs, maxWidth: theme.breakpoint.medium / 2, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, borderRadius: theme.radius.md, backgroundColor: theme.color.surface.inverse, ...theme.shadow.sm }}>
          <Text variant="caption" tone="inverse">{content}</Text>
        </View>
      ) : null}
      <Pressable
        accessibilityHint={content}
        onHoverIn={() => setVisible(true)}
        onHoverOut={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onLongPress={() => setVisible(true)}
        onPressOut={() => setVisible(false)}
      >
        {cloneElement(children)}
      </Pressable>
      {visible && placement === 'bottom' ? (
        <View accessible accessibilityLabel={content} style={{ marginTop: theme.spacing.xs, maxWidth: theme.breakpoint.medium / 2, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, borderRadius: theme.radius.md, backgroundColor: theme.color.surface.inverse, ...theme.shadow.sm }}>
          <Text variant="caption" tone="inverse">{content}</Text>
        </View>
      ) : null}
    </View>
  );
});
