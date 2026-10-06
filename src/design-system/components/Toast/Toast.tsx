import React, { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, View } from '../RNTheme';
import { Animated } from '../RNTheme/native';
import { useTheme } from '../../hooks';
import { logicalRow } from '../../utilities/styles';
import { Icon, type IconName } from '../Icon';
import { Text } from '../Text';

export type ToastTone = 'neutral' | 'success' | 'warning' | 'error' | 'information';
export interface ToastOptions {
  message: string;
  tone?: ToastTone;
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
}

const ToastContext = createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children: React.ReactNode;
  maxVisible?: number;
}

export function ToastProvider({ children, maxVisible = 3 }: ToastProviderProps) {
  const { theme } = useTheme();
  const [items, setItems] = useState<ToastItem[]>([]);
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
    const duration = options.duration ?? 5000;
    if (duration > 0) timers.current.set(id, setTimeout(() => dismissToast(id), duration));
    return id;
  }, [dismissToast, maxVisible]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  const contextValue = useMemo(() => ({ showToast, dismissToast }), [dismissToast, showToast]);
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
      accessibilityRole={item.tone === 'error' ? 'alert' : 'none'}
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
      <View style={{ flex: 1 }}>
        <Text value={item.message} tone="inverse" />
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
