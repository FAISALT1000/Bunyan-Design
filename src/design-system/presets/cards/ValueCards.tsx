import React, { memo, useState } from 'react';
import { Box } from '../../base/Box';
import { Inline } from '../../base/Inline';
import { BasePressable } from '../../base/Pressable';
import { Stack } from '../../base/Stack';
import { useTheme } from '../../hooks';
import { isTextValue, useText, type TextValue } from '../../i18n';
import { createAccessibilityLabel, createAccessibilityState } from '../../utilities/accessibility';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { IconButton } from '../../components/IconButton';
import { Image, type ImageSourcePropType } from '../../components/RNTheme';
import { Skeleton } from '../../components/Skeleton';
import { Text } from '../../components/Text';
import { Money } from '../format/FormatText';
import { formatMoney } from '../format/format';
import {
  IconBox,
  PresetAvatarView,
  cardSurface,
  iconBoxColors,
  resolveIcon,
  useBadge,
  type PresetAction,
  type PresetAvatar,
  type PresetBadge,
  type PresetIcon,
  type PresetToggle,
} from '../shared';

export function useActionButton() {
  const t = useText();
  return (action: PresetAction, overrides: Partial<React.ComponentProps<typeof Button>> = {}) => (
    <Button
      title={t(action.title) ?? ''}
      onPress={action.onPress}
      {...(action.variant ? { variant: action.variant } : {})}
      {...(action.icon ? { leftIcon: action.icon } : {})}
      {...(action.disabled !== undefined ? { disabled: action.disabled } : {})}
      {...(action.loading !== undefined ? { loading: action.loading } : {})}
      {...(action.testID ? { testID: action.testID } : {})}
      {...(overrides as object)}
    />
  );
}

export interface Trend {
  value: TextValue;
  direction: 'up' | 'down' | 'flat';
}

// ---------------------------------------------------------------- AmountCard

export interface AmountCardProps {
  label: TextValue;
  amount: number;
  currency?: string;
  decimals?: number;
  trend?: Trend;
  /** Adds an eye button that hides the amount. */
  hideable?: boolean;
  /** Controlled hidden state (with `onHiddenChange`). */
  hidden?: boolean;
  onHiddenChange?: (hidden: boolean) => void;
  /** Up to 3 quick actions under the amount. */
  actions?: ReadonlyArray<Omit<PresetAction, 'variant'>>;
  /** `'primary'` = filled brand card; `'surface'` = regular card. */
  variant?: 'primary' | 'surface';
  onPress?: () => void;
  loading?: boolean;
  testID?: string;
}

/**
 * A balance or total with currency, trend and quick actions.
 *
 * ```tsx
 * <AmountCard variant="primary" label="Available balance" amount={25430.5} currency="SAR"
 *   trend={{ value: '+4.2%', direction: 'up' }} hideable
 *   actions={[{ title: 'Transfer', icon: 'transfer', onPress: goTransfer }]} />
 * ```
 */
