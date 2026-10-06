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
 * Adds Bunyan helpers (`Yup.mixed().dateRange()`) to a Yup instance.
 *
 * **You normally don't need to call this**: Bunyan registers the helpers on the
 * app's `yup` automatically when the package is imported. Call it yourself only
 * for a second Yup copy (e.g. a monorepo where Bunyan resolves a different
 * `yup` than your app). Calling it more than once is harmless.
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
  return loadYup().mixed<DateRange>().test('dateRange', function test(value) {
    const message = validateDateRange(value, requireFrom, requireTo, messages);
    return message ? this.createError({ message, path: this.path }) : true;
  });
}

declare const require: (id: string) => unknown;

/** The app's `yup` (optional peer dependency). */
function loadYup(): typeof YupModule {
  try {
    return require('yup') as typeof YupModule;
  } catch {
    throw new Error('@bunyan/design-system: install `yup` to use dateRangeSchema / Yup.mixed().dateRange().');
  }
}

// Register `Yup.mixed().dateRange()` on the app's yup as soon as Bunyan is imported.
// `yup` is optional: Metro treats a require inside try/catch as an optional dependency,
// so apps without yup still bundle and simply skip this.
try {
  addBunyanYupMethods(require('yup') as typeof YupModule);
} catch {
  // yup is not installed — nothing to register.
}

declare module 'yup' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface MixedSchema<TType, TContext, TDefault, TFlags> {
    /** `{ from, to }` date range: optional required sides and from ≤ to. Registered automatically by Bunyan. */
    dateRange(requireFrom?: boolean, requireTo?: boolean, messages?: DateRangeMessages): this;
  }
}
