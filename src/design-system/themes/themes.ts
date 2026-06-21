import { palette, tokens } from '../tokens';
import type { SemanticColors, Theme, ThemeMode } from './types';

const shared = {
  typography: tokens.typography,
  spacing: tokens.spacing,
  radius: tokens.radius,
  borderWidth: tokens.borderWidth,
  shadow: tokens.shadow,
  iconSize: tokens.iconSize,
  componentHeight: tokens.componentHeight,
  breakpoint: tokens.breakpoint,
  motion: tokens.motion,
  opacity: tokens.opacity,
  zIndex: tokens.zIndex,
} as const;

const lightColors: SemanticColors = {
  primary: {
    default: palette.blue[600],
    hover: palette.blue[700],
    pressed: palette.blue[800],
    subtle: palette.blue[50],
    contrast: palette.gray[0],
  },
  secondary: {
    default: palette.teal[700],
    hover: palette.teal[900],
    pressed: palette.teal[900],
    subtle: palette.teal[50],
    contrast: palette.gray[0],
  },
  neutral: {
    default: palette.gray[600],
    subtle: palette.gray[100],
    strong: palette.gray[900],
    contrast: palette.gray[0],
  },
  success: { default: palette.green[600], subtle: palette.green[50], border: palette.green[200], text: palette.green[900] },
  warning: { default: palette.amber[600], subtle: palette.amber[50], border: palette.amber[200], text: palette.amber[900] },
  error: { default: palette.red[600], subtle: palette.red[50], border: palette.red[200], text: palette.red[900] },
  information: { default: palette.cyan[700], subtle: palette.cyan[50], border: palette.cyan[200], text: palette.cyan[900] },
  background: { primary: palette.gray[0], secondary: palette.gray[50], inverse: palette.gray[950] },
  surface: { primary: palette.gray[0], secondary: palette.gray[50], elevated: palette.gray[0], inverse: palette.gray[900] },
  border: { primary: palette.gray[300], secondary: palette.gray[200], focus: palette.blue[600], error: palette.red[600], success: palette.green[600] },
  text: { primary: palette.gray[900], secondary: palette.gray[600], tertiary: palette.gray[500], inverse: palette.gray[0], link: palette.blue[700] },
  disabled: { background: palette.gray[100], border: palette.gray[200], text: palette.gray[400] },
  overlay: { scrim: 'rgba(2, 6, 23, 0.64)', subtle: 'rgba(2, 6, 23, 0.12)', transparent: 'transparent' },
};

const darkColors: SemanticColors = {
  primary: {
    default: palette.blue[400],
    hover: palette.blue[300],
    pressed: palette.blue[200],
    subtle: palette.blue[900],
    contrast: palette.gray[950],
  },
  secondary: {
    default: palette.teal[500],
    hover: palette.teal[200],
    pressed: palette.teal[200],
    subtle: palette.teal[900],
    contrast: palette.gray[950],
  },
  neutral: {
    default: palette.gray[300],
    subtle: palette.gray[800],
    strong: palette.gray[50],
    contrast: palette.gray[950],
  },
  success: { default: palette.green[500], subtle: palette.green[900], border: palette.green[700], text: palette.green[200] },
  warning: { default: palette.amber[500], subtle: palette.amber[900], border: palette.amber[600], text: palette.amber[200] },
  error: { default: palette.red[500], subtle: palette.red[900], border: palette.red[700], text: palette.red[200] },
  information: { default: palette.cyan[500], subtle: palette.cyan[900], border: palette.cyan[700], text: palette.cyan[200] },
  background: { primary: palette.gray[900], secondary: palette.gray[950], inverse: palette.gray[0] },
  surface: { primary: palette.gray[800], secondary: palette.gray[900], elevated: palette.gray[700], inverse: palette.gray[0] },
  border: { primary: palette.gray[600], secondary: palette.gray[700], focus: palette.blue[400], error: palette.red[500], success: palette.green[500] },
  text: { primary: palette.gray[50], secondary: palette.gray[300], tertiary: palette.gray[400], inverse: palette.gray[950], link: palette.blue[300] },
  disabled: { background: palette.gray[800], border: palette.gray[700], text: palette.gray[500] },
  overlay: { scrim: 'rgba(0, 0, 0, 0.72)', subtle: 'rgba(255, 255, 255, 0.12)', transparent: 'transparent' },
};

const blackColors: SemanticColors = {
  ...darkColors,
  background: { primary: palette.gray[1000], secondary: palette.gray[950], inverse: palette.gray[0] },
  surface: { primary: palette.gray[950], secondary: palette.gray[1000], elevated: palette.gray[900], inverse: palette.gray[0] },
  border: { ...darkColors.border, primary: palette.gray[700], secondary: palette.gray[800] },
};

export const lightTheme: Theme = { mode: 'light', color: lightColors, ...shared };
export const darkTheme: Theme = { mode: 'dark', color: darkColors, ...shared };
export const blackTheme: Theme = { mode: 'black', color: blackColors, ...shared };

export const themes: Record<ThemeMode, Theme> = {
  light: lightTheme,
  dark: darkTheme,
  black: blackTheme,
};
