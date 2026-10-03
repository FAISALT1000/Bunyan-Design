import React, { memo, useEffect, useRef, useState } from 'react';
import { Pressable, View } from '../RNTheme';
import { useTheme } from '../../hooks';
import { Text } from '../Text';

export interface TooltipProps {
  content: string;
  children: React.ReactElement;
  placement?: 'top' | 'bottom';
  /** How long a long-press tooltip stays visible on touch devices (ms). */
  touchDuration?: number;
}

export const Tooltip = memo(function Tooltip({
  content,
  children,
  placement = 'top',
  touchDuration = 1500,
}: TooltipProps) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const clearHideTimer = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = undefined;
  };
  useEffect(() => clearHideTimer, []);

  const show = () => {
    clearHideTimer();
    setVisible(true);
  };
  const hide = () => {
    clearHideTimer();
    setVisible(false);
  };

  const bubble = visible ? (
    <View
      accessibilityLiveRegion="polite"
      pointerEvents="none"
      style={{
        [placement === 'top' ? 'marginBottom' : 'marginTop']: theme.spacing.xs,
        maxWidth: theme.breakpoint.medium / 2,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.md,
        backgroundColor: theme.color.surface.inverse,
        zIndex: theme.zIndex.tooltip,
        ...theme.shadow.sm,
      }}
    >
      <Text variant="caption" tone="inverse">{content}</Text>
    </View>
  ) : null;

  return (
    <View style={{ alignSelf: 'flex-start', alignItems: 'center' }}>
      {placement === 'top' ? bubble : null}
      <Pressable
        accessibilityHint={content}
        onHoverIn={show}
        onHoverOut={hide}
        onFocus={show}
        onBlur={hide}
        onLongPress={show}
        onPressOut={() => {
          // Previously the tooltip vanished the instant the finger lifted, so touch
          // users could never read it. Keep it on screen briefly instead.
          clearHideTimer();
          hideTimer.current = setTimeout(() => setVisible(false), touchDuration);
        }}
      >
        {children}
      </Pressable>
      {placement === 'bottom' ? bubble : null}
    </View>
  );
});
