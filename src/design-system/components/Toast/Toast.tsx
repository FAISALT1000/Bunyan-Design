import React, { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, View } from '../RNTheme';
import { useTheme } from '../../hooks';
import { logicalRow } from '../../utilities/styles';
import { Icon, type IconName } from '../Icon';
import { Text } from '../Text';

export type ToastTone = 'neutral' | 'success' | 'warning' | 'error' | 'information';
export interface ToastOptions {
  message: string;
  tone?: ToastTone;
  /** Milliseconds before auto-dismiss. `0` keeps the toast until dismissed. */
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastItem extends ToastOptions {
  id: number;
}

export interface ToastContextValue {
  showToast: (options: ToastOptions) => number;
  dismissToast: (id: number) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children: React.ReactNode;
  maxVisible?: number;
  defaultDuration?: number;
  dismissLabel?: string;
}

const icons: Record<ToastTone, IconName> = {
  neutral: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
  information: 'info',
};

export function ToastProvider({
  children,
  maxVisible = 3,
  defaultDuration = 5000,
  dismissLabel = 'Dismiss notification',
}: ToastProviderProps) {
  const { theme } = useTheme();
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const clearTimer = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const dismissToast = useCallback((id: number) => {
    clearTimer(id);
    setItems(current => current.filter(item => item.id !== id));
  }, [clearTimer]);

  const dismissAll = useCallback(() => {
    timers.current.forEach(timer => clearTimeout(timer));
    timers.current.clear();
    setItems([]);
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    const id = ++nextId.current;
    const limit = Math.max(1, Math.floor(maxVisible));
    setItems(current => {
      // Old bug: slice(-(maxVisible - 1)) became slice(-0) === slice(0) for maxVisible=1,
      // so nothing was ever evicted. Also clear timers of evicted toasts.
      const next = [...current, { ...options, id }];
      const evicted = next.slice(0, Math.max(0, next.length - limit));
      evicted.forEach(item => clearTimer(item.id));
      return next.slice(-limit);
    });
    const duration = options.duration ?? defaultDuration;
    if (duration > 0) timers.current.set(id, setTimeout(() => dismissToast(id), duration));
    return id;
  }, [clearTimer, defaultDuration, dismissToast, maxVisible]);

  // Clear pending timers on unmount to avoid state updates on an unmounted provider.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(timer => clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const contextValue = useMemo(() => ({ showToast, dismissToast, dismissAll }), [dismissAll, dismissToast, showToast]);
  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <View
        pointerEvents="box-none"
        accessibilityLiveRegion="polite"
        style={{
          position: 'absolute',
          start: theme.spacing.lg,
          end: theme.spacing.lg,
          bottom: theme.spacing.xxl,
          zIndex: theme.zIndex.toast,
          gap: theme.spacing.sm,
          alignItems: 'center',
        }}
      >
        {items.map(item => (
          <ToastItemView key={item.id} item={item} dismissLabel={dismissLabel} onDismiss={dismissToast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

const ToastItemView = memo(function ToastItemView({
  item,
  dismissLabel,
  onDismiss,
}: {
  item: ToastItem;
  dismissLabel: string;
  onDismiss: (id: number) => void;
}) {
  const { theme, direction } = useTheme();
  const opacity = useRef(new Animated.Value(theme.opacity.invisible)).current;
  useEffect(() => {
    const animation = Animated.timing(opacity, {
      toValue: theme.opacity.opaque,
      duration: theme.motion.duration.normal,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [opacity, theme.motion.duration.normal, theme.opacity.opaque]);
  const urgent = item.tone === 'error' || item.tone === 'warning';
  return (
    <Animated.View
      accessibilityRole={urgent ? 'alert' : 'none'}
      accessibilityLiveRegion={urgent ? 'assertive' : 'polite'}
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
      <Icon name={icons[item.tone ?? 'neutral']} size="md" tone="inverse" />
      <Text tone="inverse" style={{ flex: 1 }}>{item.message}</Text>
      {item.actionLabel && item.onAction ? (
        <Pressable
          accessibilityRole="button"
          hitSlop={theme.spacing.sm}
          onPress={() => {
            item.onAction?.();
            onDismiss(item.id);
          }}
        >
          <Text tone="inverse" weight="semibold">{item.actionLabel}</Text>
        </Pressable>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={dismissLabel}
        hitSlop={theme.spacing.md}
        onPress={() => onDismiss(item.id)}
      >
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
