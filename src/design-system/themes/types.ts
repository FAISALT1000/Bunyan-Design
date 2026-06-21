import type { tokens } from '../tokens';

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
}
