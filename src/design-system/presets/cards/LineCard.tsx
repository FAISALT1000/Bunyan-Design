import React, { memo } from 'react';
import { Box } from '../../base/Box';
import { Inline } from '../../base/Inline';
import { BasePressable } from '../../base/Pressable';
import { Stack } from '../../base/Stack';
import { useTheme } from '../../hooks';
import { isTextValue, useText, type TextValue } from '../../i18n';
import { createAccessibilityLabel, createAccessibilityState } from '../../utilities/accessibility';
import { Icon } from '../../components/Icon';
import { Skeleton } from '../../components/Skeleton';
import { Text, type TextTone } from '../../components/Text';
import {
  IconBox,
  PresetAvatarView,
  PresetSwitch,
  cardSurface,
  resolveIcon,
  useBadge,
  type PresetAvatar,
  type PresetBadge,
  type PresetIcon,
  type PresetToggle,
} from '../shared';

/** Text or any element (e.g. `<Money />`) shown on the trailing side. */
export type PresetValue = TextValue | number | React.ReactElement;

export interface LineCardBaseProps {
  title: TextValue;
  /** Leading tinted icon. Ignored when `avatar` or `leading` is set. */
  icon?: PresetIcon;
  avatar?: PresetAvatar;
  /** Custom leading element (image, flag, logo…). */
  leading?: React.ReactNode;
  /** Trailing value, e.g. `'العربية'`, `'− 1,250.00 SAR'` or `<Money />`. */
  value?: PresetValue;
  valueTone?: TextTone;
  /** Small text under the value (status, time). */
  subValue?: TextValue;
  badge?: PresetBadge;
  /** Switch on the trailing side. */
  toggle?: PresetToggle;
  /** Show a chevron (navigates somewhere). */
  chevron?: boolean;
  /** Custom trailing element, rendered after value / badge. */
  trailing?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  /** Red title for destructive rows ("Delete account"). */
  destructive?: boolean;
  /** Show a skeleton with the same shape. */
  loading?: boolean;
  /**
   * `'card'` (default) draws its own surface; `'plain'` renders only the row,
   * for use inside `SettingsGroup` or your own containers.
   */
  variant?: 'card' | 'plain';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export interface LineCardProps extends LineCardBaseProps {
  lines: 1 | 2 | 3;
  subtitle?: TextValue;
  description?: TextValue;
  /** Top-end text such as a time (three-line cards). */
  meta?: TextValue;
  /** Unread dot (three-line cards). */
  unread?: boolean;
}

const LEADING_SIZE = 40;

function LineSkeleton({ lines }: { lines: 1 | 2 | 3 }) {
  return (
    <Inline gap="md" alignItems="center">
      <Skeleton width={LEADING_SIZE} height={LEADING_SIZE} radius="medium" />
      <Stack flex={1} gap="xs">
        <Skeleton width="60%" height={14} />
        {lines > 1 ? <Skeleton width="40%" height={11} /> : null}
        {lines > 2 ? <Skeleton width="85%" height={11} /> : null}
      </Stack>
      <Skeleton width={48} height={12} />
    </Inline>
  );
}

/** Shared implementation of OneLineCard / TwoLineCard / ThreeLineCard. */
export const LineCard = memo(function LineCard({
  lines,
  title,
  subtitle,
  description,
  meta,
  unread = false,
  icon,
  avatar,
  leading,
  value,
  valueTone = 'primary',
  subValue,
  badge,
  toggle,
  chevron = false,
  trailing,
  onPress,
  disabled = false,
  destructive = false,
  loading = false,
  variant = 'card',
  accessibilityLabel,
  accessibilityHint,
  testID,
}: LineCardProps) {
  const { theme } = useTheme();
  const t = useText();
  const renderBadge = useBadge();
  const titleText = t(title) ?? '';
  const subtitleText = lines > 1 ? t(subtitle) : undefined;
  const descriptionText = lines > 2 ? t(description) : undefined;
  const metaText = t(meta);
  const valueIsText = value !== undefined && (typeof value === 'number' || isTextValue(value));
  const valueText = valueIsText ? (typeof value === 'number' ? String(value) : t(value as TextValue)) : undefined;
  const subValueText = t(subValue);
  const surface = variant === 'card' ? cardSurface(theme) : { paddingVertical: theme.spacing.md };

  if (loading) {
    return (
      <Box testID={testID} accessibilityLabel="Loading" internalStyle={surface}>
        <LineSkeleton lines={lines} />
      </Box>
    );
  }

  const leadingNode = leading
    ?? (avatar ? <PresetAvatarView avatar={avatar} />
      : icon ? (() => {
        const resolved = resolveIcon(icon, destructive ? 'error' : 'neutral');
        return <IconBox name={resolved.name} tone={resolved.tone} size={LEADING_SIZE} />;
      })()
        : null);

  const hasTrailing = value !== undefined || subValueText || badge !== undefined || toggle || chevron || trailing;

  const row = (
    <Inline gap="md" alignItems={lines > 2 ? 'flex-start' : 'center'}>
      {leadingNode}
      <Stack flex={1} gap="xxs">
        <Inline gap="sm" alignItems="center" justifyContent="space-between">
          <Box flex={1}>
            <Text
              value={titleText}
              variant="bodyMedium"
              weight={lines === 1 ? 'medium' : 'semibold'}
              numberOfLines={lines === 1 ? 1 : 2}
              {...(destructive ? { internalColor: theme.color.error.default } : {})}
            />
          </Box>
          {metaText ? <Text value={metaText} variant="caption" tone="tertiary" /> : null}
          {unread ? (
            <Box
              width={8}
              height={8}
              accessibilityLabel="Unread"
              internalStyle={{ borderRadius: 4, backgroundColor: theme.color.primary.default }}
            />
          ) : null}
        </Inline>
        {subtitleText ? <Text value={subtitleText} variant="bodySmall" tone="secondary" numberOfLines={1} /> : null}
        {descriptionText ? <Text value={descriptionText} variant="caption" tone="tertiary" numberOfLines={3} /> : null}
      </Stack>
      {hasTrailing ? (
        <Inline gap="sm" alignItems="center" flexShrink={0}>
          {value !== undefined || subValueText ? (
            <Stack gap="none" alignItems="flex-end">
              {valueText !== undefined ? (
                <Text value={valueText} variant="bodySmall" tone={valueTone} weight={lines === 1 ? 'regular' : 'semibold'} />
              ) : value !== undefined && !valueIsText ? value : null}
              {subValueText ? <Text value={subValueText} variant="caption" tone="tertiary" /> : null}
            </Stack>
          ) : null}
          {renderBadge(badge)}
          {trailing}
          {toggle ? <PresetSwitch toggle={toggle} accessibilityLabel={titleText} {...(testID ? { testID: `${testID}-switch` } : {})} /> : null}
          {chevron ? <Icon name="chevron-right" size="md" tone="tertiary" mirroredInRTL /> : null}
        </Inline>
      ) : null}
    </Inline>
  );

  const label = accessibilityLabel ?? createAccessibilityLabel([titleText, subtitleText, valueText, subValueText]);

  if (onPress && !toggle) {
    return (
      <BasePressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        accessibilityState={createAccessibilityState({ disabled })}
        disabled={disabled}
        onPress={onPress}
        testID={testID}
        baseStyle={surface}
        pressedStyle={{ backgroundColor: theme.color.overlay.subtle }}
        disabledStyle={{ opacity: theme.opacity.disabled }}
      >
        {row}
      </BasePressable>
    );
  }

  return (
    <Box testID={testID} internalStyle={[surface, disabled ? { opacity: theme.opacity.disabled } : undefined]}>
      {row}
    </Box>
  );
});
