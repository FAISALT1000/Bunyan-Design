import React, { memo } from 'react';
import { Inline } from '../../base/Inline';
import { Stack } from '../../base/Stack';
import { useText, type TextValue } from '../../i18n';
import { Button } from '../../components/Button';
import { EmptyState, type EmptyStateProps } from '../../components/EmptyState';
import { Text } from '../../components/Text';
import { LineCard } from '../cards/LineCard';
import { cardSurface } from '../shared';
import { useTheme } from '../../hooks';
import { Box } from '../../base/Box';

export interface SectionProps {
  title?: TextValue;
  subtitle?: TextValue;
  /** Link-style action on the title row, e.g. "See all". */
  action?: { title: TextValue; onPress: () => void };
  /** Shows `skeletonCount` row skeletons instead of the children. */
  loading?: boolean;
  skeletonCount?: number;
  /** Shown instead of the children when `isEmpty` is true. */
  empty?: EmptyStateProps;
  isEmpty?: boolean;
  children?: React.ReactNode;
  testID?: string;
}

/**
 * A titled block of a screen: title row with an optional action, then content,
 * with built-in loading and empty states.
 *
 * ```tsx
 * <Section title="Recent transfers" action={{ title: 'See all', onPress: goHistory }}
 *   loading={isLoading} isEmpty={!transfers.length} empty={{ title: 'No transfers yet', icon: 'transfer' }}>
 *   <List Component={TwoLineCard} data={transfers} formatItem={toRow} />
 * </Section>
 * ```
 */
export const Section = memo(function Section({
  title,
  subtitle,
  action,
  loading = false,
  skeletonCount = 3,
  empty,
  isEmpty = false,
  children,
  testID,
}: SectionProps) {
  const { theme } = useTheme();
  const t = useText();
  const titleText = t(title);
  const subtitleText = t(subtitle);
  return (
    <Stack gap="sm" {...(testID ? { testID } : {})}>
      {titleText || action ? (
        <Inline gap="md" alignItems="center" justifyContent="space-between">
          <Stack flex={1} gap="none">
            {titleText ? <Text value={titleText} variant="headingSmall" weight="bold" accessibilityRole="header" /> : null}
            {subtitleText ? <Text value={subtitleText} variant="caption" tone="tertiary" /> : null}
          </Stack>
          {action ? <Button title={t(action.title) ?? ''} variant="link" size="small" onPress={action.onPress} /> : null}
        </Inline>
      ) : null}
      {loading ? (
        <Stack gap="sm">
          {Array.from({ length: skeletonCount }, (_, index) => <LineCard key={index} lines={2} title="" loading />)}
        </Stack>
      ) : isEmpty && empty ? (
        <Box internalStyle={cardSurface(theme)}>
          <EmptyState {...empty} />
        </Box>
      ) : children}
    </Stack>
  );
});
