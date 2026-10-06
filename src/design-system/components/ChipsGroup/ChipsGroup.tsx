import React, { memo } from 'react';
import { View } from '../RNTheme';
import { useText, type TextValue } from '../../i18n';
import { Chip } from '../Chip';
import type { IconName } from '../Icon';
import { List } from '../List';

export type ChipValue = string | number;

export interface ChipsGroupItem<V extends ChipValue = string> {
  text: TextValue;
  value: V;
  /** Icon before the text. */
  leftIcon?: IconName;
  disabled?: boolean;
  accessibilityLabel?: TextValue;
}

interface ChipsGroupBaseProps<V extends ChipValue> {
  data: readonly ChipsGroupItem<V>[];
  disabled?: boolean;
  /** One horizontally scrolling line instead of wrapping rows. */
  scrollable?: boolean;
  accessibilityLabel?: TextValue;
  testID?: string;
}

export interface ChipsGroupSingleProps<V extends ChipValue> extends ChipsGroupBaseProps<V> {
  multiple?: false;
  value?: V | null;
  onChange?: (value: V) => void;
}

export interface ChipsGroupMultipleProps<V extends ChipValue> extends ChipsGroupBaseProps<V> {
  multiple: true;
  value?: readonly V[] | null;
  onChange?: (value: V[]) => void;
  /** Maximum number of selected chips. */
  max?: number;
}

export type ChipsGroupProps<V extends ChipValue = string> = ChipsGroupSingleProps<V> | ChipsGroupMultipleProps<V>;

function ChipsGroupInner<V extends ChipValue = string>(props: ChipsGroupProps<V>) {
  const { data, disabled = false, scrollable = false, accessibilityLabel, testID } = props;
  const t = useText();
  const selected: readonly V[] = props.multiple
    ? props.value ?? []
    : props.value === undefined || props.value === null ? [] : [props.value];

  const toggle = (value: V) => {
    if (props.multiple) {
      const isOn = selected.includes(value);
      if (!isOn && props.max !== undefined && selected.length >= props.max) return;
      props.onChange?.(isOn ? selected.filter(v => v !== value) : [...selected, value]);
    } else if (!selected.includes(value)) {
      props.onChange?.(value);
    }
  };

  return (
    <View testID={testID} accessibilityLabel={t(accessibilityLabel)}>
      <List
        Component={Chip}
        data={data}
        keyExtractor={item => String(item.value)}
        formatItem={item => ({
          label: t(item.text) ?? '',
          selected: selected.includes(item.value),
          disabled: disabled || Boolean(item.disabled),
          onPress: () => toggle(item.value),
          ...(item.leftIcon ? { leadingIcon: item.leftIcon } : {}),
          ...(item.accessibilityLabel ? { accessibilityLabel: t(item.accessibilityLabel) ?? '' } : {}),
        })}
        flexDirection="row"
        flexWrap={scrollable ? 'nowrap' : 'wrap'}
        isScrolling={scrollable}
        spacing="sm"
      />
    </View>
  );
}

/**
 * Single- or multi-select group of chips.
 *
 * ```tsx
 * <ChipsGroup
 *   value={direction}
 *   onChange={setDirection}
 *   data={[
 *     { text: { localeKey: 'tx.all' }, value: '0' },
 *     { text: { localeKey: 'tx.in' }, value: '1', leftIcon: 'arrow-down-left' },
 *     { text: { localeKey: 'tx.out' }, value: '2', leftIcon: 'arrow-up-right' },
 *   ]}
 * />
 * ```
 */
export const ChipsGroup = memo(ChipsGroupInner) as unknown as {
  <V extends ChipValue = string>(props: ChipsGroupMultipleProps<V>): React.ReactElement;
  <V extends ChipValue = string>(props: ChipsGroupSingleProps<V>): React.ReactElement;
};
