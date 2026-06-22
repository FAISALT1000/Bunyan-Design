import type React from 'react';
import type {
  LineButtonConfig,
  LineIconConfig,
} from '../Line';

export type CardVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'outline'
  | 'elevated'
  | 'ghost'
  | 'success'
  | 'warning'
  | 'error';

export type CardSize = 'small' | 'medium' | 'large';

export interface CardProps {
  variant?: CardVariant;
  size?: CardSize;
  title?: string;
  subtitle?: string;
  description?: string;
  leftIcon?: LineIconConfig;
  rightIcon?: LineIconConfig;
  leftAction?: LineButtonConfig;
  rightAction?: LineButtonConfig;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  selected?: boolean;
  showBorder?: boolean;
  showDivider?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  children?: React.ReactNode;
}
