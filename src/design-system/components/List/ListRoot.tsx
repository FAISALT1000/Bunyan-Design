import React, { memo } from 'react';
import { ScrollView, View, type ViewStyle } from '../RNTheme';
import { useTheme } from '../../hooks';
import { needsMirroring } from '../../utilities/styles';
import { Card } from '../Card';
import type { ListFlexDirection, ListRootProps, ListSlot } from './List.types';

const renderSlot = (slot: ListSlot | undefined) => {
  if (slot === undefined || slot === null || slot === false) return null;
  if (typeof slot === 'function') {
    const Slot = slot as React.ComponentType;
    return <Slot />;
  }
  return slot as React.ReactNode;
};

/** Flips `row` ⇄ `row-reverse` when the provider direction differs from the native one. */
export const logicalFlexDirection = (flexDirection: ListFlexDirection, mirror: boolean): ListFlexDirection => {
  if (!mirror) return flexDirection;
  if (flexDirection === 'row') return 'row-reverse';
  if (flexDirection === 'row-reverse') return 'row';
  return flexDirection;
};

/** Outer shell of a List: optional Card, optional ScrollView, header, items, footer. */
export const ListRoot = memo(function ListRoot({
  style,
  paddingStyle,
  isScrolling = false,
  flexDirection,
  flexWrap,
  gap,
  cardVariant,
  children,
  ListHeaderComponent,
  ListFooterComponent,
  scrollViewContentContainerStyle,
  accessibilityLabel,
  busy = false,
  testID,
}: ListRootProps) {
  const { direction } = useTheme();
  const horizontal = flexDirection === 'row' || flexDirection === 'row-reverse';
  const itemsStyle: ViewStyle = {
    flexDirection: logicalFlexDirection(flexDirection, needsMirroring(direction)),
    flexWrap,
    gap,
    ...(horizontal ? { alignItems: 'center' } : {}),
  };
  const header = renderSlot(ListHeaderComponent);
  const footer = renderSlot(ListFooterComponent);

  const items = (
    <View role="list" accessibilityLabel={accessibilityLabel} accessibilityState={{ busy }} style={itemsStyle}>
      {children}
    </View>
  );

  // Header and footer sit outside the items container so `flexDirection`/`gap` only affect items.
  const content = isScrolling ? (
    <ScrollView
      horizontal={horizontal && flexWrap === 'nowrap'}
      showsHorizontalScrollIndicator={false}
      style={cardVariant ? undefined : style}
      contentContainerStyle={[{ gap }, paddingStyle, scrollViewContentContainerStyle]}
    >
      {header}
      {items}
      {footer}
    </ScrollView>
  ) : (
    <View style={[{ gap }, cardVariant ? null : style, paddingStyle]}>
      {header}
      {items}
      {footer}
    </View>
  );

  if (cardVariant) {
    return (
      <View testID={testID} style={style}>
        <Card variant={cardVariant} padding="none">{content}</Card>
      </View>
    );
  }
  return testID ? <View testID={testID}>{content}</View> : content;
});
