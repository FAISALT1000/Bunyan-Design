import React, { memo } from 'react';
import type { TextValue } from '../../i18n';
import type { Responsive } from '../../responsive/createResponsive';
import type { ThemeBreakpoint } from '../../themes/types';
import { OptionTiles, type OptionTile, type OptionValue } from '../OptionTiles';

interface BoxGroupBase<V extends OptionValue> {
  /** `{ value, title, description?, icon?, disabled? }` */
  options: readonly OptionTile<V>[];
  columns?: Responsive<ThemeBreakpoint, number>;
  disabled?: boolean;
  accessibilityLabel?: TextValue;
  testID?: string;
}

export interface BoxGroupSingleProps<V extends OptionValue> extends BoxGroupBase<V> {
  multiple?: false;
  value?: V | null;
  onChange?: (value: V) => void;
}

export interface BoxGroupMultipleProps<V extends OptionValue> extends BoxGroupBase<V> {
  multiple: true;
  value?: readonly V[] | null;
  onChange?: (value: V[]) => void;
  max?: number;
}

export type BoxGroupProps<V extends OptionValue = string> = BoxGroupSingleProps<V> | BoxGroupMultipleProps<V>;

function BoxGroupInner<V extends OptionValue = string>(props: BoxGroupProps<V>) {
  const selected: readonly V[] = props.multiple
    ? props.value ?? []
    : props.value === undefined || props.value === null ? [] : [props.value];
  const { options, columns, disabled, accessibilityLabel, testID } = props;
  return (
    <OptionTiles
      options={options}
      {...(columns !== undefined ? { columns } : {})}
      {...(disabled !== undefined ? { disabled } : {})}
      {...(accessibilityLabel !== undefined ? { accessibilityLabel } : {})}
      {...(testID !== undefined ? { testID } : {})}
      variant="box"
      role={props.multiple ? 'checkbox' : 'radio'}
      selected={selected}
      onToggle={value => {
        if (props.multiple) {
          const isOn = selected.includes(value);
          if (!isOn && props.max !== undefined && selected.length >= props.max) return;
          props.onChange?.(isOn ? selected.filter(v => v !== value) : [...selected, value]);
        } else if (!selected.includes(value)) {
          props.onChange?.(value);
        }
      }}
    />
  );
}

/** Selectable boxes with icon, title and description — single or multiple. */
export const BoxGroup = memo(BoxGroupInner) as unknown as {
  <V extends OptionValue = string>(props: BoxGroupMultipleProps<V>): React.ReactElement;
  <V extends OptionValue = string>(props: BoxGroupSingleProps<V>): React.ReactElement;
};