export const AmountCard = memo(function AmountCard({
  label,
  amount,
  currency,
  decimals,
  trend,
  hideable = false,
  hidden: hiddenProp,
  onHiddenChange,
  actions,
  variant = 'surface',
  onPress,
  loading = false,
  testID,
}: AmountCardProps) {
  const { theme } = useTheme();
  const t = useText();
  const [hiddenState, setHiddenState] = useState(false);
  const hidden = hiddenProp ?? hiddenState;
  const filled = variant === 'primary';
  const foreground = filled ? theme.color.primary.contrast : undefined;
  const labelText = t(label) ?? '';
  const surface = filled
    ? { backgroundColor: theme.color.primary.default, borderRadius: theme.radius.lg, padding: theme.spacing.lg }
    : cardSurface(theme);

  if (loading) {
    return (
      <Box {...(testID ? { testID } : {})} internalStyle={{ ...surface, gap: theme.spacing.sm }}>
        <Skeleton width="40%" height={12} />
        <Skeleton width="65%" height={28} />
      </Box>
    );
  }

  const toggleHidden = () => {
    setHiddenState(!hidden);
    onHiddenChange?.(!hidden);
  };

  const content = (
    <Stack gap="sm">
      <Inline gap="sm" alignItems="center" justifyContent="space-between">
        <Text value={labelText} variant="bodySmall" {...(foreground ? { internalColor: foreground } : { tone: 'secondary' as const })} />
        <Inline gap="xs" alignItems="center">
          {trend ? <TrendChip trend={trend} onFilled={filled} /> : null}
          {hideable ? (
            <IconButton
              icon={hidden ? 'eye-off' : 'eye'}
              size="small"
              tone={filled ? 'inverse' : 'secondary'}
              accessibilityLabel={hidden ? 'Show amount' : 'Hide amount'}
              onPress={toggleHidden}
            />
          ) : null}
        </Inline>
      </Inline>
      <Money
        amount={amount}
        variant="displayMedium"
        weight="bold"
        hidden={hidden}
        {...(currency ? { currency } : {})}
        {...(decimals !== undefined ? { decimals } : {})}
        {...(filled ? { tone: 'inverse' as const } : {})}
      />
      {actions?.length ? (
        <Inline gap="sm">
          {actions.slice(0, 3).map((action, index) => (
            <BasePressable
              key={index}
              accessibilityRole="button"
              accessibilityLabel={t(action.title) ?? ''}
              onPress={action.onPress}
              disabled={action.disabled}
              {...(action.testID ? { testID: action.testID } : {})}
              baseStyle={{
                flex: 1,
                minHeight: theme.componentHeight.sm,
                borderRadius: theme.radius.md,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: filled ? theme.color.primary.hover : theme.color.primary.subtle,
              }}
              pressedStyle={{ backgroundColor: filled ? theme.color.primary.pressed : theme.color.overlay.subtle }}
            >
              <Inline gap="xs" alignItems="center">
                {action.icon ? <Icon name={action.icon} size="sm" color={filled ? theme.color.primary.contrast : theme.color.primary.default} /> : null}
                <Text value={t(action.title) ?? ''} variant="labelMedium" weight="semibold" internalColor={filled ? theme.color.primary.contrast : theme.color.text.link} />
              </Inline>
            </BasePressable>
          ))}
        </Inline>
      ) : null}
    </Stack>
  );

  if (onPress) {
    return (
      <BasePressable accessibilityRole="button" accessibilityLabel={labelText} onPress={onPress} {...(testID ? { testID } : {})} baseStyle={surface}>
        {content}
      </BasePressable>
    );
  }
  return <Box {...(testID ? { testID } : {})} internalStyle={surface}>{content}</Box>;
});

function TrendChip({ trend, onFilled = false }: { trend: Trend; onFilled?: boolean }) {
  const { theme } = useTheme();
  const t = useText();
  const color = onFilled
    ? theme.color.primary.contrast
    : trend.direction === 'up'
      ? theme.color.success.text
      : trend.direction === 'down'
        ? theme.color.error.text
        : theme.color.text.secondary;
  const background = onFilled
    ? theme.color.primary.hover
    : trend.direction === 'up'
      ? theme.color.success.subtle
      : trend.direction === 'down'
        ? theme.color.error.subtle
        : theme.color.neutral.subtle;
  const arrow = trend.direction === 'up' ? '▲ ' : trend.direction === 'down' ? '▼ ' : '';
  return (
    <Box paddingHorizontal="sm" paddingVertical="xxs" radius="pill" internalStyle={{ backgroundColor: background }}>
      <Text value={`${arrow}${t(trend.value) ?? ''}`} variant="caption" weight="semibold" internalColor={color} internalStyle={{ writingDirection: 'ltr' }} />
    </Box>
  );
}

// ---------------------------------------------------------------- StatCard

export interface StatCardProps {
  label: TextValue;
  value: TextValue | number | React.ReactElement;
  trend?: Trend;
  icon?: PresetIcon;
  /** Text under the trend, e.g. "this week". */
  caption?: TextValue;
  onPress?: () => void;
  loading?: boolean;
  testID?: string;
}

