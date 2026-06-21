import { blackTheme, darkTheme, lightTheme, spacing, tokens } from '../src';

describe('design tokens', () => {
  it('uses a monotonic spacing scale', () => {
    expect(spacing.none).toBeLessThan(spacing.xs);
    expect(spacing.xs).toBeLessThan(spacing.md);
    expect(spacing.md).toBeLessThan(spacing.xxl);
  });

  it('keeps the complete token contract in every theme', () => {
    for (const theme of [lightTheme, darkTheme, blackTheme]) {
      expect(theme.spacing).toBe(tokens.spacing);
      expect(theme.typography).toBe(tokens.typography);
      expect(theme.color.text.primary).toBeTruthy();
      expect(theme.color.background.primary).toBeTruthy();
    }
  });

  it('provides visually distinct background modes', () => {
    expect(new Set([
      lightTheme.color.background.primary,
      darkTheme.color.background.primary,
      blackTheme.color.background.primary,
    ]).size).toBe(3);
  });
});
