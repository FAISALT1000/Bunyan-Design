import React from 'react';
import { useText } from '../../i18n';
import { Button } from '../../components/Button';
import type { PresetAction } from '../shared';

/** Resolves an action's text from `titleLocalize` (when translated) or `title`. */
export function useActionTitle() {
  const t = useText();
  return (action: Pick<PresetAction, 'title' | 'titleLocalize'>) =>
    t(action.titleLocalize ? { localeKey: action.titleLocalize, fallback: t(action.title) ?? action.titleLocalize } : action.title) ?? '';
}

/** Renders a `PresetAction` as a Bunyan `Button`; `overrides` win. */
export function useActionButton() {
  const t = useText();
  return (action: PresetAction, overrides: Partial<React.ComponentProps<typeof Button>> = {}) => (
    <Button
      title={t(action.title) ?? ''}
      {...(action.titleLocalize ? { titleLocalize: action.titleLocalize } : {})}
      onPress={action.onPress}
      {...(action.accessibilityLabel ? { accessibilityLabel: action.accessibilityLabel } : {})}
      {...(action.variant ? { variant: action.variant } : {})}
      {...(action.icon ? { leftIcon: action.icon } : {})}
      {...(action.disabled !== undefined ? { disabled: action.disabled } : {})}
      {...(action.loading !== undefined ? { loading: action.loading } : {})}
      {...(action.testID ? { testID: action.testID } : {})}
      {...(overrides as object)}
    />
  );
}