/** A KPI tile: label, big value and trend. Put two or more in a `Grid`. */
export const StatCard = memo(function StatCard({ label, value, trend, icon, caption, onPress, loading = false, testID }: StatCardProps) {
  const { theme } = useTheme();
  const t = useText();
  const surface = { ...cardSurface(theme), gap: theme.spacing.xs, flex: 1 };
  if (loading) {
    return (
      <Box {...(testID ? { testID } : {})} internalStyle={surface}>
        <Skeleton width="50%" height={11} />
        <Skeleton width="40%" height={22} />
      </Box>
    );
  }
  const resolved = icon ? resolveIcon(icon, 'primary') : undefined;
  const content = (
    <>
      <Inline gap="sm" alignItems="center" justifyContent="space-between">
        <Text value={t(label) ?? ''} variant="caption" tone="tertiary" />
        {resolved ? <IconBox name={resolved.name} tone={resolved.tone} size={28} /> : null}
      </Inline>
      {typeof value === 'number' || isTextValue(value)
        ? <Text value={typeof value === 'number' ? String(value) : t(value) ?? ''} variant="headingMedium" weight="bold" />
        : value}
      {trend || caption ? (
        <Inline gap="xs" alignItems="center">
          {trend ? <TrendChip trend={trend} /> : null}
          {caption ? <Text value={t(caption) ?? ''} variant="caption" tone="tertiary" /> : null}
        </Inline>
      ) : null}
    </>
  );
  return onPress ? (
    <BasePressable accessibilityRole="button" accessibilityLabel={t(label) ?? ''} onPress={onPress} {...(testID ? { testID } : {})} baseStyle={surface}>
      {content}
    </BasePressable>
  ) : (
    <Box {...(testID ? { testID } : {})} internalStyle={surface}>{content}</Box>
  );
});

// ---------------------------------------------------------------- ProfileCard

export interface ProfileCardProps {
  avatar?: PresetAvatar;
  name: TextValue;
  subtitle?: TextValue;
  badges?: ReadonlyArray<PresetBadge> | false;
  stats?: ReadonlyArray<{ label: TextValue; value: TextValue | number }>;
  actions?: ReadonlyArray<PresetAction>;
  /** `'horizontal'` (default) for headers and lists; `'centered'` for profile screens. */
  layout?: 'horizontal' | 'centered';
  onPress?: () => void;
  loading?: boolean;
  testID?: string;
}

/** Avatar, name, role, badges, stats and actions. */
export const ProfileCard = memo(function ProfileCard({
  avatar,
  name,
  subtitle,
  badges,
  stats,
  actions,
  layout = 'horizontal',
  onPress,
  loading = false,
  testID,
}: ProfileCardProps) {
  const { theme } = useTheme();
  const t = useText();
  const renderBadge = useBadge();
  const renderAction = useActionButton();
  const nameText = t(name) ?? '';
  const subtitleText = t(subtitle);
  const centered = layout === 'centered';
  const resolvedAvatar: PresetAvatar = avatar ?? { name: nameText };
  const surface = { ...cardSurface(theme), gap: theme.spacing.lg };

  if (loading) {
    return (
      <Box {...(testID ? { testID } : {})} internalStyle={surface}>
        <Inline gap="md" alignItems="center">
          <Skeleton width={56} height={56} radius="pill" />
          <Stack flex={1} gap="xs"><Skeleton width="50%" height={14} /><Skeleton width="35%" height={11} /></Stack>
        </Inline>
      </Box>
    );
  }

  const badgeRow = badges && badges.length ? (
    <Inline gap="xs" alignItems="center" flexWrap="wrap" {...(centered ? { justifyContent: 'center' as const } : {})}>
      {badges.map((badge, index) => <React.Fragment key={index}>{renderBadge(badge)}</React.Fragment>)}
    </Inline>
  ) : null;

  const identity = centered ? (
    <Stack gap="xs" alignItems="center">
      <PresetAvatarView avatar={resolvedAvatar} size="xlarge" />
      <Text value={nameText} variant="headingSmall" weight="bold" align="center" />
      {subtitleText ? <Text value={subtitleText} variant="bodySmall" tone="secondary" align="center" /> : null}
      {badgeRow}
    </Stack>
  ) : (
    <Inline gap="md" alignItems="center">
      <PresetAvatarView avatar={resolvedAvatar} size="large" />
      <Stack flex={1} gap="xxs">
        <Text value={nameText} variant="bodyLarge" weight="bold" numberOfLines={1} />
        {subtitleText ? <Text value={subtitleText} variant="bodySmall" tone="secondary" numberOfLines={1} /> : null}
      </Stack>
      {badgeRow}
    </Inline>
  );

  const content = (
    <>
      {identity}
      {stats?.length ? (
        <Inline gap="md" justifyContent="space-around">
          {stats.map((stat, index) => (
            <Stack key={index} gap="none" alignItems="center">
              <Text value={typeof stat.value === 'number' ? String(stat.value) : t(stat.value) ?? ''} variant="bodyLarge" weight="bold" />
              <Text value={t(stat.label) ?? ''} variant="caption" tone="tertiary" />
            </Stack>
          ))}
        </Inline>
      ) : null}
      {actions?.length ? (
        <Inline gap="sm">
          {actions.map((action, index) => (
            <Box key={index} flex={1}>{renderAction({ variant: 'outline', ...action }, { fullWidth: true, size: 'small' })}</Box>
          ))}
        </Inline>
      ) : null}
    </>
  );

  return onPress ? (
    <BasePressable
      accessibilityRole="button"
      accessibilityLabel={createAccessibilityLabel([nameText, subtitleText])}
      onPress={onPress}
      {...(testID ? { testID } : {})}
      baseStyle={surface}
    >
      {content}
    </BasePressable>
  ) : (
    <Box {...(testID ? { testID } : {})} internalStyle={surface}>{content}</Box>
  );
});

