import React, { memo, useId } from 'react';
import Svg, { ClipPath, Defs, Polygon, Rect } from 'react-native-svg';
import { Box } from '../../base/Box';
import { Inline } from '../../base/Inline';
import { BasePressable } from '../../base/Pressable';
import { Stack } from '../../base/Stack';
import { useClipboard, useTheme } from '../../hooks';
import { useText, type TextValue } from '../../i18n';
import { useStrings } from '../../i18n/strings';
import { Icon, type IconName } from '../../components/Icon';
import { IconButton } from '../../components/IconButton';
import { Text, type TextTone } from '../../components/Text';
import { ScrollView, View } from '../../components/RNTheme';

// ---------------------------------------------------------------- Rating

export interface RatingProps {
  value: number;
  /** Omit (or set `readOnly`) for a display-only rating. */
  onChange?: (value: number) => void;
  max?: number;
  /** Star size in points, or a token. Default `'md'` (28 interactive / 16 read-only). */
  size?: 'sm' | 'md' | 'lg' | number;
  readOnly?: boolean;
  /** One star + `4.6 (120)` text, for lists. */
  compact?: boolean;
  /** Review count shown with `compact`. */
  count?: number;
  accessibilityLabel?: string;
  testID?: string;
}

const STAR = '12 2.8 14.9 8.7 21.4 9.6 16.7 14.2 17.8 20.7 12 17.6 6.2 20.7 7.3 14.2 2.6 9.6 9.1 8.7';

function Star({ fill, size, color, empty, rtl = false }: { fill: number; size: number; color: string; empty: string; rtl?: boolean }) {
  // `fill` 0..1; partial values (half stars) clip the filled star.
  const clipId = `star-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon points={STAR} fill={empty} stroke={empty} strokeWidth={1.5} strokeLinejoin="round" />
      {fill > 0 && fill < 1 ? (
        <Defs>
          <ClipPath id={clipId}>
            <Rect x={rtl ? 24 * (1 - fill) : 0} y="0" width={24 * fill} height="24" />
          </ClipPath>
        </Defs>
      ) : null}
      {fill > 0 ? (
        <Polygon
          points={STAR}
          fill={color}
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
          {...(fill < 1 ? { clipPath: `url(#${clipId})` } : {})}
        />
      ) : null}
    </Svg>
  );
}

/**
 * Star rating, interactive or read-only. Interactive ratings are an
 * `adjustable` control for screen readers (swipe up / down to change).
 *
 * ```tsx
 * <Rating value={stars} onChange={setStars} />
 * <Rating value={4.6} count={120} compact />
 * ```
 */
export const Rating = memo(function Rating({
  value,
  onChange,
  max = 5,
  size = 'md',
  readOnly = !onChange,
  compact = false,
  count,
  accessibilityLabel,
  testID,
}: RatingProps) {
  const { theme, isRTL } = useTheme();
  const strings = useStrings();
  const color = theme.color.warning.default;
  const empty = theme.color.neutral.subtle;
  const pixels = typeof size === 'number' ? size : { sm: 16, md: readOnly ? 16 : 28, lg: 36 }[size];
  const label = accessibilityLabel ?? strings('rating', { value: Number.isInteger(value) ? value : value.toFixed(1), max });

  if (compact) {
    return (
      <Inline gap="xxs" alignItems="center" {...(testID ? { testID } : {})} accessible accessibilityLabel={label}>
        <Star fill={1} size={pixels} color={color} empty={empty} />
        <Text
          value={`${value.toFixed(1)}${count !== undefined ? ` (${count})` : ''}`}
          variant="caption"
          tone="secondary"
          internalStyle={{ writingDirection: 'ltr' }}
        />
      </Inline>
    );
  }

  const stars = Array.from({ length: max }, (_, index) => {
    const fill = Math.max(0, Math.min(1, value - index));
    return fill >= 0.75 ? 1 : fill >= 0.25 ? 0.5 : 0;
  });

  if (readOnly) {
    return (
      <Inline gap="xxs" alignItems="center" {...(testID ? { testID } : {})} accessible accessibilityRole="image" accessibilityLabel={label}>
        {stars.map((fill, index) => <Star key={index} fill={fill} size={pixels} color={color} empty={empty} rtl={isRTL} />)}
      </Inline>
    );
  }

  const set = (next: number) => onChange?.(Math.max(1, Math.min(max, next)));
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max, now: value }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={event => set(event.nativeEvent.actionName === 'increment' ? value + 1 : value - 1)}
      {...(testID ? { testID } : {})}
    >
      <Inline gap="xs" alignItems="center">
        {stars.map((fill, index) => (
          <BasePressable
            key={index}
            accessible={false}
            importantForAccessibility="no"
            onPress={() => set(index + 1)}
            testID={testID ? `${testID}-star-${index + 1}` : undefined}
            baseStyle={{ alignItems: 'center', justifyContent: 'center' }}
          >
            <Star fill={fill >= 1 ? 1 : 0} size={pixels} color={color} empty={empty} />
          </BasePressable>
        ))}
      </Inline>
    </View>
  );
});

// ---------------------------------------------------------------- CodeBlock

export interface CodeBlockProps {
  /** Text shown as-is (logs, JSON, request IDs). */
  value: string;
  title?: TextValue;
  /** Copy button (uses the clipboard adapter; `onCopy` lets you show a toast). */
  copyable?: boolean;
  onCopy?: (value: string) => void;
  /** Wrap long lines instead of scrolling sideways. Default false. */
  wrap?: boolean;
  /** Clamp to N lines (wrapped mode). */
  maxLines?: number;
  testID?: string;
}

