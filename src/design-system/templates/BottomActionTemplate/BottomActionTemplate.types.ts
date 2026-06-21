import type React from 'react';
import type { TemplateAction } from '../types';

export interface BottomActionTemplateProps {
  primaryAction: TemplateAction;
  secondaryAction?: TemplateAction;
  children?: React.ReactNode;
  layout?: 'stacked' | 'inline';
  safeArea?: boolean;
  keyboardAware?: boolean;
  testID?: string;
}