// ---------------------------------------------------------------- ActionCard

export interface ActionCardProps {
  icon: PresetIcon;
  title: TextValue;
  description?: TextValue;
  badge?: PresetBadge;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
  testID?: string;
}

/** A large tappable tile for menus, dashboards and onboarding choices. */
export const ActionCard = memo(function ActionCard({ icon, title, description, badge, selected = false, disabled = false, onPress, testID }: ActionCardProps) {
  const { theme } = useTheme();
  const t = useText();
  const renderBadge = useBadge();
  const resolved = resolveIcon(icon, 'primary');
  const titleText = t(title) ?? '';
  const descriptionText = t(description);
  return (
    <BasePressable
      accessibilityRole="button"
      accessibilityLabel={createAccessibilityLabel([titleText, descriptionText])}
      accessibilityState={createAccessibilityState({ selected, disabled })}
      onPress={onPress}
      disabled={disabled}
      {...(testID ? { testID } : {})}
      baseStyle={{
        ...cardSurface(theme),
        flex: 1,
        gap: theme.spacing.md,
        ...(selected ? { borderColor: theme.color.primary.default, borderWidth: theme.borderWidth.medium } : {}),
      }}
      pressedStyle={{ backgroundColor: theme.color.overlay.subtle }}
      disabledStyle={{ opacity: theme.opacity.disabled }}
    >
      <Inline gap="sm" alignItems="flex-start" justifyContent="space-between">
        <IconBox name={resolved.name} tone={resolved.tone} size={40} />
        {renderBadge(badge)}
      </Inline>
      <Stack gap="xxs">
        <Text value={titleText} variant="bodyMedium" weight="semibold" />
        {descriptionText ? <Text value={descriptionText} variant="caption" tone="tertiary" numberOfLines={2} /> : null}
      </Stack>
    </BasePressable>
  );
});

// ---------------------------------------------------------------- ProductCard

export interface ProductCardProps {
  image?: ImageSourcePropType;
  title: TextValue;
  subtitle?: TextValue;
  price: number;
  oldPrice?: number;
  currency?: string;
  rating?: number;
  reviews?: number;
  badge?: PresetBadge;
  favorite?: PresetToggle;
  cta?: PresetAction;
  /** Quantity stepper (horizontal layout, e.g. cart rows). */
  quantity?: { value: number; onChange: (value: number) => void; min?: number; max?: number };
  /** `'vertical'` (default) for grids; `'horizontal'` for lists and carts. */
  layout?: 'vertical' | 'horizontal';
  onPress?: () => void;
  loading?: boolean;
  testID?: string;
}

