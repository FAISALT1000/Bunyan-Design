import type React from 'react';
import { createThemedComponent } from '../createThemedComponent';
import * as Native from './native';

/**
 * Themed React Native primitives.
 *
 * Design-system code imports primitives from here instead of `react-native`:
 *
 * ```ts
 * import { Pressable, View } from '../RNTheme';
 * ```
 *
 * Every primitive reads the active theme, accepts an optional `themeStyle`
 * resolver and forwards refs to the underlying native component. Primitives
 * whose names clash with Bunyan components are exported with an `RN` prefix
 * (`RNText`, `RNModal`, `RNSwitch`).
 */

const fontFamilyFor = (direction: 'ltr' | 'rtl', fonts: { sans: string; arabic: string }) =>
  direction === 'rtl' ? fonts.arabic : fonts.sans;

export const View = createThemedComponent(Native.View, { displayName: 'RNTheme.View' });

export const Pressable = createThemedComponent(Native.Pressable, { displayName: 'RNTheme.Pressable' });

export const Image = createThemedComponent(Native.Image, { displayName: 'RNTheme.Image' });

export const RNModal = createThemedComponent(Native.Modal, { displayName: 'RNTheme.Modal' });

export const RNText = createThemedComponent(Native.Text, {
  displayName: 'RNTheme.Text',
  defaultProps: () => ({ allowFontScaling: true, maxFontSizeMultiplier: 2 }),
  baseStyle: ({ theme, direction }) => ({
    color: theme.color.text.primary,
    fontFamily: fontFamilyFor(direction, theme.typography.fontFamily),
    writingDirection: direction,
  }),
});

export const TextInput = createThemedComponent(Native.TextInput, {
  displayName: 'RNTheme.TextInput',
  defaultProps: ({ theme }) => ({
    allowFontScaling: true,
    maxFontSizeMultiplier: 2,
    placeholderTextColor: theme.color.text.tertiary,
    selectionColor: theme.color.primary.default,
    cursorColor: theme.color.primary.default,
  }),
  baseStyle: ({ theme, direction }) => ({
    color: theme.color.text.primary,
    fontFamily: fontFamilyFor(direction, theme.typography.fontFamily),
    writingDirection: direction,
  }),
});

export const ScrollView = createThemedComponent(Native.ScrollView, {
  displayName: 'RNTheme.ScrollView',
  defaultProps: ({ isDark }) => ({
    indicatorStyle: isDark ? ('white' as const) : ('black' as const),
    keyboardShouldPersistTaps: 'handled' as const,
  }),
});

export const ActivityIndicator = createThemedComponent(Native.ActivityIndicator, {
  displayName: 'RNTheme.ActivityIndicator',
  defaultProps: ({ theme }) => ({ color: theme.color.primary.default }),
});

export const RNSwitch = createThemedComponent(Native.Switch, {
  displayName: 'RNTheme.Switch',
  defaultProps: ({ theme }) => ({
    trackColor: { false: theme.color.disabled.background, true: theme.color.primary.default },
    ios_backgroundColor: theme.color.disabled.background,
  }),
});

export const KeyboardAvoidingView = createThemedComponent(Native.KeyboardAvoidingView, {
  displayName: 'RNTheme.KeyboardAvoidingView',
  defaultProps: () => (Native.Platform.OS === 'ios' ? { behavior: 'padding' as const } : {}),
});

/** Non-visual React Native APIs, re-exported through the same boundary. */
export {
  AccessibilityInfo,
  Animated,
  Appearance,
  Dimensions,
  I18nManager,
  Linking,
  PanResponder,
  PixelRatio,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from './native';

export type {
  AccessibilityState,
  ColorSchemeName,
  GestureResponderEvent,
  ImageProps,
  ImageSourcePropType,
  ImageStyle,
  LayoutChangeEvent,
  PanResponderGestureState,
  PressableProps,
  PressableStateCallbackType,
  ScaledSize,
  StyleProp,
  TextInputProps,
  TextProps,
  TextStyle,
  ViewProps,
  ViewStyle,
} from './native';

/** Ref instance types of the underlying native components. */
export type ViewRef = React.ComponentRef<typeof Native.View>;
export type TextRef = React.ComponentRef<typeof Native.Text>;
export type TextInputRef = React.ComponentRef<typeof Native.TextInput>;
export type ScrollViewRef = React.ComponentRef<typeof Native.ScrollView>;
