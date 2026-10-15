export type TextVariant =
  | 'displayLarge'
  | 'displayMedium'
  | 'headingLarge'
  | 'headingMedium'
  | 'headingSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'labelSmall'
  | 'caption'
  /** 10pt, for tab badges and tiny counters. */
  | 'micro';

export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export type TextTone =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'disabled'
  | 'inverse';
