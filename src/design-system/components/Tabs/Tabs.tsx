import React, { memo, useId } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useTheme } from '../../hooks';
import { Text } from '../Text';

export interface TabItem {
  value: string;
  label: string;
  disabled?: boolean;
  badge?: string;
}

export interface TabsProps {
  items: readonly TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  variant?: 'line' | 'pill';
  accessibilityLabel?: string;
}

export const Tabs = memo(function Tabs({
  items,
  value,
  onValueChange,
  variant = 'line',
  accessibilityLabel = 'Tabs',
}: TabsProps) {
  const { theme, direction } = useTheme();
  const id = useId();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      contentContainerStyle={{
        flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
        gap: variant === 'pill' ? theme.spacing.sm : theme.spacing.none,
      }}
    >
      {items.map(item => {
        const selected = item.value === value;
        return (
          <Pressable
            key={item.value}
            nativeID={`${id}-${item.value}-tab`}
            accessibilityRole="tab"
            accessibilityState={{ selected, disabled: item.disabled }}
            disabled={item.disabled}
            onPress={() => onValueChange(item.value)}
            style={({ pressed }) => ({
              minHeight: theme.componentHeight.md,
              minWidth: theme.componentHeight.xl,
              paddingHorizontal: theme.spacing.lg,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: variant === 'pill' ? theme.radius.pill : theme.radius.none,
              borderBottomWidth: variant === 'line' && selected ? theme.borderWidth.medium : theme.borderWidth.none,
              borderColor: theme.color.primary.default,
              backgroundColor: variant === 'pill' && selected
                ? theme.color.primary.subtle
                : pressed
                ? theme.color.overlay.subtle
                : theme.color.overlay.transparent,
              opacity: item.disabled ? theme.opacity.disabled : theme.opacity.opaque,
            })}
          >
            <View style={{ flexDirection: direction === 'rtl' ? 'row-reverse' : 'row', gap: theme.spacing.xs }}>
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
