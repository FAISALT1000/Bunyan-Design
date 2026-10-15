import React, { memo, useState } from 'react';
import { View } from '../RNTheme';
import { Platform } from '../RNTheme/native';
import NativeDateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../../hooks';
import type { FeedbackStatus } from '../../utilities/styles';
import { BottomSheet } from '../BottomSheet';
import { Button } from '../Button';
import { InputField } from '../InputField';
import { useStrings } from '../../i18n/strings';

export type DatePickerMode = 'date' | 'time' | 'datetime';

export interface DatePickerProps {
  value?: Date;
  /** `'date'` (default), `'time'` or `'datetime'` (Android asks for the date, then the time). */
  mode?: DatePickerMode;
  /** Field label. Default: "Date" / "Time" (translated). */
  label?: string;
  /** 24-hour clock (Android). Default: the locale's convention. */
  is24Hour?: boolean;
  /** iOS minute steps. */
  minuteInterval?: 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;
  onChange: (date: Date | undefined) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  locale?: string;
  placeholder?: string;
  disabled?: boolean;
  status?: FeedbackStatus;
  accessibilityLabel?: string;
  clearable?: boolean;
  /** Sheet title. Defaults to `placeholder`. */
  title?: string;
  /** Accessibility label of the clear button. Default `'Clear date'`. */
  clearLabel?: string;
  /** Text of the iOS confirm button. Default `'Confirm'`. */
  confirmLabel?: string;
  /** Overrides of the displayed date format (`calendar`, `month`…). */
  formatOptions?: Intl.DateTimeFormatOptions;
}

export const DatePicker = memo(function DatePicker({
  value,
  mode = 'date',
  label: labelProp,
  is24Hour,
  minuteInterval,
  onChange,
  minimumDate,
  maximumDate,
  locale,
  placeholder: placeholderProp,
  disabled = false,
  status = 'default',
  accessibilityLabel: accessibilityLabelProp,
  clearable = true,
  title,
  clearLabel: clearLabelProp,
  confirmLabel: confirmLabelProp,
  formatOptions,
}: DatePickerProps) {
  const strings = useStrings();
  const confirmLabel = confirmLabelProp ?? strings('confirm');
  const clearLabel = clearLabelProp ?? strings('clearDate');
  const placeholder = placeholderProp ?? strings(mode === 'time' ? 'selectTime' : mode === 'datetime' ? 'selectDateTime' : 'selectDate');
  const fieldLabel = labelProp ?? accessibilityLabelProp ?? strings(mode === 'time' ? 'time' : 'date');
  const accessibilityLabel = accessibilityLabelProp ?? fieldLabel;
  const { theme, locale: themeLocale } = useTheme();
  const [open, setOpen] = useState(false);
  // Android has no combined picker: 'datetime' shows the date dialog, then the time dialog.
  const [androidStep, setAndroidStep] = useState<'date' | 'time'>(mode === 'time' ? 'time' : 'date');
  const [draft, setDraft] = useState(value ?? new Date());
  const resolvedLocale = locale ?? themeLocale;
  const defaultFormat: Intl.DateTimeFormatOptions = mode === 'time'
    ? { hour: 'numeric', minute: '2-digit' }
    : mode === 'datetime'
      ? { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }
      : { year: 'numeric', month: 'short', day: 'numeric' };
  const formatted = value ? new Intl.DateTimeFormat(resolvedLocale, { ...defaultFormat, ...formatOptions }).format(value) : '';
  const handleNativeChange = (event: DateTimePickerEvent, next?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type !== 'set' || !next) {
        setOpen(false);
        return;
      }
      if (mode === 'datetime' && androidStep === 'date') {
        // Keep the chosen day, then ask for the time.
        const merged = new Date(draft);
        merged.setFullYear(next.getFullYear(), next.getMonth(), next.getDate());
        setDraft(merged);
        setAndroidStep('time');
        return;
      }
      setOpen(false);
      if (mode === 'datetime') {
        const merged = new Date(draft);
        merged.setHours(next.getHours(), next.getMinutes(), 0, 0);
        onChange(merged);
      } else {
        onChange(next);
      }
    } else if (next) {
      setDraft(next);
    }
  };
  const optionalNative = {
    ...(minimumDate ? { minimumDate } : {}),
    ...(maximumDate ? { maximumDate } : {}),
    ...(is24Hour !== undefined ? { is24Hour } : {}),
    ...(minuteInterval ? { minuteInterval } : {}),
  };

  return (
    <>
      <InputField
        type="text"
        label={fieldLabel}
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
            setAndroidStep(mode === 'time' ? 'time' : 'date');
            setOpen(true);
          }
        }}
        leftIcon={mode === 'time' ? 'clock' : 'calendar'}
        {...(clearable && value
          ? {
              rightIcon: 'close' as const,
              rightIconAccessibilityLabel: clearLabelProp ?? (mode === 'time' ? strings('clearTime') : clearLabel),
              onRightIconPress: () => onChange(undefined),
            }
          : {})}
      />
      {Platform.OS === 'android' && open ? (
        <NativeDateTimePicker
          key={androidStep}
          value={draft}
          mode={androidStep}
          {...optionalNative}
          locale={resolvedLocale}
          onChange={handleNativeChange}
        />
      ) : (
        <BottomSheet visible={open} onClose={() => setOpen(false)} title={title ?? placeholder}>
          <View style={{ gap: theme.spacing.lg, alignItems: 'stretch' }}>
            <NativeDateTimePicker
              value={draft}
              mode={mode}
              display={Platform.OS === 'ios' ? (mode === 'time' ? 'spinner' : 'inline') : 'default'}
              {...optionalNative}
              locale={resolvedLocale}
              onChange={handleNativeChange}
            />
            <Button
              title={confirmLabel}
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

/** `DatePicker` with `mode="datetime"` by default: pick a day and a time. */
export const DateTimePicker = memo(function DateTimePicker(props: DatePickerProps) {
  return <DatePicker mode="datetime" {...props} />;
});
