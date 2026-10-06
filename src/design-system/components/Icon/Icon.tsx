import React, { memo } from 'react';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { useTheme } from '../../hooks';

export type IconName =
  | 'alert-circle' | 'arrow-down' | 'arrow-down-left' | 'arrow-up' | 'arrow-up-right' | 'backspace' | 'calendar' | 'check' | 'chevron-down' | 'chevron-left'
  | 'chevron-right' | 'close' | 'eye' | 'eye-off' | 'info' | 'search'
  | 'success' | 'warning' | 'error' | 'user' | 'filter' | 'upload' | 'file' | 'plus' | 'minus' | 'trash' | 'image';
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type IconTone = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'success' | 'warning' | 'error' | 'information';

/** Icons whose meaning depends on reading direction and should mirror in RTL. */
export const DIRECTIONAL_ICONS: ReadonlySet<IconName> = new Set<IconName>(['backspace', 'chevron-left', 'chevron-right']);

export interface IconProps {
  name: IconName;
  size?: IconSize;
  tone?: IconTone;
  color?: string;
  /** Mirror in RTL. Defaults to `true` for directional icons only. */
  mirroredInRTL?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

const paths: Record<IconName, React.ReactNode> = {
  'alert-circle': <><Circle cx="12" cy="12" r="9" /><Line x1="12" y1="7" x2="12" y2="13" /><Line x1="12" y1="17" x2="12.01" y2="17" /></>,
  'arrow-down': <><Line x1="12" y1="5" x2="12" y2="19" /><Polyline points="6 13 12 19 18 13" /></>,
  'arrow-down-left': <><Line x1="17" y1="7" x2="7" y2="17" /><Polyline points="7 9 7 17 15 17" /></>,
  'arrow-up': <><Line x1="12" y1="19" x2="12" y2="5" /><Polyline points="6 11 12 5 18 11" /></>,
  'arrow-up-right': <><Line x1="7" y1="17" x2="17" y2="7" /><Polyline points="9 7 17 7 17 15" /></>,
  filter: <Path d="M4 5h16l-6 7.5V19l-4-2v-4.5L4 5z" />,
  upload: <><Path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" /><Polyline points="7 9 12 4 17 9" /><Line x1="12" y1="4" x2="12" y2="16" /></>,
  file: <><Path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" /><Polyline points="14 3 14 8 19 8" /></>,
  plus: <><Line x1="12" y1="5" x2="12" y2="19" /><Line x1="5" y1="12" x2="19" y2="12" /></>,
  minus: <Line x1="5" y1="12" x2="19" y2="12" />,
  trash: <><Polyline points="4 7 20 7" /><Path d="M9 7V4h6v3" /><Path d="M6 7l1 13h10l1-13" /></>,
  image: <><Rect x="3" y="4" width="18" height="16" rx="2" /><Circle cx="9" cy="10" r="2" /><Polyline points="21 16 15 11 5 20" /></>,
  backspace: <><Path d="M21 6H9l-6 6 6 6h12V6z" /><Line x1="12" y1="9" x2="17" y2="15" /><Line x1="17" y1="9" x2="12" y2="15" /></>,
  calendar: <><Rect x="3" y="5" width="18" height="16" rx="2" /><Line x1="8" y1="3" x2="8" y2="7" /><Line x1="16" y1="3" x2="16" y2="7" /><Line x1="3" y1="10" x2="21" y2="10" /></>,
  check: <Polyline points="5 12 10 17 19 7" />,
  'chevron-down': <Polyline points="6 9 12 15 18 9" />,
  'chevron-left': <Polyline points="15 18 9 12 15 6" />,
  'chevron-right': <Polyline points="9 18 15 12 9 6" />,
  close: <><Line x1="6" y1="6" x2="18" y2="18" /><Line x1="18" y1="6" x2="6" y2="18" /></>,
  eye: <><Path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" /><Circle cx="12" cy="12" r="2.5" /></>,
  'eye-off': <><Path d="M3 3l18 18" /><Path d="M10.5 6.2A11.8 11.8 0 0112 6c6.5 0 10 6 10 6a18 18 0 01-2.2 2.8M6.2 6.2C3.5 8 2 12 2 12s3.5 6 10 6a10.8 10.8 0 004-0.7" /></>,
  info: <><Circle cx="12" cy="12" r="9" /><Line x1="12" y1="11" x2="12" y2="17" /><Line x1="12" y1="7" x2="12.01" y2="7" /></>,
  search: <><Circle cx="11" cy="11" r="7" /><Line x1="16" y1="16" x2="21" y2="21" /></>,
  success: <><Circle cx="12" cy="12" r="9" /><Polyline points="7.5 12 10.5 15 16.5 9" /></>,
  warning: <><Path d="M12 3L2.5 20h19L12 3z" /><Line x1="12" y1="9" x2="12" y2="14" /><Line x1="12" y1="17" x2="12.01" y2="17" /></>,
  error: <><Circle cx="12" cy="12" r="9" /><Line x1="8.5" y1="8.5" x2="15.5" y2="15.5" /><Line x1="15.5" y1="8.5" x2="8.5" y2="15.5" /></>,
  user: <><Circle cx="12" cy="8" r="4" /><Path d="M4 21c.5-5 3-7 8-7s7.5 2 8 7" /></>,
};

export const Icon = memo(function Icon({
  name,
  size = 'md',
  tone = 'primary',
  color,
  mirroredInRTL = DIRECTIONAL_ICONS.has(name),
  accessibilityLabel,
  testID,
}: IconProps) {
  const { theme, isRTL } = useTheme();
  const toneColors: Record<IconTone, string> = {
    primary: theme.color.text.primary,
    secondary: theme.color.text.secondary,
    tertiary: theme.color.text.tertiary,
    inverse: theme.color.text.inverse,
    success: theme.color.success.default,
    warning: theme.color.warning.default,
    error: theme.color.error.default,
    information: theme.color.information.default,
  };
  const dimension = theme.iconSize[size];

  return (
    <Svg
      {...(testID ? { testID } : {})}
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? toneColors[tone]}
      strokeWidth={theme.borderWidth.medium}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...(accessibilityLabel
        ? { accessible: true, accessibilityRole: 'image' as const, accessibilityLabel }
        : { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' as const })}
      {...(mirroredInRTL && isRTL ? { style: { transform: [{ scaleX: -1 }] } } : {})}
    >
      {paths[name]}
    </Svg>
  );
});
