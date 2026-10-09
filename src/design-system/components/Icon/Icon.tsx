import React, { memo } from 'react';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { useTheme } from '../../hooks';

export type IconName =
  | 'alert-circle' | 'backspace' | 'calendar' | 'check' | 'chevron-down' | 'chevron-left'
  | 'chevron-right' | 'chevron-end' | 'close' | 'eye' | 'eye-off' | 'info' | 'search'
  | 'settings' | 'success' | 'transfer' | 'trash' | 'warning' | 'error' | 'user'
  | 'arrow-down' | 'arrow-down-left' | 'arrow-up' | 'arrow-up-right' | 'file' | 'filter'
  | 'image' | 'minus' | 'plus' | 'upload'
  | 'monitor' | 'sun' | 'moon' | 'contrast' | 'bell' | 'globe' | 'layers' | 'grid';
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type IconTone = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'success' | 'warning' | 'error' | 'information';

export interface IconProps {
  name: IconName;
  size?: IconSize;
  tone?: IconTone;
  color?: string;
  mirroredInRTL?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

const paths: Record<IconName, React.ReactNode> = {
  'alert-circle': <><Circle cx="12" cy="12" r="9" /><Line x1="12" y1="7" x2="12" y2="13" /><Line x1="12" y1="17" x2="12.01" y2="17" /></>,
  backspace: <><Path d="M21 6H9l-6 6 6 6h12V6z" /><Line x1="12" y1="9" x2="17" y2="15" /><Line x1="17" y1="9" x2="12" y2="15" /></>,
  calendar: <><Rect x="3" y="5" width="18" height="16" rx="2" /><Line x1="8" y1="3" x2="8" y2="7" /><Line x1="16" y1="3" x2="16" y2="7" /><Line x1="3" y1="10" x2="21" y2="10" /></>,
  check: <Polyline points="5 12 10 17 19 7" />,
  'chevron-down': <Polyline points="6 9 12 15 18 9" />,
  'chevron-left': <Polyline points="15 18 9 12 15 6" />,
  'chevron-right': <Polyline points="9 18 15 12 9 6" />,
  'chevron-end': <Polyline points="9 18 15 12 9 6" />,
  close: <><Line x1="6" y1="6" x2="18" y2="18" /><Line x1="18" y1="6" x2="6" y2="18" /></>,
  eye: <><Path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" /><Circle cx="12" cy="12" r="2.5" /></>,
  'eye-off': <><Path d="M3 3l18 18" /><Path d="M10.5 6.2A11.8 11.8 0 0112 6c6.5 0 10 6 10 6a18 18 0 01-2.2 2.8M6.2 6.2C3.5 8 2 12 2 12s3.5 6 10 6a10.8 10.8 0 004-0.7" /></>,
  info: <><Circle cx="12" cy="12" r="9" /><Line x1="12" y1="11" x2="12" y2="17" /><Line x1="12" y1="7" x2="12.01" y2="7" /></>,
  search: <><Circle cx="11" cy="11" r="7" /><Line x1="16" y1="16" x2="21" y2="21" /></>,
  settings: <><Circle cx="12" cy="12" r="3" /><Path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.6V21h-4v-.1a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 00.3-1.9A1.7 1.7 0 003 14H3v-4h.1a1.7 1.7 0 001.6-1 1.7 1.7 0 00-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 009 4.6 1.7 1.7 0 0010 3V3h4v.1a1.7 1.7 0 001 1.6 1.7 1.7 0 001.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 00-.3 1.9 1.7 1.7 0 001.6 1H21v4h-.1a1.7 1.7 0 00-1.5 1z" /></>,
  success: <><Circle cx="12" cy="12" r="9" /><Polyline points="7.5 12 10.5 15 16.5 9" /></>,
  transfer: <><Line x1="4" y1="7" x2="20" y2="7" /><Polyline points="16 3 20 7 16 11" /><Line x1="20" y1="17" x2="4" y2="17" /><Polyline points="8 13 4 17 8 21" /></>,
  trash: <><Polyline points="3 6 5 6 21 6" /><Path d="M8 6V4h8v2M19 6l-1 15H6L5 6" /><Line x1="10" y1="11" x2="10" y2="17" /><Line x1="14" y1="11" x2="14" y2="17" /></>,
  warning: <><Path d="M12 3L2.5 20h19L12 3z" /><Line x1="12" y1="9" x2="12" y2="14" /><Line x1="12" y1="17" x2="12.01" y2="17" /></>,
  error: <><Circle cx="12" cy="12" r="9" /><Line x1="8.5" y1="8.5" x2="15.5" y2="15.5" /><Line x1="15.5" y1="8.5" x2="8.5" y2="15.5" /></>,
  'arrow-down': <><Line x1="12" y1="5" x2="12" y2="19" /><Polyline points="6 13 12 19 18 13" /></>,
  'arrow-down-left': <><Line x1="17" y1="7" x2="7" y2="17" /><Polyline points="7 9 7 17 15 17" /></>,
  'arrow-up': <><Line x1="12" y1="19" x2="12" y2="5" /><Polyline points="6 11 12 5 18 11" /></>,
  'arrow-up-right': <><Line x1="7" y1="17" x2="17" y2="7" /><Polyline points="9 7 17 7 17 15" /></>,
  file: <><Path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" /><Polyline points="14 3 14 8 19 8" /></>,
  filter: <Path d="M4 5h16l-6 7.5V19l-4-2v-4.5L4 5z" />,
  image: <><Rect x="3" y="4" width="18" height="16" rx="2" /><Circle cx="9" cy="10" r="2" /><Polyline points="21 16 15 11 5 20" /></>,
  minus: <Line x1="5" y1="12" x2="19" y2="12" />,
  plus: <><Line x1="12" y1="5" x2="12" y2="19" /><Line x1="5" y1="12" x2="19" y2="12" /></>,
  upload: <><Path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" /><Polyline points="7 9 12 4 17 9" /><Line x1="12" y1="4" x2="12" y2="16" /></>,
  monitor: <><Rect x="3" y="4" width="18" height="12" rx="2" /><Line x1="8" y1="20" x2="16" y2="20" /><Line x1="12" y1="16" x2="12" y2="20" /></>,
  sun: <><Circle cx="12" cy="12" r="4" /><Line x1="12" y1="2" x2="12" y2="4" /><Line x1="12" y1="20" x2="12" y2="22" /><Line x1="4.9" y1="4.9" x2="6.3" y2="6.3" /><Line x1="17.7" y1="17.7" x2="19.1" y2="19.1" /><Line x1="2" y1="12" x2="4" y2="12" /><Line x1="20" y1="12" x2="22" y2="12" /><Line x1="4.9" y1="19.1" x2="6.3" y2="17.7" /><Line x1="17.7" y1="6.3" x2="19.1" y2="4.9" /></>,
  moon: <Path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" />,
  contrast: <><Circle cx="12" cy="12" r="9" /><Path d="M12 3a9 9 0 010 18z" fill="currentColor" /></>,
  bell: <><Path d="M18 16V11a6 6 0 00-12 0v5l-2 2h16z" /><Path d="M10 20a2 2 0 004 0" /></>,
  globe: <><Circle cx="12" cy="12" r="9" /><Line x1="3" y1="12" x2="21" y2="12" /><Path d="M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" /></>,
  layers: <><Polyline points="12 3 21 8 12 13 3 8 12 3" /><Polyline points="3 12 12 17 21 12" /><Polyline points="3 16 12 21 21 16" /></>,
  grid: <><Rect x="4" y="4" width="6" height="6" rx="1" /><Rect x="14" y="4" width="6" height="6" rx="1" /><Rect x="4" y="14" width="6" height="6" rx="1" /><Rect x="14" y="14" width="6" height="6" rx="1" /></>,
  user: <><Circle cx="12" cy="8" r="4" /><Path d="M4 21c.5-5 3-7 8-7s7.5 2 8 7" /></>,
};

export const Icon = memo(function Icon({
  name,
  size = 'md',
  tone = 'primary',
  color,
  mirroredInRTL = false,
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
      color={color ?? toneColors[tone]}
      stroke={color ?? toneColors[tone]}
      strokeWidth={theme.borderWidth.medium}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...(accessibilityLabel ? { accessibilityRole: 'image' as const, accessibilityLabel } : {})}
      {...(mirroredInRTL && isRTL ? { style: { transform: [{ scaleX: -1 }] } } : {})}
    >
      {paths[name]}
    </Svg>
  );
});
