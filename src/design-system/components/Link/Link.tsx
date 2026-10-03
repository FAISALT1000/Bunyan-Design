import React, { forwardRef, memo } from 'react';
import type { ViewRef } from '../RNTheme';
import { Button, type ButtonProps } from '../Button';

/**
 * Props of `Link`: every `Button` prop except `variant`, which is always `'link'`.
 */
export type LinkProps = Omit<ButtonProps, 'variant'>;

/**
 * Inline text link.
 *
 * `Link` is now a thin alias of `<Button variant="link" />` — both render the same
 * component, so styling and behaviour (href, external, onOpenError, loading,
 * disabled, icons, sizes) stay in one place. It is kept as a convenience entry
 * point; new code can use either.
 */
export const Link = memo(forwardRef<ViewRef, LinkProps>(function Link(props, ref) {
  return <Button ref={ref} {...props} variant="link" />;
}));
