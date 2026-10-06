import React, { memo, useState } from 'react';
import { Platform, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../../hooks';
import type { FeedbackStatus } from '../../utilities/styles';
import { BottomSheet } from '../BottomSheet';
import { Button } from '../Button';
import { InputField } from '../InputField';

export interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  locale?: string;
  placeholder?: string;
  disabled?: boolean;
  status?: FeedbackStatus;
  accessibilityLabel?: string;
  clearable?: boolean;
}

export const DatePicker = memo(function DatePicker({
  value,
  onChange,
  minimumDate,
  maximumDate,
  locale,
  placeholder = 'Select date',
  disabled = false,
  status = 'default',
  accessibilityLabel = 'Date',
  clearable = true,
}: DatePickerProps) {
  const { theme, locale: themeLocale } = useTheme();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value ?? new Date());
  const resolvedLocale = locale ?? themeLocale;
  const formatted = value ? new Intl.DateTimeFormat(resolvedLocale, { year: 'numeric', month: 'short', day: 'numeric' }).format(value) : '';
  const handleNativeChange = (event: DateTimePickerEvent, next?: Date) => {
    if (Platform.OS === 'android') {
      setOpen(false);
      if (event.type === 'set' && next) onChange(next);
    } else if (next) {
      setDraft(next);
    }
  };

  return (
    <>
      <InputField
        type="text"
        label={accessibilityLabel}
        value={formatted}
        onChangeText={() => undefined}
        placeholder={placeholder}
        readOnly
        disabled={disabled}
        state={status}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onPressIn={() => {
          if (!disabled) {
            setDraft(value ?? new Date());
            setOpen(true);
          }
        }}
        leftIcon="calendar"
        {...(clearable && value
          ? {
              rightIcon: 'close' as const,
              rightIconAccessibilityLabel: 'Clear date',
              onRightIconPress: () => onChange(undefined),
            }
          : {})}
      />
      {Platform.OS === 'android' && open ? (
        <DateTimePicker
          value={draft}
          mode="date"
          {...(minimumDate ? { minimumDate } : {})}
          {...(maximumDate ? { maximumDate } : {})}
          locale={resolvedLocale}
          onChange={handleNativeChange}
        />
      ) : (
        <BottomSheet visible={open} onClose={() => setOpen(false)} title={placeholder}>
          <View style={{ gap: theme.spacing.lg, alignItems: 'stretch' }}>
            <DateTimePicker
              value={draft}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              {...(minimumDate ? { minimumDate } : {})}
              {...(maximumDate ? { maximumDate } : {})}
              locale={resolvedLocale}
              onChange={handleNativeChange}
            />
            <Button
              title="Confirm"
              fullWidth
              onPress={() => {
                onChange(draft);
                setOpen(false);
              }}
            />
          </View>
        </BottomSheet>
      )}
    </>
  );
});
