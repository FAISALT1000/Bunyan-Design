import React from 'react';
import { Image, Pressable, View, type ImageSourcePropType } from '../RNTheme';
import { useTheme } from '../../hooks';
import { useText, type TextValue } from '../../i18n';
import type { ThemeBreakpoint } from '../../themes/types';
import type { Responsive } from '../../responsive/createResponsive';
import { logicalRow } from '../../utilities/styles';
import { Icon, type IconName } from '../Icon';
import { List } from '../List';
import { Text } from '../Text';

export type OptionValue = string | number;

export interface OptionTile<V extends OptionValue = string> {
  value: V;
  title: TextValue;
  description?: TextValue;
  /** Picture on top of the tile (RadioImageGroup). */
  image?: ImageSourcePropType;
  /** Icon on the tile (BoxGroup). */
  icon?: IconName;
  disabled?: boolean;
}

export interface OptionTilesProps<V extends OptionValue> {
  options: readonly OptionTile<V>[];
  selected: readonly V[];
  onToggle: (value: V) => void;
  /** `'image'`: picture on top · `'box'`: icon + text. */
  variant: 'image' | 'box';
  role: 'radio' | 'checkbox';
  columns?: Responsive<ThemeBreakpoint, number>;
  imageAspectRatio?: number;
  disabled?: boolean;
  accessibilityLabel?: TextValue;
  testID?: string;
}

interface TileViewProps {
  option: OptionTile<OptionValue>;
  selectedValues: readonly OptionValue[];
  onToggle: (value: OptionValue) => void;
  variant: 'image' | 'box';
  role: 'radio' | 'checkbox';
  imageAspectRatio: number;
  groupDisabled: boolean;
}

/** One card. Defined at module level so List keeps the same component between renders. */
function OptionTileView({ option, selectedValues, onToggle, variant, role, imageAspectRatio, groupDisabled }: TileViewProps) {
  const { theme, direction } = useTheme();
  const t = useText();
  const isSelected = selectedValues.includes(option.value);
  const isDisabled = groupDisabled || Boolean(option.disabled);
  const title = t(option.title) ?? String(option.value);
  const description = t(option.description);
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityLabel={title}
      {...(description ? { accessibilityHint: description } : {})}
      accessibilityState={{ checked: isSelected, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={() => onToggle(option.value)}
      style={({ pressed }) => ({
        flex: 1,
        overflow: 'hidden',
        borderRadius: theme.radius.lg,
        borderWidth: isSelected ? theme.borderWidth.medium : theme.borderWidth.thin,
        borderColor: isSelected ? theme.color.primary.default : theme.color.border.secondary,
        backgroundColor: isSelected ? theme.color.primary.subtle : pressed ? theme.color.overlay.subtle : theme.color.surface.primary,
        opacity: isDisabled ? theme.opacity.disabled : theme.opacity.opaque,
      })}
    >
      {variant === 'image' && option.image ? (
        <Image source={option.image} accessibilityIgnoresInvertColors style={{ width: '100%', aspectRatio: imageAspectRatio }} />
      ) : null}
      <View style={[variant === 'image' ? logicalRow(direction) : null, { padding: theme.spacing.md, gap: theme.spacing.sm, alignItems: variant === 'image' ? 'center' : 'flex-start', flexGrow: 1 }]}>
        {variant === 'box' && option.icon ? (
          <View style={{ width: theme.componentHeight.sm, height: theme.componentHeight.sm, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: isSelected ? theme.color.surface.primary : theme.color.neutral.subtle }}>
            <Icon name={option.icon} size="md" color={isSelected ? theme.color.text.link : theme.color.text.secondary} />
          </View>
        ) : null}
        {variant === 'image' ? (
          <View style={{ width: theme.iconSize.md, height: theme.iconSize.md, borderRadius: role === 'radio' ? theme.radius.pill : theme.radius.sm, borderWidth: theme.borderWidth.medium, borderColor: isSelected ? theme.color.primary.default : theme.color.border.primary, alignItems: 'center', justifyContent: 'center' }}>
            {isSelected ? <View style={{ width: theme.iconSize.xs - 2, height: theme.iconSize.xs - 2, borderRadius: role === 'radio' ? theme.radius.pill : theme.radius.xs, backgroundColor: theme.color.primary.default }} /> : null}
          </View>
        ) : null}
        <View style={{ flex: variant === 'image' ? 1 : undefined, gap: theme.spacing.xxs }}>
          <Text variant="labelMedium" weight="semibold" internalColor={isSelected ? theme.color.text.link : theme.color.text.primary} value={title} />
          {description ? <Text variant="caption" tone="secondary" value={description} /> : null}
        </View>
      </View>
      {variant === 'box' && isSelected ? (
        <View style={{ position: 'absolute', top: theme.spacing.sm, end: theme.spacing.sm, width: theme.iconSize.md, height: theme.iconSize.md, borderRadius: theme.radius.pill, backgroundColor: theme.color.primary.default, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size="xs" tone="inverse" />
        </View>
      ) : null}
    </Pressable>
  );
}

/** Selectable cards laid out in a grid. Shared by RadioImageGroup and BoxGroup. */
export function OptionTiles<V extends OptionValue>({
  options,
  selected,
  onToggle,
  variant,
  role,
  columns = 2,
  imageAspectRatio = 4 / 3,
  disabled = false,
  accessibilityLabel,
  testID,
}: OptionTilesProps<V>) {
  const t = useText();
  return (
    <View testID={testID} accessibilityRole={role === 'radio' ? 'radiogroup' : 'none'} accessibilityLabel={t(accessibilityLabel)}>
      <List
        Component={OptionTileView}
        data={options}
        keyExtractor={option => String(option.value)}
        formatItem={option => ({ option: option as OptionTile<OptionValue> })}
        shareProps={{
          selectedValues: selected,
          onToggle: onToggle as (value: OptionValue) => void,
          variant,
          role,
          imageAspectRatio,
          groupDisabled: disabled,
        }}
        columns={columns}
        spacing="md"
        rowStyle={{ alignItems: 'stretch' }}
      />
    </View>
  );
}
