/** Converts Arabic-Indic (٠-٩) and Persian (۰-۹) digits — and the Arabic decimal separator — to ASCII. */
export const normalizeDigits = (text: string) =>
  text
    .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 0x06f0))
    .replace(/٫/g, '.')
    .replace(/٬/g, ',');

export interface AmountFormatOptions {
  /** Maximum decimals. Default `2`. */
  decimals?: number;
  /** Thousands separator. Default `','`. */
  groupSeparator?: string;
  allowNegative?: boolean;
}

/**
 * Cleans what the user typed into an amount string: ASCII digits, one dot,
 * at most `decimals` decimals, no leading zeros. Keeps a trailing dot while typing.
 */
export const sanitizeAmountText = (text: string, { decimals = 2, allowNegative = false }: AmountFormatOptions = {}) => {
  const normalized = normalizeDigits(text);
  const negative = allowNegative && normalized.trim().startsWith('-');
  let cleaned = normalized.replace(/[^0-9.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot !== -1) {
    cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
    if (decimals <= 0) cleaned = cleaned.slice(0, firstDot);
  }
  let [integer = '', fraction] = cleaned.split('.');
  integer = integer.replace(/^0+(?=\d)/, '');
  if (fraction !== undefined) {
    fraction = fraction.slice(0, decimals);
    if (integer === '') integer = '0';
  }
  const body = fraction === undefined ? integer : `${integer}.${fraction}`;
  return negative && body ? `-${body}` : body;
};

/** `"1234567.5"` → `"1,234,567.5"` (keeps what the user typed after the dot). */
export const groupAmountText = (text: string, groupSeparator = ',') => {
  const negative = text.startsWith('-');
  const [integer = '', fraction] = (negative ? text.slice(1) : text).split('.');
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
  return `${negative ? '-' : ''}${grouped}${fraction === undefined ? '' : `.${fraction}`}`;
};

/** Parses an amount string (any digits, with separators) into a number, or `null` when empty. */
export const parseAmount = (text: string): number | null => {
  const cleaned = normalizeDigits(text).replace(/[^0-9.-]/g, '');
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
};

/** Formats a number for display: `1234.5` → `"1,234.50"`. */
export const formatAmount = (value: number | null | undefined, { decimals = 2, groupSeparator = ',' }: AmountFormatOptions = {}) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return '';
  return groupAmountText(value.toFixed(decimals), groupSeparator);
};

/** Human-readable file size: `1536` → `"1.5 KB"`. */
export const formatFileSize = (bytes: number | null | undefined) => {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes)) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${unit === 0 ? value : value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
};