function ProductImage({ image, height, width }: { image: ImageSourcePropType | undefined; height: number; width?: number }) {
  const { theme } = useTheme();
  return (
    <Box
      height={height}
      {...(width !== undefined ? { width } : {})}
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      internalStyle={{ borderRadius: theme.radius.md, backgroundColor: theme.color.neutral.subtle }}
    >
      {image ? (
        <Image source={image} accessibilityIgnoresInvertColors style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      ) : (
        <Icon name="image" size="xl" tone="tertiary" />
      )}
    </Box>
  );
}

/** Product tile with image, price, rating, badge, favourite and a call to action. */
export const ProductCard = memo(function ProductCard({
  image,
  title,
  subtitle,
  price,
  oldPrice,
  currency,
  rating,
  reviews,
  badge,
  favorite,
  cta,
  quantity,
  layout = 'vertical',
  onPress,
  loading = false,
  testID,
}: ProductCardProps) {
  const { theme, locale } = useTheme();
  const t = useText();
  const renderBadge = useBadge();
  const renderAction = useActionButton();
  const titleText = t(title) ?? '';
  const subtitleText = t(subtitle);
  const horizontal = layout === 'horizontal';
  const surface = { ...cardSurface(theme), padding: theme.spacing.md, gap: theme.spacing.sm, ...(horizontal ? {} : { flex: 1 }) };

  if (loading) {
    return (
      <Box {...(testID ? { testID } : {})} internalStyle={surface}>
        {horizontal ? (
          <Inline gap="md" alignItems="center">
            <Skeleton width={72} height={72} />
            <Stack flex={1} gap="xs"><Skeleton width="70%" height={13} /><Skeleton width="40%" height={13} /></Stack>
          </Inline>
        ) : (
          <>
            <Skeleton height={110} />
            <Skeleton width="70%" height={13} />
            <Skeleton width="40%" height={15} />
          </>
        )}
      </Box>
    );
  }

  const priceRow = (
    <Inline gap="xs" alignItems="baseline" flexWrap="wrap">
      <Money amount={price} weight="bold" variant="bodyLarge" decimals={Number.isInteger(price) ? 0 : 2} {...(currency ? { currency } : {})} />
      {oldPrice !== undefined ? (
        <Text
          value={formatMoney(oldPrice, { locale, decimals: Number.isInteger(oldPrice) ? 0 : 2 })}
          variant="caption"
          tone="tertiary"
          accessibilityLabel={`Was ${oldPrice}`}
          internalStyle={{ textDecorationLine: 'line-through', writingDirection: 'ltr' }}
        />
      ) : null}
    </Inline>
  );
  const ratingRow = rating !== undefined ? (
    <Inline gap="xxs" alignItems="center">
      <Icon name="star" size="xs" color={theme.color.warning.default} />
      <Text value={`${rating.toFixed(1)}${reviews !== undefined ? ` (${reviews})` : ''}`} variant="caption" tone="secondary" />
    </Inline>
  ) : null;
  const favoriteButton = favorite ? (
    <IconButton
      icon="heart"
      size="small"
      tone={favorite.value ? 'error' : 'tertiary'}
      selected={favorite.value}
      accessibilityLabel={favorite.value ? 'Remove from favourites' : 'Add to favourites'}
      onPress={() => favorite.onChange(!favorite.value)}
    />
  ) : null;
  const stepper = quantity ? (
    <Inline gap="xs" alignItems="center">
      <IconButton icon="minus" size="small" variant="outline" accessibilityLabel="Decrease quantity"
        disabled={quantity.value <= (quantity.min ?? 0)} onPress={() => quantity.onChange(quantity.value - 1)} />
      <Text value={String(quantity.value)} weight="bold" />
      <IconButton icon="plus" size="small" variant="outline" accessibilityLabel="Increase quantity"
        disabled={quantity.max !== undefined && quantity.value >= quantity.max} onPress={() => quantity.onChange(quantity.value + 1)} />
    </Inline>
  ) : null;

  const content = horizontal ? (
    <Inline gap="md" alignItems="center">
      <ProductImage image={image} height={72} width={72} />
      <Stack flex={1} gap="xxs">
        <Text value={titleText} variant="bodyMedium" weight="semibold" numberOfLines={2} />
        {subtitleText ? <Text value={subtitleText} variant="caption" tone="tertiary" numberOfLines={1} /> : null}
        {ratingRow}
        {priceRow}
      </Stack>
      {stepper ?? favoriteButton}
    </Inline>
  ) : (
    <>
      <Box>
        <ProductImage image={image} height={110} />
        {badge !== undefined ? <Box position="absolute" internalStyle={{ top: theme.spacing.sm, start: theme.spacing.sm }}>{renderBadge(badge)}</Box> : null}
        {favoriteButton ? <Box position="absolute" internalStyle={{ top: theme.spacing.xs, end: theme.spacing.xs }}>{favoriteButton}</Box> : null}
      </Box>
      <Stack gap="xxs">
        <Text value={titleText} variant="bodyMedium" weight="semibold" numberOfLines={2} />
        {subtitleText ? <Text value={subtitleText} variant="caption" tone="tertiary" numberOfLines={1} /> : null}
        {ratingRow}
        {priceRow}
      </Stack>
      {cta ? renderAction(cta, { fullWidth: true, size: 'small' }) : null}
    </>
  );

  return onPress ? (
    <BasePressable accessibilityRole="button" accessibilityLabel={titleText} onPress={onPress} {...(testID ? { testID } : {})} baseStyle={surface}>
      {content}
    </BasePressable>
  ) : (
    <Box {...(testID ? { testID } : {})} internalStyle={surface}>{content}</Box>
  );
});

