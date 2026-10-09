import React from 'react';
import { Icon, iconCategories, type IconName } from '../src';
import { WalletIcon } from '../src/design-system/icons';

declare module '../src' {
  interface CustomIcons {
    'streamspy-logo': true;
  }
}

export const custom = <Icon name="streamspy-logo" />;
export const builtIn: IconName = 'wallet';
export const named = <WalletIcon size={24} tone="primary" />;
export const finance: readonly IconName[] = iconCategories.finance;
// @ts-expect-error unknown icon names are rejected
export const unknown = <Icon name="not-an-icon" />;
