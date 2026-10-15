import React, { memo } from 'react';
import { Box } from '../../base/Box';
import type { ViewStyle } from '../RNTheme/native';
import { useTheme } from '../../hooks';
import {
  resolveLocalizedText,
  type TranslationOptions,
  useOptionalLocalization,
} from '../../localization';
import { warnDeprecated } from '../../utilities/deprecations';
import { logicalRow } from '../../utilities/styles';
import { Icon, type IconName, type IconTone } from '../Icon';
import { Text, type TextTone } from '../Text';

const iconToneFor: Partial<Record<TextTone, IconTone>> = {
  secondary: 'secondary', info: 'information', success: 'success', warning: 'warning', error: 'error',
};

export type BadgeTone =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'information'
  /** Alias of `'information'`. */
  | 'info';

interface SharedBadgeProps {
  tone?: BadgeTone;
  size?: 'small' | 'medium';
  /**
   * Cross-axis alignment of the badge itself. Default `'auto'`, so it follows
   * the parent's `alignItems` (e.g. centred next to a name in a row). Pass
   * `'flex-start'` inside a stretching column to keep the old placement.
   */
  alignSelf?: ViewStyle['alignSelf'];
  /** Small leading icon in the badge's text colour. */
  icon?: IconName;
  accessibilityLabel?: string;
  testID?: string;
  labelLocalize?: string;
  labelTranslationOptions?: TranslationOptions;
}

export type BadgeProps = SharedBadgeProps & (
  | { label: string | number; children?: never }
  | {
      label?: never;
      /**
       * @deprecated Use the label prop. Scheduled for removal in 1.0.0.
       */
      children: string | number;
    }
);

export const Badge = memo(function Badge({
  label,
  children,
  labelLocalize,
  labelTranslationOptions,
  tone = 'neutral',
  size = 'medium',
  alignSelf = 'auto',
  icon,
  accessibilityLabel,
  testID,
}: BadgeProps) {
  const { theme, direction } = useTheme();
  const localization = useOptionalLocalization();
  const labelFallback = label ?? children;
  const resolvedLabel = resolveLocalizedText({
    ...(labelLocalize ? { localize: labelLocalize } : {}),
    value: labelFallback,
    ...(labelTranslationOptions
      ? { translationOptions: labelTranslationOptions }
      : {}),
    ...(localization ? { localization } : {}),
  });
  if (label === undefined && children !== undefined) {
    warnDeprecated('Badge children is deprecated. Use <Badge label="..." />. It will be removed in 1.0.0.');
  }
  const toneMap: Record<BadgeTone, { background: string; textTone: TextTone }> = {
    neutral: { background: theme.color.neutral.subtle, textTone: 'secondary' },
    primary: { background: theme.color.primary.subtle, textTone: 'info' },
    success: { background: theme.color.success.subtle, textTone: 'success' },
    warning: { background: theme.color.warning.subtle, textTone: 'warning' },
    error: { background: theme.color.error.subtle, textTone: 'error' },
    information: { background: theme.color.information.subtle, textTone: 'info' },
    info: { background: theme.color.information.subtle, textTone: 'info' },
  };
  const current = toneMap[tone];

  return (
    <Box
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? String(resolvedLabel)}
      alignSelf={alignSelf}
      flexGrow={0}
      flexShrink={0}
      alignItems="center"
      gap="xxs"
      paddingHorizontal={size === 'small' ? 'sm' : 'md'}
      paddingVertical={size === 'small' ? 'xxs' : 'xs'}
      radius="pill"
      internalStyle={[{ backgroundColor: current.background }, logicalRow(direction)]}
    >
      {icon ? <Icon name={icon} size="xs" tone={iconToneFor[current.textTone] ?? 'secondary'} /> : null}
      <Text
        value={labelFallback}
        {...(labelLocalize ? { localize: labelLocalize } : {})}
        {...(labelTranslationOptions
          ? { translationOptions: labelTranslationOptions }
          : {})}
        variant="caption"
        weight="semibold"
        tone={current.textTone}
      />
    </Box>
  );
});
