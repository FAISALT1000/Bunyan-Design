import type * as YupModule from 'yup';
import type { DateRange } from '../DateRangePicker';

export interface DateRangeMessages {
  /** Shown when `from` is required and missing. Can be a locale key (Form translates errors). */
  fromRequired?: string;
  toRequired?: string;
  /** Shown when `from` is after `to`. */
  order?: string;
}

const DEFAULT_MESSAGES: Required<DateRangeMessages> = {
  fromRequired: 'Select a start date',
  toRequired: 'Select an end date',
  order: 'The start date must be before the end date',
};

/**
 * Validates a `DateRange` ({ from, to }) value. Returns an error message or `undefined`.
 * Usable without Yup (e.g. in a Formik `validate` function).
 */
export function validateDateRange(
  value: DateRange | null | undefined,
  requireFrom = false,
  requireTo = false,
  messages: DateRangeMessages = {},
): string | undefined {
  const text = { ...DEFAULT_MESSAGES, ...messages };
  const from = value?.from;
  const to = value?.to;
  if (requireFrom && !from) return text.fromRequired;
  if (requireTo && !to) return text.toRequired;
  if (from && to && from.getTime() > to.getTime()) return text.order;
  return undefined;
}

/**
 * Adds Bunyan helpers to your Yup instance (call once at app start):
 *
 * ```ts
 * import * as Yup from 'yup';
 * addBunyanYupMethods(Yup);
 *
 * Yup.object({ transactionDate: Yup.mixed().dateRange(true, true) });
 * ```
 */
export function addBunyanYupMethods(yup: typeof YupModule) {
  yup.addMethod(yup.mixed, 'dateRange', function dateRange(
    this: YupModule.MixedSchema,
    requireFrom = false,
    requireTo = false,
    messages: DateRangeMessages = {},
  ) {
    return this.test('dateRange', function test(value) {
      const message = validateDateRange(value as DateRange | undefined, requireFrom, requireTo, messages);
      return message ? this.createError({ message, path: this.path }) : true;
    });
  });
  return yup;
}

declare module 'yup' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface MixedSchema<TType, TContext, TDefault, TFlags> {
    /** `{ from, to }` date range: optional required sides and from ≤ to. Needs `addBunyanYupMethods(Yup)`. */
    dateRange(requireFrom?: boolean, requireTo?: boolean, messages?: DateRangeMessages): this;
  }
}
