import * as YupModule from 'yup';
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
 * Adds Bunyan helpers (`mixed().dateRange()`) to a Yup instance.
 *
 * Not needed with Bunyan's own `Yup` export (already registered). Only for an
 * app that still imports its own separate `yup` copy. Idempotent.
 */
export function addBunyanYupMethods(yup: typeof YupModule) {
  if (typeof (yup.mixed() as unknown as { dateRange?: unknown }).dateRange === 'function') return yup;
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

/**
 * Same rule as `Yup.mixed().dateRange()` without touching Yup's prototype:
 *
 * ```ts
 * Yup.object({ transactionDate: dateRangeSchema(true, true) });
 * ```
 */
export function dateRangeSchema(requireFrom = false, requireTo = false, messages: DateRangeMessages = {}) {
  return YupModule.mixed<DateRange>().test('dateRange', function test(value) {
    const message = validateDateRange(value, requireFrom, requireTo, messages);
    return message ? this.createError({ message, path: this.path }) : true;
  });
}

// Bunyan owns Yup: register the helpers once, when this module loads.
addBunyanYupMethods(YupModule);

/**
 * Yup, shipped by Bunyan with Bunyan's helpers (`Yup.mixed().dateRange()`)
 * already registered. Apps import it from the design system instead of
 * installing `yup` themselves:
 *
 * ```ts
 * import { Form, Yup } from '@bunyan/design-system';
 *
 * const schema = Yup.object({
 *   email: Yup.string().email('errors.email').required('errors.required'),
 *   transactionDate: Yup.mixed().dateRange(true, true),
 * });
 * type Values = Yup.InferType<typeof schema>;
 * ```
 */
export { YupModule as Yup };

declare module 'yup' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface MixedSchema<TType, TContext, TDefault, TFlags> {
    /** `{ from, to }` date range: optional required sides and from ≤ to. Registered on Bunyan's `Yup` export. */
    dateRange(requireFrom?: boolean, requireTo?: boolean, messages?: DateRangeMessages): this;
  }
}
