import React, { memo } from 'react';
import type { TextValue } from '../../i18n';
import type { Responsive } from '../../responsive/createResponsive';
import type { ThemeBreakpoint } from '../../themes/types';
import { OptionTiles, type OptionTile, type OptionValue } from '../OptionTiles';

export interface RadioImageGroupProps<V extends OptionValue = string> {
  /** `{ value, title, description?, image, disabled? }` */
  options: readonly OptionTile<V>[];
  value?: V | null;
  onChange?: (value: V) => void;
  columns?: Responsive<ThemeBreakpoint, number>;
  /** Width / height of the pictures. Default `4/3`. */
  imageAspectRatio?: number;
  disabled?: boolean;
  accessibilityLabel?: TextValue;
  testID?: string;
}

function RadioImageGroupInner<V extends OptionValue = string>({ value, onChange, ...props }: RadioImageGroupProps<V>) {
  return (
    <OptionTiles
      {...props}
      variant="image"
      role="radio"
      selected={value === undefined || value === null ? [] : [value]}
      onToggle={next => {
        if (next !== value) onChange?.(next);
      }}
    />
  );
}

/** Single choice between picture cards (card designs, plans, themes…). */
export const RadioImageGroup = memo(RadioImageGroupInner) as typeof RadioImageGroupInner;
