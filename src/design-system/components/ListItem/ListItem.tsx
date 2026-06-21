import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../../hooks';
import { logicalRow } from '../../utilities/styles';
import { Icon, type IconName } from '../Icon';
import { Text } from '../Text';

export interface ListItemProps {
  title: string;
  description?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  showChevron?: boolean;
  chevronIcon?: IconName;
}

export const ListItem = memo(function ListItem({
  title,
  description,
  leading,
  trailing,
  onPress,
  disabled = false,
  selected = false,
  showChevron = Boolean(onPress),
  chevronIcon = 'chevron-right',
}: ListItemProps) {
  const { theme, direction } = useTheme();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={title}
      accessibilityHint={description}
      accessibilityState={{ disabled, selected }}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        logicalRow(direction),
        {
          minHeight: theme.componentHeight.xl,
          alignItems: 'center',
          gap: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radius.md,
          borderWidth: theme.borderWidth.none,
          borderColor: theme.color.border.focus,
          backgroundColor: selected
            ? theme.color.primary.subtle
            : pressed
            ? theme.color.overlay.subtle
            : theme.color.overlay.transparent,
          opacity: disabled ? theme.opacity.disabled : theme.opacity.opaque,
        },
      ]}
    >
      {leading}
      <View style={{ flex: 1 }}>
        <Text variant="label" weight="medium">{title}</Text>
        {description ? <Text variant="bodySmall" tone="secondary">{description}</Text> : null}
      </View>
      {trailing}
      {showChevron ? <Icon name={chevronIcon} size="sm" tone="tertiary" mirroredInRTL /> : null}
    </Pressable>
  );
});
