import React, { memo, useEffect, useRef } from 'react';
import { Platform, Pressable, RNModal, ScrollView, StyleSheet, View, type ViewRef } from '../RNTheme';
import { useTheme } from '../../hooks';
import { logicalRow } from '../../utilities/styles';
import { Button, type ButtonVariant } from '../Button';
import { Heading } from '../Heading';
import { IconButton } from '../IconButton';
import { Text } from '../Text';

export interface ModalAction {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
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
  closeLabel?: string;
  testID?: string;
}

const renderAction = (action: ModalAction, fallbackVariant: ButtonVariant) => (
  <Button
    variant={action.variant ?? fallbackVariant}
    onPress={action.onPress}
    {...(action.disabled !== undefined ? { disabled: action.disabled } : {})}
    {...(action.loading !== undefined ? { loading: action.loading } : {})}
  >
    {action.label}
  </Button>
);

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
  closeLabel = 'Close modal',
  testID,
}: ModalProps) {
  const { theme, direction } = useTheme();
  const closeRef = useRef<ViewRef>(null);

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
      onRequestClose={() => {
        if (dismissible) onClose();
      }}
      statusBarTranslucent
    >
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing.lg,
          backgroundColor: theme.color.overlay.scrim,
        }}
      >
        {dismissible ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={closeLabel}
            onPress={onClose}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <View
          testID={testID}
          accessibilityViewIsModal
          aria-modal
          role="dialog"
          accessibilityLabel={title}
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
          <View style={[logicalRow(direction), { alignItems: 'flex-start', gap: theme.spacing.md }]}>
            <View style={{ flex: 1, gap: theme.spacing.xs }}>
              <Heading level={3}>{title}</Heading>
              {description ? <Text tone="secondary">{description}</Text> : null}
            </View>
            {dismissible ? <IconButton ref={closeRef} icon="close" accessibilityLabel={closeLabel} onPress={onClose} /> : null}
          </View>
          <ScrollView style={{ flexShrink: 1 }}>{children}</ScrollView>
          {primaryAction || secondaryAction ? (
            <View style={[logicalRow(direction), { justifyContent: 'flex-end', gap: theme.spacing.md, flexWrap: 'wrap' }]}>
              {secondaryAction ? renderAction(secondaryAction, 'ghost') : null}
              {primaryAction ? renderAction(primaryAction, 'primary') : null}
            </View>
          ) : null}
        </View>
      </View>
    </RNModal>
  );
});
