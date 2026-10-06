import React, { memo } from 'react';
import { useTheme } from '../../hooks';
import { useText, type TextValue } from '../../i18n';
import type { LogicalAlign } from '../../utilities/styles';
import { RNText as NativeText } from '../RNTheme';
import { Text, type TextVariant } from '../Text';

export interface ActionTextProps {
  /** Leading sentence, e.g. "Don't have an account?". */
  text?: TextValue;
  /** Pressable part, e.g. "Sign up". */
  actionText: TextValue;
  onPress: () => void;
  /** Text after the action. */
  trailingText?: TextValue;
  variant?: TextVariant;
  align?: LogicalAlign;
  disabled?: boolean;
  testID?: string;
}

/** A sentence with an inline link that wraps naturally ("Forgot password? Reset it"). */
export const ActionText = memo(function ActionText({
  text,
  actionText,
  onPress,
  trailingText,
  variant = 'bodySmall',
  align = 'start',
  disabled = false,
  testID,
}: ActionTextProps) {
  const { theme } = useTheme();
  const t = useText();
  const lead = t(text);
  const tail = t(trailingText);
  return (
    <NativeText testID={testID}>
      {/* Nested native Text keeps the sentence wrapping as one paragraph. */}
      <Text variant={variant} tone="secondary" align={align} value={lead ? `${lead} ` : ''} />
      <NativeText
        accessibilityRole="link"
        accessibilityState={{ disabled }}
        disabled={disabled}
        suppressHighlighting
        onPress={disabled ? undefined : onPress}
      >
        <Text
          variant={variant}
          weight="semibold"
          decoration="underline"
          internalColor={disabled ? theme.color.disabled.text : theme.color.text.link}
          value={t(actionText) ?? ''}
        />
      </NativeText>
      {tail ? <Text variant={variant} tone="secondary" value={` ${tail}`} /> : null}
    </NativeText>
  );
});
