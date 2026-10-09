import React, { memo } from 'react';
import type { TextValue } from '../../i18n';
import { LineCard, type LineCardBaseProps } from './LineCard';

export type OneLineCardProps = LineCardBaseProps;

/**
 * One tappable row: icon or avatar, title and an optional value, badge,
 * switch or chevron.
 *
 * ```tsx
 * <OneLineCard icon="globe" title="Language" value="العربية" chevron onPress={openLanguage} />
 * <OneLineCard icon="moon" title="Dark mode" toggle={{ value: dark, onChange: setDark }} />
 * ```
 */
export const OneLineCard = memo(function OneLineCard(props: OneLineCardProps) {
  return <LineCard {...props} lines={1} />;
});

export interface TwoLineCardProps extends LineCardBaseProps {
  subtitle?: TextValue;
}

/**
 * Title plus a second line (status, date, email…). The most common list row.
 *
 * ```tsx
 * <TwoLineCard avatar={{ name: 'Sara Ali' }} title="Sara Ali" subtitle="sara@company.sa"
 *   badge={{ label: 'Admin', tone: 'primary' }} chevron onPress={open} />
 * ```
 */
export const TwoLineCard = memo(function TwoLineCard(props: TwoLineCardProps) {
  return <LineCard {...props} lines={2} />;
});

export interface ThreeLineCardProps extends TwoLineCardProps {
  description?: TextValue;
  /** Top-end text such as a time. */
  meta?: TextValue;
  unread?: boolean;
}

/**
 * Title, subtitle and a short description, for notifications, tickets or messages.
 *
 * ```tsx
 * <ThreeLineCard icon={{ name: 'warning', tone: 'warning' }} title="Card payment declined"
 *   subtitle="Visa •••• 4821" description="Try again or use another card." meta="2m" unread />
 * ```
 */
export const ThreeLineCard = memo(function ThreeLineCard(props: ThreeLineCardProps) {
  return <LineCard {...props} lines={3} />;
});
