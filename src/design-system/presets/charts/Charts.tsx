import React, { memo, useId, useState } from 'react';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { Box } from '../../base/Box';
import { Inline } from '../../base/Inline';
import { BasePressable } from '../../base/Pressable';
import { Stack } from '../../base/Stack';
import { View, type LayoutChangeEvent } from '../../components/RNTheme';
import { useTheme } from '../../hooks';
import { useText, type TextValue } from '../../i18n';
import { useStrings } from '../../i18n/strings';
import type { Theme } from '../../themes/types';
import { logicalRow } from '../../utilities/styles';
import { Icon, type IconName } from '../../components/Icon';
import { Text } from '../../components/Text';

export type ChartTone = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

const toneColor = (theme: Theme, tone: ChartTone) => ({
  primary: theme.color.primary.default,
  success: theme.color.success.default,
  warning: theme.color.warning.default,
  error: theme.color.error.default,
  info: theme.color.information.default,
  neutral: theme.color.neutral.default,
}[tone]);

const defaultFormat = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

// ---------------------------------------------------------------- BarList

export interface BarListItem {
  label: TextValue;
  value: number;
  /** Text after the bar instead of the formatted value (e.g. "1.2k calls"). */
  valueLabel?: string;
  icon?: IconName;
  tone?: ChartTone;
  onPress?: () => void;
}

export interface BarListProps {
  items: readonly BarListItem[];
  /** Value of a full bar. Default: the largest value. */
  max?: number;
  tone?: ChartTone;
  formatValue?: (value: number) => string;
  /** Sort largest first. Default false (keeps your order). */
  sorted?: boolean;
  /** Show only the first N items. */
  limit?: number;
  testID?: string;
}

/**
 * Ranked horizontal bars with a label and value: top endpoints, usage per
 * country, spend per category. Bars grow from the start edge (right in Arabic).
 *
 * ```tsx
 * <BarList items={[{ label: '/v1/streams', value: 1240 }, { label: '/v1/users', value: 620 }]} />
 * ```
 */
export const BarList = memo(function BarList({ items, max, tone = 'primary', formatValue = defaultFormat, sorted = false, limit, testID }: BarListProps) {
  const { theme, direction } = useTheme();
  const t = useText();
  const list = (sorted ? [...items].sort((a, b) => b.value - a.value) : items).slice(0, limit ?? items.length);
  const top = max ?? Math.max(0, ...list.map(item => item.value));
  return (
    <Stack gap="sm" {...(testID ? { testID } : {})}>
      {list.map((item, index) => {
        const label = t(item.label) ?? '';
        const valueText = item.valueLabel ?? formatValue(item.value);
        const ratio = top > 0 ? Math.max(0, Math.min(1, item.value / top)) : 0;
        const color = toneColor(theme, item.tone ?? tone);
        const content = (
          <View style={[logicalRow(direction), { alignItems: 'center', gap: theme.spacing.md }]}>
            <View style={{ flex: 1, justifyContent: 'center', minHeight: 32 }}>
              <View
                style={[logicalRow(direction), {
                  position: 'absolute',
                  start: 0,
                  end: 0,
                  top: 0,
                  bottom: 0,
                }]}
              >
                <View style={{ width: `${ratio * 100}%`, borderRadius: theme.radius.sm, backgroundColor: color, opacity: 0.18 }} />
              </View>
              <View style={[logicalRow(direction), { alignItems: 'center', gap: theme.spacing.xs, paddingHorizontal: theme.spacing.sm }]}>
                {item.icon ? <Icon name={item.icon} size="sm" color={color} /> : null}
                <Text value={label} variant="bodySmall" numberOfLines={1} internalStyle={{ flexShrink: 1 }} />
              </View>
            </View>
            <Text value={valueText} variant="bodySmall" weight="semibold" internalStyle={{ fontVariant: ['tabular-nums'], writingDirection: 'ltr' }} />
          </View>
        );
        return item.onPress ? (
          <BasePressable
            key={`${label}-${index}`}
            accessibilityRole="button"
            accessibilityLabel={`${label}, ${valueText}`}
            onPress={item.onPress}
            minTouchTarget={false}
            pressedStyle={{ opacity: theme.opacity.pressed }}
          >
            {content}
          </BasePressable>
        ) : (
          <View key={`${label}-${index}`} accessible accessibilityLabel={`${label}, ${valueText}`}>{content}</View>
        );
      })}
    </Stack>
  );
});

// ---------------------------------------------------------------- Sparkline

export interface SparklineProps {
  values: readonly number[];
  /** Width in points. Default: fills the parent. */
  width?: number;
  height?: number;
  tone?: ChartTone;
  /** Fill under the line. Default true. */
  area?: boolean;
  /** Dot on the last value. Default true. */
  showLastPoint?: boolean;
  strokeWidth?: number;
  /** Draw right-to-left in Arabic. Default false: time runs left-to-right like most charts. */
  mirrorInRTL?: boolean;
  formatValue?: (value: number) => string;
  accessibilityLabel?: string;
  testID?: string;
}

