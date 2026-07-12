import React, { forwardRef, memo, useState } from 'react';
import {
  Pressable as RNPressable,
  StyleSheet,
  type GestureResponderEvent,
  type PressableProps as RNPressableProps,
  type StyleProp,
  type View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks';
import type { InteractionFeedback } from '../../platform';

export type BasePressableHandle = View;

export interface BasePressableState {
  pressed: boolean;
  focused: boolean;
  hovered: boolean;
}

export interface BasePressableProps extends Omit<
  RNPressableProps,
  'children' | 'onPress' | 'style'
> {
  children:
    | React.ReactNode
    | ((state: BasePressableState) => React.ReactNode);
  onPress?: (() => void) | undefined;
  stopPropagation?: boolean;
  minTouchTarget?: boolean;
  baseStyle?: StyleProp<ViewStyle>;
  pressedStyle?: ViewStyle;
  focusedStyle?: ViewStyle;
  hoveredStyle?: ViewStyle;
  disabledStyle?: ViewStyle;
  accessibilityLabel?: string | undefined;
  accessibilityHint?: string | undefined;
  testID?: string | undefined;
  feedback?: InteractionFeedback;
  stateLayerColor?: string;
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
      feedback = 'auto',
      stateLayerColor,
      android_ripple,
      ...props
    },
    ref,
  ) {
    const { platformTokens, theme } = useTheme();
    const [focused, setFocused] = useState(false);
    const [hovered, setHovered] = useState(false);
    const handlePress = (event?: GestureResponderEvent) => {
      if (stopPropagation) event?.stopPropagation?.();
      onPress?.();
    };
    const resolvedFeedback = feedback === 'auto'
      ? platformTokens.interaction.pressFeedback
      : feedback;
    const flattenedBaseStyle = StyleSheet.flatten(baseStyle);
    const minimumTouchStyle = minTouchTarget
      ? {
          minWidth: Math.max(
            platformTokens.touchTarget.minimum,
            typeof flattenedBaseStyle?.minWidth === 'number'
              ? flattenedBaseStyle.minWidth
              : 0,
          ),
          minHeight: Math.max(
            platformTokens.touchTarget.minimum,
            typeof flattenedBaseStyle?.minHeight === 'number'
              ? flattenedBaseStyle.minHeight
              : 0,
          ),
        }
      : undefined;

    return (
      <RNPressable
        ref={ref}
        disabled={disabled}
        android_ripple={
          resolvedFeedback === 'stateLayer'
            ? android_ripple ?? {
                color: stateLayerColor ?? theme.color.overlay.subtle,
                borderless: false,
              }
            : android_ripple
        }
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
          baseStyle,
          minimumTouchStyle,
          pressed ? pressedStyle : undefined,
          pressed && resolvedFeedback === 'opacity'
            ? { opacity: platformTokens.interaction.pressedOpacity }
            : undefined,
          focused ? focusedStyle : undefined,
          hovered ? hoveredStyle : undefined,
          disabled ? disabledStyle : undefined,
        ]}
      >
        {({ pressed }) => (
          typeof children === 'function'
            ? children({ pressed, focused, hovered })
            : children
        )}
      </RNPressable>
    );
  },
));
