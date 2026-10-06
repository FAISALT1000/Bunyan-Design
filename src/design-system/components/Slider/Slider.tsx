import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, View, type GestureResponderEvent, type LayoutChangeEvent, type ViewStyle } from '../RNTheme';
import { useTheme } from '../../hooks';
import { useText, type TextValue } from '../../i18n';
import { logicalRow, needsMirroring } from '../../utilities/styles';
import { Text } from '../Text';

export interface SliderProps {
  value?: number;
  onChange?: (value: number) => void;
  /** Called when the user lifts the finger. */
  onChangeEnd?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: TextValue;
  /** Show the current value next to the label. Default `true`. */
  showValue?: boolean;
  formatValue?: (value: number) => string;
  /** Show min / max under the track. */
  showLimits?: boolean;
  testID?: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const snap = (value: number, min: number, step: number) => {
  const snapped = Math.round((value - min) / step) * step + min;
  const decimals = (String(step).split('.')[1] ?? '').length;
  return Number(snapped.toFixed(decimals));
};

/**
 * Dependency-free slider (PanResponder). Drag or tap the track; screen readers
 * get the adjustable role with increment / decrement actions. RTL-aware.
 */
export const Slider = memo(function Slider({
  value: valueProp,
  onChange,
  onChangeEnd,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  label,
  showValue = true,
  formatValue = v => String(v),
  showLimits = false,
  testID,
}: SliderProps) {
  const { theme, direction, isRTL } = useTheme();
  const t = useText();
  const [internal, setInternal] = useState(valueProp ?? min);
  const value = clamp(valueProp ?? internal, min, max);
  const width = useRef(0);
  const latest = useRef({ value, onChange, onChangeEnd, disabled, isRTL, min, max, step });
  latest.current = { value, onChange, onChangeEnd, disabled, isRTL, min, max, step };

  useEffect(() => {
    if (valueProp !== undefined) setInternal(valueProp);
  }, [valueProp]);

  const valueAt = (x: number) => {
    const { isRTL: rtl, min: lo, max: hi, step: st } = latest.current;
    if (width.current <= 0) return latest.current.value;
    const ratio = clamp(x / width.current, 0, 1);
    return clamp(snap(lo + (rtl ? 1 - ratio : ratio) * (hi - lo), lo, st), lo, hi);
  };

  const update = (next: number) => {
    if (next === latest.current.value) return;
    latest.current.value = next;
    setInternal(next);
    latest.current.onChange?.(next);
  };

  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !latest.current.disabled,
    onMoveShouldSetPanResponder: () => !latest.current.disabled,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (event: GestureResponderEvent) => update(valueAt(event.nativeEvent.locationX)),
    onPanResponderMove: (event: GestureResponderEvent) => update(valueAt(event.nativeEvent.locationX)),
    onPanResponderRelease: () => latest.current.onChangeEnd?.(latest.current.value),
    onPanResponderTerminate: () => latest.current.onChangeEnd?.(latest.current.value),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  const ratio = max === min ? 0 : (value - min) / (max - min);
  const thumb = theme.iconSize.lg;
  const track = theme.spacing.xs;
  const labelText = t(label);
  const percent = `${ratio * 100}%` as const;
  // Physical styles mirror only when the native layout differs (RN already swaps left/right in native RTL).
  const mirror = needsMirroring(direction);
  const fillStart: ViewStyle = mirror ? { right: 0 } : { left: 0 };
  const thumbStart: ViewStyle = mirror
    ? { right: percent, marginRight: -thumb / 2 }
    : { left: percent, marginLeft: -thumb / 2 };

  return (
    <View testID={testID} style={{ gap: theme.spacing.xs, opacity: disabled ? theme.opacity.disabled : theme.opacity.opaque }}>
      {labelText || showValue ? (
        <View style={[logicalRow(direction), { justifyContent: 'space-between' }]}>
          {labelText ? <Text variant="labelMedium" weight="medium" value={labelText} /> : <View />}
          {showValue ? <Text variant="labelMedium" weight="semibold" internalColor={theme.color.text.link} value={formatValue(value)} /> : null}
        </View>
      ) : null}
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={labelText}
        accessibilityState={{ disabled }}
        accessibilityValue={{ min, max, now: value, text: formatValue(value) }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={event => {
          if (disabled) return;
          const next = clamp(value + (event.nativeEvent.actionName === 'increment' ? step : -step), min, max);
          update(next);
          onChangeEnd?.(next);
        }}
        onLayout={(event: LayoutChangeEvent) => {
          width.current = event.nativeEvent.layout.width;
        }}
        hitSlop={{ top: theme.spacing.md, bottom: theme.spacing.md }}
        style={{ height: thumb, justifyContent: 'center', marginHorizontal: thumb / 2 }}
        {...responder.panHandlers}
      >
        <View pointerEvents="none" style={{ height: track, borderRadius: theme.radius.pill, backgroundColor: theme.color.neutral.subtle }} />
        <View pointerEvents="none" style={{ position: 'absolute', ...fillStart, width: percent, height: track, borderRadius: theme.radius.pill, backgroundColor: theme.color.primary.default }} />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            ...thumbStart,
            width: thumb,
            height: thumb,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.color.surface.primary,
            borderWidth: theme.borderWidth.medium,
            borderColor: theme.color.primary.default,
            ...theme.shadow.sm,
          }}
        />
      </View>
      {showLimits ? (
        <View style={[logicalRow(direction), { justifyContent: 'space-between' }]}>
          <Text variant="caption" tone="tertiary" value={formatValue(min)} />
          <Text variant="caption" tone="tertiary" value={formatValue(max)} />
        </View>
      ) : null}
    </View>
  );
});
