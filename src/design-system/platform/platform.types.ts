import type { PlatformTypography } from './typography';
import type { ViewStyle } from '../components/RNTheme/native';

export type DesignSystemPlatform = 'ios' | 'android' | 'web' | 'default';

export type InteractionFeedback =
  | 'auto'
  | 'opacity'
  | 'stateLayer'
  | 'none';

export type ResolvedInteractionFeedback = Exclude<
  InteractionFeedback,
  'auto'
>;

export type ElevationLevel = 'none' | 'low' | 'medium' | 'high';

export interface PlatformInteractionTokens {
  pressFeedback: ResolvedInteractionFeedback;
  pressedOpacity: number;
  stateLayerOpacity: number;
  focusRingWidth: number;
}

export interface PlatformMotionTokens {
  fast: number;
  normal: number;
  slow: number;
  reduced: number;
}

export interface PlatformTokens {
  touchTarget: {
    minimum: number;
  };
  components: {
    button: { corner: 'rounded' | 'full'; secondaryStyle: 'filled' | 'tonal'; labelVariant: 'labelMedium' | 'labelLarge' };
    tabBar: { minimumHeight: number; activeIndicator: boolean; iconSize: 'md' | 'lg'; labelVariant: 'micro' | 'labelMedium' };
  };
  typography: PlatformTypography;
  interaction: PlatformInteractionTokens;
  motion: PlatformMotionTokens;
  safeArea: {
    minimumContentInset: number;
  };
  elevation: Record<ElevationLevel, ViewStyle>;
}

export interface PlatformTokenValue<T> {
  default: T;
  ios?: T;
  android?: T;
  web?: T;
}
