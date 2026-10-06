import type React from 'react';
import type {
  ConfirmationSection,
  ScreenState,
  TemplateAction,
} from '../types';

export interface ConfirmationAmountSummary {
  label: string;
  amount: React.ReactNode;
  fees?: React.ReactNode;
  total?: React.ReactNode;
}

export interface ConfirmationScreenTemplateProps {
  title: string;
  subtitle?: string;
  sections: readonly ConfirmationSection[];
  amountSummary?: ConfirmationAmountSummary;
  terms?: React.ReactNode;
  confirmationLabel?: string;
  confirmed?: boolean;
  onConfirmedChange?: (confirmed: boolean) => void;
  confirmationRequired?: boolean;
  primaryAction: TemplateAction;
  secondaryAction?: TemplateAction;
  state?: ScreenState;
  error?: string;
  loading?: boolean;
  onBack?: () => void;
  testID?: string;
}
