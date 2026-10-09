import React, { memo } from 'react';
import { Box } from '../base/Box';
import { BaseSwitch } from '../base/Switch';
import { useTheme } from '../hooks';
import { useText, type TextValue } from '../i18n';
import type { Theme } from '../themes/types';
import { createAccessibilityState } from '../utilities/accessibility';
import { Avatar, type AvatarProps } from '../components/Avatar';
import { Badge, type BadgeTone } from '../components/Badge';
import { Icon, type IconName } from '../components/Icon';
import type { ImageSourcePropType } from '../components/RNTheme/native';

/** Colour family of a tinted icon box. */
export type IconBoxTone = 'primary' | 'neutral' | 'success' | 'warning' | 'error' | 'info';

/** Leading icon of a preset: a name, or a name with a tone. */
export type PresetIcon = IconName | { name: IconName; tone?: IconBoxTone };

export interface PresetAvatar {
  name?: string;
  image?: ImageSourcePropType;
  status?: 'online' | 'busy' | 'offline';
}

/** A badge: just the label, or a label with a tone. */
export type PresetBadge = TextValue | { label: TextValue; tone?: BadgeTone };

export interface PresetToggle {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

/** A button rendered by a preset. */
export interface PresetAction {
  title: TextValue;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost' | 'link' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
}

export const iconBoxColors = (theme: Theme, tone: IconBoxTone) => ({
  primary: { background: theme.color.primary.subtle, foreground: theme.color.primary.default },
  neutral: { background: theme.color.neutral.subtle, foreground: theme.color.text.secondary },
  success: { background: theme.color.success.subtle, foreground: theme.color.success.default },
  warning: { background: theme.color.warning.subtle, foreground: theme.color.warning.default },
  error: { background: theme.color.error.subtle, foreground: theme.color.error.default },
  info: { background: theme.color.information.subtle, foreground: theme.color.information.default },
})[tone];

export interface IconBoxProps {
  name: IconName;
  tone?: IconBoxTone;
  /** Box side in points. Default 40. */
  size?: number;
  mirroredInRTL?: boolean;
  testID?: string;
}

/** An icon on a tinted rounded square, the leading element of most presets. */
export const IconBox = memo(function IconBox({ name, tone = 'neutral', size = 40, mirroredInRTL, testID }: IconBoxProps) {
  const { theme } = useTheme();
  const colors = iconBoxColors(theme, tone);
  return (
    <Box
      width={size}
      height={size}
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      {...(testID ? { testID } : {})}
      internalStyle={{ borderRadius: Math.round(size * 0.3), backgroundColor: colors.background }}
    >
      <Icon name={name} size={Math.round(size * 0.5)} color={colors.foreground} {...(mirroredInRTL ? { mirroredInRTL } : {})} />
    </Box>
  );
});

export const resolveIcon = (icon: PresetIcon, fallbackTone: IconBoxTone = 'neutral') =>
  typeof icon === 'string' ? { name: icon, tone: fallbackTone } : { name: icon.name, tone: icon.tone ?? fallbackTone };

/** Avatar with an optional presence dot. */
export const PresetAvatarView = memo(function PresetAvatarView({ avatar, size = 'medium' }: { avatar: PresetAvatar; size?: AvatarProps['size'] }) {
  const { theme } = useTheme();
  const statusColor = avatar.status === 'online'
    ? theme.color.success.default
    : avatar.status === 'busy'
      ? theme.color.warning.default
      : theme.color.text.tertiary;
  return (
    <Box flexShrink={0}>
      <Avatar size={size} {...(avatar.name ? { name: avatar.name } : {})} {...(avatar.image ? { source: avatar.image } : {})} />
      {avatar.status ? (
        <Box
          position="absolute"
          width={12}
          height={12}
          internalStyle={{
            bottom: 0,
            end: 0,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: theme.color.surface.primary,
            backgroundColor: statusColor,
          }}
        />
      ) : null}
    </Box>
  );
});

export function useBadge() {
  const t = useText();
  return (badge: PresetBadge | undefined) => {
    if (badge === undefined) return null;
    const isObject = typeof badge === 'object' && 'label' in badge;
    const label = t(isObject ? badge.label : badge) ?? '';
    const tone = isObject ? badge.tone ?? 'neutral' : 'neutral';
    return <Badge label={label} tone={tone} size="small" />;
  };
}

/** Themed native switch used by presets. */
export const PresetSwitch = memo(function PresetSwitch({
  toggle,
  accessibilityLabel,
  testID,
}: {
  toggle: PresetToggle;
  accessibilityLabel: string;
  testID?: string | undefined;
}) {
  const { theme } = useTheme();
  return (
    <BaseSwitch
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="switch"
      accessibilityState={createAccessibilityState({ checked: toggle.value, disabled: Boolean(toggle.disabled) })}
      {...(testID ? { testID } : {})}
      value={toggle.value}
      disabled={toggle.disabled}
      onValueChange={toggle.onChange}
      trackColor={{ false: theme.color.disabled.background, true: theme.color.primary.default }}
      thumbColor={toggle.value ? theme.color.primary.contrast : theme.color.neutral.default}
      ios_backgroundColor={theme.color.disabled.background}
    />
  );
});

/** Surface styles shared by preset cards. */
export const cardSurface = (theme: Theme, padded = true) => ({
  backgroundColor: theme.color.surface.primary,
  borderColor: theme.color.border.secondary,
  borderWidth: theme.borderWidth.thin,
  borderRadius: theme.radius.lg,
  ...(padded ? { padding: theme.spacing.lg } : {}),
});
