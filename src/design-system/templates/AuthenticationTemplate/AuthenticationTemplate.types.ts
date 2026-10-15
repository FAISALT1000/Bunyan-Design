import type React from 'react';
import type { TemplateAction } from '../types';

export type AuthenticationMode =
  | 'login'
  | 'registration'
  | 'otp'
  | 'passwordReset'
  | 'pin'
  | 'biometric';

export interface AuthenticationTemplateProps {
  mode: AuthenticationMode;
  title: string;
  description?: string;
  logo?: React.ReactNode;
  /** Content above the logo, e.g. a language switch or a "Need help?" link. */
  header?: React.ReactNode;
  /** Element at the end of the top bar (language, help). */
  headerRight?: React.ReactNode;
  /** Element at the start of the top bar (replaces the back button). */
  headerLeft?: React.ReactNode;
  /** Screen reader label of the content area. Default: the title. */
  contentAccessibilityLabel?: string;
  form: React.ReactNode;
  error?: string;
  primaryAction?: TemplateAction;
  secondaryActions?: readonly TemplateAction[];
  biometricAction?: TemplateAction;
  footer?: React.ReactNode;
  loading?: boolean;
  onBack?: () => void;
  background?: 'primary' | 'secondary' | 'surface';
  testID?: string;
}
