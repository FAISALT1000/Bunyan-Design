# Responsive layout & your own tokens

Bunyan keeps sizes in fixed, density-independent points and changes **layout** at breakpoints. For the few values that should grow with the screen, it offers clamped scale helpers. Everything is plain JavaScript (no native module), works on iOS, Android and web, and updates live on rotation, split-screen and window resize.

## Cheat sheet

| Keyword | What it does | Example |
| --- | --- | --- |
| `useResponsive()` | All tools below, re-rendering on window changes | `const r = useResponsive();` |
| `r.breakpoint` | Current breakpoint name | `'compact'` · `'medium'` · `'expanded'` · `'wide'` |
| `r.up(bp)` | Window is at least `bp` wide | `r.up('medium')` → tablet and larger |
| `r.down(bp)` | Window is narrower than `bp` | `r.down('medium')` → phones |
| `r.between(a, b)` | `a` ≤ width < `b` | `r.between('medium', 'expanded')` |
| `r.is(bp)` | Exactly this breakpoint | `r.is('compact')` |
| `r.select({...})` | Value per breakpoint, mobile-first, with `default` | `r.select({ compact: 1, medium: 2, expanded: 3 })` |
| `r.s(n)` | Scale with the short side (widths, padding, icons) | `r.s(16)` |
| `r.vs(n)` | Scale with the long side (heights) | `r.vs(200)` |
| `r.ms(n, f?)` | Moderate scale — only part of `s` (default 0.5). Use for fonts and radii | `r.ms(theme.typography.fontSize.xl)` |
| `r.mvs(n, f?)` | Moderate vertical scale | `r.mvs(48)` |
| `r.isPortrait` / `r.isLandscape` | Orientation | |
| `useBreakpoint()` | Just the breakpoint name | |
| `useResponsiveValue({...})` | Just one value per breakpoint | `useResponsiveValue({ compact: 16, medium: 24 })` |
| `makeStyles((theme, r) => ({...}))` | Memoised theme- and size-aware StyleSheet hook | see below |
| `s`, `vs`, `ms`, `mvs` | Static versions (read the window when called; no re-render) | module-level `StyleSheet.create` |
| `getResponsive({ width, height })` | Pure tools for an explicit size | tests, previews, SSR |

Long names exist too: `scale`, `verticalScale`, `moderateScale`, `moderateVerticalScale`.

Default breakpoints come from the theme: `compact` 0, `medium` 600, `expanded` 1024, `wide` 1440. Default design canvas: 375 × 812. Scale ratios are clamped to **0.85 – 1.35**, so small phones never drop below touch-target sizes and tablets never look like zoomed phones.

## Examples

```tsx
import { Card, List, RNTheme, makeStyles, useResponsive } from '@bunyan/design-system';

const useStyles = makeStyles((theme, r) => ({
  screen: { padding: r.select({ compact: theme.spacing.lg, medium: theme.spacing.xxl }), maxWidth: 1200, alignSelf: 'center', width: '100%' },
  title: { fontSize: r.ms(theme.typography.fontSize.xxl) },
}));

export function Dashboard({ items }: { items: Stat[] }) {
  const styles = useStyles();
  const r = useResponsive();
  return (
    <RNTheme.View style={styles.screen}>
      <List
        Component={Card}
        data={items}
        formatItem={item => ({ children: <StatBody item={item} /> })}
        columns={{ compact: 1, medium: 2, expanded: 4 }}   // List props accept breakpoint maps
        spacing={{ compact: 'md', medium: 'xl' }}
      />
      {r.up('medium') ? <SidePanel /> : null}
    </RNTheme.View>
  );
}
```

`List` accepts breakpoint maps for `columns`, `spacing` and `dividerSpacing`.

## Your own tokens

### 1. Your own theme values: `createTheme` / `createThemes`

Override only what differs; everything else keeps Bunyan's value. Token *names* stay type-checked, *values* are yours.

```tsx
import { ThemeProvider, createThemes } from '@bunyan/design-system';

export const brandThemes = createThemes({
  shared: {                              // every mode
    typography: { fontFamily: { sans: 'Inter', arabic: 'IBMPlexSansArabic' } },
    spacing: { md: 14 },
    breakpoint: { medium: 640, expanded: 1100 },
  },
  light: { color: { primary: { default: '#6D28D9', pressed: '#5B21B6', subtle: '#F5F3FF' } } },
  dark:  { color: { primary: { default: '#A78BFA', pressed: '#C4B5FD', subtle: '#2E1065' } } },
});

<ThemeProvider themes={brandThemes} initialPreference="system">…</ThemeProvider>
```

All components, `useResponsive()` and `List` follow the new values — including your breakpoints. Define the themes at module level (or memoise them) so the provider value stays stable. Use `createTheme(overrides, base?)` for a single theme.

### 2. Your own breakpoint names and design canvas: `createResponsive`

```ts
// src/responsive.ts in your app
import { createResponsive } from '@bunyan/design-system';

export const { useResponsive, useBreakpoint, useResponsiveValue, makeStyles, s, vs, ms, mvs } = createResponsive({
  breakpoints: { phone: 0, tablet: 768, desktop: 1200 },   // your names → fully typed: r.up('tablet')
  guidelineWidth: 390,                                       // your Figma frame
  guidelineHeight: 844,
  minScale: 0.9,
  maxScale: 1.25,
  moderateFactor: 0.4,
});
```

Import these from your own module everywhere in the app. TypeScript then only accepts your breakpoint names (`r.select({ phone: 1, desktop: 3 })`).

| Option | Default | Meaning |
| --- | --- | --- |
| `breakpoints` | theme `breakpoint` tokens | Name → minimum width |
| `guidelineWidth` / `guidelineHeight` | 375 / 812 | Size of the design canvas |
| `minScale` / `maxScale` | 0.85 / 1.35 | Clamp for the scale ratio |
| `moderateFactor` | 0.5 | Share of the scale used by `ms` / `mvs` |
| `roundToPixel` | true | Round to the nearest physical pixel |

## Rules of thumb

- Change **layout** with breakpoints (`select`, `up`, `List columns`); don't scale everything.
- Use `ms` for font sizes and radii, `s` for icon/illustration sizes, and leave spacing tokens as they are unless a design really needs it.
- Text still follows the user's accessibility font size (capped at 2× by Bunyan's `Text`), so avoid scaling body text aggressively.
- Use the hooks inside components; the static `s`/`ms` helpers are for module-level styles and do not update on rotation.
- Requires TypeScript ≥ 5.4.
