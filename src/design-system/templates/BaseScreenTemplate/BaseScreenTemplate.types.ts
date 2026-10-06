import type React from 'react';
import type {
  KeyboardAvoidingViewProps,
  RefreshControlProps,
} from 'react-native';
import type {
  HeaderConfiguration,
  ScreenState,
  StatusBarConfiguration,
  TemplateBackground,
  TemplatePadding,
} from '../types';

export interface BaseScreenTemplateProps {
  children: React.ReactNode;
  header?: HeaderConfiguration | undefined;
  title?: string | undefined;
  subtitle?: string | undefined;
  showBackButton?: boolean | undefined;
  backLabel?: string | undefined;
  onBack?: (() => void) | undefined;
  headerLeft?: React.ReactNode | undefined;
  headerRight?: React.ReactNode | undefined;
  scrollable?: boolean | undefined;
  keyboardAvoiding?: boolean | undefined;
  keyboardBehavior?: KeyboardAvoidingViewProps['behavior'] | undefined;
  keyboardVerticalOffset?: number | undefined;
  loading?: boolean | undefined;
  loadingLabel?: string | undefined;
  state?: ScreenState | undefined;
  errorBanner?: React.ReactNode | undefined;
  bottomContent?: React.ReactNode | undefined;
  footer?: React.ReactNode | undefined;
  stickyFooter?: boolean | undefined;
  background?: TemplateBackground | undefined;
  padding?: TemplatePadding | undefined;
  safeArea?: boolean | undefined;
  statusBar?: StatusBarConfiguration | undefined;
  refreshControl?: React.ReactElement<RefreshControlProps> | undefined;
  contentAccessibilityLabel?: string | undefined;
  testID?: string | undefined;
}
