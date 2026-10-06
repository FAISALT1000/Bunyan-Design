import type { Theme } from './types';

export type ThemeValidationSeverity = 'error' | 'warning';

export interface ThemeValidationIssue {
  severity: ThemeValidationSeverity;
  path: string;
  message: string;
}

export interface ThemeValidationResult {
  valid: boolean;
  issues: readonly ThemeValidationIssue[];
}

const parseHexColor = (color: string): [number, number, number] | undefined => {
  const value = color.trim();
  const match = /^#([\da-f]{6})$/i.exec(value);
  if (!match?.[1]) return undefined;
  const hex = match[1];
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ];
};

const relativeLuminance = ([red, green, blue]: [number, number, number]) => {
  const channels = [red, green, blue].map(channel => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return (
    (channels[0] ?? 0) * 0.2126
    + (channels[1] ?? 0) * 0.7152
    + (channels[2] ?? 0) * 0.0722
  );
};

export const getContrastRatio = (
  foreground: string,
  background: string,
): number | undefined => {
  const foregroundRgb = parseHexColor(foreground);
  const backgroundRgb = parseHexColor(background);
  if (!foregroundRgb || !backgroundRgb) return undefined;
  const foregroundLuminance = relativeLuminance(foregroundRgb);
  const backgroundLuminance = relativeLuminance(backgroundRgb);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
};

export const validateTheme = (theme: Theme): ThemeValidationResult => {
  const issues: ThemeValidationIssue[] = [];
  const requiredStrings: ReadonlyArray<readonly [string, string]> = [
    ['color.text.primary', theme.color.text.primary],
    ['color.text.inverse', theme.color.text.inverse],
    ['color.background.primary', theme.color.background.primary],
    ['color.surface.inverse', theme.color.surface.inverse],
    ['color.primary.default', theme.color.primary.default],
    ['color.primary.contrast', theme.color.primary.contrast],
    ['components.line.dividerColor', theme.components.line.dividerColor],
    ['components.card.focusedBorderColor', theme.components.card.focusedBorderColor],
    ['components.inputField.focusedBorderColor', theme.components.inputField.focusedBorderColor],
    ['components.inputField.errorBorderColor', theme.components.inputField.errorBorderColor],
    ['components.button.link.textColor', theme.components.button.link.textColor],
  ];

  requiredStrings.forEach(([path, value]) => {
    if (!value.trim()) {
      issues.push({ severity: 'error', path, message: 'Token must not be empty.' });
    }
  });

  const numericTokens: ReadonlyArray<readonly [string, number]> = [
    ['components.line.minHeight', theme.components.line.minHeight],
    ['components.line.paddingHorizontal', theme.components.line.paddingHorizontal],
    ['components.card.radius', theme.components.card.radius],
    ['components.inputField.minHeight', theme.components.inputField.minHeight],
    ['components.inputField.animationDuration', theme.components.inputField.animationDuration],
  ];
  numericTokens.forEach(([path, value]) => {
    if (!Number.isFinite(value) || value < 0) {
      issues.push({
        severity: 'error',
        path,
        message: 'Token must be a finite non-negative number.',
      });
    }
  });

  const contrastPairs: ReadonlyArray<
    readonly [string, string, string, string]
  > = [
    [
      'color.text.primary',
      theme.color.text.primary,
      'color.background.primary',
      theme.color.background.primary,
    ],
    [
      'color.text.inverse',
      theme.color.text.inverse,
      'color.surface.inverse',
      theme.color.surface.inverse,
    ],
    [
      'color.primary.contrast',
      theme.color.primary.contrast,
      'color.primary.default',
      theme.color.primary.default,
    ],
  ];
  contrastPairs.forEach(([foregroundPath, foreground, backgroundPath, background]) => {
    const ratio = getContrastRatio(foreground, background);
    if (ratio !== undefined && ratio < 4.5) {
      issues.push({
        severity: 'error',
        path: `${foregroundPath} / ${backgroundPath}`,
        message: `Contrast ratio ${ratio.toFixed(2)} is below WCAG AA 4.5:1.`,
      });
    }
  });

  const duplicateSemanticPairs: ReadonlyArray<
    readonly [string, string, string, string]
  > = [
    [
      'color.text.primary',
      theme.color.text.primary,
      'color.background.primary',
      theme.color.background.primary,
    ],
    [
      'color.text.inverse',
      theme.color.text.inverse,
      'color.surface.inverse',
      theme.color.surface.inverse,
    ],
  ];
  duplicateSemanticPairs.forEach(([firstPath, first, secondPath, second]) => {
    if (first.toLowerCase() === second.toLowerCase()) {
      issues.push({
        severity: 'error',
        path: `${firstPath} / ${secondPath}`,
        message: 'Foreground and background tokens must not be identical.',
      });
    }
  });

  return {
    valid: issues.every(issue => issue.severity !== 'error'),
    issues,
  };
};
