import React, { forwardRef, memo } from 'react';
import {
  ScrollView,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks';
import type { SpacingToken } from '../Box';

export interface ScrollContainerProps extends Omit<
  ScrollViewProps,
  'contentContainerStyle' | 'style'
> {
  children: React.ReactNode;
  padding?: SpacingToken;
  paddingHorizontal?: SpacingToken;
  paddingVertical?: SpacingToken;
  gap?: SpacingToken;
  /**
   * Internal design-system escape hatch. Values must be token-derived.
   */
  internalStyle?: StyleProp<ViewStyle>;
  /**
   * Internal design-system escape hatch. Values must be token-derived.
   */
  contentInternalStyle?: StyleProp<ViewStyle>;
}

export const ScrollContainer = memo(forwardRef<ScrollView, ScrollContainerProps>(
  function ScrollContainer(
    {
      children,
      padding,
      paddingHorizontal,
      paddingVertical,
      gap,
      horizontal = false,
      internalStyle,
      contentInternalStyle,
      ...props
    },
    ref,
  ) {
    const { theme, direction } = useTheme();

    return (
      <ScrollView
        ref={ref}
        horizontal={horizontal}
        {...props}
        style={internalStyle}
        contentContainerStyle={[
          {
            padding: padding ? theme.spacing[padding] : undefined,
            paddingHorizontal: paddingHorizontal
              ? theme.spacing[paddingHorizontal]
              : undefined,
            paddingVertical: paddingVertical
              ? theme.spacing[paddingVertical]
              : undefined,
            gap: gap ? theme.spacing[gap] : undefined,
            flexDirection: horizontal
              ? direction === 'rtl'
                ? 'row-reverse'
                : 'row'
              : undefined,
          },
          contentInternalStyle,
        ]}
      >
        {children}
      </ScrollView>
    );
  },
));
