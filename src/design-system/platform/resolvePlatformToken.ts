import { Platform } from 'react-native';
import { platformTokens } from './platform.tokens';
import type {
  DesignSystemPlatform,
  PlatformTokens,
  PlatformTokenValue,
} from './platform.types';

export function normalizeDesignSystemPlatform(
  platform: string,
): DesignSystemPlatform {
  if (platform === 'ios' || platform === 'android' || platform === 'web') {
    return platform;
  }
  return 'default';
}

export function getDesignSystemPlatform(): DesignSystemPlatform {
  return normalizeDesignSystemPlatform(Platform.OS);
}

export function resolvePlatformToken<T>(
  value: PlatformTokenValue<T>,
  platform: DesignSystemPlatform = getDesignSystemPlatform(),
): T {
  return value[platform] ?? value.default;
}

export function resolvePlatformTokens(
  platform: DesignSystemPlatform = getDesignSystemPlatform(),
): PlatformTokens {
  return platformTokens[platform];
}
