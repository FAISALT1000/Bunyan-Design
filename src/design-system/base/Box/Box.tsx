import React, { forwardRef, memo } from 'react';
import {
  View,
  type AccessibilityProps,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks';

export type SpacingToken = keyof ReturnType<typeof useTheme>['theme']['spacing'];
export type RadiusToken = keyof ReturnType<typeof useTheme>['theme']['radius'];

export interface BoxProps extends AccessibilityProps {
  children?: React.ReactNode;
  flex?: number;
  flexGrow?: number;
  flexShrink?: number;
  width?: ViewStyle['width'];
  minWidth?: ViewStyle['minWidth'];
  maxWidth?: ViewStyle['maxWidth'];
  height?: ViewStyle['height'];
  minHeight?: ViewStyle['minHeight'];
  maxHeight?: ViewStyle['maxHeight'];
  padding?: SpacingToken;
  paddingHorizontal?: SpacingToken;
  paddingVertical?: SpacingToken;
  paddingTop?: SpacingToken;
  paddingBottom?: SpacingToken;
  paddingStart?: SpacingToken;
  paddingEnd?: SpacingToken;
  gap?: SpacingToken;
  alignItems?: ViewStyle['alignItems'];
  justifyContent?: ViewStyle['justifyContent'];
  alignSelf?: ViewStyle['alignSelf'];
  flexWrap?: ViewStyle['flexWrap'];
  overflow?: ViewStyle['overflow'];
  position?: ViewStyle['position'];
  opacity?: number;
  radius?: RadiusToken;
  nativeID?: string | undefined;
  testID?: string | undefined;
  accessibilityLabel?: string | undefined;
  accessibilityHint?: string | undefined;
  /**
   * Internal composition escape hatch. Values must come from design-system
   * tokens. Product components should prefer controlled Box props.
   */
  internalStyle?: ViewStyle | readonly (ViewStyle | undefined)[];
}

export const Box = memo(forwardRef<View, BoxProps>(function Box(
  {
    children,
    flex,
    flexGrow,
    flexShrink,
    width,
    minWidth,
    maxWidth,
    height,
    minHeight,
    maxHeight,
    padding,
    paddingHorizontal,
    paddingVertical,
    paddingTop,
    paddingBottom,
    paddingStart,
    paddingEnd,
    gap,
    alignItems,
    justifyContent,
    alignSelf,
    flexWrap,
    overflow,
    position,
    opacity,
    radius,
    internalStyle,
    ...props
  },
  ref,
) {
  const { theme } = useTheme();
  const spacing = theme.spacing;

  return (
    <View
      ref={ref}
      {...(props as ViewProps)}
      style={[
        {
          flex,
          flexGrow,
          flexShrink,
          width,
          minWidth,
          maxWidth,
          height,
          minHeight,
          maxHeight,
          padding: padding ? spacing[padding] : undefined,
          paddingHorizontal: paddingHorizontal ? spacing[paddingHorizontal] : undefined,
          paddingVertical: paddingVertical ? spacing[paddingVertical] : undefined,
          paddingTop: paddingTop ? spacing[paddingTop] : undefined,
          paddingBottom: paddingBottom ? spacing[paddingBottom] : undefined,
          paddingStart: paddingStart ? spacing[paddingStart] : undefined,
          paddingEnd: paddingEnd ? spacing[paddingEnd] : undefined,
          gap: gap ? spacing[gap] : undefined,
          alignItems,
          justifyContent,
          alignSelf,
          flexWrap,
          overflow,
          position,
          opacity,
          borderRadius: radius ? theme.radius[radius] : undefined,
        },
        internalStyle,
      ]}
    >
      {children}
    </View>
  );
}));
