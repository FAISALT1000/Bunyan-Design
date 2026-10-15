import React, { memo } from 'react';
import { Box } from '../../base/Box';
import { Inline } from '../../base/Inline';
import { Stack } from '../../base/Stack';
import { useClipboard, useTheme } from '../../hooks';
import { isTextValue, useText, type TextValue } from '../../i18n';
import { BasePressable } from '../../base/Pressable';
import { Divider } from '../../components/Divider';
import { Icon } from '../../components/Icon';
import { IconButton } from '../../components/IconButton';
import { Skeleton } from '../../components/Skeleton';
import { Text, type TextTone } from '../../components/Text';
import { cardSurface, useBadge, type PresetBadge } from '../shared';
import { LineCard, type LineCardBaseProps } from './LineCard';
import { useStrings } from '../../i18n/strings';

export interface SettingsItem extends Omit<LineCardBaseProps, 'variant' | 'loading'> {
  subtitle?: TextValue;
  /** Stable key; defaults to the index. */
  key?: string;
}

export interface SettingsGroupProps {
  /** Small uppercase heading above the group. */
  title?: TextValue;
  /** Hint under the group. */
  footer?: TextValue;
  items: ReadonlyArray<SettingsItem | false | null | undefined>;
  loading?: boolean;
  testID?: string;
}

/**
 * A titled group of setting rows with switches, values and chevrons.
 * Falsy items are skipped, so `isAdmin && { … }` works.
 *
 * ```tsx
 * <SettingsGroup title="Preferences" items={[
 *   { icon: 'globe', title: 'Language', value: 'العربية', chevron: true, onPress: pickLanguage },
 *   { icon: 'bell', title: 'Notifications', toggle: { value: push, onChange: setPush } },
 * ]} />
 * ```
 */
export const SettingsGroup = memo(function SettingsGroup({ title, footer, items, loading = false, testID }: SettingsGroupProps) {
  const { theme } = useTheme();
  const t = useText();
  const visible = items.filter(Boolean) as SettingsItem[];
  const titleText = t(title);
  const footerText = t(footer);
  return (
    <Stack gap="sm" {...(testID ? { testID } : {})}>
      {titleText ? (
        <Box paddingHorizontal="xs">
          <Text value={titleText.toLocaleUpperCase()} variant="labelSmall" weight="semibold" tone="tertiary" accessibilityRole="header" />
        </Box>
      ) : null}
      <Box internalStyle={{ ...cardSurface(theme, false), paddingHorizontal: theme.spacing.lg }}>
        {(loading ? Array.from({ length: Math.max(visible.length, 3) }, () => undefined) : visible).map((item, index) => (
          <React.Fragment key={item?.key ?? index}>
            {index > 0 ? <Divider inset="large" /> : null}
            {item ? (
              // `key` is a React key, not a prop: never spread it into JSX.
              (({ key: _key, ...row }) => <LineCard {...row} lines={row.subtitle ? 2 : 1} variant="plain" />)(item)
            ) : (
              <LineCard lines={1} title="" loading variant="plain" />
            )}
          </React.Fragment>
        ))}
      </Box>
      {footerText ? (
        <Box paddingHorizontal="xs">
          <Text value={footerText} variant="caption" tone="tertiary" />
        </Box>
      ) : null}
    </Stack>
  );
});

export interface DetailsRow {
  label: TextValue;
  /** Text, number or any element such as `<Money />`. */
  value?: TextValue | number | React.ReactElement;
  badge?: PresetBadge;
  /** Adds a copy button (uses the clipboard adapter, or `onCopy`). */
  copyable?: boolean;
  tone?: TextTone;
  /** Bold value. */
  emphasis?: boolean;
  /** Makes the row tappable (adds a chevron). */
  onPress?: () => void;
}

