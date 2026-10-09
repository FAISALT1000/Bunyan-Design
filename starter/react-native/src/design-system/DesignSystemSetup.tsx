import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  ApplicationAdapterProvider,
  DesignSystemProvider,
  OverlayProvider,
  ToastProvider,
  type ThemePreference,
} from '@bunyan/design-system';
import { designSystemAdapters } from './designSystemAdapters';
import {
  designSystemLocalization,
  type AppLocale,
} from './designSystemLocalization';
import { designSystemTheme } from './designSystemTheme';

export interface DesignSystemSetupProps {
  children: React.ReactNode;
  locale?: AppLocale;
  themePreference?: ThemePreference;
  onThemePreferenceChange?: (preference: ThemePreference) => void;
}

export function DesignSystemSetup({
  children,
  locale = 'en',
  themePreference = 'system',
  onThemePreferenceChange,
}: DesignSystemSetupProps) {
  return (
    <SafeAreaProvider>
      <ApplicationAdapterProvider adapters={designSystemAdapters}>
        <DesignSystemProvider
          theme={{
            ...designSystemTheme,
            preference: themePreference,
            ...(onThemePreferenceChange
              ? { onPreferenceChange: onThemePreferenceChange }
              : {}),
          }}
          localization={{
            ...designSystemLocalization,
            locale,
          }}
        >
          {/* Toasts (useToast / useStatusToast) and dialogs (useConfirm, useActionSheet, usePrompt). */}
          <ToastProvider>
            <OverlayProvider>{children}</OverlayProvider>
          </ToastProvider>
        </DesignSystemProvider>
      </ApplicationAdapterProvider>
    </SafeAreaProvider>
  );
}
