import React, { memo, useEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  RNModal,
  ScrollView,
  StyleSheet,
  View,
} from '../../components/RNTheme';
import { logicalAlignItems, logicalRow } from '../../utilities/styles';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { Heading } from '../../components/Heading';
import { IconButton } from '../../components/IconButton';
import { Link } from '../../components/Link';
import { Text } from '../../components/Text';
import { useTheme } from '../../hooks';
import { OTPInput } from '../../components/OTPInput';

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
  const { theme } = useTheme();
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

  const locked = disabled || loading;
  const updateValue = (next: string) => {
    if (locked) return;
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

      <OTPInput
        value={normalizedValue}
        onChange={updateValue}
        length={length}
        secure={secure}
        disabled={locked}
        useNumPad={useNumPad}
        error={Boolean(error)}
        {...(error ? { errorText: error } : {})}
      />

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
              // Link aligns itself to flex-start; the wrapper shrink-wraps it so it stays centred.
              <View>
                <Link onPress={onResend}>{resendLabel}</Link>
              </View>
            )}
          </View>
        ) : null}
      </View>
    </View>
  );

  return useNumPad ? content : (
    <KeyboardAvoidingView>
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
      <RNModal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (canDismiss) close();
        }}
        statusBarTranslucent
      >
        <View
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
              accessibilityRole="button"
              accessibilityLabel="Close verification overlay"
              onPress={close}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            style={{ width: '100%' }}
          >
            <View
              accessibilityViewIsModal
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
                    alignItems: logicalAlignItems(direction, 'end'),
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
      </RNModal>
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
          ...logicalRow(direction),
          alignItems: 'center',
        }}
      >
        {canDismiss ? (
          <IconButton icon="close" accessibilityLabel="Close verification" onPress={close} />
        ) : null}
      </View>
      <ScrollView
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
