import React from 'react';
import {
  DesignSystemLocalizationProvider,
  localeIsRTL,
  type DesignSystemLocalizationProviderProps,
  type SupportedLocale,
} from '../localization';
import {
  ThemeProvider,
  type ThemeProviderProps,
} from './ThemeProvider';

export interface DesignSystemProviderProps<
  TLocale extends string = SupportedLocale,
> {
  children: React.ReactNode;
  theme?: Omit<ThemeProviderProps, 'children' | 'locale'>;
  localization?: Omit<
    DesignSystemLocalizationProviderProps<TLocale>,
    'children'
  >;
}

export function DesignSystemProvider<
  TLocale extends string = SupportedLocale,
>({
  children,
  theme,
  localization,
}: DesignSystemProviderProps<TLocale>) {
  if (!localization) {
    return <ThemeProvider {...theme}>{children}</ThemeProvider>;
  }

  const direction = theme?.direction
    ?? (localeIsRTL(localization.locale, localization.rtlLocales)
      ? 'rtl'
      : 'ltr');

  return (
    <DesignSystemLocalizationProvider {...localization}>
      <ThemeProvider
        {...theme}
        locale={localization.locale}
        direction={direction}
      >
        {children}
      </ThemeProvider>
    </DesignSystemLocalizationProvider>
  );
}
