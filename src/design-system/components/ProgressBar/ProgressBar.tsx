import React, { memo } from 'react';
import { View } from '../RNTheme';
import { useTheme } from '../../hooks';
import { useText, type TextValue } from '../../i18n';
import { logicalRow, needsMirroring } from '../../utilities/styles';
import { Text } from '../Text';

export interface ProgressBarProps {
  /** 0 – 1, or `current` / `total` when `total` is given. */
  value: number;
  total?: number;
  label?: TextValue;
  /** Shows "40%" (or "2 / 5" with `total`) after the label. */
  showValue?: boolean;
  formatValue?: (ratio: number, value: number, total?: number) => string;
  tone?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  testID?: string;
}

/** Determinate progress (upload, profile completion, steps). */
export const ProgressBar = memo(function ProgressBar({
  value,
  total,
  label,
  showValue = true,
  formatValue,
  tone = 'primary',
  size = 'medium',
  testID,
}: ProgressBarProps) {
  const { theme, direction } = useTheme();
  const t = useText();
  const ratio = Math.min(1, Math.max(0, total ? value / total : value));
  const valueText = formatValue
    ? formatValue(ratio, value, total)
    : total ? `${value} / ${total}` : `${Math.round(ratio * 100)}%`;
  const height = { small: theme.spacing.xs, medium: theme.spacing.sm, large: theme.spacing.md }[size];
  const color = { primary: theme.color.primary.default, success: theme.color.success.default, warning: theme.color.warning.default, error: theme.color.error.default }[tone];
  const labelText = t(label);
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={labelText}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100), text: valueText }}
      style={{ gap: theme.spacing.xs }}
    >
      {labelText || showValue ? (
        <View style={[logicalRow(direction), { justifyContent: 'space-between' }]}>
          {labelText ? <Text variant="labelMedium" weight="medium" value={labelText} /> : <View />}
          {showValue ? <Text variant="caption" tone="secondary" value={valueText} /> : null}
        </View>
      ) : null}
      <View style={{ height, borderRadius: theme.radius.pill, backgroundColor: theme.color.neutral.subtle, overflow: 'hidden', flexDirection: needsMirroring(direction) ? 'row-reverse' : 'row' }}>
        <View style={{ width: `${ratio * 100}%`, borderRadius: theme.radius.pill, backgroundColor: color }} />
      </View>
    </View>
  );
});
