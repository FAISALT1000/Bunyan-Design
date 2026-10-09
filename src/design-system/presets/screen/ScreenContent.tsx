import React from 'react';
import type { SpacingToken } from '../../base/Box';
import { ScrollContainer } from '../../base/ScrollContainer';
import { Stack } from '../../base/Stack';
import { Spacer } from '../../base/Spacer';
import { useText, type TextValue } from '../../i18n';
import { Divider } from '../../components/Divider';
import { Heading } from '../../components/Heading';
import { Text, type TextTone, type TextVariant } from '../../components/Text';
import {
  AmountCard,
  ActionCard,
  ProductCard,
  ProfileCard,
  StatCard,
  StatusCard,
  useActionButton,
  type ActionCardProps,
  type AmountCardProps,
  type ProductCardProps,
  type ProfileCardProps,
  type StatCardProps,
  type StatusCardProps,
} from '../cards/ValueCards';
import { DetailsCard, SettingsGroup, type DetailsCardProps, type SettingsGroupProps } from '../cards/GroupCards';
import {
  OneLineCard,
  ThreeLineCard,
  TwoLineCard,
  type OneLineCardProps,
  type ThreeLineCardProps,
  type TwoLineCardProps,
} from '../cards/LineCards';
import { Grid, Row, type GridProps } from '../layout/Layout';
import { Section, type SectionProps } from '../layout/Section';
import { DataState, type DataStateProps } from '../state/DataState';
import { StatusBanner, type StatusBannerProps } from '../status/StatusViews';
import type { PresetAction } from '../shared';

/** Item presets a `List` block can repeat. */
export type ListRenderAs = 'OneLineCard' | 'TwoLineCard' | 'ThreeLineCard' | 'ProductCard' | 'ActionCard' | 'StatCard';

/**
 * Props per block `type`. Augment it to add your own blocks:
 *
 * ```ts
 * declare module '@bunyan/design-system' {
 *   interface ScreenBlockTypes { PromoBanner: { imageUrl: string } }
 * }
 * registerBlockType('PromoBanner', PromoBanner);
 * ```
 */
export interface ScreenBlockTypes {
  OneLineCard: OneLineCardProps;
  TwoLineCard: TwoLineCardProps;
  ThreeLineCard: ThreeLineCardProps;
  ProductCard: ProductCardProps;
  DetailsCard: DetailsCardProps;
  AmountCard: AmountCardProps;
  StatCard: StatCardProps;
  ProfileCard: ProfileCardProps;
  SettingsGroup: SettingsGroupProps;
  StatusCard: StatusCardProps;
  ActionCard: ActionCardProps;
  StatusBanner: StatusBannerProps;
  Section: Omit<SectionProps, 'children'> & { blocks: ScreenBlockEntry[] };
  Grid: Omit<GridProps, 'children'> & { blocks: ScreenBlockEntry[] };
  Row: { blocks: ScreenBlockEntry[]; gap?: SpacingToken };
  /** Repeats a preset for each item, with loading / empty / error handled by DataState. */
  List: Omit<DataStateProps<readonly unknown[]>, 'children'> & {
    renderAs: ListRenderAs;
    formatItem: (item: never, index: number) => Record<string, unknown>;
    keyExtractor?: (item: never, index: number) => string;
    gap?: SpacingToken;
  };
  Heading: { title: TextValue; level?: 1 | 2 | 3 | 4 | 5 | 6 };
  Text: { value: TextValue; tone?: TextTone; variant?: TextVariant; align?: 'start' | 'center' | 'end' };
  Button: PresetAction & { fullWidth?: boolean };
  Spacer: { size?: SpacingToken };
  Divider: Record<never, never>;
}

export type ScreenBlockType = keyof ScreenBlockTypes;

export type ScreenBlock = {
  [K in ScreenBlockType]: { type: K; key?: string } & ScreenBlockTypes[K];
}[ScreenBlockType];

/** A block, a React element, or a falsy value (skipped). */
export type ScreenBlockEntry = ScreenBlock | React.ReactElement | false | null | undefined;

type BlockComponent = React.ComponentType<any>;

const LIST_COMPONENTS: Record<ListRenderAs, BlockComponent> = {
  OneLineCard, TwoLineCard, ThreeLineCard, ProductCard, ActionCard, StatCard,
};

const registry = new Map<string, BlockComponent>([
  ['OneLineCard', OneLineCard],
  ['TwoLineCard', TwoLineCard],
  ['ThreeLineCard', ThreeLineCard],
  ['ProductCard', ProductCard],
  ['DetailsCard', DetailsCard],
  ['AmountCard', AmountCard],
  ['StatCard', StatCard],
  ['ProfileCard', ProfileCard],
  ['SettingsGroup', SettingsGroup],
  ['StatusCard', StatusCard],
  ['ActionCard', ActionCard],
  ['StatusBanner', StatusBanner],
]);

