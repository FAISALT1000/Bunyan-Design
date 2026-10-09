import React, { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, View } from '../RNTheme';
import { Animated } from '../RNTheme/native';
import { useKeyboard, useSafeArea, useTheme } from '../../hooks';
import { logicalRow } from '../../utilities/styles';
import { Icon, type IconName } from '../Icon';
import { Text } from '../Text';
import { StatusIcon, type StatusKind } from '../../presets/status/StatusIcon';

export type ToastTone = 'neutral' | 'success' | 'warning' | 'error' | 'information';
export interface ToastOptions {
  message: string;
  /** Second line under the message. */
  subtitle?: string;
  tone?: ToastTone;
  /** Animated status mark instead of the tone icon. Pending toasts stay until updated. */
  status?: StatusKind;
  /** Milliseconds; `0` keeps the toast until dismissed. Default 5000 (0 for `status: 'pending'`). */
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastItem extends ToastOptions {
  id: number;
}

export interface ToastContextValue {
  showToast: (options: ToastOptions) => number;
  /** Changes a visible toast in place (e.g. pending → success) and restarts its timer. */
  updateToast: (id: number, options: Partial<ToastOptions>) => void;
  dismissToast: (id: number) => void;
}

const durationOf = (options: ToastOptions) => options.duration ?? (options.status === 'pending' ? 0 : 5000);

const ToastContext = createContext<ToastContextValue | null>(null);

export type ToastPlacement = 'top' | 'bottom';

export interface ToastProviderProps {
  children: React.ReactNode;
  maxVisible?: number;
  /**
   * Extra space between the toasts and the screen edge on top of the safe
   * area, e.g. the height of a bottom tab bar. Default `0`.
   */
  bottomOffset?: number;
  /** Screen edge the toasts stack from. Default `'bottom'`. */
  placement?: ToastPlacement;
  testID?: string;
}

export function ToastProvider({
  children,
  maxVisible = 3,
  bottomOffset = 0,
  placement = 'bottom',
  testID,
}: ToastProviderProps) {
  const { theme } = useTheme();
  const safeArea = useSafeArea();
  const keyboard = useKeyboard();
  // Bottom toasts clear the navigation bar / home indicator and the app's tab
  // bar; while the keyboard is open they sit just above it instead.
  const edgeStyle = placement === 'top'
    ? { top: safeArea.top + theme.spacing.xxl }
    : {
        bottom: keyboard.isVisible
          ? keyboard.height + theme.spacing.lg
          : safeArea.bottom + theme.spacing.xxl + bottomOffset,
      };
  const [items, setItems] = useState<ToastItem[]>([]);
  // Latest items for synchronous reads in updateToast.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismissToast = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setItems(current => current.filter(item => item.id !== id));
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    const id = ++nextId.current;
    itemsRef.current = [...itemsRef.current, { ...options, id }];
    setItems(current => {
      // `slice(-0)` would keep everything, so compute the kept count explicitly.
      const keep = Math.max(0, maxVisible - 1);
      const evicted = current.slice(0, Math.max(0, current.length - keep));
      evicted.forEach(item => {
        const timer = timers.current.get(item.id);
        if (timer) clearTimeout(timer);
        timers.current.delete(item.id);
      });
      return [...current.slice(current.length - Math.min(keep, current.length)), { ...options, id }];
    });
    const duration = durationOf(options);
    if (duration > 0) timers.current.set(id, setTimeout(() => dismissToast(id), duration));
    return id;
  }, [dismissToast, maxVisible]);

  const updateToast = useCallback((id: number, options: Partial<ToastOptions>) => {
    const existing = itemsRef.current.find(item => item.id === id);
    if (!existing) return;
    const merged: ToastItem = { ...existing, ...options, id };
    // A new status without an explicit duration uses that status' default.
    if (options.status && options.duration === undefined) delete merged.duration;
    itemsRef.current = itemsRef.current.map(item => (item.id === id ? merged : item));
    setItems(current => current.map(item => (item.id === id ? merged : item)));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    const duration = durationOf(merged);
    if (duration > 0) timers.current.set(id, setTimeout(() => dismissToast(id), duration));
  }, [dismissToast]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  const contextValue = useMemo(() => ({ showToast, updateToast, dismissToast }), [dismissToast, showToast, updateToast]);
  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <View
        pointerEvents="box-none"
        accessibilityLiveRegion="polite"
        {...(testID ? { testID } : {})}
        style={{
          position: 'absolute',
          start: theme.spacing.lg,
          end: theme.spacing.lg,
          ...edgeStyle,
          zIndex: theme.zIndex.toast,
          gap: theme.spacing.sm,
          alignItems: 'center',
        }}
      >
        {items.map(item => <ToastItemView key={item.id} item={item} onDismiss={() => dismissToast(item.id)} />)}
      </View>
    </ToastContext.Provider>
  );
}

const ToastItemView = memo(function ToastItemView({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const { theme, direction } = useTheme();
  const opacity = useRef(new Animated.Value(theme.opacity.invisible)).current;
  React.useEffect(() => {
    Animated.timing(opacity, { toValue: theme.opacity.opaque, duration: theme.motion.duration.normal, useNativeDriver: true }).start();
  }, [opacity, theme]);
  const icons: Record<ToastTone, IconName> = { neutral: 'info', success: 'success', warning: 'warning', error: 'error', information: 'info' };
  return (
    <Animated.View
      accessibilityRole={item.tone === 'error' || item.status === 'error' ? 'alert' : 'none'}
      style={[
        logicalRow(direction),
        {
          width: '100%',
          maxWidth: theme.breakpoint.medium,
          alignItems: 'center',
          gap: theme.spacing.md,
          padding: theme.spacing.lg,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.color.surface.inverse,
          opacity,
          ...theme.shadow.lg,
        },
      ]}
    >
      {item.status
        ? <StatusIcon status={item.status} size={theme.iconSize.xl} halo={false} />
        : <Icon name={icons[item.tone ?? 'neutral']} size="md" tone="inverse" />}
      <View style={{ flex: 1 }}>
        <Text value={item.message} tone="inverse" weight={item.subtitle ? 'semibold' : 'regular'} />
        {item.subtitle ? <Text value={item.subtitle} tone="inverse" variant="caption" /> : null}
      </View>
      {item.actionLabel && item.onAction ? (
        <Pressable accessibilityRole="button" onPress={item.onAction}>
          <Text value={item.actionLabel} tone="inverse" weight="semibold" />
        </Pressable>
      ) : null}
      <Pressable accessibilityRole="button" accessibilityLabel="Dismiss notification" onPress={onDismiss}>
        <Icon name="close" size="sm" tone="inverse" />
      </Pressable>
    </Animated.View>
  );
});

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
