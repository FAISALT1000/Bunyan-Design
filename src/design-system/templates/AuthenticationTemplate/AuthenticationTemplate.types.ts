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