/** Monospace, selectable, always left-to-right text block with an optional copy button. */
export const CodeBlock = memo(function CodeBlock({ value, title, copyable = true, onCopy, wrap = false, maxLines, testID }: CodeBlockProps) {
  const { theme } = useTheme();
  const t = useText();
  const strings = useStrings();
  const clipboard = useClipboard();
  const titleText = t(title);
  const canCopy = copyable && (clipboard.isSupported || Boolean(onCopy));
  const copy = async () => {
    if (clipboard.isSupported) {
      try {
        await clipboard.copy(value);
      } catch {
        // clipboard unavailable
      }
    }
    onCopy?.(value);
  };
  const text = (
    <Text
      value={value}
      mono
      selectable
      variant="bodySmall"
      {...(wrap && maxLines ? { numberOfLines: maxLines } : {})}
    />
  );
  return (
    <Box
      {...(testID ? { testID } : {})}
      radius="md"
      internalStyle={{
        backgroundColor: theme.color.surface.secondary,
        borderWidth: theme.borderWidth.thin,
        borderColor: theme.color.border.secondary,
      }}
    >
      {titleText || canCopy ? (
        <Inline gap="sm" alignItems="center" justifyContent="space-between" paddingStart="md" paddingEnd="xs">
          <Text value={titleText ?? ''} variant="labelSmall" weight="semibold" tone="secondary" />
          {canCopy ? (
            <IconButton icon="copy" size="small" tone="secondary" accessibilityLabel={strings('copy', { label: titleText ?? '' }).trim()} onPress={() => void copy()} />
          ) : null}
        </Inline>
      ) : null}
      {wrap ? (
        <Box padding="md" internalStyle={{ direction: 'ltr' }}>{text}</Box>
      ) : (
        // Plain horizontal ScrollView: code reads left-to-right in every locale.
        <ScrollView horizontal style={{ direction: 'ltr' }} contentContainerStyle={{ padding: theme.spacing.md }}>{text}</ScrollView>
      )}
    </Box>
  );
});

// ---------------------------------------------------------------- TimelineEvent

export interface TimelineEventProps {
  text: TextValue;
  icon?: IconName;
  /** Time or date shown after the text. */
  meta?: TextValue;
  tone?: TextTone;
  /** Makes the line tappable (adds an arrow), e.g. "Merged into SUP-000123 →". */
  onPress?: () => void;
  testID?: string;
}

/** Centred small caption for activity feeds and ticket timelines ("Status: Waiting for you"). */
export const TimelineEvent = memo(function TimelineEvent({ text, icon, meta, tone = 'tertiary', onPress, testID }: TimelineEventProps) {
  const { theme } = useTheme();
  const t = useText();
  const textValue = t(text) ?? '';
  const metaText = t(meta);
  const content = (
    <Inline gap="xs" alignItems="center" justifyContent="center" flexWrap="wrap">
      {icon ? <Icon name={icon} size="xs" tone={tone === 'tertiary' ? 'tertiary' : 'secondary'} /> : null}
      <Text value={textValue} variant="caption" tone={onPress ? 'info' : tone} align="center" />
      {metaText ? <Text value={`· ${metaText}`} variant="caption" tone="tertiary" /> : null}
      {onPress ? <Icon name="arrow-right" size="xs" color={theme.color.text.link} mirroredInRTL /> : null}
    </Inline>
  );
  return (
    <Box alignItems="center" paddingVertical="xs" {...(testID ? { testID } : {})}>
      {onPress ? (
        <BasePressable accessibilityRole="link" accessibilityLabel={textValue} onPress={onPress} baseStyle={{ paddingHorizontal: theme.spacing.sm }}>
          {content}
        </BasePressable>
      ) : content}
    </Box>
  );
});

// ---------------------------------------------------------------- StepperHeader

export interface StepperHeaderProps {
  /** 1-based current step. */
  step: number;
  total: number;
  title?: TextValue;
  subtitle?: TextValue;
  /** Shows a back button (previous step or screen). */
  onBack?: () => void;
  testID?: string;
}

/**
 * "Step 2 of 3" header with a segmented progress bar and optional back
 * button, for multi-step flows (support request, 2FA setup, password reset).
 */
export const StepperHeader = memo(function StepperHeader({ step, total, title, subtitle, onBack, testID }: StepperHeaderProps) {
  const { theme } = useTheme();
  const t = useText();
  const strings = useStrings();
  const stepLabel = strings('stepOf', { step, total });
  const titleText = t(title);
  const subtitleText = t(subtitle);
  return (
    <Stack gap="sm" {...(testID ? { testID } : {})}>
      <Inline gap="sm" alignItems="center">
        {onBack ? <IconButton icon="arrow-left" accessibilityLabel={strings('back')} onPress={onBack} /> : null}
        <Text value={stepLabel} variant="labelSmall" weight="semibold" tone="tertiary" transform="uppercase" />
      </Inline>
      <Inline
        gap="xs"
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={stepLabel}
        accessibilityValue={{ min: 0, max: total, now: step }}
      >
        {Array.from({ length: total }, (_, index) => (
          <Box
            key={index}
            flex={1}
            height={4}
            radius="pill"
            internalStyle={{ backgroundColor: index < step ? theme.color.primary.default : theme.color.border.secondary }}
          />
        ))}
      </Inline>
      {titleText ? <Text value={titleText} variant="headingSmall" weight="bold" accessibilityRole="header" /> : null}
      {subtitleText ? <Text value={subtitleText} variant="bodySmall" tone="secondary" /> : null}
    </Stack>
  );
});
