import type React from 'react';
import type { StatusBarStyle } from 'react-native';
import type { BadgeTone } from '../components/Badge';
import type { IconName } from '../components/Icon';
import type { TabItem } from '../components/Tabs';

export interface TemplateAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
}

export interface HeaderConfiguration {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backLabel?: string;
  onBack?: () => void;
  leading?: React.ReactNode;
  actions?: React.ReactNode;
}

export interface FooterConfiguration {
  primaryAction?: TemplateAction;
  secondaryAction?: TemplateAction;
  content?: React.ReactNode;
  sticky?: boolean;
}

export type ScreenState =
  | { type: 'content' }
  | { type: 'loading'; label?: string }
  | {
      type: 'empty';
      title: string;
      description?: string;
      action?: TemplateAction;
    }
  | {
      type: 'error';
      title?: string;
      message: string;
      retryAction?: TemplateAction;
      referenceCode?: string;
    }
  | {
      type: 'success';
      title: string;
      description?: string;
    };

export type TemplateBackground = 'primary' | 'secondary' | 'surface';
export type TemplatePadding = 'none' | 'compact' | 'comfortable';

export interface StatusBarConfiguration {
  style?: StatusBarStyle;
  hidden?: boolean;
  animated?: boolean;
}

export interface FormSection {
  id: string;
  title?: string;
  description?: string;
  content: React.ReactNode;
  error?: string;
  required?: boolean;
}

export interface ValidationMessage {
  id: string;
  message: string;
}

export interface ListSection<T> {
  id: string;
  title?: string;
  description?: string;
  data: readonly T[];
}

export type ListDataConfiguration<T> =
  | { mode: 'flat'; data: readonly T[] }
  | { mode: 'sectioned'; sections: readonly ListSection<T>[] };

export interface ListSearchConfiguration {
  value: string;
  onChangeText: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  accessibilityLabel?: string;
}

export interface ListTabsConfiguration {
  items: readonly TabItem[];
  value: string;
  onValueChange: (value: string) => void;
}

export interface PaginationConfiguration {
  loading?: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  label?: string;
}

export interface DetailRow {
  id: string;
  label: string;
  value: React.ReactNode;
  description?: string;
  copyValue?: string;
  onPress?: () => void;
}

export interface DetailsSection {
  id: string;
  title?: string;
  description?: string;
  rows?: readonly DetailRow[];
  content?: React.ReactNode;
  expandable?: boolean;
  defaultExpanded?: boolean;
}

export interface ConfirmationRow extends DetailRow {
  onEdit?: () => void;
  editLabel?: string;
}

export interface ConfirmationSection {
  id: string;
  title?: string;
  rows: readonly ConfirmationRow[];
}

export type BuiltInResultStatus =
  | 'success'
  | 'error'
  | 'pending'
  | 'warning'
  | 'underReview'
  | 'blocked';

export type ResultStatus =
  | { type: BuiltInResultStatus }
  | {
      type: 'custom';
      label: string;
      icon: IconName;
      tone: BadgeTone;
    };

export interface ResultDetail {
  id: string;
  label: string;
  value: React.ReactNode;
}

export interface DashboardSection {
  id: string;
  title?: string;
  action?: TemplateAction;
  content: React.ReactNode;
}

export interface DashboardQuickAction {
  id: string;
  label: string;
  icon?: IconName;
  onPress: () => void;
  disabled?: boolean;
}

export interface StepConfiguration {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  hidden?: boolean;
  optional?: boolean;
  disabled?: boolean;
}

export type StepStatus = 'completed' | 'current' | 'pending';

export interface TemplateStateLabels {
  loading?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  errorTitle?: string;
}
