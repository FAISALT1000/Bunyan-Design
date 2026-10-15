import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '../../base/Box';
import { Inline } from '../../base/Inline';
import { BaseModal } from '../../base/Modal';
import { BasePressable } from '../../base/Pressable';
import { ScrollContainer } from '../../base/ScrollContainer';
import { Stack } from '../../base/Stack';
import { useKeyboard, useSafeArea, useTheme } from '../../hooks';
import { KeyboardAvoidingView, View } from '../RNTheme';
import { Animated, PanResponder, useWindowDimensions } from '../RNTheme/native';
import { Heading } from '../Heading';
import { IconButton } from '../IconButton';
import { Text } from '../Text';
import { useStrings } from '../../i18n/strings';

/** A sheet height: points or a share of the window (`'50%'`). */
export type SheetHeight = number | `${number}%`;

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Header title. Omit for a sheet without a header row (the handle stays). */
  title?: string;
  description?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  /**
   * Fixed height. Default `'auto'`: fits the content, up to 90% of the window.
   * Ignored when `snapPoints` is set.
   */
  height?: SheetHeight | 'auto';
  /**
   * Heights the sheet can be dragged between, smallest first, e.g.
   * `['40%', '90%']`. Dragging below the smallest closes a dismissible sheet.
   */
  snapPoints?: readonly SheetHeight[];
  /** Index in `snapPoints` to open at. Default 0. */
  initialSnap?: number;
  onSnapChange?: (index: number) => void;
  /** Drag the handle down to close (and between snap points). Default true. */
  draggable?: boolean;
  /** Wrap children in a ScrollView. Default true; set false for lists that scroll themselves. */
  scrollable?: boolean;
  /** Pinned under the content (buttons). */
  footer?: React.ReactNode;
  closeAccessibilityLabel?: string;
  accessibilityLabel?: string;
  testID?: string;
}

const CLOSE_DISTANCE = 120;
const CLOSE_VELOCITY = 1.2;

