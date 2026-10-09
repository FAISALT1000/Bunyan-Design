import React, { memo } from 'react';
import Svg from 'react-native-svg';
import { useTheme } from '../../hooks';
import { glyphs, type BuiltInIconName } from '../../icons/glyphs';

/**
 * App-specific icons registered with `registerIcons()`. Augment it so the
 * names type-check everywhere `IconName` is accepted:
 *
 * ```ts
 * declare module '@bunyan/design-system' {
 *   interface CustomIcons { 'streamspy-logo': true }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CustomIcons {}

export type IconName = BuiltInIconName | Extract<keyof CustomIcons, string>;

const customGlyphs = new Map<string, React.ReactNode>();

/**
 * Adds app-specific glyphs (24×24 react-native-svg children, stroke-based to
 * match the set). Call once at startup, before rendering.
 */
export function registerIcons(icons: Record<string, React.ReactNode>) {
  Object.entries(icons).forEach(([name, glyph]) => customGlyphs.set(name, glyph));
}

/** Every icon name known at runtime (built-in and registered). */
export const getIconNames = (): string[] => [...Object.keys(glyphs), ...customGlyphs.keys()];

const glyphFor = (name: string): React.ReactNode =>
  customGlyphs.get(name) ?? (glyphs as Record<string, React.ReactNode>)[name] ?? null;

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type IconTone = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'success' | 'warning' | 'error' | 'information';

export interface IconProps {
  name: IconName;
  /** Token name or a number of points. */
  size?: IconSize | number;
  tone?: IconTone;
  color?: string;
  mirroredInRTL?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

export const Icon = memo(function Icon({
  name,
  size = 'md',
  tone = 'primary',
  color,
  mirroredInRTL = false,
  accessibilityLabel,
  testID,
}: IconProps) {
  const { theme, isRTL } = useTheme();
  const toneColors: Record<IconTone, string> = {
    primary: theme.color.text.primary,
    secondary: theme.color.text.secondary,
    tertiary: theme.color.text.tertiary,
    inverse: theme.color.text.inverse,
    success: theme.color.success.default,
    warning: theme.color.warning.default,
    error: theme.color.error.default,
    information: theme.color.information.default,
  };
  const dimension = typeof size === 'number' ? size : theme.iconSize[size];

  return (
    <Svg
      {...(testID ? { testID } : {})}
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill="none"
      color={color ?? toneColors[tone]}
      stroke={color ?? toneColors[tone]}
      strokeWidth={theme.borderWidth.medium}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...(accessibilityLabel ? { accessibilityRole: 'image' as const, accessibilityLabel } : {})}
      {...(mirroredInRTL && isRTL ? { style: { transform: [{ scaleX: -1 }] } } : {})}
    >
      {glyphFor(name)}
    </Svg>
  );
});
