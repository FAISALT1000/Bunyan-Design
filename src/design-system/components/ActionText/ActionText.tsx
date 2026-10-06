import React, { memo } from 'react';
import { useText, type TextValue } from '../../i18n';
import type { LogicalAlign } from '../../utilities/styles';
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
  const t = useText();
  const lead = t(text);
  const tail = t(trailingText);
  return (
    <Text testID={testID} variant={variant} tone="secondary" align={align}>
      {lead ? `${lead} ` : ''}
      <Text
        variant={variant}
        tone="link"
        weight="semibold"
        accessibilityRole="link"
        accessibilityState={{ disabled }}
        disabled={disabled}
        suppressHighlighting
        onPress={disabled ? undefined : onPress}
        style={{ textDecorationLine: 'underline' }}
      >
        {t(actionText)}
      </Text>
      {tail ? ` ${tail}` : ''}
    </Text>
  );
});
