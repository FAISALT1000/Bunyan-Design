import type React from 'react';
import type { TranslationOptions } from '../../localization';
import type { ButtonSize, ButtonVariant } from '../Button';
import type {
  IconName,
  IconSize,
  IconTone,
} from '../Icon';
import type {
  TextTone,
  TextVariant,
  TextWeight,
} from '../Text';

export type LineType =
  | '1'
  | '2'
  | '3'
  | 'single'
  | 'double'
  | 'triple';
export type LinePadding = 'none' | 'small' | 'medium' | 'large';
export type LineGap = 'none' | 'small' | 'medium' | 'large';

interface LineTextPresentation {
  variant?: TextVariant;
  tone?: TextTone;
  weight?: TextWeight;
  numberOfLines?: number;
  accessibilityLabel?: string;
  testID?: string;
}

export type LineTextItem = LineTextPresentation & (
  | {
      value: string | number;
      localize?: string;
      translationOptions?: TranslationOptions;
      text?: never;
    }
  | {
      localize: string;
      value?: string | number;
      translationOptions?: TranslationOptions;
      text?: never;
    }
  | {
      value?: never;
      localize?: never;
      translationOptions?: never;
      /**
       * @deprecated Use value. Scheduled for removal in 1.0.0.
       */
      text: string | number;
    }
);

export type LineTextValue = LineTextItem | string | number;

export interface LineTextGroup {
  text1?: LineTextValue;
  text2?: LineTextValue;
  text3?: LineTextValue;
}

export interface LineIconConfig {
  name: IconName;
  size?: IconSize;
  tone?: IconTone;
  accessibilityLabel?: string;
  testID?: string;
}

export interface LineButtonConfig {
  title: string;
  titleLocalize?: string;
  titleTranslationOptions?: TranslationOptions;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: IconName;
  rightIcon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

export interface LineProps {
  type?: LineType;
  leftText?: LineTextGroup;
  rightText?: LineTextGroup;
  leftIcon?: LineIconConfig;
  rightIcon?: LineIconConfig;
  leftButton?: LineButtonConfig;
  rightButton?: LineButtonConfig;
  /**
   * Slots must contain design-system components only.
   */
  leftContent?: React.ReactNode;
  /**
   * Slots must contain design-system components only.
   */
  rightContent?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  preventDoublePressMs?: number;
  hapticFeedback?: boolean;
  align?: 'start' | 'center' | 'end';
  verticalAlign?: 'top' | 'center' | 'bottom';
  padding?: LinePadding;
  gap?: LineGap;
  showDivider?: boolean;
  dividerInset?: 'none' | 'content' | 'text';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}
