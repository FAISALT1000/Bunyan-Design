import React, { memo, useEffect, useRef } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { Animated, Easing } from '../../components/RNTheme/native';
import { useAccessibility, useHaptics, useTheme } from '../../hooks';
import type { Theme } from '../../themes/types';

export type StatusKind = 'success' | 'error' | 'pending';

export interface StatusIconProps {
  status: StatusKind;
  /** Diameter in points. Default 72. */
  size?: number;
  /** Default true. Reduce Motion (system setting) always shows the final frame. */
  animated?: boolean;
  /** Draw the soft halo behind the icon. Default true. */
  halo?: boolean;
  /** Notification haptic when success / error appear. Default false. */
  haptics?: boolean;
  onAnimationEnd?: () => void;
  testID?: string;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

export const statusColors = (theme: Theme, status: StatusKind) => ({
  success: { fill: theme.color.success.default, halo: theme.color.success.subtle },
  error: { fill: theme.color.error.default, halo: theme.color.error.subtle },
  pending: { fill: theme.color.primary.default, halo: theme.color.primary.subtle },
})[status];

const GLYPHS = {
  success: { d: 'M7.5 12.5L10.5 15.5L16.5 9', length: 14 },
  error: { d: 'M9 9L15 15M15 9L9 15', length: 18 },
} as const;

/**
 * Animated status mark:
 * - success: circle scales in, then the check is drawn;
 * - error: circle scales in, the X is drawn, then one shake;
 * - pending: a ring spins until the status changes.
 */
export const StatusIcon = memo(function StatusIcon({
  status,
  size = 72,
  animated = true,
  halo = true,
  haptics = false,
  onAnimationEnd,
  testID,
}: StatusIconProps) {
  const { theme } = useTheme();
  const { reduceMotionEnabled } = useAccessibility();
  const { notification } = useHaptics();
  const motion = animated && !reduceMotionEnabled;
  const scale = useRef(new Animated.Value(motion ? 0.6 : 1)).current;
  const draw = useRef(new Animated.Value(motion ? 0 : 1)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const colors = statusColors(theme, status);

  useEffect(() => {
    let loop: Animated.CompositeAnimation | undefined;
    if (status === 'pending') {
      scale.setValue(1);
      if (motion) {
        spin.setValue(0);
        loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true }));
        loop.start();
      }
      return () => loop?.stop();
    }
    if (haptics) void notification(status === 'success' ? 'success' : 'error');
    if (!motion) {
      scale.setValue(1);
      draw.setValue(1);
      onAnimationEnd?.();
      return undefined;
    }
    scale.setValue(0.6);
    draw.setValue(0);
    shake.setValue(0);
    const steps: Animated.CompositeAnimation[] = [
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 120, useNativeDriver: false }),
      Animated.timing(draw, { toValue: 1, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: false }),
    ];
    if (status === 'error') {
      steps.push(Animated.sequence([-1, 1, -0.6, 0.6, 0].map(toValue => (
        Animated.timing(shake, { toValue, duration: 50, useNativeDriver: false })
      ))));
    }
    const sequence = Animated.sequence(steps);
    sequence.start(({ finished }) => {
      if (finished) onAnimationEnd?.();
    });
    return () => sequence.stop();
    // Re-run only when the status (or motion preference) changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, motion]);

  const inner = halo ? size * 0.72 : size;
  const strokeWidth = 2.4;

  return (
    <Animated.View
      testID={testID}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: halo ? colors.halo : theme.color.overlay.transparent,
        transform: [
          { translateX: shake.interpolate({ inputRange: [-1, 1], outputRange: [-size * 0.08, size * 0.08] }) },
          { scale },
        ],
      }}
    >
      {status === 'pending' ? (
        <Animated.View style={{ transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
          <Svg width={inner} height={inner} viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="9" stroke={colors.fill} strokeOpacity={0.2} strokeWidth={strokeWidth} fill="none" />
            <Circle cx="12" cy="12" r="9" stroke={colors.fill} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeDasharray="16 60" />
          </Svg>
        </Animated.View>
      ) : (
        <Svg width={inner} height={inner} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="10" fill={colors.fill} />
          <AnimatedPath
            d={GLYPHS[status].d}
            stroke={theme.color.text.inverse}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={GLYPHS[status].length}
            strokeDashoffset={draw.interpolate({ inputRange: [0, 1], outputRange: [GLYPHS[status].length, 0] })}
          />
        </Svg>
      )}
    </Animated.View>
  );
});