// ---------------------------------------------------------------- StatusCard

export type StatusCardStatus = 'success' | 'warning' | 'error' | 'info';

export interface StatusCardProps {
  status: StatusCardStatus;
  title: TextValue;
  message?: TextValue;
  primaryAction?: PresetAction;
  secondaryAction?: PresetAction;
  /** One-row banner style instead of the centred card. */
  compact?: boolean;
  testID?: string;
}

const STATUS_ICON = { success: 'success', warning: 'warning', error: 'error', info: 'info' } as const;

/** Inline result card: icon, title, message and actions. For full screens use `StatusScreen`. */
export const StatusCard = memo(function StatusCard({ status, title, message, primaryAction, secondaryAction, compact = false, testID }: StatusCardProps) {
  const { theme } = useTheme();
  const t = useText();
  const renderAction = useActionButton();
  const colors = iconBoxColors(theme, status);
  const titleText = t(title) ?? '';
  const messageText = t(message);
  if (compact) {
    return (
      <Box
        {...(testID ? { testID } : {})}
        accessibilityRole={status === 'error' ? 'alert' : undefined}
        internalStyle={{ ...cardSurface(theme), backgroundColor: colors.background, borderColor: colors.background }}
      >
        <Inline gap="md" alignItems="center">
          <Icon name={STATUS_ICON[status]} size="lg" color={colors.foreground} />
          <Stack flex={1} gap="xxs">
            <Text value={titleText} variant="bodyMedium" weight="semibold" />
            {messageText ? <Text value={messageText} variant="caption" tone="secondary" /> : null}
          </Stack>
          {primaryAction ? renderAction({ variant: 'ghost', ...primaryAction }, { size: 'small' }) : null}
        </Inline>
      </Box>
    );
  }
  return (
    <Box {...(testID ? { testID } : {})} internalStyle={{ ...cardSurface(theme), gap: theme.spacing.md }}>
      <Stack gap="sm" alignItems="center">
        <IconBox name={STATUS_ICON[status]} tone={status} size={56} />
        <Text value={titleText} variant="headingSmall" weight="bold" align="center" />
        {messageText ? <Text value={messageText} variant="bodySmall" tone="secondary" align="center" /> : null}
      </Stack>
      {primaryAction ? renderAction(primaryAction, { fullWidth: true }) : null}
      {secondaryAction ? renderAction({ variant: 'ghost', ...secondaryAction }, { fullWidth: true }) : null}
    </Box>
  );
});
