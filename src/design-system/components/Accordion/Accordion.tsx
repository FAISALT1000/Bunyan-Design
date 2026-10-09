import React, { memo, useId, useState } from 'react';
import { Box } from '../../base/Box';
import { Inline } from '../../base/Inline';
import { BasePressable } from '../../base/Pressable';
import { useTheme } from '../../hooks';
import { createAccessibilityState } from '../../utilities/accessibility';
import { Icon } from '../Icon';
import { Text } from '../Text';

export interface AccordionProps {
  title: string;
  children: React.ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  disabled?: boolean;
  accessibilityHint?: string;
  testID?: string;
}

export const Accordion = memo(function Accordion({
  title,
  children,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  disabled = false,
  accessibilityHint,
  testID,
}: AccordionProps) {
  const { theme } = useTheme();
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = expanded ?? internalExpanded;
  const contentId = `${useId()}-content`;
  const toggle = () => {
    const next = !isExpanded;
    if (expanded === undefined) setInternalExpanded(next);
    onExpandedChange?.(next);
  };

  return (
    <Box
      internalStyle={{
        borderBottomWidth: theme.borderWidth.thin,
        borderBottomColor: theme.color.border.secondary,
      }}
    >
      <BasePressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={accessibilityHint}
        accessibilityState={createAccessibilityState({
          expanded: isExpanded,
          disabled,
        })}
        aria-controls={contentId}
        testID={testID}
        disabled={disabled}
        onPress={toggle}
        baseStyle={{
          minHeight: theme.componentHeight.lg,
          paddingVertical: theme.spacing.md,
          borderRadius: theme.radius.sm,
        }}
        pressedStyle={{ backgroundColor: theme.color.overlay.subtle }}
        hoveredStyle={{ backgroundColor: theme.color.overlay.subtle }}
        focusedStyle={{
          borderColor: theme.color.border.focus,
          borderWidth: theme.borderWidth.medium,
        }}
        disabledStyle={{ opacity: theme.opacity.disabled }}
      >
        <Inline gap="md" alignItems="center" justifyContent="space-between">
          <Text value={title} weight="semibold" />
          <Icon name="chevron-down" size="sm" tone="secondary" />
        </Inline>
      </BasePressable>
      {isExpanded ? (
        <Box nativeID={contentId} paddingBottom="lg">
          {children}
        </Box>
      ) : null}
    </Box>
  );
});
