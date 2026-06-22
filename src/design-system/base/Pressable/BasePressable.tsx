import React, { forwardRef, memo, useState } from 'react';
import {
  Pressable as RNPressable,
  type GestureResponderEvent,
  type PressableProps as RNPressableProps,
  type View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks';

export type BasePressableHandle = View;

export interface BasePressableProps extends Omit<
  RNPressableProps,
  'children' | 'onPress' | 'style'
> {
  children: React.ReactNode;
  onPress?: (() => void) | undefined;
  stopPropagation?: boolean;
  minTouchTarget?: boolean;
  baseStyle?: ViewStyle | readonly (ViewStyle | undefined)[];
  pressedStyle?: ViewStyle;
  focusedStyle?: ViewStyle;
  hoveredStyle?: ViewStyle;
  disabledStyle?: ViewStyle;
  accessibilityLabel?: string | undefined;
  accessibilityHint?: string | undefined;
  testID?: string | undefined;
}

export const BasePressable = memo(forwardRef<BasePressableHandle, BasePressableProps>(
  function BasePressable(
    {
      children,
      onPress,
      stopPropagation = false,
      minTouchTarget = true,
      disabled = false,
      baseStyle,
      pressedStyle,
      focusedStyle,
      hoveredStyle,
      disabledStyle,
      onFocus,
      onBlur,
      onHoverIn,
      onHoverOut,
      ...props
    },
    ref,
  ) {
    const { theme } = useTheme();
    const [focused, setFocused] = useState(false);
    const [hovered, setHovered] = useState(false);
    const handlePress = (event?: GestureResponderEvent) => {
      if (stopPropagation) event?.stopPropagation?.();
      onPress?.();
    };

    return (
      <RNPressable
        ref={ref}
        disabled={disabled}
        onPress={handlePress}
        onFocus={event => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={event => {
          setFocused(false);
          onBlur?.(event);
        }}
        onHoverIn={event => {
          setHovered(true);
          onHoverIn?.(event);
        }}
        onHoverOut={event => {
          setHovered(false);
          onHoverOut?.(event);
        }}
        {...props}
        style={({ pressed }) => [
          minTouchTarget
            ? {
                minHeight: theme.componentHeight.md,
                minWidth: theme.componentHeight.md,
              }
            : undefined,
          baseStyle,
          pressed ? pressedStyle : undefined,
          focused ? focusedStyle : undefined,
          hovered ? hoveredStyle : undefined,
          disabled ? disabledStyle : undefined,
        ]}
      >
        {children}
      </RNPressable>
    );
  },
));
