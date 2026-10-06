import React, { memo } from 'react';
import { warnDeprecated } from '../../utilities/deprecations';
import {
  Text,
  type TextTone,
  type TextVariant,
} from '../Text';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface SharedHeadingProps {
  level?: HeadingLevel;
  tone?: TextTone;
  align?: 'start' | 'center' | 'end';
  numberOfLines?: number;
  accessibilityLabel?: string;
  testID?: string;
}

export type HeadingProps = SharedHeadingProps & (
  | { title: string | number; children?: never }
  | {
      title?: never;
      /**
       * @deprecated Use the title prop. Scheduled for removal in 1.0.0.
       */
      children: string | number;
    }
);

const variantForLevel: Record<HeadingLevel, TextVariant> = {
  1: 'displayLarge',
  2: 'displayMedium',
  3: 'headingLarge',
  4: 'headingMedium',
  5: 'headingSmall',
  6: 'labelLarge',
};

export const Heading = memo(function Heading({
  title,
  children,
  level = 2,
  ...props
}: HeadingProps) {
  const resolvedTitle = title ?? children;
  if (title === undefined && children !== undefined) {
    warnDeprecated('Heading children is deprecated. Use <Heading title="..." />. It will be removed in 1.0.0.');
  }

  return (
    <Text
      value={resolvedTitle as string | number}
      variant={variantForLevel[level]}
      weight="bold"
      accessibilityRole="header"
      {...(props.tone !== undefined ? { tone: props.tone } : {})}
      {...(props.align !== undefined ? { align: props.align } : {})}
      {...(props.numberOfLines !== undefined
        ? { numberOfLines: props.numberOfLines }
        : {})}
      {...(props.accessibilityLabel
        ? { accessibilityLabel: props.accessibilityLabel }
        : {})}
      {...(props.testID ? { testID: props.testID } : {})}
    />
  );
});