/** Registers a custom block type (augment `ScreenBlockTypes` for typing). */
export function registerBlockType<K extends ScreenBlockType>(type: K, component: React.ComponentType<ScreenBlockTypes[K]>) {
  registry.set(type, component as BlockComponent);
}

function TextBlock({ value, tone, variant, align }: ScreenBlockTypes['Text']) {
  const t = useText();
  return <Text value={t(value) ?? ''} {...(tone ? { tone } : {})} {...(variant ? { variant } : {})} {...(align ? { align } : {})} />;
}

function HeadingBlock({ title, level = 3 }: ScreenBlockTypes['Heading']) {
  const t = useText();
  return <Heading title={t(title) ?? ''} level={level} />;
}

function ButtonBlock({ fullWidth = true, ...action }: ScreenBlockTypes['Button']) {
  const renderAction = useActionButton();
  return renderAction(action, { fullWidth });
}

function renderBlocks(blocks: readonly ScreenBlockEntry[]): React.ReactNode[] {
  return blocks.map((entry, index) => {
    if (!entry) return null;
    if (React.isValidElement(entry)) return <React.Fragment key={`element-${index}`}>{entry}</React.Fragment>;
    const block = entry as ScreenBlock;
    const key = block.key ?? `${block.type}-${index}`;
    return <BlockView key={key} block={block} />;
  });
}

function BlockView({ block }: { block: ScreenBlock }) {
  const { type, key: _key, ...props } = block as ScreenBlock & Record<string, unknown>;
  void _key;
  switch (type) {
    case 'Section': {
      const { blocks, ...section } = props as unknown as ScreenBlockTypes['Section'];
      return <Section {...section}><Stack gap="sm">{renderBlocks(blocks)}</Stack></Section>;
    }
    case 'Grid': {
      const { blocks, ...grid } = props as unknown as ScreenBlockTypes['Grid'];
      return <Grid {...grid}>{renderBlocks(blocks)}</Grid>;
    }
    case 'Row': {
      const { blocks, gap } = props as unknown as ScreenBlockTypes['Row'];
      return <Row {...(gap ? { gap } : {})} align="center">{renderBlocks(blocks)}</Row>;
    }
    case 'List': {
      const { renderAs, formatItem, keyExtractor, gap = 'sm', ...state } = props as unknown as ScreenBlockTypes['List'];
      const Item = LIST_COMPONENTS[renderAs];
      return (
        <DataState {...(state as Omit<DataStateProps<readonly unknown[]>, 'children'>)}>
          {data => (
            <Stack gap={gap}>
              {data.map((item, index) => (
                <Item key={keyExtractor ? keyExtractor(item as never, index) : index} {...formatItem(item as never, index)} />
              ))}
            </Stack>
          )}
        </DataState>
      );
    }
    case 'Heading':
      return <HeadingBlock {...(props as unknown as ScreenBlockTypes['Heading'])} />;
    case 'Text':
      return <TextBlock {...(props as unknown as ScreenBlockTypes['Text'])} />;
    case 'Button':
      return <ButtonBlock {...(props as unknown as ScreenBlockTypes['Button'])} />;
    case 'Spacer': {
      const { size } = props as ScreenBlockTypes['Spacer'];
      return <Spacer {...(size ? { size } : {})} />;
    }
    case 'Divider':
      return <Divider />;
    default: {
      const Component = registry.get(type);
      if (!Component) {
        return <Text value={`Unknown block type "${type}". Register it with registerBlockType().`} tone="error" />;
      }
      return <Component {...props} />;
    }
  }
}

export interface ScreenContentProps {
  blocks: readonly ScreenBlockEntry[];
  /** Wrap in a ScrollView. Default true. */
  scroll?: boolean;
  gap?: SpacingToken;
  padding?: SpacingToken;
  testID?: string;
}

/**
 * A screen described as data. Blocks are presets (cards, sections, lists,
 * buttons…); falsy entries are skipped and React elements render as they are.
 *
 * ```tsx
 * <ScreenContent blocks={[
 *   { type: 'ProfileCard', name: user.name, subtitle: user.role },
 *   { type: 'AmountCard', variant: 'primary', label: 'Balance', amount: 25000, currency: 'SAR' },
 *   isAdmin && { type: 'SettingsGroup', title: 'Admin', items: adminItems },
 * ]} />
 * ```
 */
export function ScreenContent({ blocks, scroll = true, gap = 'lg', padding = 'lg', testID }: ScreenContentProps) {
  const content = renderBlocks(blocks);
  if (!scroll) {
    return <Stack gap={gap} padding={padding} {...(testID ? { testID } : {})}>{content}</Stack>;
  }
  return (
    <ScrollContainer gap={gap} padding={padding} keyboardShouldPersistTaps="handled" {...(testID ? { testID } : {})}>
      {content}
    </ScrollContainer>
  );
}
