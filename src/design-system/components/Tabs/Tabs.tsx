import React, { memo, useId } from 'react';
import { Pressable, ScrollView, View } from '../RNTheme';
import { useTheme } from '../../hooks';
import { logicalRow } from '../../utilities/styles';
import { Text } from '../Text';

export interface TabItem {
  value: string;
  label: string;
  disabled?: boolean;
  badge?: string;
  accessibilityLabel?: string;
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
  accessibilityLabel = 'Tabs',
  testID,
}: TabsProps) {
  const { theme, direction } = useTheme();
  const id = useId();
  return (
    <ScrollView
      testID={testID}
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      contentContainerStyle={[
        logicalRow(direction),
        { gap: variant === 'pill' ? theme.spacing.sm : theme.spacing.none },
      ]}
    >
      {items.map((item, index) => {
        const selected = item.value === value;
        const disabled = Boolean(item.disabled);
        return (
          <Pressable
            key={item.value}
            nativeID={`${id}-${item.value}-tab`}
            accessibilityRole="tab"
            accessibilityLabel={item.accessibilityLabel ?? (item.badge ? `${item.label}, ${item.badge}` : item.label)}
            accessibilityHint={`${index + 1} of ${items.length}`}
            accessibilityState={{ selected, disabled }}
            disabled={disabled}
            onPress={() => {
              // Selecting the active tab again should not re-fire change handlers.
              if (!selected) onValueChange(item.value);
            }}
            style={({ pressed }) => ({
              minHeight: theme.componentHeight.md,
              minWidth: theme.componentHeight.xl,
              paddingHorizontal: theme.spacing.lg,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: variant === 'pill' ? theme.radius.pill : theme.radius.none,
              borderBottomWidth: variant === 'line' ? theme.borderWidth.medium : theme.borderWidth.none,
              // Keep the border width constant so the label doesn't jump on selection.
              borderBottomColor: variant === 'line' && selected ? theme.color.primary.default : theme.color.overlay.transparent,
              backgroundColor: variant === 'pill' && selected
                ? theme.color.primary.subtle
                : pressed
                ? theme.color.overlay.subtle
                : theme.color.overlay.transparent,
              opacity: disabled ? theme.opacity.disabled : theme.opacity.opaque,
            })}
          >
            <View style={[logicalRow(direction), { alignItems: 'center', gap: theme.spacing.xs }]}>
              <Text variant="label" weight={selected ? 'semibold' : 'medium'} tone={selected ? 'link' : 'secondary'}>
                {item.label}
              </Text>
              {item.badge ? <Text variant="caption" tone="tertiary">{item.badge}</Text> : null}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
});
