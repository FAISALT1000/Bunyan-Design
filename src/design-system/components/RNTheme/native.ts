/**
 * The single boundary between Bunyan and `react-native`.
 *
 * This is the ONLY file in the design system allowed to import from
 * `react-native`. Every other module consumes React Native through
 * `RNTheme` (themed primitives) or this module (non-visual APIs and types),
 * which keeps platform access auditable and lets us theme primitives centrally.
 */
export {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Appearance,
  Dimensions,
  I18nManager,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  PixelRatio,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

export type {
  AccessibilityState,
  ActivityIndicatorProps,
  ColorSchemeName,
  ImageProps,
  ImageSourcePropType,
  ImageStyle,
  KeyboardAvoidingViewProps,
  ModalProps,
  PressableProps,
  PressableStateCallbackType,
  ScaledSize,
  ScrollViewProps,
  StyleProp,
  SwitchProps,
  TextInputProps,
  TextProps,
  TextStyle,
  ViewProps,
  ViewStyle,
} from 'react-native';
