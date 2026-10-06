import React, { memo } from 'react';
import { Linking } from 'react-native';
import { warnDeprecated } from '../../utilities/deprecations';
import { Button } from '../Button';

interface SharedLinkProps {
  onPress?: () => void;
  href?: string;
  external?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

/**
 * @deprecated Use `Button` with `variant="link"`.
 */
export type LinkProps = SharedLinkProps & (
  | { label: string; children?: never }
  | {
      label?: never;
      /**
       * @deprecated Use the label prop.
       */
      children: string;
    }
);

/**
 * @deprecated Use `Button` with `variant="link"`. Scheduled for removal in
 * 1.0.0.
 */
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
  const resolvedLabel = label ?? children;
  warnDeprecated(
    'Link is deprecated. Use <Button title="..." variant="link" />. It will be removed in 1.0.0.',
  );

  return (
    <Button
      title={`${resolvedLabel}${external ? ' ↗' : ''}`}
      variant="link"
      actionType={href || external ? 'externalLink' : 'navigation'}
      disabled={disabled}
      onPress={() => {
        onPress?.();
        if (href) void Linking.openURL(href);
      }}
      {...(accessibilityLabel ? { accessibilityLabel } : {})}
      {...(accessibilityHint ? { accessibilityHint } : {})}
      {...(testID ? { testID } : {})}
    />
  );
});
