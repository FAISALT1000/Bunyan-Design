import React, { memo } from 'react';
import { Box } from '../../base/Box';
import { useTheme } from '../../hooks';
import { Text } from '../Text';

export interface CountBadgeProps {
  /** Shown as text; values above `max` render as `max+`. Omit for a dot. */
  count?: number;
  max?: number;
  /** Just a dot (unread marker). */
  dot?: boolean;
  tone?: 'primary' | 'error' | 'neutral';
  accessibilityLabel?: string;
  testID?: string;
}

/** Small count pill or dot for tabs, icons and rows (unread, pending). */
export const CountBadge = memo(function CountBadge({ count, max = 99, dot = false, tone = 'error', accessibilityLabel, testID }: CountBadgeProps) {
  const { theme } = useTheme();
  const background = tone === 'primary'
    ? theme.color.primary.default
    : tone === 'neutral'
      ? theme.color.neutral.default
      : theme.color.error.default;
  const foreground = tone === 'primary' ? theme.color.primary.contrast : theme.color.text.inverse;
  if (dot || count === undefined) {
    return (
      <Box
        width={8}
        height={8}
        {...(testID ? { testID } : {})}
        {...(accessibilityLabel ? { accessibilityLabel, accessible: true } : {})}
        internalStyle={{ borderRadius: 4, backgroundColor: background }}
      />
    );
  }
  const text = count > max ? `${max}+` : String(count);
  return (
    <Box
      {...(testID ? { testID } : {})}
      accessible
      accessibilityLabel={accessibilityLabel ?? text}
      minWidth={18}
      height={18}
      paddingHorizontal="xs"
      alignItems="center"
      justifyContent="center"
      internalStyle={{ borderRadius: 9, backgroundColor: background }}
    >
      <Text value={text} variant="micro" weight="bold" internalColor={foreground} internalStyle={{ writingDirection: 'ltr' }} />
    </Box>
  );
});
