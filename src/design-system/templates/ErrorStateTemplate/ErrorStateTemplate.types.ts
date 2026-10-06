import type React from 'react';
import type { TemplateAction } from '../types';

export type ErrorStateType =
  | 'general'
  | 'network'
  | 'server'
  | 'sessionExpired'
  | 'permission'
  | 'maintenance';

export interface ErrorStateTemplateProps {
  type?: ErrorStateType;
  title?: string;
  message?: string;
  illustration?: React.ReactNode;
  retryAction?: TemplateAction;
  secondaryAction?: TemplateAction;
  referenceCode?: string;
  variant?: 'compact' | 'fullScreen';
  testID?: string;
}
