import React, { memo, useMemo, useState } from 'react';
import { Pressable, View } from '../RNTheme';
import { useTheme } from '../../hooks';
import { logicalRow } from '../../utilities/styles';
import { BottomSheet } from '../BottomSheet';
import { Icon } from '../Icon';
import { List } from '../List';
import { ListItem } from '../ListItem';
import { SearchInput } from '../SearchInput';
import { Text } from '../Text';

export interface InlinePickerOption {
  value: string;
  /** Text on the trigger. */
  short: string;
  /** Row title in the sheet. */
  label: string;
  description?: string;
  /** Extra text matched by search. */
  keywords?: string;
}

export interface InlinePickerProps {
  options: readonly InlinePickerOption[];
  value: string;
  onChange: (value: string) => void;
  title: string;
  accessibilityLabel: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
}

/** Compact trigger inside an input (currency, country code) that opens a searchable sheet. */
export const InlinePicker = memo(function InlinePicker({
  options,
  value,
  onChange,
  title,
  accessibilityLabel,
  searchable = options.length > 7,
  searchPlaceholder = 'Search',
  disabled = false,
}: InlinePickerProps) {
  const { theme, direction } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const current = options.find(option => option.value === value);
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return options;
    return options.filter(option => `${option.label} ${option.short} ${option.keywords ?? ''}`.toLocaleLowerCase().includes(needle));
  }, [options, query]);
  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ text: current?.label ?? value }}
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        hitSlop={theme.spacing.xs}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          logicalRow(direction),
          { alignItems: 'center', gap: theme.spacing.xxs, paddingVertical: theme.spacing.xs, opacity: pressed ? theme.opacity.strong : theme.opacity.opaque },
        ]}
      >
        <Text weight="semibold" style={{ writingDirection: 'ltr' }}>{current?.short ?? value}</Text>
        <Icon name="chevron-down" size="xs" tone="secondary" />
      </Pressable>
      <BottomSheet visible={open} onClose={close} title={title}>
        <View style={{ gap: theme.spacing.md }}>
          {searchable ? <SearchInput value={query} onChangeText={setQuery} placeholder={searchPlaceholder} /> : null}
          <List
            Component={ListItem}
            data={filtered}
            keyExtractor={option => option.value}
            spacing={0}
            formatItem={option => ({
              title: option.label,
              ...(option.description ? { description: option.description } : {}),
              selected: option.value === value,
              showChevron: false,
              trailing: <Text tone="secondary" style={{ writingDirection: 'ltr' }}>{option.short}</Text>,
              onPress: () => {
                if (option.value !== value) onChange(option.value);
                close();
              },
            })}
          />
        </View>
      </BottomSheet>
    </>
  );
});
