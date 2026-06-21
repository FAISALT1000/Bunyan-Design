import type React from 'react';
import type { BadgeTone } from '../../components/Badge';
import type { DetailsSection, ScreenState, TemplateAction } from '../types';

export interface DetailsScreenTemplateProps {
  title: string;
  subtitle?: string;
  headerSection?: React.ReactNode;
  status?: { label: string; tone?: BadgeTone };
  summary?: React.ReactNode;
  sections: readonly DetailsSection[];
  primaryAction?: TemplateAction;
  secondaryAction?: TemplateAction;
  shareAction?: TemplateAction;
  downloadAction?: TemplateAction;
  state?: ScreenState;
  loading?: boolean;
  onBack?: () => void;
  testID?: string;
}
