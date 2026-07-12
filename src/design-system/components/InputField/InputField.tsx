import React, {
  forwardRef,
  memo,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  BaseFloatingField,
  BaseTextInput,
} from '../../base/Input';
import { Inline } from '../../base/Inline';
import { Stack } from '../../base/Stack';
import {
  useAccessibility,
  useTheme,
} from '../../hooks';
import {
  resolveLocalizedText,
  useOptionalLocalization,
} from '../../localization';
import {
  createAccessibilityLabel,
  createAccessibilityState,
} from '../../utilities/accessibility';
import { Icon } from '../Icon';
import { IconButton } from '../IconButton';
import { Text } from '../Text';
import type {
  InputFieldHandle,
  InputFieldProps,
  InputFieldState,
} from './InputField.types';
import { getInputFieldTypeDefaults } from './InputField.utils';

const resolveLocalizedValue = (
  fallback: string | undefined,
  key: string | undefined,
  options: Record<string, unknown> | undefined,
  localization: ReturnType<typeof useOptionalLocalization>,
) => key
  ? resolveLocalizedText({
      localize: key,
      ...(fallback !== undefined ? { value: fallback } : {}),
      ...(options ? { translationOptions: options } : {}),
      ...(localization ? { localization } : {}),
    })
  : fallback;

