import type React from 'react';
import type {
  DashboardQuickAction,
  DashboardSection,
  ScreenState,
} from '../types';

export interface DashboardTemplateProps {
  greeting: string;
  subtitle?: string;
  profileAction?: React.ReactNode;
  balanceSummary?: React.ReactNode;
  quickActions?: readonly DashboardQuickAction[];
  promotionalBanner?: React.ReactNode;
  sections?: readonly DashboardSection[];
  recentActivity?: React.ReactNode;
  state?: ScreenState;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  testID?: string;
}
