import React, { forwardRef } from 'react';
import { useTheme } from '../../hooks/useTheme';
import type { ThemeContextValue } from '../../providers/ThemeProvider';

/** Any style value, including Pressable's `(state) => style` form. */
type AnyStyle = unknown;
type StyleResolver = (state: unknown) => AnyStyle;

/** The static (non-function) style type a component accepts. */
export type ThemedStaticStyle<P> = P extends { style?: infer S }
  ? Exclude<S, (...args: never[]) => unknown>
  : never;

export interface ThemedComponentOptions<P> {
  /** Shown in React DevTools and error messages. */
  displayName: string;
  /** Theme-aware props applied first; anything passed explicitly wins. */
  defaultProps?: (context: ThemeContextValue) => Partial<P>;
  /** Theme-aware base style; merged underneath the caller's `style`. */
  baseStyle?: (context: ThemeContextValue) => ThemedStaticStyle<P>;
}

export interface ThemedExtraProps<P> {
  /**
   * Style computed from the active theme. Applied after the base style and
   * before `style`, so an explicit `style` always has the final say.
   */
  themeStyle?: (context: ThemeContextValue) => ThemedStaticStyle<P>;
}

export type ThemedComponentProps<C extends React.ElementType> =
  React.ComponentPropsWithoutRef<C> & ThemedExtraProps<React.ComponentPropsWithoutRef<C>>;

export type ThemedComponent<C extends React.ElementType> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ThemedComponentProps<C>> & React.RefAttributes<React.ComponentRef<C>>
>;

const isResolver = (value: AnyStyle): value is StyleResolver => typeof value === 'function';

/**
 * Merges style layers, flattening `undefined` layers away. When any layer is a
 * Pressable-style resolver the result is a resolver as well, so interaction
 * state keeps working through the themed wrapper.
 */
export const mergeThemedStyles = (...layers: AnyStyle[]): AnyStyle => {
  const present = layers.filter(layer => layer !== undefined && layer !== null && layer !== false);
  if (present.length === 0) return undefined;
  if (present.some(isResolver)) {
    return (state: unknown) => present.map(layer => (isResolver(layer) ? layer(state) : layer));
  }
  return present.length === 1 ? present[0] : present;
};

/**
 * Applies theme defaults underneath explicit props. An explicit `undefined`
 * does not erase a theme default (e.g. `placeholderTextColor={undefined}`).
 */
const withDefaults = (
  defaults: Record<string, unknown> | undefined,
  props: Record<string, unknown>,
): Record<string, unknown> => {
  if (!defaults) return props;
  const result: Record<string, unknown> = { ...defaults };
  for (const key of Object.keys(props)) {
    if (props[key] !== undefined || !(key in defaults)) result[key] = props[key];
  }
  return result;
};

/**
 * Wraps a React Native primitive so it reads the active Bunyan theme.
 *
 * ```tsx
 * const Surface = createThemedComponent(View, {
 *   displayName: 'Surface',
 *   baseStyle: ({ theme }) => ({ backgroundColor: theme.color.surface.primary }),
 * });
 *
 * <Surface themeStyle={({ theme }) => ({ padding: theme.spacing.lg })} />
 * ```
 */
export function createThemedComponent<C extends React.ElementType>(
  Component: C,
  options: ThemedComponentOptions<React.ComponentPropsWithoutRef<C>>,
): ThemedComponent<C> {
  const { displayName, defaultProps, baseStyle } = options;
  const Base = Component as unknown as React.ComponentType<Record<string, unknown>>;

  const Themed = forwardRef<unknown, Record<string, unknown>>(function Themed(
    { themeStyle, style, ...props },
    ref,
  ) {
    const context = useTheme();
    const defaults = defaultProps ? (defaultProps(context) as Record<string, unknown>) : undefined;
    const resolvedThemeStyle = typeof themeStyle === 'function'
      ? (themeStyle as (value: ThemeContextValue) => AnyStyle)(context)
      : undefined;
    const merged = mergeThemedStyles(baseStyle?.(context), resolvedThemeStyle, style);

    return (
      <Base
        ref={ref}
        {...withDefaults(defaults, props)}
        {...(merged !== undefined ? { style: merged } : {})}
      />
    );
  });

  Themed.displayName = displayName;
  return Themed as unknown as ThemedComponent<C>;
}