export const InputField = memo(forwardRef<InputFieldHandle, InputFieldProps>(
  function InputField(
    {
      type = 'text',
      variant = 'outlined',
      state: stateOverride,
      label,
      labelLocalize,
      labelTranslationOptions,
      value,
      onChangeText,
      placeholder,
      placeholderLocalize,
      placeholderTranslationOptions,
      helperText,
      helperTextLocalize,
      helperTextTranslationOptions,
      errorText,
      errorTextLocalize,
      errorTextTranslationOptions,
      successText,
      successTextLocalize,
      successTextTranslationOptions,
      disabled = false,
      readOnly = false,
      required = false,
      reduceMotion,
      leftIcon,
      rightIcon,
      onLeftIconPress,
      onRightIconPress,
      leftIconAccessibilityLabel = 'Input leading action',
      rightIconAccessibilityLabel = 'Input trailing action',
      maxLength,
      numberOfLines = 1,
      accessibilityLabel,
      accessibilityHint,
      accessibilityLabelledBy,
      accessibilityRole,
      'aria-describedby': ariaDescribedBy,
      testID,
      onPressIn,
      onFocus,
      onBlur,
      onSubmitEditing,
      ...overrides
    },
    ref,
  ) {
    const { direction, theme } = useTheme();
    const { reduceMotionEnabled } = useAccessibility();
    const localization = useOptionalLocalization();
    const [focused, setFocused] = useState(false);
    const initiallyVisible = 'initiallyVisible' in overrides
      ? overrides.initiallyVisible
      : false;
    const passwordToggleEnabled = 'showPasswordToggle' in overrides
      ? overrides.showPasswordToggle
      : undefined;
    const clearButtonEnabled = 'showClearButton' in overrides
      ? overrides.showClearButton
      : undefined;
    const clearAccessibilityLabel = 'clearAccessibilityLabel' in overrides
      ? overrides.clearAccessibilityLabel
      : undefined;
    const codeLength = 'length' in overrides ? overrides.length : undefined;
    const onComplete = 'onComplete' in overrides
      ? overrides.onComplete
      : undefined;
    const onSearch = 'onSearch' in overrides ? overrides.onSearch : undefined;
    const [passwordVisible, setPasswordVisible] = useState(
      type === 'password' && Boolean(initiallyVisible),
    );
    const lastCompletedValue = useRef<string | undefined>(undefined);
    const defaults = getInputFieldTypeDefaults(type);
    const resolvedLabel = String(resolveLocalizedValue(
      label,
      labelLocalize,
      labelTranslationOptions,
      localization,
    ) ?? label);
    const resolvedPlaceholder = resolveLocalizedValue(
      placeholder,
      placeholderLocalize,
      placeholderTranslationOptions,
      localization,
    );
    const resolvedError = resolveLocalizedValue(
      errorText,
      errorTextLocalize,
      errorTextTranslationOptions,
      localization,
    );
    const resolvedSuccess = resolveLocalizedValue(
      successText,
      successTextLocalize,
      successTextTranslationOptions,
      localization,
    );
    const resolvedHelper = resolveLocalizedValue(
      helperText,
      helperTextLocalize,
      helperTextTranslationOptions,
      localization,
    );
    const supportingText = resolvedError ?? resolvedSuccess ?? resolvedHelper;
    const visualState: InputFieldState = disabled
      ? 'disabled'
      : resolvedError || stateOverride === 'error'
        ? 'error'
        : resolvedSuccess || stateOverride === 'success'
          ? 'success'
          : focused
            ? 'focused'
            : value.length > 0
              ? 'filled'
              : stateOverride ?? 'default';
    const floating = focused || value.length > 0;
    const tone = visualState === 'error'
      ? 'error'
      : visualState === 'success'
        ? 'success'
        : 'default';
    const configuredLeftIcon = leftIcon ?? defaults.leftIcon;
    const showPasswordToggle = type === 'password'
      && (passwordToggleEnabled ?? true);
    const showClearButton = type === 'search'
      && (clearButtonEnabled ?? true)
      && value.length > 0;
    const configuredMaxLength = type === 'otp' || type === 'pin'
      ? maxLength ?? codeLength
      : maxLength;
    const inputAccessibilityLabel = accessibilityLabel
      ?? createAccessibilityLabel([
        resolvedLabel,
        required ? 'Required' : undefined,
      ]);

    useEffect(() => {
      if (type !== 'otp' && type !== 'pin') return;
      if (value.length === codeLength) {
        if (lastCompletedValue.current !== value) {
          lastCompletedValue.current = value;
          onComplete?.(value);
        }
      } else {
        lastCompletedValue.current = undefined;
      }
    }, [codeLength, onComplete, type, value]);

    const handleChangeText = (nextValue: string) => {
      onChangeText(nextValue);
    };

    const trailing = showPasswordToggle ? (
      <IconButton
        icon={passwordVisible ? 'eye-off' : 'eye'}
        size="small"
        accessibilityLabel={
          passwordVisible ? 'Hide password' : 'Show password'
        }
        onPress={() => setPasswordVisible(current => !current)}
      />
    ) : showClearButton ? (
      <IconButton
        icon="close"
        size="small"
        accessibilityLabel={clearAccessibilityLabel ?? 'Clear search'}
        onPress={() => onChangeText('')}
      />
    ) : rightIcon && onRightIconPress ? (
      <IconButton
        icon={rightIcon}
        size="small"
        accessibilityLabel={rightIconAccessibilityLabel}
        onPress={onRightIconPress}
      />
    ) : rightIcon ? (
      <Icon
        name={rightIcon}
        size="md"
        tone={focused ? 'primary' : 'secondary'}
        mirroredInRTL
      />
    ) : null;
    const leading = configuredLeftIcon && onLeftIconPress ? (
      <IconButton
        icon={configuredLeftIcon}
        size="small"
        accessibilityLabel={leftIconAccessibilityLabel}
        onPress={onLeftIconPress}
      />
    ) : configuredLeftIcon ? (
      <Icon
        name={configuredLeftIcon}
        size="md"
        tone={focused ? 'primary' : 'secondary'}
        mirroredInRTL
      />
    ) : null;
    const labelInsetStart = configuredLeftIcon
      ? theme.iconSize.md + theme.components.inputField.iconGap
      : theme.spacing.none;

    return (
      <Stack
        gap="xs"
        testID={testID ? `${testID}-container` : undefined}
      >
        <BaseFloatingField
          label={`${resolvedLabel}${required ? ' *' : ''}`}
          floating={floating}
          focused={focused}
          tone={tone}
          variant={variant}
          disabled={disabled}
          reducedMotion={reduceMotion ?? reduceMotionEnabled}
          labelInsetStart={labelInsetStart}
          {...(testID
            ? {
                testID: `${testID}-surface`,
                labelTestID: `${testID}-label`,
              }
            : {})}
        >
          <Inline
            gap="sm"
            alignItems="center"
            minHeight={theme.componentHeight.md}
          >
            {leading}
            <BaseTextInput
              ref={ref}
              testID={testID}
              value={value}
              onChangeText={handleChangeText}
              editable={!disabled && !readOnly}
              readOnly={readOnly}
              accessibilityLabel={inputAccessibilityLabel}
              accessibilityHint={accessibilityHint}
              accessibilityLabelledBy={accessibilityLabelledBy}
              accessibilityRole={accessibilityRole}
              aria-describedby={ariaDescribedBy}
              accessibilityState={createAccessibilityState({
                disabled,
              })}
              aria-invalid={visualState === 'error'}
              autoCapitalize={
                overrides.autoCapitalize ?? defaults.autoCapitalize
              }
              autoComplete={overrides.autoComplete ?? defaults.autoComplete}
              autoCorrect={overrides.autoCorrect ?? defaults.autoCorrect}
              autoFocus={overrides.autoFocus}
              forceLTR={defaults.forceLTR}
              inputMode={overrides.inputMode ?? defaults.inputMode}
              keyboardType={overrides.keyboardType ?? defaults.keyboardType}
              maxLength={configuredMaxLength}
              multiline={numberOfLines > 1}
              numberOfLines={numberOfLines}
              placeholder={
                floating && resolvedPlaceholder !== undefined
                  ? String(resolvedPlaceholder)
                  : undefined
              }
              returnKeyType={
                overrides.returnKeyType ?? defaults.returnKeyType
              }
              secureTextEntry={
                overrides.secureTextEntry
                ?? (type === 'password'
                  ? !passwordVisible
                  : defaults.secureTextEntry)
              }
              submitBehavior={overrides.submitBehavior}
              textContentType={
                overrides.textContentType ?? defaults.textContentType
              }
              onFocus={event => {
                setFocused(true);
                onFocus?.(event);
              }}
              onPressIn={onPressIn}
              onBlur={event => {
                setFocused(false);
                onBlur?.(event);
              }}
              onSubmitEditing={event => {
                if (type === 'search') {
                  onSearch?.(value);
                }
                onSubmitEditing?.(event);
              }}
              internalStyle={{
                writingDirection: defaults.forceLTR
                  ? 'ltr'
                  : direction,
              }}
            />
            {trailing}
          </Inline>
        </BaseFloatingField>
        {supportingText ? (
          <Text
            value={supportingText}
            variant="caption"
            tone={
              visualState === 'error'
                ? 'error'
                : visualState === 'success'
                  ? 'success'
                  : 'secondary'
            }
            accessibilityRole={visualState === 'error' ? 'alert' : undefined}
            accessibilityLiveRegion={
              visualState === 'error' ? 'assertive' : 'polite'
            }
            testID={testID ? `${testID}-supporting` : undefined}
          />
        ) : null}
      </Stack>
    );
  },
));
