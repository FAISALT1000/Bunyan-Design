import React, { memo } from 'react';
import { Icon, type IconName, type IconProps } from '../components/Icon/Icon';

export type NamedIconProps = Omit<IconProps, 'name'>;

/** Builds a named icon component, e.g. `const WalletIcon = createIcon('wallet')`. */
export function createIcon(name: IconName) {
  const Named = memo(function NamedIcon(props: NamedIconProps) {
    return <Icon {...props} name={name} />;
  });
  Named.displayName = `Icon(${name})`;
  return Named;
}
