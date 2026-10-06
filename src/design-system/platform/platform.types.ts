import type { ViewStyle } from 'react-native';

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
