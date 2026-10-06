import React, {
  memo,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  Animated,
  Easing,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks';

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
          start: tokens.contentPaddingHorizontal + labelInsetStart,
          end: tokens.contentPaddingHorizontal,
          top: tokens.labelFloatingTop,
          color: emphasisProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [tokens.labelColor, activeLabelColor],
          }),
          fontFamily: direction === 'rtl'
            ? theme.typography.fontFamily.arabic
            : theme.typography.fontFamily.sans,
          fontSize: tokens.labelFontSize,
          lineHeight: theme.typography.lineHeight.md,
          textAlign: direction === 'rtl' ? 'right' : 'left',
          transform: [
            {
              translateY: labelProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [
                  tokens.labelRestingTop - tokens.labelFloatingTop,
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
      {children}
    </Animated.View>
  );
});
