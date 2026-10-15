import React, { memo, useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, View, type ViewStyle } from '../RNTheme';
import { useTheme } from '../../hooks';
import { useStrings } from '../../i18n/strings';

export interface SkeletonProps {
  width?: ViewStyle['width'];
  height?: number;
  radius?: 'small' | 'medium' | 'large' | 'pill';
  lines?: number;
  /**
   * Ready-made shapes that match Bunyan layouts: row cards (`'OneLineCard'`,
   * `'TwoLineCard'`, `'ThreeLineCard'`), a generic `'card'` or an input `'field'`.
   */
  preset?: 'OneLineCard' | 'TwoLineCard' | 'ThreeLineCard' | 'card' | 'field';
  accessibilityLabel?: string;
}

export const Skeleton = memo(function Skeleton({
  width = '100%',
  height,
  radius = 'medium',
  lines = 1,
  preset,
  accessibilityLabel: accessibilityLabelProp,
}: SkeletonProps) {
  const strings = useStrings();
  const accessibilityLabel = accessibilityLabelProp ?? strings('loadingContent');
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

  const bone = (style: ViewStyle, key?: number | string) => (
    <Animated.View
      key={key}
      style={[{ backgroundColor: theme.color.neutral.subtle, borderRadius: theme.radius.md, opacity }, style]}
    />
  );

  if (preset) {
    const surface: ViewStyle = {
      padding: theme.spacing.lg,
      borderRadius: theme.radius.lg,
      borderWidth: theme.borderWidth.thin,
      borderColor: theme.color.border.secondary,
      backgroundColor: theme.color.surface.primary,
    };
    const rowLines = preset === 'OneLineCard' ? 1 : preset === 'ThreeLineCard' ? 3 : 2;
    return (
      <View accessible accessibilityRole="progressbar" accessibilityLabel={accessibilityLabel}>
        {preset === 'field' ? bone({ height: theme.components.inputField.minHeight, width: '100%' })
          : preset === 'card' ? (
            <View style={[surface, { gap: theme.spacing.sm }]}>
              {bone({ height: theme.spacing.lg, width: '45%' })}
              {bone({ height: theme.spacing.xxl, width: '70%' })}
              {bone({ height: theme.spacing.md, width: '90%' })}
            </View>
          ) : (
            <View style={[surface, { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }]}>
              {bone({ width: theme.tileSize.md, height: theme.tileSize.md })}
              <View style={{ flex: 1, gap: theme.spacing.xs }}>
                {bone({ height: theme.spacing.md, width: '60%' })}
                {rowLines > 1 ? bone({ height: theme.spacing.sm + 3, width: '40%' }) : null}
                {rowLines > 2 ? bone({ height: theme.spacing.sm + 3, width: '85%' }) : null}
              </View>
            </View>
          )}
      </View>
    );
  }

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