function DetailsRowView({ row, label, children }: { row: DetailsRow; label: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  const content = (
    <Inline gap="md" justifyContent="space-between" alignItems="center">
      <Text value={label} variant="bodySmall" tone="secondary" />
      <Inline gap="xs" alignItems="center" flexShrink={1} justifyContent="flex-end">
        {children}
        {row.onPress ? <Icon name="chevron-right" size="sm" tone="tertiary" mirroredInRTL /> : null}
      </Inline>
    </Inline>
  );
  return row.onPress ? (
    <BasePressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={row.onPress}
      minTouchTarget={false}
      baseStyle={{ borderRadius: theme.radius.sm }}
      pressedStyle={{ opacity: theme.opacity.pressed }}
    >
      {content}
    </BasePressable>
  ) : content;
}

export interface DetailsCardProps {
  title?: TextValue;
  rows: ReadonlyArray<DetailsRow | false | null | undefined>;
  /** Highlighted last row after a divider. */
  total?: { label: TextValue; value: TextValue | number | React.ReactElement };
  /** Called after a value is copied (show a toast here). */
  onCopy?: (row: DetailsRow, text: string) => void;
  footer?: React.ReactNode;
  loading?: boolean;
  testID?: string;
}

/**
 * Label / value rows: receipts, account details, order summaries.
 *
 * ```tsx
 * <DetailsCard title="Transfer details" rows={[
 *   { label: 'IBAN', value: 'SA03 8000 …', copyable: true },
 *   { label: 'Status', badge: { label: 'Completed', tone: 'success' } },
 * ]} total={{ label: 'Total', value: <Money amount={1250} currency="SAR" /> }} />
 * ```
 */
export const DetailsCard = memo(function DetailsCard({ title, rows, total, onCopy, footer, loading = false, testID }: DetailsCardProps) {
  const { theme } = useTheme();
  const t = useText();
  const renderBadge = useBadge();
  const clipboard = useClipboard();
  const strings = useStrings();
  const titleText = t(title);
  const visible = rows.filter(Boolean) as DetailsRow[];

  const renderValue = (value: DetailsRow['value'], tone: TextTone | undefined, emphasis: boolean | undefined) => {
    if (value === undefined) return null;
    if (typeof value === 'number' || isTextValue(value)) {
      return (
        <Text
          value={typeof value === 'number' ? String(value) : t(value) ?? ''}
          variant="bodySmall"
          weight={emphasis ? 'bold' : 'semibold'}
          align="end"
          {...(tone ? { tone } : {})}
        />
      );
    }
    return value;
  };

  const copy = async (row: DetailsRow) => {
    const text = typeof row.value === 'number' || isTextValue(row.value) ? (typeof row.value === 'number' ? String(row.value) : t(row.value) ?? '') : '';
    if (clipboard.isSupported) {
      try {
        await clipboard.copy(text);
      } catch {
        // clipboard unavailable; onCopy still lets the app react
      }
    }
    onCopy?.(row, text);
  };

  return (
    <Box {...(testID ? { testID } : {})} internalStyle={{ ...cardSurface(theme), gap: theme.spacing.md }}>
      {titleText ? <Text value={titleText} variant="labelLarge" weight="bold" accessibilityRole="header" /> : null}
      {loading
        ? Array.from({ length: Math.max(visible.length, 3) }, (_, index) => (
          <Inline key={index} justifyContent="space-between" alignItems="center">
            <Skeleton width="35%" height={11} />
            <Skeleton width="40%" height={12} />
          </Inline>
        ))
        : visible.map((row, index) => {
          const labelText = t(row.label) ?? '';
          return (
            <DetailsRowView key={index} row={row} label={labelText}>
              {renderValue(row.value, row.tone, row.emphasis)}
              {renderBadge(row.badge)}
              {row.copyable && (clipboard.isSupported || onCopy) ? (
                <IconButton icon="copy" size="small" tone="tertiary" accessibilityLabel={strings('copy', { label: labelText })} onPress={() => void copy(row)} />
              ) : null}
            </DetailsRowView>
          );
        })}
      {total && !loading ? (
        <>
          <Divider />
          <Inline gap="md" justifyContent="space-between" alignItems="center">
            <Text value={t(total.label) ?? ''} variant="bodyMedium" weight="bold" />
            {typeof total.value === 'number' || isTextValue(total.value)
              ? <Text value={typeof total.value === 'number' ? String(total.value) : t(total.value) ?? ''} variant="bodyLarge" weight="bold" />
              : total.value}
          </Inline>
        </>
      ) : null}
      {footer}
    </Box>
  );
});
