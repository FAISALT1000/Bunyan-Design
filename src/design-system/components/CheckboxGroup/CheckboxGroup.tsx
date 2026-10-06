import React, { memo } from 'react';
import { View } from '../RNTheme';
import { useTheme } from '../../hooks';
import { useText, type TextValue } from '../../i18n';
import { logicalRow } from '../../utilities/styles';
import { Checkbox } from '../Checkbox';
import { Divider } from '../Divider';

export interface CheckboxGroupOption<V extends string | number = string> {
  label: TextValue;
  value: V;
  description?: TextValue;
  disabled?: boolean;
}

export interface CheckboxGroupProps<V extends string | number = string> {
  options: readonly CheckboxGroupOption<V>[];
  value?: readonly V[] | null;
  onChange?: (value: V[]) => void;
  /** Adds a "select all" checkbox (shows the mixed state when partly selected). */
  selectAllLabel?: TextValue;
  max?: number;
  layout?: 'column' | 'row';
  disabled?: boolean;
  error?: boolean;
  accessibilityLabel?: TextValue;
  testID?: string;
}

function CheckboxGroupInner<V extends string | number = string>({
  options,
  value,
  onChange,
  selectAllLabel,
  max,
  layout = 'column',
  disabled = false,
  error = false,
  accessibilityLabel,
  testID,
}: CheckboxGroupProps<V>) {
  const { theme, direction } = useTheme();
  const t = useText();
  const selected = value ?? [];
  const enabled = options.filter(option => !option.disabled);
  const allSelected = enabled.length > 0 && enabled.every(option => selected.includes(option.value));
  const someSelected = !allSelected && enabled.some(option => selected.includes(option.value));
  const label = t(selectAllLabel);

  return (
    <View testID={testID} accessibilityLabel={t(accessibilityLabel)} style={{ gap: theme.spacing.md }}>
      {label ? (
        <>
          <Checkbox
            label={label}
            checked={allSelected}
            indeterminate={someSelected}
            disabled={disabled}
            error={error}
            onChange={() => onChange?.(allSelected ? selected.filter(v => !enabled.some(o => o.value === v)) : Array.from(new Set([...selected, ...enabled.map(o => o.value)])))}
          />
          <Divider />
        </>
      ) : null}
      <View style={[layout === 'row' ? { ...logicalRow(direction), flexWrap: 'wrap' } : null, { gap: layout === 'row' ? theme.spacing.xl : theme.spacing.md }]}>
        {options.map(option => {
          const checked = selected.includes(option.value);
          const description = t(option.description);
          const atMax = max !== undefined && selected.length >= max && !checked;
          return (
            <Checkbox
              key={String(option.value)}
              label={t(option.label) ?? String(option.value)}
              checked={checked}
              disabled={disabled || Boolean(option.disabled) || atMax}
              error={error}
              onChange={() => onChange?.(checked ? selected.filter(v => v !== option.value) : [...selected, option.value])}
              {...(description ? { description } : {})}
            />
          );
        })}
      </View>
    </View>
  );
}

/** Several checkboxes bound to one array value, with optional "select all". */
export const CheckboxGroup = memo(CheckboxGroupInner) as typeof CheckboxGroupInner;
