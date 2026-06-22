import React, { memo, useMemo } from 'react';
import { Box } from '../../base/Box';
import { BasePressable } from '../../base/Pressable';
import { Stack } from '../../base/Stack';
import { useTheme } from '../../hooks';
import {
  createAccessibilityLabel,
  createAccessibilityState,
} from '../../utilities/accessibility';
import { Divider } from '../Divider';
import { Line } from '../Line';
import { Skeleton } from '../Skeleton';
import { createCardStyles } from './Card.styles';
import type { CardProps } from './Card.types';

export const Card = memo(function Card({
  variant = 'outline',
  size = 'medium',
  title,
  subtitle,
  description,
  leftIcon,
  rightIcon,
  leftAction,
  rightAction,
  onPress,
  disabled = false,
  loading = false,
  selected = false,
  showBorder,
  showDivider = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
  children,
}: CardProps) {
  const { theme } = useTheme();
  const styles = useMemo(
    () => createCardStyles(theme, variant, size, selected, showBorder),
    [selected, showBorder, size, theme, variant],
  );
  const hasHeader = Boolean(
    title ||
    subtitle ||
    description ||
    leftIcon ||
    rightIcon ||
    leftAction ||
    rightAction,
  );
  const resolvedAccessibilityLabel = accessibilityLabel
    ?? createAccessibilityLabel([title, subtitle, description]);
  const content = loading ? (
    <Skeleton lines={3} accessibilityLabel="Loading card" />
  ) : (
    <Stack gap="md">
      {hasHeader ? (
        <Line
          type={description ? '3' : subtitle ? '2' : '1'}
          padding="none"
          leftText={{
            ...(title ? { text1: { value: title, weight: 'semibold' } } : {}),
            ...(subtitle ? { text2: subtitle } : {}),
            ...(description ? { text3: description } : {}),
          }}
          {...(leftIcon ? { leftIcon } : {})}
          {...(rightIcon ? { rightIcon } : {})}
          {...(leftAction ? { leftButton: leftAction } : {})}
          {...(rightAction ? { rightButton: rightAction } : {})}
        />
      ) : null}
      {hasHeader && showDivider && children ? <Divider /> : null}
      {children}
    </Stack>
  );

  if (onPress) {
    return (
      <BasePressable
        accessibilityRole="button"
        accessibilityLabel={resolvedAccessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={createAccessibilityState({
          disabled,
          busy: loading,
          selected,
        })}
        testID={testID}
        disabled={disabled || loading}
        onPress={onPress}
        baseStyle={styles.container}
        pressedStyle={styles.pressed}
        focusedStyle={styles.focused}
        hoveredStyle={styles.pressed}
        disabledStyle={styles.disabled}
      >
        {content}
      </BasePressable>
    );
  }

  return (
    <Box
      accessibilityLabel={resolvedAccessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={createAccessibilityState({
        disabled,
        busy: loading,
        selected,
      })}
      testID={testID}
      internalStyle={[
        styles.container,
        disabled ? styles.disabled : undefined,
      ]}
    >
      {content}
    </Box>
  );
});