/** A tiny trend line for KPI tiles and rows. */
export const Sparkline = memo(function Sparkline({
  values,
  width: widthProp,
  height = 40,
  tone = 'primary',
  area = true,
  showLastPoint = true,
  strokeWidth = 2,
  mirrorInRTL = false,
  formatValue = defaultFormat,
  accessibilityLabel,
  testID,
}: SparklineProps) {
  const { theme, isRTL } = useTheme();
  const strings = useStrings();
  const gradientId = `spark-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`;
  const [measured, setMeasured] = useState(0);
  const width = widthProp ?? measured;
  const color = toneColor(theme, tone);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;
  const last = values.length ? values[values.length - 1] ?? 0 : 0;
  const label = accessibilityLabel ?? strings('chartSummary', {
    count: values.length,
    min: formatValue(min),
    max: formatValue(max),
    last: formatValue(last),
  });

  const pad = strokeWidth + (showLastPoint ? 2 : 0);
  const mirrored = mirrorInRTL && isRTL;
  const points = values.map((value, index) => {
    const x = values.length > 1 ? pad + (index / (values.length - 1)) * (width - pad * 2) : width / 2;
    const y = max === min ? height / 2 : pad + (1 - (value - min) / (max - min)) * (height - pad * 2);
    return { x: mirrored ? width - x : x, y };
  });
  const line = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
  const first = points[0];
  const end = points[points.length - 1];
  const fill = first && end ? `${line} L${end.x.toFixed(2)} ${height} L${first.x.toFixed(2)} ${height} Z` : '';

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
      {...(testID ? { testID } : {})}
      style={{ height, ...(widthProp !== undefined ? { width: widthProp } : { alignSelf: 'stretch' }) }}
      {...(widthProp === undefined ? { onLayout: (event: LayoutChangeEvent) => setMeasured(event.nativeEvent.layout.width) } : {})}
    >
      {width > 0 && points.length > 0 ? (
        <Svg width={width} height={height}>
          {area ? (
            <>
              <Defs>
                <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={color} stopOpacity={0.25} />
                  <Stop offset="1" stopColor={color} stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Path d={fill} fill={`url(#${gradientId})`} />
            </>
          ) : null}
          <Path d={line} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {showLastPoint && end ? <Circle cx={end.x} cy={end.y} r={strokeWidth + 1} fill={color} /> : null}
        </Svg>
      ) : null}
    </View>
  );
});

// ---------------------------------------------------------------- BarChart

export interface BarChartItem {
  label: string;
  value: number;
  tone?: ChartTone;
}

export interface BarChartProps {
  items: readonly BarChartItem[];
  height?: number;
  tone?: ChartTone;
  /** Index drawn in the main colour; the others are lighter. Default: all solid. */
  highlightIndex?: number;
  /** Value labels above the bars. */
  showValues?: boolean;
  formatValue?: (value: number) => string;
  onBarPress?: (item: BarChartItem, index: number) => void;
  /** Order bars right-to-left in Arabic. Default true. */
  mirrorInRTL?: boolean;
  testID?: string;
}

/** Vertical bars with labels: calls per day, spend per month. */
export const BarChart = memo(function BarChart({
  items,
  height = 140,
  tone = 'primary',
  highlightIndex,
  showValues = false,
  formatValue = defaultFormat,
  onBarPress,
  mirrorInRTL = true,
  testID,
}: BarChartProps) {
  const { theme, direction } = useTheme();
  const top = Math.max(0, ...items.map(item => item.value));
  const rowStyle = mirrorInRTL ? logicalRow(direction) : { flexDirection: 'row' as const };
  return (
    <Stack gap="xs" {...(testID ? { testID } : {})}>
      <View style={[rowStyle, { height, alignItems: 'flex-end', gap: theme.spacing.xs }]}>
        {items.map((item, index) => {
          const color = toneColor(theme, item.tone ?? tone);
          const dim = highlightIndex !== undefined && highlightIndex !== index;
          const ratio = top > 0 ? Math.max(0, item.value / top) : 0;
          const valueText = formatValue(item.value);
          const bar = (
            <Box flex={1} justifyContent="flex-end" alignItems="center">
              {showValues ? <Text value={valueText} variant="micro" tone="secondary" internalStyle={{ writingDirection: 'ltr' }} /> : null}
              <View
                style={{
                  width: '70%',
                  maxWidth: 32,
                  height: Math.max(2, ratio * (height - (showValues ? 16 : 0))),
                  borderTopStartRadius: theme.radius.sm,
                  borderTopEndRadius: theme.radius.sm,
                  backgroundColor: color,
                  opacity: dim ? 0.3 : 1,
                }}
              />
            </Box>
          );
          return onBarPress ? (
            <BasePressable
              key={`${item.label}-${index}`}
              accessibilityRole="button"
              accessibilityLabel={`${item.label}, ${valueText}`}
              onPress={() => onBarPress(item, index)}
              minTouchTarget={false}
              baseStyle={{ flex: 1, height: '100%' }}
            >
              {bar}
            </BasePressable>
          ) : (
            <View key={`${item.label}-${index}`} accessible accessibilityLabel={`${item.label}, ${valueText}`} style={{ flex: 1, height: '100%' }}>{bar}</View>
          );
        })}
      </View>
      <View style={[rowStyle, { gap: theme.spacing.xs }]}>
        {items.map((item, index) => (
          <Box key={`${item.label}-${index}`} flex={1} alignItems="center">
            <Text value={item.label} variant="micro" tone="tertiary" numberOfLines={1} align="center" />
          </Box>
        ))}
      </View>
    </Stack>
  );
});

// ---------------------------------------------------------------- Legend helper

export interface ChartLegendProps {
  items: readonly { label: TextValue; tone?: ChartTone; value?: string }[];
}

/** Coloured dots with labels under a chart. */
export const ChartLegend = memo(function ChartLegend({ items }: ChartLegendProps) {
  const { theme } = useTheme();
  const t = useText();
  return (
    <Inline gap="md" flexWrap="wrap">
      {items.map((item, index) => (
        <Inline key={index} gap="xs" alignItems="center">
          <Box width={8} height={8} radius="pill" internalStyle={{ backgroundColor: toneColor(theme, item.tone ?? 'primary') }} />
          <Text value={t(item.label) ?? ''} variant="caption" tone="secondary" />
          {item.value ? <Text value={item.value} variant="caption" weight="semibold" /> : null}
        </Inline>
      ))}
    </Inline>
  );
});
