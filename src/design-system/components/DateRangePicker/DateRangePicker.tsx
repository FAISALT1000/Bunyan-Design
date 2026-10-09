import React, { memo, useState } from 'react';
import { View } from '../RNTheme';
import { useTheme } from '../../hooks';
import { useText, type TextValue } from '../../i18n';
import { logicalRow, type FeedbackStatus } from '../../utilities/styles';
import { ChipsGroup } from '../ChipsGroup';
import { DatePicker } from '../DatePicker';
import { Text } from '../Text';

export interface DateRange {
  from?: Date | undefined;
  to?: Date | undefined;
}

export type DisplayCalendar = 'gregory' | 'islamic-umalqura';

export interface DateRangePickerProps {
  value?: DateRange | null;
  onChange: (range: DateRange) => void;
  fromLabel?: TextValue;
  toLabel?: TextValue;
  fromPlaceholder?: TextValue;
  toPlaceholder?: TextValue;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
  status?: FeedbackStatus;
  /** Side by side (default) or stacked. */
  layout?: 'row' | 'column';
  locale?: string;
  /** Show a Gregorian / Hijri switch for how dates are displayed. */
  showHijriToggle?: boolean;
  /** Controlled display calendar. */
  calendar?: DisplayCalendar;
  defaultCalendar?: DisplayCalendar;
  onCalendarChange?: (calendar: DisplayCalendar) => void;
  gregorianLabel?: TextValue;
  hijriLabel?: TextValue;
  clearable?: boolean;
  testID?: string;
}

const earlier = (a?: Date, b?: Date) => (a && b ? (a < b ? a : b) : a ?? b);
const later = (a?: Date, b?: Date) => (a && b ? (a > b ? a : b) : a ?? b);

/**
 * From / to date selection. Each side is bounded by the other, so the range is
 * always valid. With `showHijriToggle` the user can display dates in the Hijri
 * (Umm al-Qura) calendar; values are always plain `Date`s.
 */
export const DateRangePicker = memo(function DateRangePicker({
  value,
  onChange,
  fromLabel = 'From',
  toLabel = 'To',
  fromPlaceholder = 'Start date',
  toPlaceholder = 'End date',
  minimumDate,
  maximumDate,
  disabled = false,
  status = 'default',
  layout = 'row',
  locale,
  showHijriToggle = false,
  calendar: calendarProp,
  defaultCalendar = 'gregory',
  onCalendarChange,
  gregorianLabel = 'Gregorian',
  hijriLabel = 'Hijri',
  clearable = true,
  testID,
}: DateRangePickerProps) {
  const { theme, direction } = useTheme();
  const t = useText();
  const [internalCalendar, setInternalCalendar] = useState<DisplayCalendar>(defaultCalendar);
  const calendar = calendarProp ?? internalCalendar;
  const from = value?.from;
  const to = value?.to;
  // Hijri month names are long ("Rabiʻ I"); numeric months keep both sides readable side by side.
  const formatOptions: Intl.DateTimeFormatOptions = calendar === 'gregory'
    ? { calendar }
    : { calendar, year: 'numeric', month: 'numeric', day: 'numeric' };

  const side = (which: 'from' | 'to') => {
    const isFrom = which === 'from';
    const label = t(isFrom ? fromLabel : toLabel) ?? '';
    const min = isFrom ? minimumDate : later(minimumDate, from);
    const max = isFrom ? earlier(maximumDate, to) : maximumDate;
    return (
      <View style={{ flex: layout === 'row' ? 1 : undefined, gap: theme.spacing.xs }}>
        <Text variant="caption" tone="secondary" value={label} />
        <DatePicker
          {...(isFrom ? (from ? { value: from } : {}) : (to ? { value: to } : {}))}
          onChange={date => onChange({ from, to, [which]: date })}
          placeholder={t(isFrom ? fromPlaceholder : toPlaceholder) ?? ''}
          title={label}
          accessibilityLabel={label}
          disabled={disabled}
          // An error on the range marks the empty side(s); with both filled (order error) both sides.
          status={status === 'error' && (from && to ? false : isFrom ? Boolean(from) : Boolean(to)) ? 'default' : status}
          clearable={clearable}
          formatOptions={formatOptions}
          {...(min ? { minimumDate: min } : {})}
          {...(max ? { maximumDate: max } : {})}
          {...(locale ? { locale } : {})}
        />
      </View>
    );
  };

  return (
    <View testID={testID} style={{ gap: theme.spacing.sm }}>
      {showHijriToggle ? (
        <ChipsGroup
          value={calendar}
          onChange={next => {
            if (calendarProp === undefined) setInternalCalendar(next);
            onCalendarChange?.(next);
          }}
          disabled={disabled}
          data={[
            { text: gregorianLabel, value: 'gregory' as const },
            { text: hijriLabel, value: 'islamic-umalqura' as const },
          ]}
        />
      ) : null}
      <View style={[layout === 'row' ? logicalRow(direction) : null, { gap: theme.spacing.md }]}>
        {side('from')}
        {side('to')}
      </View>
    </View>
  );
});
