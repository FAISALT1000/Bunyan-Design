import React, { memo, useEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
  type TextInput as TextInputType,
} from 'react-native';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { Heading } from '../../components/Heading';
import { IconButton } from '../../components/IconButton';
import { Link } from '../../components/Link';
import { Text } from '../../components/Text';
import { useTheme } from '../../hooks';
import { NumPad } from '../NumPad';

export type OTPTemplateVariant = 'bottomSheet' | 'overlay' | 'fullScreen';

export interface OTPTemplateProps {
  variant: OTPTemplateVariant;
  visible?: boolean;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onClose?: () => void;
  onResend?: () => void;
  length?: number;
  title?: string;
  description?: string;
  destination?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  secure?: boolean;
  autoSubmit?: boolean;
  dismissible?: boolean;
  submitLabel?: string;
  resendLabel?: string;
  resendDisabled?: boolean;
  useNumPad?: boolean;
  testID?: string;
}

interface OTPContentProps extends Omit<OTPTemplateProps, 'variant' | 'visible' | 'onClose' | 'dismissible'> {
  showHeading?: boolean;
  showDestination?: boolean;
}

const onlyDigits = (value: string, length: number) =>
  value.replace(/\D/g, '').slice(0, length);

const OTPContent = memo(function OTPContent({
  value,
  onChange,
  onSubmit,
  onResend,
  length = 4,
  title = 'Enter verification code',
  description = 'Enter the one-time code sent to your registered contact.',
  destination,
  error,
  loading = false,
  disabled = false,
  secure = false,
  autoSubmit = false,
  submitLabel = 'Verify',
  resendLabel = 'Resend code',
  resendDisabled = false,
  useNumPad = false,
  testID,
  showHeading = true,
  showDestination = true,
}: OTPContentProps) {
  const { theme, direction } = useTheme();
  const inputRef = useRef<TextInputType>(null);
  const normalizedValue = onlyDigits(value, length);
  const complete = normalizedValue.length === length;
  const previousCompletedValue = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (
      autoSubmit &&
      complete &&
      previousCompletedValue.current !== normalizedValue
    ) {
      previousCompletedValue.current = normalizedValue;
      onSubmit(normalizedValue);
    }
    if (!complete) previousCompletedValue.current = undefined;
  }, [autoSubmit, complete, normalizedValue, onSubmit]);

  const updateValue = (next: string) => {
    if (disabled || loading) return;
    onChange(onlyDigits(next, length));
  };

  const content = (
    <View
      testID={testID}
      style={{
        width: '100%',
        maxWidth: theme.breakpoint.medium,
        alignSelf: 'center',
        gap: theme.spacing.xxl,
      }}
    >
      {showHeading ? (
        <View style={{ gap: theme.spacing.sm }}>
          <Heading level={3} align="center">{title}</Heading>
          <Text tone="secondary" align="center">
            {description}
            {showDestination && destination ? ` ${destination}` : ''}
          </Text>
        </View>
      ) : showDestination && destination ? (
        <Text tone="secondary" align="center">{destination}</Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Verification code, ${normalizedValue.length} of ${length} digits entered`}
        accessibilityState={{ disabled }}
        onPress={() => inputRef.current?.focus()}
        style={{
          flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
          justifyContent: 'center',
          gap: theme.spacing.sm,
        }}
      >
        {Array.from({ length }, (_, index) => {
          const digit = normalizedValue[index];
          const active = index === normalizedValue.length && !complete;
          return (
            <View
              key={index}
              accessible
              accessibilityLabel={digit ? `Digit ${index + 1} entered` : `Digit ${index + 1} empty`}
              style={{
                width: theme.componentHeight.lg,
                height: theme.componentHeight.xl,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.radius.md,
                borderWidth: active || error
                  ? theme.borderWidth.medium
                  : theme.borderWidth.thin,
                borderColor: error
                  ? theme.color.border.error
                  : active
                  ? theme.color.border.focus
                  : digit
                  ? theme.color.primary.default
                  : theme.color.border.primary,
                backgroundColor: digit
                  ? theme.color.primary.subtle
                  : theme.color.surface.primary,
              }}
            >
              <Text
                weight="bold"
                style={{
                  fontSize: theme.typography.fontSize.xl,
                  lineHeight: theme.typography.lineHeight.xl,
                }}
              >
                {digit ? (secure ? '•' : digit) : ''}
              </Text>
            </View>
          );
        })}
      </Pressable>

      <TextInput
        ref={inputRef}
        value={normalizedValue}
        onChangeText={updateValue}
        maxLength={length}
        keyboardType="number-pad"
        inputMode="numeric"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        accessibilityLabel="Verification code input"
        accessibilityState={{ disabled }}
        editable={!disabled && !loading}
        caretHidden
        style={{
          position: 'absolute',
          width: theme.spacing.xs,
          height: theme.spacing.xs,
          opacity: theme.opacity.invisible,
        }}
      />

      {error ? (
        <Text accessibilityRole="alert" variant="bodySmall" tone="error" align="center">
          {error}
        </Text>
      ) : null}

      {useNumPad ? (
        <NumPad
          value={normalizedValue}
          onChange={updateValue}
          maxLength={length}
          disabled={disabled || loading}
        />
      ) : null}

      <View style={{ gap: theme.spacing.md }}>
        <Button
          fullWidth
          loading={loading}
          disabled={disabled || !complete}
          onPress={() => onSubmit(normalizedValue)}
        >
          {submitLabel}
        </Button>
        {onResend ? (
          <View style={{ alignItems: 'center' }}>
            {resendDisabled ? (
              <Text variant="label" tone="tertiary">{resendLabel}</Text>
            ) : (
              <Link onPress={onResend}>{resendLabel}</Link>
            )}
          </View>
        ) : null}
      </View>
    </View>
  );

  return useNumPad ? content : (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {content}
    </KeyboardAvoidingView>
  );
});

export const OTPTemplate = memo(function OTPTemplate({
  variant,
  visible = true,
  onClose,
  dismissible = true,
  title = 'Enter verification code',
  description = 'Enter the one-time code sent to your registered contact.',
  ...contentProps
}: OTPTemplateProps) {
  const { theme, direction } = useTheme();
  const canDismiss = dismissible && Boolean(onClose);
  const close = onClose ?? (() => undefined);

  if (variant === 'bottomSheet') {
    return (
      <BottomSheet
        visible={visible}
        onClose={close}
        title={title}
        description={`${description}${contentProps.destination ? ` ${contentProps.destination}` : ''}`}
        dismissible={canDismiss}
      >
        <OTPContent
          {...contentProps}
          title={title}
          description={description}
          showHeading={false}
          showDestination={false}
        />
      </BottomSheet>
    );
  }

  if (variant === 'overlay') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={canDismiss ? close : undefined}
        statusBarTranslucent
      >
        <View
          accessibilityViewIsModal
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing.lg,
            backgroundColor: theme.color.overlay.scrim,
          }}
        >
          {canDismiss ? (
            <Pressable
              accessibilityLabel="Close verification overlay"
              onPress={close}
              style={{ position: 'absolute', inset: theme.spacing.none }}
            />
          ) : null}
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            style={{ width: '100%' }}
          >
            <View
              style={{
                width: '100%',
                maxWidth: theme.breakpoint.medium,
                padding: theme.spacing.xxl,
                borderRadius: theme.radius.xl,
                backgroundColor: theme.color.surface.elevated,
                ...theme.shadow.lg,
              }}
            >
              {canDismiss ? (
                <View
                  style={{
                    alignItems: direction === 'rtl' ? 'flex-start' : 'flex-end',
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  <IconButton icon="close" accessibilityLabel="Close verification" onPress={close} />
                </View>
              ) : null}
              <OTPContent
                {...contentProps}
                title={title}
                description={description}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  }

  if (!visible) return null;

  return (
    <View
      style={{
        flex: 1,
        minHeight: '100%',
        backgroundColor: theme.color.background.primary,
      }}
    >
      <View
        style={{
          minHeight: theme.componentHeight.xl,
          paddingHorizontal: theme.spacing.lg,
          flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
          alignItems: 'center',
        }}
      >
        {canDismiss ? (
          <IconButton icon="close" accessibilityLabel="Close verification" onPress={close} />
        ) : null}
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: theme.spacing.xxl,
        }}
      >
        <View style={{ width: '100%', maxWidth: theme.breakpoint.medium, alignSelf: 'center' }}>
          <OTPContent
            {...contentProps}
            title={title}
            description={description}
          />
        </View>
      </ScrollView>
    </View>
  );
});
