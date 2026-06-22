import React, { memo } from 'react';
import { Linking } from 'react-native';
import { BasePressable } from '../../base/Pressable';
import { useTheme } from '../../hooks';
import { warnDeprecated } from '../../utilities/deprecations';
import { Text } from '../Text';

interface SharedLinkProps {
  onPress?: () => void;
  href?: string;
  external?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export type LinkProps = SharedLinkProps & (
  | { label: string; children?: never }
  | {
      label?: never;
      /**
       * @deprecated Use the label prop. Scheduled for removal in 1.0.0.
       */
      children: string;
    }
);

export const Link = memo(function Link({
  label,
  children,
  href,
  external = false,
  disabled = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: LinkProps) {
  const { theme } = useTheme();
  const resolvedLabel = label ?? children;
  if (label === undefined && children !== undefined) {
    warnDeprecated('Link children is deprecated. Use <Link label="..." />. It will be removed in 1.0.0.');
  }

  return (
    <BasePressable
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel ?? resolvedLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      testID={testID}
      disabled={disabled}
      minTouchTarget
      onPress={() => {
        onPress?.();
        if (href) void Linking.openURL(href);
      }}
      baseStyle={{
        alignSelf: 'flex-start',
        borderRadius: theme.radius.sm,
        borderWidth: theme.borderWidth.none,
      }}
      focusedStyle={{
        borderWidth: theme.borderWidth.medium,
        borderColor: theme.color.border.focus,
      }}
      pressedStyle={{ opacity: theme.opacity.strong }}
      disabledStyle={{ opacity: theme.opacity.disabled }}
    >
      <Text
        value={`${resolvedLabel}${external ? ' ↗' : ''}`}
        tone={disabled ? 'disabled' : 'info'}
        weight="semibold"
        variant="labelMedium"
      />
    </BasePressable>
  );
});
