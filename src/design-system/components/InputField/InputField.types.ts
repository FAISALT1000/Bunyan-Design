import type {
  BaseTextInputHandle,
  BaseTextInputProps,
} from '../../base/Input';
import type { TranslationOptions } from '../../localization';
import type { IconName } from '../Icon';

export type InputFieldHandle = BaseTextInputHandle;

export type InputFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'phone'
  | 'number'
  | 'decimal'
  | 'search'
  | 'url'
  | 'otp'
  | 'pin';

export type InputFieldVariant = 'outlined' | 'filled' | 'underlined';

export type InputFieldState =
  | 'default'
  | 'focused'
  | 'filled'
  | 'disabled'
  | 'error'
  | 'success';

type TextInputOverrides = Pick<
  BaseTextInputProps,
  | 'autoCapitalize'
  | 'autoComplete'
  | 'autoCorrect'
  | 'autoFocus'
  | 'inputMode'
  | 'keyboardType'
  | 'onBlur'
  | 'onFocus'
  | 'onPressIn'
  | 'onSubmitEditing'
  | 'returnKeyType'
  | 'secureTextEntry'
  | 'submitBehavior'
  | 'textContentType'
>;

export interface BaseInputFieldProps extends TextInputOverrides {
  variant?: InputFieldVariant;
  state?: InputFieldState;
  label: string;
  labelLocalize?: string;
  labelTranslationOptions?: TranslationOptions;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  placeholderLocalize?: string;
  placeholderTranslationOptions?: TranslationOptions;
  helperText?: string;
  helperTextLocalize?: string;
  helperTextTranslationOptions?: TranslationOptions;
  errorText?: string;
  errorTextLocalize?: string;
  errorTextTranslationOptions?: TranslationOptions;
  successText?: string;
  successTextLocalize?: string;
  successTextTranslationOptions?: TranslationOptions;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  /**
   * Overrides the operating-system preference for deterministic previews and
   * tests. Applications normally leave this undefined.
   */
  reduceMotion?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onLeftIconPress?: () => void;
  onRightIconPress?: () => void;
  leftIconAccessibilityLabel?: string;
  rightIconAccessibilityLabel?: string;
  maxLength?: number;
  numberOfLines?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityLabelledBy?: BaseTextInputProps['accessibilityLabelledBy'];
  accessibilityRole?: BaseTextInputProps['accessibilityRole'];
  'aria-describedby'?: string;
  testID?: string;
}

export interface PasswordInputFieldProps extends BaseInputFieldProps {
  type: 'password';
  showPasswordToggle?: boolean;
  initiallyVisible?: boolean;
}

export interface SearchInputFieldProps extends BaseInputFieldProps {
  type: 'search';
  onSearch?: (value: string) => void;
  showClearButton?: boolean;
  clearAccessibilityLabel?: string;
}

export interface CodeInputFieldProps extends BaseInputFieldProps {
  type: 'otp' | 'pin';
  length: number;
  onComplete?: (value: string) => void;
}

export interface StandardInputFieldProps extends BaseInputFieldProps {
  type?:
    | 'text'
    | 'email'
    | 'phone'
    | 'number'
    | 'decimal'
    | 'url';
}

export type InputFieldProps =
  | StandardInputFieldProps
  | PasswordInputFieldProps
  | SearchInputFieldProps
  | CodeInputFieldProps;
