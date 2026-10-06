import type { BaseTextInputProps } from '../../base/Input';
import type { IconName } from '../Icon';
import type { InputFieldType } from './InputField.types';

export interface InputFieldTypeDefaults {
  autoCapitalize: BaseTextInputProps['autoCapitalize'];
  autoComplete?: BaseTextInputProps['autoComplete'];
  autoCorrect: boolean;
  forceLTR: boolean;
  inputMode: BaseTextInputProps['inputMode'];
  keyboardType: BaseTextInputProps['keyboardType'];
  leftIcon?: IconName;
  returnKeyType?: BaseTextInputProps['returnKeyType'];
  secureTextEntry: boolean;
  textContentType?: BaseTextInputProps['textContentType'];
}

export function getInputFieldTypeDefaults(
  type: InputFieldType,
): InputFieldTypeDefaults {
  switch (type) {
    case 'email':
      return {
        autoCapitalize: 'none',
        autoComplete: 'email',
        autoCorrect: false,
        forceLTR: true,
        inputMode: 'email',
        keyboardType: 'email-address',
        secureTextEntry: false,
        textContentType: 'emailAddress',
      };
    case 'password':
      return {
        autoCapitalize: 'none',
        autoComplete: 'current-password',
        autoCorrect: false,
        forceLTR: false,
        inputMode: 'text',
        keyboardType: 'default',
        secureTextEntry: true,
        textContentType: 'password',
      };
    case 'phone':
      return {
        autoCapitalize: 'none',
        autoComplete: 'tel',
        autoCorrect: false,
        forceLTR: true,
        inputMode: 'tel',
        keyboardType: 'phone-pad',
        secureTextEntry: false,
        textContentType: 'telephoneNumber',
      };
    case 'number':
      return {
        autoCapitalize: 'none',
        autoCorrect: false,
        forceLTR: true,
        inputMode: 'numeric',
        keyboardType: 'number-pad',
        secureTextEntry: false,
      };
    case 'decimal':
      return {
        autoCapitalize: 'none',
        autoCorrect: false,
        forceLTR: true,
        inputMode: 'decimal',
        keyboardType: 'decimal-pad',
        secureTextEntry: false,
      };
    case 'search':
      return {
        autoCapitalize: 'none',
        autoCorrect: true,
        forceLTR: false,
        inputMode: 'search',
        keyboardType: 'web-search',
        leftIcon: 'search',
        returnKeyType: 'search',
        secureTextEntry: false,
      };
    case 'url':
      return {
        autoCapitalize: 'none',
        autoComplete: 'url',
        autoCorrect: false,
        forceLTR: true,
        inputMode: 'url',
        keyboardType: 'url',
        secureTextEntry: false,
        textContentType: 'URL',
      };
    case 'otp':
      return {
        autoCapitalize: 'none',
        autoComplete: 'one-time-code',
        autoCorrect: false,
        forceLTR: true,
        inputMode: 'numeric',
        keyboardType: 'number-pad',
        secureTextEntry: false,
        textContentType: 'oneTimeCode',
      };
    case 'pin':
      return {
        autoCapitalize: 'none',
        autoComplete: 'off',
        autoCorrect: false,
        forceLTR: true,
        inputMode: 'numeric',
        keyboardType: 'number-pad',
        secureTextEntry: true,
        textContentType: 'none',
      };
    case 'text':
    default:
      return {
        autoCapitalize: 'sentences',
        autoCorrect: true,
        forceLTR: false,
        inputMode: 'text',
        keyboardType: 'default',
        secureTextEntry: false,
      };
  }
}
