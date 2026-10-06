import React, { memo, useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, View, type ViewStyle } from '../RNTheme';
import { useTheme } from '../../hooks';

export interface SkeletonProps {
  width?: ViewStyle['width'];
  height?: number;
  radius?: 'small' | 'medium' | 'large' | 'pill';
  lines?: number;
  accessibilityLabel?: string;
}

export const Skeleton = memo(function Skeleton({
  width = '100%',
  height,
  radius = 'medium',
  lines = 1,
  accessibilityLabel = 'Loading content',
}: SkeletonProps) {
  const { theme } = useTheme();
  const lineCount = Math.max(1, Math.floor(lines));
  const opacity = useRef(new Animated.Value(theme.opacity.muted)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | undefined;
    let cancelled = false;
    // Guard against starting a loop after unmount (the promise resolves async).
    AccessibilityInfo.isReduceMotionEnabled().then(reduced => {
      if (!cancelled && !reduced) {
        animation = Animated.loop(Animated.sequence([
          Animated.timing(opacity, { toValue: theme.opacity.strong, duration: theme.motion.duration.slow, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: theme.opacity.muted, duration: theme.motion.duration.slow, useNativeDriver: true }),
        ]));
        animation.start();
      }
    }).catch(() => undefined);
    return () => {
      cancelled = true;
      animation?.stop();
    };
  }, [opacity, theme.motion.duration.slow, theme.opacity.muted, theme.opacity.strong]);

  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={accessibilityLabel} style={{ gap: theme.spacing.sm }}>
      {Array.from({ length: lineCount }, (_, index) => (
        <Animated.View
          key={index}
          style={{
            width: index === lineCount - 1 && lineCount > 1 ? '72%' : width,
            height: height ?? theme.spacing.lg,
            borderRadius: theme.radius[radius === 'small' ? 'sm' : radius === 'large' ? 'lg' : radius === 'pill' ? 'pill' : 'md'],
            backgroundColor: theme.color.neutral.subtle,
            opacity,
          }}
        />
      ))}
    </View>
  );
});
