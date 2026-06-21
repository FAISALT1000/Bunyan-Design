import React, { memo, useEffect, useRef } from 'react';
import {
  Modal as RNModal,
  Platform,
  Pressable,
  ScrollView,
  View,
  type View as ViewType,
} from 'react-native';
import { useTheme } from '../../hooks';
import { Button } from '../Button';
import { Heading } from '../Heading';
import { IconButton } from '../IconButton';
import { Text } from '../Text';

export interface ModalAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
  dismissible?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const Modal = memo(function Modal({
  visible,
  onClose,
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  dismissible = true,
  size = 'medium',
}: ModalProps) {
  const { theme, direction } = useTheme();
  const closeRef = useRef<ViewType>(null);

  useEffect(() => {
    if (visible && Platform.OS === 'web') {
      const timer = setTimeout(() => closeRef.current?.focus?.(), theme.motion.duration.fast);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [theme.motion.duration.fast, visible]);

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismissible ? onClose : undefined}
      statusBarTranslucent
    >
      <View
        accessibilityViewIsModal
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing.lg,
          backgroundColor: theme.color.overlay.scrim,
        }}
      >
        {dismissible ? (
          <Pressable accessibilityLabel="Close modal overlay" onPress={onClose} style={{ position: 'absolute', inset: theme.spacing.none }} />
        ) : null}
        <View
          accessibilityRole="none"
          style={{
            width: '100%',
            maxWidth: size === 'small' ? theme.breakpoint.medium : size === 'large' ? theme.breakpoint.expanded : theme.breakpoint.medium + theme.spacing.huge,
            maxHeight: '90%',
            backgroundColor: theme.color.surface.elevated,
            borderRadius: theme.radius.xl,
            padding: theme.spacing.xxl,
            gap: theme.spacing.lg,
            ...theme.shadow.lg,
          }}
        >
          <View style={{ flexDirection: direction === 'rtl' ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: theme.spacing.md }}>
            <View style={{ flex: 1, gap: theme.spacing.xs }}>
              <Heading level={3}>{title}</Heading>
              {description ? <Text tone="secondary">{description}</Text> : null}
            </View>
            {dismissible ? <IconButton ref={closeRef} icon="close" accessibilityLabel="Close modal" onPress={onClose} /> : null}
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
          {primaryAction || secondaryAction ? (
            <View style={{ flexDirection: direction === 'rtl' ? 'row-reverse' : 'row', justifyContent: 'flex-end', gap: theme.spacing.md, flexWrap: 'wrap' }}>
              {secondaryAction ? <Button {...secondaryAction} variant={secondaryAction.variant ?? 'ghost'}>{secondaryAction.label}</Button> : null}
              {primaryAction ? <Button {...primaryAction} variant={primaryAction.variant ?? 'primary'}>{primaryAction.label}</Button> : null}
            </View>
          ) : null}
        </View>
      </View>
    </RNModal>
  );
});
