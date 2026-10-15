import React, { memo, useId } from 'react';
import { Inline } from '../../base/Inline';
import { BasePressable } from '../../base/Pressable';
import { ScrollContainer } from '../../base/ScrollContainer';
import { useTheme } from '../../hooks';
import {
  createAccessibilityLabel,
  createAccessibilityState,
} from '../../utilities/accessibility';
import { CountBadge } from '../CountBadge';
import { Text } from '../Text';
import { useStrings } from '../../i18n/strings';

export interface TabItem {
  value: string;
  label: string;
  disabled?: boolean;
  /**
   * A string renders as quiet text (as before); a number renders a count pill;
   * `{ dot: true }` an unread dot.
   */
  badge?: string | number | { count?: number; dot?: boolean; tone?: 'primary' | 'error' | 'neutral' };
}

export interface TabsProps {
  items: readonly TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  variant?: 'line' | 'pill';
  accessibilityLabel?: string;
  testID?: string;
}

export const Tabs = memo(function Tabs({
  items,
  value,
  onValueChange,
  variant = 'line',
  accessibilityLabel: accessibilityLabelProp,
  testID,
}: TabsProps) {
  const strings = useStrings();
  const accessibilityLabel = accessibilityLabelProp ?? strings('tabs');
  const { theme } = useTheme();
  const id = useId();

  return (
    <ScrollContainer
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      gap={variant === 'pill' ? 'sm' : 'none'}
    >
      {items.map(item => {
        const selected = item.value === value;
        return (
          <BasePressable
            key={item.value}
            nativeID={`${id}-${item.value}-tab`}
            accessibilityRole="tab"
            accessibilityLabel={createAccessibilityLabel([item.label, typeof item.badge === 'object' ? item.badge.count : item.badge])}
            accessibilityState={createAccessibilityState({
              selected,
              disabled: item.disabled ?? false,
            })}
            disabled={item.disabled}
            onPress={() => onValueChange(item.value)}
            baseStyle={{
              minHeight: theme.componentHeight.md,
              minWidth: theme.componentHeight.xl,
              paddingHorizontal: theme.spacing.lg,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: variant === 'pill'
                ? theme.radius.pill
                : theme.radius.none,
              borderBottomWidth: variant === 'line' && selected
                ? theme.borderWidth.medium
                : theme.borderWidth.none,
              borderColor: theme.color.primary.default,
              backgroundColor: variant === 'pill' && selected
                ? theme.color.primary.subtle
                : theme.color.overlay.transparent,
            }}
            pressedStyle={{ backgroundColor: theme.color.overlay.subtle }}
            hoveredStyle={{ backgroundColor: theme.color.overlay.subtle }}
            focusedStyle={{
              borderColor: theme.color.border.focus,
              borderWidth: theme.borderWidth.medium,
            }}
            disabledStyle={{ opacity: theme.opacity.disabled }}
          >
            <Inline gap="xs" alignItems="center">
              <Text
                value={item.label}
                variant="labelMedium"
                weight={selected ? 'semibold' : 'medium'}
                tone={selected ? 'info' : 'secondary'}
              />
              {typeof item.badge === 'string' && item.badge ? (
                <Text value={item.badge} variant="caption" tone="tertiary" />
              ) : typeof item.badge === 'number' ? (
                <CountBadge count={item.badge} tone={selected ? 'primary' : 'neutral'} />
              ) : item.badge && typeof item.badge === 'object' ? (
                <CountBadge
                  {...(item.badge.count !== undefined ? { count: item.badge.count } : {})}
                  {...(item.badge.dot ? { dot: true } : {})}
                  {...(item.badge.tone ? { tone: item.badge.tone } : {})}
                />
              ) : null}
            </Inline>
          </BasePressable>
        );
      })}
    </ScrollContainer>
  );
});
