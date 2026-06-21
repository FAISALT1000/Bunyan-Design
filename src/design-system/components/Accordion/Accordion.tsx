import React, { memo, useId, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../../hooks';
import { logicalRow } from '../../utilities/styles';
import { Icon } from '../Icon';
import { Text } from '../Text';

export interface AccordionProps {
  title: string;
  children: React.ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  disabled?: boolean;
}

export const Accordion = memo(function Accordion({
  title,
  children,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  disabled = false,
}: AccordionProps) {
  const { theme, direction } = useTheme();
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = expanded ?? internalExpanded;
  const contentId = `${useId()}-content`;
  const toggle = () => {
    const next = !isExpanded;
    if (expanded === undefined) setInternalExpanded(next);
    onExpandedChange?.(next);
  };

  return (
    <View style={{ borderBottomWidth: theme.borderWidth.thin, borderBottomColor: theme.color.border.secondary }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded, disabled }}
        aria-controls={contentId}
        disabled={disabled}
        onPress={toggle}
        style={({ pressed }) => [
          logicalRow(direction),
          {
            minHeight: theme.componentHeight.lg,
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: theme.spacing.md,
            paddingVertical: theme.spacing.md,
            opacity: disabled ? theme.opacity.disabled : pressed ? theme.opacity.strong : theme.opacity.opaque,
            borderRadius: theme.radius.sm,
            borderWidth: theme.borderWidth.none,
          },
        ]}
      >
        <Text weight="semibold">{title}</Text>
        <Icon name="chevron-down" size="sm" tone="secondary" />
      </Pressable>
      {isExpanded ? (
        <View nativeID={contentId} style={{ paddingBottom: theme.spacing.lg }}>{children}</View>
      ) : null}
    </View>
  );
});
