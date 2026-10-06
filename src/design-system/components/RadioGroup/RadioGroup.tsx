import React, { memo } from 'react';
import { View } from '../RNTheme';
import { useTheme } from '../../hooks';
import { useText, type TextValue } from '../../i18n';
import { logicalRow } from '../../utilities/styles';
import { Radio } from '../Radio';

export interface RadioGroupOption<V extends string | number = string> {
  label: TextValue;
  value: V;
  description?: TextValue;
  disabled?: boolean;
}

export interface RadioGroupProps<V extends string | number = string> {
  options: readonly RadioGroupOption<V>[];
  value?: V | null;
  onChange?: (value: V) => void;
  disabled?: boolean;
  /** Stack (default) or place options side by side. */
  layout?: 'column' | 'row';
  accessibilityLabel?: TextValue;
  testID?: string;
}

function RadioGroupInner<V extends string | number = string>({
  options,
  value,
  onChange,
  disabled = false,
  layout = 'column',
  accessibilityLabel,
  testID,
}: RadioGroupProps<V>) {
  const { theme, direction } = useTheme();
  const t = useText();
  return (
    <View
      testID={testID}
      accessibilityRole="radiogroup"
      accessibilityLabel={t(accessibilityLabel)}
      style={[
        layout === 'row' ? { ...logicalRow(direction), flexWrap: 'wrap' } : null,
        { gap: layout === 'row' ? theme.spacing.xl : theme.spacing.md },
      ]}
    >
      {options.map(option => {
        const description = t(option.description);
        return (
          <Radio
            key={String(option.value)}
            label={t(option.label) ?? ''}
            selected={option.value === value}
            disabled={disabled || Boolean(option.disabled)}
            onSelect={() => onChange?.(option.value)}
            value={String(option.value)}
            {...(description ? { description } : {})}
          />
        );
      })}
    </View>
  );
}

/** Labelled set of Radio buttons with one selected value. */
export const RadioGroup = memo(RadioGroupInner) as typeof RadioGroupInner;
