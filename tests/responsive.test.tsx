import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Dimensions } from '../src/design-system/components/RNTheme/native';
import {
  List,
  Text,
  ThemeProvider,
  computeResponsive,
  createResponsive,
  createTheme,
  createThemes,
  getResponsive,
  lightTheme,
  ms,
  s,
  useBreakpoint,
  useResponsive,
  useTheme,
} from '../src';
import { renderWithTheme } from './test-utils';

const PHONE = { width: 375, height: 812 };
const TABLET = { width: 820, height: 1180 };
const DESKTOP = { width: 1280, height: 800 };

// useWindowDimensions reads Dimensions.get('window') on mount.
const mockWindow = (size: { width: number; height: number }) =>
  jest.spyOn(Dimensions, 'get').mockReturnValue({ ...size, scale: 2, fontScale: 1 });

afterEach(() => jest.restoreAllMocks());

describe('computeResponsive', () => {
  it('resolves the breakpoint mobile-first', () => {
    expect(getResponsive(PHONE).breakpoint).toBe('compact');
    expect(getResponsive(TABLET).breakpoint).toBe('medium');
    expect(getResponsive(DESKTOP).breakpoint).toBe('expanded');
    expect(getResponsive({ width: 1600, height: 900 }).breakpoint).toBe('wide');
  });

  it('answers up / down / between / is', () => {
    const r = getResponsive(TABLET);
    expect(r.up('medium')).toBe(true);
    expect(r.up('expanded')).toBe(false);
    expect(r.down('expanded')).toBe(true);
    expect(r.between('medium', 'expanded')).toBe(true);
    expect(r.is('medium')).toBe(true);
    expect(r.isPortrait).toBe(true);
  });

  it('selects values with fallback to the nearest smaller breakpoint, then default', () => {
    expect(getResponsive(DESKTOP).select({ compact: 1, medium: 2 })).toBe(2);
    expect(getResponsive(PHONE).select({ medium: 2 })).toBeUndefined();
    expect(getResponsive(PHONE).select({ medium: 2, default: 1 })).toBe(1);
    expect(getResponsive(TABLET).resolve(4)).toBe(4);
    expect(getResponsive(TABLET).resolve({ compact: 1, medium: 3 })).toBe(3);
  });

  it('scales from the design canvas and clamps the ratio', () => {
    expect(getResponsive(PHONE).s(16)).toBe(16); // 375 canvas → ratio 1
    expect(getResponsive({ width: 320, height: 568 }).s(100)).toBe(85.5); // clamped to 0.85 (rounded to pixel)
    expect(getResponsive(TABLET).s(100)).toBe(135); // clamped to 1.35
    expect(getResponsive(TABLET).ms(100)).toBe(117.5); // half of the extra scale
    expect(getResponsive(TABLET).ms(100, 0)).toBe(100);
    expect(getResponsive({ width: 812, height: 375 }).s(16)).toBe(16); // uses the short side: rotation-stable
  });

  it('supports any project breakpoints and canvas', () => {
    const r = computeResponsive({ phone: 0, tablet: 768, desktop: 1200 }, { width: 900, height: 700 }, { guidelineWidth: 350, maxScale: 2, roundToPixel: false });
    expect(r.breakpoint).toBe('tablet');
    expect(r.s(35)).toBe(70); // short side 700 / 350 = 2
  });
});

describe('createResponsive', () => {
  it('gives a typed hook for custom breakpoints', () => {
    mockWindow({ width: 1300, height: 900 });
    const brand = createResponsive({ breakpoints: { phone: 0, tablet: 768, desktop: 1200 } });
    function Probe() {
      const r = brand.useResponsive();
      return <Text>{`${r.breakpoint}:${r.select({ phone: 'one', desktop: 'three' })}`}</Text>;
    }
    render(<Probe />);
    expect(screen.getByText('desktop:three')).toBeTruthy();
  });

  it('static helpers read the window at call time', () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 750, height: 1334, scale: 2, fontScale: 1 });
    expect(s(10)).toBe(13.5); // 750/375 = 2 → clamped to 1.35
    expect(ms(10)).toBe(12); // 11.75 rounded to the nearest physical pixel
  });

  it('makeStyles builds memoised theme + size aware styles', () => {
    mockWindow(TABLET);
    const brand = createResponsive();
    const useStyles = brand.makeStyles((theme, r) => ({
      box: { padding: r.select({ compact: theme.spacing.sm, medium: theme.spacing.xl }) ?? 0 },
    }));
    function Probe() {
      const styles = useStyles();
      return <Text style={styles.box}>box</Text>;
    }
    renderWithTheme(<Probe />);
    expect(screen.getByText('box')).toHaveStyle({ padding: lightTheme.spacing.xl });
  });
});

describe('own tokens', () => {
  it('createTheme overrides only what you pass', () => {
    const brand = createTheme({ color: { primary: { default: '#6D28D9' } }, spacing: { md: 14 }, breakpoint: { medium: 700 } });
    expect(brand.color.primary.default).toBe('#6D28D9');
    expect(brand.color.primary.pressed).toBe(lightTheme.color.primary.pressed);
    expect(brand.spacing.md).toBe(14);
    expect(brand.spacing.lg).toBe(lightTheme.spacing.lg);
    expect(lightTheme.spacing.md).toBe(12); // base untouched
  });

  it('ThemeProvider uses project themes, and the default hook follows their breakpoints', () => {
    mockWindow({ width: 650, height: 900 });
    const themes = createThemes({
      shared: { breakpoint: { medium: 700 } },
      dark: { color: { background: { primary: '#101010' } } },
    });
    function Probe() {
      const { theme } = useTheme();
      const bp = useBreakpoint();
      const r = useResponsive();
      return <Text>{`${theme.color.background.primary}|${bp}|${r.up('medium')}`}</Text>;
    }
    render(<ThemeProvider themes={themes} initialPreference="dark"><Probe /></ThemeProvider>);
    // 650 < custom medium 700 → still compact
    expect(screen.getByText('#101010|compact|false')).toBeTruthy();
  });

  it('List accepts responsive columns', () => {
    mockWindow(TABLET);
    renderWithTheme(<List Component={Text} data={[{ children: 'a' }, { children: 'b' }, { children: 'c' }]} columns={{ compact: 1, medium: 2 }} />);
    // medium → 2 columns: 3 items + 1 padding cell
    expect(JSON.stringify(screen.toJSON()).match(/"role":"listitem"/g)).toHaveLength(4);
  });
});
