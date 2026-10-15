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
import { CountBadge } from '../../components/CountBadge';
import { useActionButton } from './useActionButton';
import {
  IconBox,
  iconBoxColors,
  type PresetAction,
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
import { useStrings } from '../../i18n/strings';

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
  /** Several badges (status + priority…), shown after `badge`. */
  badges?: ReadonlyArray<PresetBadge | false | null | undefined>;
  /** Count pill on the trailing side (unread messages…). */
  unreadCount?: number;
  /** Switch on the trailing side. */
  toggle?: PresetToggle;
  /** Show a chevron (navigates somewhere). */
  chevron?: boolean;
  /** Custom trailing element, rendered after value / badge. */
  trailing?: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  /** Tinted card for flagged rows (suspicious, overdue, resolved…). */
  tone?: 'default' | 'error' | 'warning' | 'success' | 'info';
  /** Allow copying the title / subtitle / description (long press). */
  selectable?: boolean;
  /** Content under the row (inside the card): progress, notes, chips… */
  footer?: React.ReactNode;
  /** Buttons under the row (Accept / Decline). */
  actions?: ReadonlyArray<PresetAction | false | null | undefined>;
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
  /** Max lines of the description. Default 3. */
  descriptionLines?: number;
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
  badges,
  unreadCount,
  toggle,
  chevron = false,
  trailing,
  onPress,
  onLongPress,
  disabled = false,
  tone = 'default',
  selectable = false,
  footer,
  actions,
  descriptionLines = 3,
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
  const strings = useStrings();
  const titleText = t(title) ?? '';
  const subtitleText = lines > 1 ? t(subtitle) : undefined;
  const descriptionText = lines > 2 ? t(description) : undefined;
  const metaText = t(meta);
  const valueIsText = value !== undefined && (typeof value === 'number' || isTextValue(value));
  const valueText = valueIsText ? (typeof value === 'number' ? String(value) : t(value as TextValue)) : undefined;
  const subValueText = t(subValue);
  const renderAction = useActionButton();
  const tint = tone === 'default' ? undefined : iconBoxColors(theme, tone);
  const surface = variant === 'card'
    ? { ...cardSurface(theme), ...(tint ? { backgroundColor: tint.background, borderColor: tint.foreground } : {}) }
    : { paddingVertical: theme.spacing.md };
  const visibleActions = (actions ?? []).filter(Boolean) as PresetAction[];
  const visibleBadges = [badge, ...(badges ?? [])].filter(item => item !== undefined && item !== null && item !== false) as PresetBadge[];

  if (loading) {
    return (
      <Box testID={testID} accessibilityLabel={strings('loading')} internalStyle={surface}>
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

  const hasTrailing = value !== undefined || subValueText || visibleBadges.length > 0 || unreadCount || toggle || chevron || trailing;

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
              selectable={selectable}
              {...(destructive ? { internalColor: theme.color.error.default } : {})}
            />
          </Box>
          {metaText ? <Text value={metaText} variant="caption" tone="tertiary" /> : null}
          {unread ? (
            <Box
              width={8}
              height={8}
              accessibilityLabel={strings('unread')}
              internalStyle={{ borderRadius: 4, backgroundColor: theme.color.primary.default }}
            />
          ) : null}
        </Inline>
        {subtitleText ? <Text value={subtitleText} variant="bodySmall" tone="secondary" numberOfLines={1} selectable={selectable} /> : null}
        {descriptionText ? <Text value={descriptionText} variant="caption" tone="tertiary" numberOfLines={descriptionLines} selectable={selectable} /> : null}
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
          {visibleBadges.map((item, index) => <React.Fragment key={index}>{renderBadge(item)}</React.Fragment>)}
          {unreadCount ? <CountBadge count={unreadCount} tone="primary" /> : null}
          {trailing}
          {toggle ? <PresetSwitch toggle={toggle} accessibilityLabel={titleText} {...(testID ? { testID: `${testID}-switch` } : {})} /> : null}
          {chevron ? <Icon name="chevron-right" size="md" tone="tertiary" mirroredInRTL /> : null}
        </Inline>
      ) : null}
    </Inline>
  );

  const label = accessibilityLabel ?? createAccessibilityLabel([titleText, subtitleText, valueText, subValueText]);
  const extras = footer || visibleActions.length ? (
    <Stack gap="sm" paddingTop="sm">
      {footer}
      {visibleActions.length ? (
        <Inline gap="sm" flexWrap="wrap">
          {visibleActions.map((action, index) => (
            <React.Fragment key={index}>
              {renderAction({ variant: index === 0 ? 'primary' : 'outline', ...action }, { size: 'small' })}
            </React.Fragment>
          ))}
        </Inline>
      ) : null}
    </Stack>
  ) : null;
  const pressable = (onPress || onLongPress) && !toggle;

  if (pressable && !extras) {
    return (
      <BasePressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        accessibilityState={createAccessibilityState({ disabled })}
        disabled={disabled}
        {...(onPress ? { onPress } : {})}
        {...(onLongPress ? { onLongPress } : {})}
        testID={testID}
        baseStyle={surface}
        pressedStyle={{ backgroundColor: theme.color.overlay.subtle }}
        disabledStyle={{ opacity: theme.opacity.disabled }}
      >
        {row}
      </BasePressable>
    );
  }

  // With footer / actions, only the row is pressable so the buttons stay
  // separate targets for touch and screen readers.
  return (
    <Box testID={testID} internalStyle={[surface, disabled ? { opacity: theme.opacity.disabled } : undefined]}>
      {pressable ? (
        <BasePressable
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityHint={accessibilityHint}
          disabled={disabled}
          {...(onPress ? { onPress } : {})}
          {...(onLongPress ? { onLongPress } : {})}
          minTouchTarget={false}
          baseStyle={{ borderRadius: theme.radius.md }}
          pressedStyle={{ opacity: theme.opacity.pressed }}
        >
          {row}
        </BasePressable>
      ) : row}
      {extras}
    </Box>
  );
});
