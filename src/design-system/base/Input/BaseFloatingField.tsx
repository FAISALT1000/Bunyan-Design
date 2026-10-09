import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View } from '../../components/RNTheme';
import {
  Animated,
  Easing,
  type LayoutChangeEvent,
  type ViewStyle,
} from '../../components/RNTheme/native';
import { useTheme } from '../../hooks';
import type { Direction } from '../../themes/types';
import { logicalTextAlign, needsMirroring } from '../../utilities/styles';

/**
 * Physical side where text starts reading. Transform origins are physical
 * (React Native never swaps them), so RTL text scales from its right edge.
 */
export const floatingLabelOrigin = (direction: Direction) =>
  direction === 'rtl' ? 'right top' : 'left top';

/**
 * Logical `start`/`end` offsets of the label box. `labelInsetStart` (room for a
 * leading icon) must sit on the side where the text starts; when the provider
 * direction differs from the native one, `start` is on the opposite side.
 */
export const floatingLabelInsets = (
  direction: Direction,
  padding: number,
  labelInsetStart: number,
) => (needsMirroring(direction)
  ? { start: padding, end: padding + labelInsetStart }
  : { start: padding + labelInsetStart, end: padding });

export type BaseFloatingFieldVariant = 'outlined' | 'filled' | 'underlined';
export type BaseFloatingFieldTone = 'default' | 'error' | 'success';

export interface BaseFloatingFieldProps {
  children: React.ReactNode;
  label: string;
  floating: boolean;
  focused: boolean;
  tone?: BaseFloatingFieldTone;
  variant?: BaseFloatingFieldVariant;
  disabled?: boolean;
  reducedMotion?: boolean;
  labelInsetStart?: number;
  testID?: string;
  labelTestID?: string;
}

export const BaseFloatingField = memo(function BaseFloatingField({
  children,
  label,
  floating,
  focused,
  tone = 'default',
  variant = 'outlined',
  disabled = false,
  reducedMotion = false,
  labelInsetStart = 0,
  testID,
  labelTestID,
}: BaseFloatingFieldProps) {
  const { direction, platformTokens, theme } = useTheme();
  const tokens = theme.components.inputField;
  const variantTokens = tokens.variants[variant];
  const labelProgress = useRef(new Animated.Value(floating ? 1 : 0)).current;
  const emphasisProgress = useRef(
    new Animated.Value(focused || tone !== 'default' ? 1 : 0),
  ).current;
  const easing = useMemo(
    () => Easing.bezier(...tokens.animationEasing),
    [tokens.animationEasing],
  );
  const lineHeight = theme.typography.lineHeight.md;
  // Centre line of the content row (value text, leading and trailing icons).
  // Starts from the token-based estimate and follows the measured row.
  const [contentCenter, setContentCenter] = useState<number>(
    tokens.contentPaddingTop + theme.componentHeight.md / 2,
  );
  const handleContentLayout = useCallback((event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    if (height > 0) {
      const next = y + height / 2;
      setContentCenter(current => (Math.abs(current - next) < 0.5 ? current : next));
    }
  }, []);
  const restingTop = contentCenter - lineHeight / 2;
  const insets = floatingLabelInsets(
    direction,
    tokens.contentPaddingHorizontal,
    labelInsetStart,
  );
  const duration = reducedMotion
    ? platformTokens.motion.reduced
    : tokens.animationDuration;

  useEffect(() => {
    Animated.timing(labelProgress, {
      toValue: floating ? 1 : 0,
      duration,
      easing,
      useNativeDriver: false,
    }).start();
  }, [duration, easing, floating, labelProgress]);

  useEffect(() => {
    Animated.timing(emphasisProgress, {
      toValue: focused || tone !== 'default' ? 1 : 0,
      duration,
      easing,
      useNativeDriver: false,
    }).start();
  }, [duration, easing, emphasisProgress, focused, tone]);

  const activeBorderColor = tone === 'error'
    ? tokens.errorBorderColor
    : tone === 'success'
      ? tokens.successBorderColor
      : tokens.focusedBorderColor;
  const activeLabelColor = tone === 'error'
    ? tokens.errorLabelColor
    : tone === 'success'
      ? tokens.successLabelColor
      : tokens.focusedLabelColor;
  const isBottomIndicator = variant === 'filled' || variant === 'underlined';
  const borderStyle: Animated.WithAnimatedObject<ViewStyle> = isBottomIndicator
    ? {
        borderBottomWidth: emphasisProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [
            variantTokens.borderWidth,
            variantTokens.focusedBorderWidth,
          ],
        }),
        borderBottomColor: emphasisProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [variantTokens.borderColor, activeBorderColor],
        }),
      }
    : {
        borderWidth: emphasisProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [
            variantTokens.borderWidth,
            variantTokens.focusedBorderWidth,
          ],
        }),
        borderColor: emphasisProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [variantTokens.borderColor, activeBorderColor],
        }),
      };

  return (
    <Animated.View
      testID={testID}
      style={[
        {
          minHeight: tokens.minHeight,
          borderRadius: variant === 'underlined'
            ? theme.radius.none
            : tokens.radius,
          backgroundColor: variantTokens.background,
          paddingHorizontal: tokens.contentPaddingHorizontal,
          paddingTop: tokens.contentPaddingTop,
          paddingBottom: tokens.contentPaddingBottom,
          opacity: disabled ? tokens.disabledOpacity : theme.opacity.opaque,
          justifyContent: 'center',
        },
        borderStyle,
      ]}
    >
      <Animated.Text
        testID={labelTestID}
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no"
        numberOfLines={1}
        style={{
          position: 'absolute',
          ...insets,
          top: tokens.labelFloatingTop,
          color: emphasisProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [tokens.labelColor, activeLabelColor],
          }),
          fontFamily: direction === 'rtl'
            ? theme.typography.fontFamily.arabic
            : theme.typography.fontFamily.sans,
          fontSize: tokens.labelFontSize,
          lineHeight,
          textAlign: logicalTextAlign(direction),
          writingDirection: direction,
          // Scale from the edge where the text starts so the floated label
          // stays aligned with the value text instead of drifting inwards.
          transformOrigin: floatingLabelOrigin(direction),
          transform: [
            {
              translateY: labelProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [
                  restingTop - tokens.labelFloatingTop,
                  theme.spacing.none,
                ],
              }),
            },
            {
              scale: labelProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [1, tokens.labelScale],
              }),
            },
          ],
        }}
      >
        {label}
      </Animated.Text>
      <View
        onLayout={handleContentLayout}
        {...(testID ? { testID: `${testID}-content` } : {})}
      >
        {children}
      </View>
    </Animated.View>
  );
});
