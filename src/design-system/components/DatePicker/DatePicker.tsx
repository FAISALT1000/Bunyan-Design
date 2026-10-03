import React, { memo, useMemo, useState } from 'react';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Platform, Pressable, View } from '../RNTheme';
import { useTheme } from '../../hooks';
import { heightForSize, logicalRow, statusBorderColor, type ComponentSize, type FeedbackStatus } from '../../utilities/styles';
import { BottomSheet } from '../BottomSheet';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { IconButton } from '../IconButton';
import { Text } from '../Text';

export interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  locale?: string;
  placeholder?: string;
  title?: string;
  disabled?: boolean;
  status?: FeedbackStatus;
  size?: ComponentSize;
  accessibilityLabel?: string;
  clearable?: boolean;
  clearLabel?: string;
  confirmLabel?: string;
  /**
   * Display format. Defaults to the Gregorian calendar so the label matches the
   * (Gregorian) native picker — `ar-SA` would otherwise format as Hijri.
   * Pass `{ calendar: 'islamic-umalqura' }` to opt into Hijri display.
   */
  formatOptions?: Intl.DateTimeFormatOptions;
  testID?: string;
}

const clampDate = (date: Date, min?: Date, max?: Date) => {
  if (min && date < min) return min;
  if (max && date > max) return max;
  return date;
};

const DEFAULT_FORMAT: Intl.DateTimeFormatOptions = {
  calendar: 'gregory',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const formatDate = (date: Date, locale: string, options: Intl.DateTimeFormatOptions) => {
  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    // Invalid locale tags throw a RangeError; fall back to the runtime default.
    return new Intl.DateTimeFormat(undefined, options).format(date);
  }
};

export const DatePicker = memo(function DatePicker({
  value,
  onChange,
  minimumDate,
  maximumDate,
  locale,
  placeholder = 'Select date',
  title,
  disabled = false,
  status = 'default',
  size = 'medium',
  accessibilityLabel = 'Date',
  clearable = true,
  clearLabel = 'Clear date',
  confirmLabel = 'Confirm',
  formatOptions,
  testID,
}: DatePickerProps) {
  const { theme, direction, locale: themeLocale } = useTheme();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => clampDate(value ?? new Date(), minimumDate, maximumDate));
  const resolvedLocale = locale ?? themeLocale;
  const formatted = useMemo(
    () => (value ? formatDate(value, resolvedLocale, { ...DEFAULT_FORMAT, ...formatOptions }) : ''),
    [formatOptions, resolvedLocale, value],
  );
  const limits = {
    ...(minimumDate ? { minimumDate } : {}),
    ...(maximumDate ? { maximumDate } : {}),
  };

  const openPicker = () => {
    if (disabled) return;
    setDraft(clampDate(value ?? new Date(), minimumDate, maximumDate));
    setOpen(true);
  };

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
      {/*
        A pressable trigger instead of a read-only TextInput: the old approach always
        rendered in the disabled style and onPressIn on non-editable inputs is unreliable.
      */}
      <View
        testID={testID}
        style={[
          logicalRow(direction),
          {
            minHeight: heightForSize(theme, size),
            alignItems: 'center',
            borderRadius: theme.radius.md,
            borderWidth: theme.borderWidth.thin,
            borderColor: statusBorderColor(theme, status),
            backgroundColor: disabled ? theme.color.disabled.background : theme.color.surface.primary,
            opacity: disabled ? theme.opacity.disabled : theme.opacity.opaque,
            overflow: 'hidden',
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityValue={{ text: formatted || placeholder }}
          accessibilityState={{ disabled, expanded: open }}
          aria-invalid={status === 'error'}
          disabled={disabled}
          onPress={openPicker}
          style={({ pressed }) => [
            logicalRow(direction),
            {
              flex: 1,
              alignSelf: 'stretch',
              alignItems: 'center',
              gap: theme.spacing.sm,
              paddingHorizontal: theme.spacing.md,
              backgroundColor: pressed ? theme.color.overlay.subtle : theme.color.overlay.transparent,
            },
          ]}
        >
          <Icon name="calendar" size="md" tone="secondary" />
          <Text tone={value ? 'primary' : 'tertiary'} style={{ flex: 1 }} numberOfLines={1}>
            {formatted || placeholder}
          </Text>
        </Pressable>
        {clearable && value && !disabled ? (
          <IconButton icon="close" size="small" accessibilityLabel={clearLabel} onPress={() => onChange(undefined)} />
        ) : null}
      </View>
      {Platform.OS === 'android' ? (
        open ? (
          <DateTimePicker value={draft} mode="date" {...limits} locale={resolvedLocale} onChange={handleNativeChange} />
        ) : null
      ) : (
        <BottomSheet visible={open} onClose={() => setOpen(false)} title={title ?? placeholder}>
          <View style={{ gap: theme.spacing.lg, alignItems: 'stretch' }}>
            <DateTimePicker
              value={draft}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              {...limits}
              locale={resolvedLocale}
              themeVariant={theme.mode === 'light' ? 'light' : 'dark'}
              accentColor={theme.color.primary.default}
              onChange={handleNativeChange}
            />
            <Button
              fullWidth
              onPress={() => {
                onChange(clampDate(draft, minimumDate, maximumDate));
                setOpen(false);
              }}
            >
              {confirmLabel}
            </Button>
          </View>
        </BottomSheet>
      )}
    </>
  );
});
