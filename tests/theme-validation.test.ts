import {
  getContrastRatio,
  lightTheme,
  themes,
  validateTheme,
  type Theme,
} from '../src';

describe('theme validation', () => {
  it.each(Object.entries(themes))('validates the %s theme', (_name, theme) => {
    expect(validateTheme(theme).issues).toEqual([]);
    expect(validateTheme(theme).valid).toBe(true);
  });

  it('detects invalid component tokens and semantic contrast', () => {
    const invalidTheme: Theme = {
      ...lightTheme,
      color: {
        ...lightTheme.color,
        text: {
          ...lightTheme.color.text,
          primary: lightTheme.color.background.primary,
        },
      },
      components: {
        ...lightTheme.components,
        line: {
          ...lightTheme.components.line,
          minHeight: -1,
        },
      },
    };

    const result = validateTheme(invalidTheme);
    expect(result.valid).toBe(false);
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        path: 'components.line.minHeight',
        severity: 'error',
      }),
      expect.objectContaining({
        path: 'color.text.primary / color.background.primary',
        severity: 'error',
      }),
    ]));
  });

  it('calculates WCAG contrast ratios for opaque hex colors', () => {
    expect(getContrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21);
    expect(getContrastRatio('transparent', '#FFFFFF')).toBeUndefined();
  });
});
