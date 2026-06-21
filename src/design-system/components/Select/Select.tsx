import React, { memo, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useTheme } from '../../hooks';
import { heightForSize, logicalRow, statusBorderColor, type ComponentSize, type FeedbackStatus } from '../../utilities/styles';
import { BottomSheet } from '../BottomSheet';
import { Icon } from '../Icon';
import { ListItem } from '../ListItem';
import { SearchInput } from '../SearchInput';
import { Text } from '../Text';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: readonly SelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  title?: string;
  disabled?: boolean;
  status?: FeedbackStatus;
  size?: ComponentSize;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  accessibilityLabel?: string;
}

export const Select = memo(function Select({
  options,
  value,
  onValueChange,
  placeholder = 'Select an option',
  title = 'Select an option',
  disabled = false,
  status = 'default',
  size = 'medium',
  searchable = false,
  searchPlaceholder = 'Search options',
  emptyMessage = 'No options found',
  accessibilityLabel,
}: SelectProps) {
  const { theme, direction } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find(option => option.value === value);
  const filtered = useMemo(
    () => options.filter(option => option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase())),
    [options, query],
  );

  return (
    <>
      <Pressable
        accessibilityRole="combobox"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityState={{ disabled, expanded: open }}
        aria-invalid={status === 'error'}
        accessibilityValue={{ text: selected?.label ?? placeholder }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          logicalRow(direction),
          {
            minHeight: heightForSize(theme, size),
            alignItems: 'center',
            gap: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
            borderRadius: theme.radius.md,
            borderWidth: theme.borderWidth.thin,
            borderColor: statusBorderColor(theme, status),
            backgroundColor: disabled ? theme.color.disabled.background : pressed ? theme.color.overlay.subtle : theme.color.surface.primary,
            opacity: disabled ? theme.opacity.disabled : theme.opacity.opaque,
          },
        ]}
      >
        <Text tone={selected ? 'primary' : 'tertiary'} style={{ flex: 1 }}>{selected?.label ?? placeholder}</Text>
        <Icon name="chevron-down" size="sm" tone="secondary" />
      </Pressable>
      <BottomSheet visible={open} onClose={() => setOpen(false)} title={title}>
        <View style={{ gap: theme.spacing.md }}>
          {searchable ? <SearchInput value={query} placeholder={searchPlaceholder} onChangeText={setQuery} onClear={() => setQuery('')} /> : null}
          <ScrollView keyboardShouldPersistTaps="handled">
            {filtered.length ? filtered.map(option => (
              <ListItem
                key={option.value}
                title={option.label}
                selected={option.value === value}
                showChevron={false}
                {...(option.description ? { description: option.description } : {})}
                {...(option.disabled !== undefined ? { disabled: option.disabled } : {})}
                {...(option.value === value ? { trailing: <Icon name="check" tone="primary" /> } : {})}
                onPress={() => {
                  onValueChange(option.value);
                  setOpen(false);
                  setQuery('');
                }}
              />
            )) : <Text tone="secondary" align="center">{emptyMessage}</Text>}
          </ScrollView>
        </View>
      </BottomSheet>
    </>
  );
});