export const BottomSheet = memo(function BottomSheet({
  visible,
  onClose,
  title,
  description,
  children,
  dismissible = true,
  height = 'auto',
  snapPoints,
  initialSnap = 0,
  onSnapChange,
  draggable = true,
  scrollable = true,
  footer,
  closeAccessibilityLabel: closeAccessibilityLabelProp,
  accessibilityLabel,
  testID,
}: BottomSheetProps) {
  const strings = useStrings();
  const closeAccessibilityLabel = closeAccessibilityLabelProp ?? strings('closeSheet');
  const { theme } = useTheme();
  const { bottom } = useSafeArea();
  const keyboard = useKeyboard();
  const window = useWindowDimensions();
  // Keep the last row above the home indicator / Android navigation bar.
  // While the keyboard is open it already covers that area.
  const bottomPadding = theme.spacing.xxl + (keyboard.isVisible ? 0 : bottom);

  const toPoints = (value: SheetHeight) =>
    typeof value === 'number' ? value : (parseFloat(value) / 100) * window.height;
  const snapHeights = useMemo(
    () => (snapPoints?.length ? snapPoints.map(toPoints).sort((a, b) => a - b) : undefined),
    // Recomputed when the window height changes (rotation, split screen).
    [snapPoints, window.height],
  );
  const clampIndex = (index: number) => Math.max(0, Math.min((snapHeights?.length ?? 1) - 1, index));
  const [snapIndex, setSnapIndex] = useState(() => clampIndex(initialSnap));
  const sheetHeight = useRef(new Animated.Value(snapHeights?.[snapIndex] ?? 0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const dragStart = useRef(0);

  // Reset to the initial snap point every time the sheet opens.
  useEffect(() => {
    if (!visible) return;
    const index = clampIndex(initialSnap);
    setSnapIndex(index);
    dragY.setValue(0);
    if (snapHeights) sheetHeight.setValue(snapHeights[index] ?? 0);
  }, [visible]);

  useEffect(() => {
    if (snapHeights) sheetHeight.setValue(snapHeights[snapIndex] ?? 0);
  }, [snapHeights]);

  const goTo = (index: number) => {
    if (!snapHeights) return;
    const next = clampIndex(index);
    setSnapIndex(next);
    onSnapChange?.(next);
    Animated.spring(sheetHeight, { toValue: snapHeights[next] ?? 0, useNativeDriver: false, bounciness: 0 }).start();
  };

  const latest = useRef({ snapHeights, snapIndex, dismissible, onClose, goTo });
  latest.current = { snapHeights, snapIndex, dismissible, onClose, goTo };

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 4,
    onPanResponderGrant: () => {
      const { snapHeights: heights, snapIndex: index } = latest.current;
      dragStart.current = heights?.[index] ?? 0;
    },
    onPanResponderMove: (_, gesture) => {
      const { snapHeights: heights } = latest.current;
      if (heights) {
        const max = heights[heights.length - 1] ?? 0;
        const next = Math.min(max, dragStart.current - gesture.dy);
        if (next >= (heights[0] ?? 0)) {
          sheetHeight.setValue(next);
          dragY.setValue(0);
        } else {
          sheetHeight.setValue(heights[0] ?? 0);
          dragY.setValue((heights[0] ?? 0) - next);
        }
      } else {
        dragY.setValue(Math.max(0, gesture.dy));
      }
    },
    onPanResponderRelease: (_, gesture) => {
      const { snapHeights: heights, dismissible: canClose, onClose: close, goTo: snapTo } = latest.current;
      const springBack = () => Animated.spring(dragY, { toValue: 0, useNativeDriver: false, bounciness: 0 }).start();
      const smallest = heights?.[0] ?? 0;
      const current = heights ? dragStart.current - gesture.dy : 0;
      const closing = canClose && (heights
        ? current < smallest - CLOSE_DISTANCE / 2 || (current <= smallest && gesture.vy > CLOSE_VELOCITY)
        : gesture.dy > CLOSE_DISTANCE || gesture.vy > CLOSE_VELOCITY);
      if (closing) {
        close();
        return;
      }
      springBack();
      if (heights) {
        // Fling picks the next point in that direction; otherwise the nearest.
        const projected = current - gesture.vy * 120;
        let nearest = 0;
        heights.forEach((point, index) => {
          if (Math.abs(point - projected) < Math.abs((heights[nearest] ?? 0) - projected)) nearest = index;
        });
        snapTo(nearest);
      }
    },
    onPanResponderTerminate: () => {
      Animated.spring(dragY, { toValue: 0, useNativeDriver: false, bounciness: 0 }).start();
    },
  }), [dragY, sheetHeight]);

  const canDrag = draggable && (dismissible || Boolean(snapHeights && snapHeights.length > 1));
  const fixedHeight = !snapHeights && height !== 'auto' ? toPoints(height) : undefined;
  const handle = (
    <View
      {...(canDrag ? panResponder.panHandlers : {})}
      style={{ alignSelf: 'stretch', alignItems: 'center', paddingTop: theme.spacing.sm, paddingBottom: theme.spacing.xs }}
      {...(snapHeights && snapHeights.length > 1
        ? {
            accessible: true,
            accessibilityRole: 'adjustable' as const,
            accessibilityLabel: strings('resizeSheet'),
            accessibilityValue: { min: 1, max: snapHeights.length, now: snapIndex + 1 },
            accessibilityActions: [{ name: 'increment' }, { name: 'decrement' }],
            onAccessibilityAction: (event: { nativeEvent: { actionName: string } }) =>
              goTo(event.nativeEvent.actionName === 'increment' ? snapIndex + 1 : snapIndex - 1),
          }
        : { accessible: false, importantForAccessibility: 'no' as const })}
    >
      <Box
        width={theme.componentHeight.xl}
        height={theme.borderWidth.thick}
        radius="pill"
        internalStyle={{ backgroundColor: theme.color.border.primary }}
      />
    </View>
  );

  const body = scrollable
    ? <ScrollContainer keyboardShouldPersistTaps="handled">{children}</ScrollContainer>
    : <View style={snapHeights || fixedHeight !== undefined ? { flex: 1 } : undefined}>{children}</View>;

  return (
    <BaseModal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={dismissible ? onClose : undefined}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <KeyboardAvoidingView
        behavior="padding"
        // Scrim lives here so the keyboard padding area is dimmed too.
        style={{ flex: 1, backgroundColor: theme.color.overlay.scrim }}
        testID={testID ? `${testID}-keyboard-avoider` : undefined}
      >
        <Box flex={1} justifyContent="flex-end">
          {dismissible ? (
            <BasePressable
              accessible={false}
              importantForAccessibility="no-hide-descendants"
              minTouchTarget={false}
              onPress={onClose}
              baseStyle={{ flex: 1 }}
            >
              <Box flex={1} />
            </BasePressable>
          ) : null}
          <Animated.View
            accessibilityViewIsModal
            accessibilityLabel={accessibilityLabel ?? title}
            testID={testID}
            style={[
              {
                maxHeight: '90%',
                paddingHorizontal: theme.spacing.xxl,
                paddingBottom: bottomPadding,
                borderTopStartRadius: theme.radius.xl,
                borderTopEndRadius: theme.radius.xl,
                backgroundColor: theme.color.surface.elevated,
                transform: [{ translateY: dragY }],
              },
              snapHeights ? { height: sheetHeight, maxHeight: undefined } : null,
              fixedHeight !== undefined ? { height: fixedHeight } : null,
              theme.shadow.lg,
            ]}
          >
            {handle}
            <Stack gap="lg" {...(snapHeights || fixedHeight !== undefined ? { flex: 1 } : {})}>
              {title || dismissible ? (
                <Inline gap="md" alignItems="flex-start" paddingTop="sm">
                  <Stack flex={1} gap="xs">
                    {title ? <Heading title={title} level={4} /> : null}
                    {description ? <Text value={description} tone="secondary" /> : null}
                  </Stack>
                  {dismissible ? (
                    <IconButton
                      icon="close"
                      accessibilityLabel={closeAccessibilityLabel}
                      onPress={onClose}
                    />
                  ) : null}
                </Inline>
              ) : null}
              {body}
              {footer ? <View>{footer}</View> : null}
            </Stack>
          </Animated.View>
        </Box>
      </KeyboardAvoidingView>
    </BaseModal>
  );
});
