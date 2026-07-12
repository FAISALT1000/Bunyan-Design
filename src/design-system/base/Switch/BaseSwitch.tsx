import React, { forwardRef, memo } from 'react';
import {
  Switch as NativeSwitch,
  type SwitchProps as NativeSwitchProps,
} from 'react-native';

export interface BaseSwitchProps extends Omit<NativeSwitchProps, 'style'> {
  accessibilityLabel: string;
}

export const BaseSwitch = memo(forwardRef<
  React.ElementRef<typeof NativeSwitch>,
  BaseSwitchProps
>(function BaseSwitch(props, ref) {
  return <NativeSwitch ref={ref} {...props} />;
}));
