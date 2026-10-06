/* Compile-time checks for the responsive API (run by `npm run typecheck`). */
import { createResponsive, createTheme, getResponsive } from '../src';

const brand = createResponsive({ breakpoints: { phone: 0, tablet: 768, desktop: 1200 } });
const r = brand.get({ width: 800, height: 600 });
export const ok: [string, number | undefined, boolean] = [r.breakpoint, r.select({ phone: 1, tablet: 2 }), r.up('desktop')];
export const withDefault: number = r.select({ tablet: 2, default: 1 });

// @ts-expect-error unknown breakpoint name for this project
r.up('medium');

// default toolkit uses the theme names
getResponsive({ width: 400, height: 800 }).up('medium');
// @ts-expect-error 'tablet' is not a default breakpoint
getResponsive({ width: 400, height: 800 }).up('tablet');

// own token values are allowed (theme types are widened)
export const brandTheme = createTheme({ spacing: { md: 14 }, typography: { fontFamily: { sans: 'Inter' }, fontWeight: { bold: '800' } } });
// @ts-expect-error token names stay checked
createTheme({ spacing: { gigantic: 99 } });
