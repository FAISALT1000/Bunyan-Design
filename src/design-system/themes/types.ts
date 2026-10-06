import type { tokens } from '../tokens';
import type { TextVariant } from '../tokens/typography.types';

export type ThemeMode = 'light' | 'dark' | 'black';
export type Direction = 'ltr' | 'rtl';

export interface SemanticColors {
  primary: {
    default: string;
    hover: string;
    pressed: string;
    subtle: string;
    contrast: string;
  };
  secondary: {
    default: string;
    hover: string;
    pressed: string;
    subtle: string;
    contrast: string;
  };
  neutral: {
    default: string;
    subtle: string;
    strong: string;
    contrast: string;
  };
  success: { default: string; subtle: string; border: string; text: string };
  warning: { default: string; subtle: string; border: string; text: string };
  error: { default: string; subtle: string; border: string; text: string };
  information: { default: string; subtle: string; border: string; text: string };
  background: { primary: string; secondary: string; inverse: string };
  surface: { primary: string; secondary: string; elevated: string; inverse: string };
  border: { primary: string; secondary: string; focus: string; error: string; success: string };
  text: { primary: string; secondary: string; tertiary: string; inverse: string; link: string };
  disabled: { background: string; border: string; text: string };
  overlay: { scrim: string; subtle: string; transparent: string };
}

export interface Theme {
  mode: ThemeMode;
  color: SemanticColors;
  typography: typeof tokens.typography;
  spacing: typeof tokens.spacing;
  radius: typeof tokens.radius;
  borderWidth: typeof tokens.borderWidth;
  shadow: typeof tokens.shadow;
  iconSize: typeof tokens.iconSize;
  componentHeight: typeof tokens.componentHeight;
  breakpoint: typeof tokens.breakpoint;
  motion: typeof tokens.motion;
  opacity: typeof tokens.opacity;
  zIndex: typeof tokens.zIndex;
  components: ComponentTokens;
}

export interface LineComponentTokens {
  minHeight: number;
  paddingHorizontal: number;
  paddingVertical: number;
  sectionGap: number;
  iconGap: number;
  textGap: number;
  dividerColor: string;
  pressedBackground: string;
  focusedBorderColor: string;
  disabledOpacity: number;
  titleTextVariant: TextVariant;
  subtitleTextVariant: TextVariant;
  tertiaryTextVariant: TextVariant;
}

export interface CardVariantTokens {
  background: string;
  borderColor: string;
  borderWidth: number;
  shadow: keyof typeof tokens.shadow;
  pressedBackground: string;
}

export interface CardComponentTokens {
  radius: number;
  selectedBorderColor: string;
  focusedBorderColor: string;
  disabledOpacity: number;
  size: {
    small: { padding: number; gap: number };
    medium: { padding: number; gap: number };
    large: { padding: number; gap: number };
  };
  variants: {
    primary: CardVariantTokens;
    secondary: CardVariantTokens;
    tertiary: CardVariantTokens;
    outline: CardVariantTokens;
    elevated: CardVariantTokens;
    ghost: CardVariantTokens;
    success: CardVariantTokens;
    warning: CardVariantTokens;
    error: CardVariantTokens;
  };
}

export interface ComponentTokens {
  button: ButtonComponentTokens;
  inputField: InputFieldComponentTokens;
  line: LineComponentTokens;
  card: CardComponentTokens;
}

export interface ButtonComponentTokens {
  link: {
    textColor: string;
    pressedTextColor: string;
    disabledTextColor: string;
    underline: 'always' | 'none';
    focusIndicatorColor: string;
    iconGap: number;
    touchTargetPadding: number;
  };
}

export interface InputFieldVariantTokens {
  background: string;
  borderColor: string;
  borderWidth: number;
  focusedBorderWidth: number;
}

export interface InputFieldComponentTokens {
  minHeight: number;
  radius: number;
  contentPaddingHorizontal: number;
  contentPaddingTop: number;
  contentPaddingBottom: number;
  iconGap: number;
  helperTextSpacing: number;
  disabledOpacity: number;
  labelRestingTop: number;
  labelFloatingTop: number;
  labelScale: number;
  labelFontSize: number;
  animationDuration: number;
  animationEasing: readonly [number, number, number, number];
  focusedBorderColor: string;
  errorBorderColor: string;
  successBorderColor: string;
  labelColor: string;
  focusedLabelColor: string;
  errorLabelColor: string;
  successLabelColor: string;
  variants: {
    outlined: InputFieldVariantTokens;
    filled: InputFieldVariantTokens;
    underlined: InputFieldVariantTokens;
  };
}
