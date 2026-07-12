import {
  borderWidth,
  componentHeight,
  motion,
  opacity,
  palette,
  shadow,
  spacing,
} from '../tokens/primitives';
import type {
  DesignSystemPlatform,
  PlatformTokens,
} from './platform.types';

const sharedPlatformTokens: PlatformTokens = {
  touchTarget: {
    minimum: componentHeight.md,
  },
  interaction: {
    pressFeedback: 'opacity',
    pressedOpacity: opacity.strong,
    stateLayerOpacity: opacity.subtle,
    focusRingWidth: borderWidth.medium,
  },
  motion: {
    fast: motion.duration.fast,
    normal: motion.duration.normal,
    slow: motion.duration.slow,
    reduced: motion.duration.instant,
  },
  safeArea: {
    minimumContentInset: spacing.lg,
  },
  elevation: {
    none: shadow.none,
    low: shadow.sm,
    medium: shadow.md,
    high: shadow.lg,
  },
};

export const iosPlatformTokens: PlatformTokens = {
  ...sharedPlatformTokens,
  touchTarget: {
    minimum: componentHeight.md,
  },
  interaction: {
    ...sharedPlatformTokens.interaction,
    pressFeedback: 'opacity',
    pressedOpacity: opacity.strong,
  },
  motion: {
    fast: 120,
    normal: 220,
    slow: 350,
    reduced: motion.duration.instant,
  },
  elevation: {
    none: {
      shadowColor: palette.gray[1000],
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
    },
    low: {
      shadowColor: palette.gray[1000],
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    medium: {
      shadowColor: palette.gray[1000],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    high: {
      shadowColor: palette.gray[1000],
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.16,
      shadowRadius: 20,
    },
  },
};

export const androidPlatformTokens: PlatformTokens = {
  ...sharedPlatformTokens,
  touchTarget: {
    minimum: 48,
  },
  interaction: {
    ...sharedPlatformTokens.interaction,
    pressFeedback: 'stateLayer',
    pressedOpacity: opacity.opaque,
    stateLayerOpacity: 0.12,
  },
  motion: {
    fast: 100,
    normal: 200,
    slow: 300,
    reduced: motion.duration.instant,
  },
  elevation: {
    none: { elevation: 0 },
    low: { elevation: 1 },
    medium: { elevation: 4 },
    high: { elevation: 8 },
  },
};

export const webPlatformTokens: PlatformTokens = {
  ...sharedPlatformTokens,
  interaction: {
    ...sharedPlatformTokens.interaction,
    pressFeedback: 'stateLayer',
  },
};

export const defaultPlatformTokens = sharedPlatformTokens;

export const platformTokens: Record<DesignSystemPlatform, PlatformTokens> = {
  ios: iosPlatformTokens,
  android: androidPlatformTokens,
  web: webPlatformTokens,
  default: defaultPlatformTokens,
};
