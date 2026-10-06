import type React from 'react';
import type {
  ListDataConfiguration,
  ListSearchConfiguration,
  ListTabsConfiguration,
  PaginationConfiguration,
  ScreenState,
  TemplateAction,
} from '../types';

export interface ListScreenTemplateProps<T> {
  title: string;
  subtitle?: string;
  data: ListDataConfiguration<T>;
  keyExtractor: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => React.ReactElement;
  search?: ListSearchConfiguration;
  filter?: React.ReactNode;
  sort?: React.ReactNode;
  tabs?: ListTabsConfiguration;
  headerSummary?: React.ReactNode;
  state?: ScreenState;
  refreshing?: boolean;
  onRefresh?: () => void;
  pagination?: PaginationConfiguration;
  floatingAction?: TemplateAction;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: TemplateAction;
  skeletonCount?: number;
  onBack?: () => void;
  headerRight?: React.ReactNode;
  testID?: string;
}
