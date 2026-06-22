import React, { memo } from 'react';
import { Box } from '../../base/Box';
import { useTheme } from '../../hooks';
import {
  resolveLocalizedText,
  type TranslationOptions,
  useOptionalLocalization,
} from '../../localization';
import { warnDeprecated } from '../../utilities/deprecations';
import { Text, type TextTone } from '../Text';

export type BadgeTone =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'information';

interface SharedBadgeProps {
  tone?: BadgeTone;
  size?: 'small' | 'medium';
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
  accessibilityLabel,
  testID,
}: BadgeProps) {
  const { theme } = useTheme();
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
  };
  const current = toneMap[tone];

  return (
    <Box
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? String(resolvedLabel)}
      alignSelf="flex-start"
      alignItems="center"
      paddingHorizontal={size === 'small' ? 'sm' : 'md'}
      paddingVertical={size === 'small' ? 'xxs' : 'xs'}
      radius="pill"
      internalStyle={{ backgroundColor: current.background }}
    >
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
