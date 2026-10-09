import type React from 'react';
import type { IconName } from '../../components/Icon';
import type { TemplateAction } from '../types';

export interface EmptyStateTemplateProps {
  title: string;
  description?: string;
  illustration?: React.ReactNode;
  icon?: IconName;
  primaryAction?: TemplateAction;
  secondaryAction?: TemplateAction;
  supportingContent?: React.ReactNode;
  variant?: 'compact' | 'fullScreen';
  testID?: string;
}
