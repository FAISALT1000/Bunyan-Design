import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../../hooks';
import { Icon } from '../../components/Icon';
import { Text } from '../../components/Text';

export interface NumPadProps {
  value?: string;
  onChange?: (value: string) => void;
  onDigitPress?: (digit: string) => void;
  onDelete?: () => void;
  maxLength?: number;
  disabled?: boolean;
  deleteLabel?: string;
  accessibilityLabel?: string;
  leadingAction?: React.ReactNode;
  testID?: string;
}

const rows = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
] as const;

export const NumPad = memo(function NumPad({
  value = '',
  onChange,
  onDigitPress,
  onDelete,
  maxLength,
  disabled = false,
  deleteLabel = 'Delete last digit',
  accessibilityLabel = 'Numeric keypad',
  leadingAction,
  testID,
}: NumPadProps) {
  const { theme } = useTheme();
  const canAddDigit = maxLength === undefined || value.length < maxLength;
  const canDelete = value.length > 0 || Boolean(onDelete);

  const pressDigit = (digit: string) => {
    if (disabled || !canAddDigit) return;
    onDigitPress?.(digit);
    onChange?.(`${value}${digit}`);
  };

  const deleteDigit = () => {
    if (disabled || !canDelete) return;
    onDelete?.();
    onChange?.(value.slice(0, -1));
  };

  const renderDigit = (digit: string) => (
    <Pressable
      key={digit}
      accessibilityRole="button"
      accessibilityLabel={digit}
      accessibilityState={{ disabled: disabled || !canAddDigit }}
      disabled={disabled || !canAddDigit}
      onPress={() => pressDigit(digit)}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: theme.componentHeight.xl,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radius.lg,
        borderWidth: theme.borderWidth.thin,
        borderColor: theme.color.border.secondary,
        backgroundColor: pressed
          ? theme.color.primary.subtle
          : theme.color.surface.secondary,
        opacity: disabled || !canAddDigit
          ? theme.opacity.disabled
          : theme.opacity.opaque,
      })}
    >
      <Text
        weight="semibold"
        style={{
          fontSize: theme.typography.fontSize.xxl,
          lineHeight: theme.typography.lineHeight.xxl,
        }}
      >
        {digit}
      </Text>
    </Pressable>
  );

  return (
    <View
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      style={{ gap: theme.spacing.md }}
    >
      {rows.map((row, index) => (
        <View
          key={index}
          style={{
            flexDirection: 'row',
            gap: theme.spacing.md,
          }}
        >
          {row.map(renderDigit)}
        </View>
      ))}

      <View
        style={{
          flexDirection: 'row',
          gap: theme.spacing.md,
        }}
      >
        <View
          style={{
            flex: 1,
            minHeight: theme.componentHeight.xl,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {leadingAction}
        </View>
        {renderDigit('0')}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={deleteLabel}
          accessibilityState={{ disabled: disabled || !canDelete }}
          disabled={disabled || !canDelete}
          onPress={deleteDigit}
          style={({ pressed }) => ({
            flex: 1,
            minHeight: theme.componentHeight.xl,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: theme.radius.lg,
            backgroundColor: pressed
              ? theme.color.overlay.subtle
              : theme.color.overlay.transparent,
            opacity: disabled || !canDelete
              ? theme.opacity.disabled
              : theme.opacity.opaque,
          })}
        >
          <Icon name="backspace" size="lg" tone="secondary" />
        </Pressable>
      </View>
    </View>
  );
});
