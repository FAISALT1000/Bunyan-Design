import React from 'react';
import { Box } from '../../base/Box';
import { Inline } from '../../base/Inline';
import { BasePressable } from '../../base/Pressable';
import { ScrollContainer } from '../../base/ScrollContainer';
import { useTheme } from '../../hooks';
import { useText, type TextValue } from '../../i18n';
import { createAccessibilityLabel } from '../../utilities/accessibility';
import { Icon, type IconName } from '../../components/Icon';
import { Text } from '../../components/Text';

export interface FilterChipItem<V extends string | number = string> {
  value: V;
  label?: TextValue;
  /** Translation key (Bunyan prop naming); `label` is the fallback. */
  labelLocalize?: string;
  /** Count shown inside the chip (e.g. unread). */
  count?: number;
  icon?: IconName;
  disabled?: boolean;
}

interface FilterChipsBaseProps<V extends string | number> {
  items: ReadonlyArray<FilterChipItem<V> | false | null | undefined>;
  /** One horizontally scrolling row instead of wrapping lines. */
  scrollable?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

export type FilterChipsProps<V extends string | number = string> = FilterChipsBaseProps<V> & (
  | { multiple?: false; value: V | null; onChange: (value: V) => void; values?: never }
  /** Multi-select: `values` / `onChange(values)`. */
  | { multiple: true; values: readonly V[]; onChange: (values: V[]) => void; value?: never }
);

/**
 * A bar of filter chips (single or multi select) with optional counts:
 * inbox filters, categories, audit filters.
 *
 * ```tsx
 * <FilterChips value={filter} onChange={setFilter} scrollable items={[
 *   { value: 'mine', labelLocalize: 'agent.filter.mine', count: 4 },
 *   { value: 'unassigned', label: 'Unassigned' },
 * ]} />
 * ```
 */
export function FilterChips<V extends string | number = string>(props: FilterChipsProps<V>) {
  const { items, scrollable = false, accessibilityLabel, testID } = props;
  const { theme } = useTheme();
  const t = useText();
  const visible = items.filter(Boolean) as FilterChipItem<V>[];
  const isSelected = (value: V) => (props.multiple ? props.values.includes(value) : props.value === value);
  const press = (value: V) => {
    if (props.multiple) {
      props.onChange(props.values.includes(value) ? props.values.filter(item => item !== value) : [...props.values, value]);
    } else if (props.value !== value) {
      props.onChange(value);
    }
  };

  const chips = visible.map(item => {
    const selected = isSelected(item.value);
    const label = t(item.labelLocalize ? { localeKey: item.labelLocalize, fallback: t(item.label) ?? item.labelLocalize } : item.label) ?? String(item.value);
    return (
      <BasePressable
        key={String(item.value)}
        accessibilityRole={props.multiple ? 'checkbox' : 'radio'}
        accessibilityLabel={createAccessibilityLabel([label, item.count])}
        accessibilityState={props.multiple ? { checked: selected, disabled: Boolean(item.disabled) } : { selected, disabled: Boolean(item.disabled) }}
        disabled={item.disabled}
        onPress={() => press(item.value)}
        testID={testID ? `${testID}-${item.value}` : undefined}
        baseStyle={{
          minHeight: theme.componentHeight.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radius.pill,
          borderWidth: theme.borderWidth.thin,
          borderColor: selected ? theme.color.primary.default : theme.color.border.primary,
          backgroundColor: selected ? theme.color.primary.subtle : theme.color.surface.primary,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        pressedStyle={{ backgroundColor: theme.color.overlay.subtle }}
        disabledStyle={{ opacity: theme.opacity.disabled }}
      >
        <Inline gap="xs" alignItems="center">
          {item.icon ? <Icon name={item.icon} size="sm" {...(selected ? { color: theme.color.primary.default } : { tone: 'secondary' as const })} /> : null}
          <Text value={label} variant="labelMedium" weight={selected ? 'semibold' : 'medium'} tone={selected ? 'info' : 'primary'} />
          {item.count !== undefined ? (
            <Box
              minWidth={20}
              paddingHorizontal="xs"
              alignItems="center"
              radius="pill"
              internalStyle={{ backgroundColor: selected ? theme.color.primary.default : theme.color.neutral.subtle }}
            >
              <Text
                value={String(item.count)}
                variant="micro"
                weight="bold"
                internalColor={selected ? theme.color.primary.contrast : theme.color.text.secondary}
              />
            </Box>
          ) : null}
        </Inline>
      </BasePressable>
    );
  });

  const group = {
    accessibilityRole: props.multiple ? undefined : ('radiogroup' as const),
    ...(accessibilityLabel ? { accessibilityLabel } : {}),
    ...(testID ? { testID } : {}),
  };

  if (scrollable) {
    return (
      <ScrollContainer horizontal showsHorizontalScrollIndicator={false} gap="sm" {...group}>
        {chips}
      </ScrollContainer>
    );
  }
  return <Inline gap="sm" flexWrap="wrap" {...group}>{chips}</Inline>;
}
