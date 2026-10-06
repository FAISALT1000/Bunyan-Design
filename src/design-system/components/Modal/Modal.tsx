import React, { memo, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { BaseModal } from '../../base/Modal';
import {
  BasePressable,
  type BasePressableHandle,
} from '../../base/Pressable';
import { Box } from '../../base/Box';
import { Inline } from '../../base/Inline';
import { ScrollContainer } from '../../base/ScrollContainer';
import { Stack } from '../../base/Stack';
import { useTheme } from '../../hooks';
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
  closeAccessibilityLabel?: string;
  accessibilityLabel?: string;
  testID?: string;
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
  closeAccessibilityLabel = 'Close modal',
  accessibilityLabel,
  testID,
}: ModalProps) {
  const { theme } = useTheme();
  const closeRef = useRef<BasePressableHandle>(null);

  useEffect(() => {
    if (visible && dismissible && Platform.OS === 'web') {
      const timer = setTimeout(
        () => closeRef.current?.focus?.(),
        theme.motion.duration.fast,
      );
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [dismissible, theme.motion.duration.fast, visible]);

  const maxWidth = size === 'small'
    ? theme.breakpoint.medium
    : size === 'large'
      ? theme.breakpoint.expanded
      : theme.breakpoint.medium + theme.spacing.huge;

  return (
    <BaseModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismissible ? onClose : undefined}
      statusBarTranslucent
    >
      <Box
        flex={1}
        alignItems="center"
        justifyContent="center"
        padding="lg"
        internalStyle={{ backgroundColor: theme.color.overlay.scrim }}
      >
        {dismissible ? (
          <BasePressable
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            minTouchTarget={false}
            onPress={onClose}
            baseStyle={{
              position: 'absolute',
              top: theme.spacing.none,
              bottom: theme.spacing.none,
              start: theme.spacing.none,
              end: theme.spacing.none,
            }}
          >
            <Box flex={1} />
          </BasePressable>
        ) : null}
        <Box
          accessibilityViewIsModal
          accessibilityLabel={accessibilityLabel ?? title}
          testID={testID}
          width="100%"
          maxWidth={maxWidth}
          maxHeight="90%"
          padding="xxl"
          radius="xl"
          internalStyle={[
            { backgroundColor: theme.color.surface.elevated },
            theme.shadow.lg,
          ]}
        >
          <Stack gap="lg">
            <Inline gap="md" alignItems="flex-start">
              <Stack flex={1} gap="xs">
                <Heading title={title} level={3} />
                {description ? <Text value={description} tone="secondary" /> : null}
              </Stack>
              {dismissible ? (
                <IconButton
                  ref={closeRef}
                  icon="close"
                  accessibilityLabel={closeAccessibilityLabel}
                  onPress={onClose}
                />
              ) : null}
            </Inline>
            <ScrollContainer keyboardShouldPersistTaps="handled">
              {children}
            </ScrollContainer>
            {primaryAction || secondaryAction ? (
              <Inline
                gap="md"
                justifyContent="flex-end"
                flexWrap="wrap"
              >
                {secondaryAction ? (
                  <Button
                    title={secondaryAction.label}
                    onPress={secondaryAction.onPress}
                    variant={secondaryAction.variant ?? 'ghost'}
                    {...(secondaryAction.disabled !== undefined
                      ? { disabled: secondaryAction.disabled }
                      : {})}
                    {...(secondaryAction.loading !== undefined
                      ? { loading: secondaryAction.loading }
                      : {})}
                  />
                ) : null}
                {primaryAction ? (
                  <Button
                    title={primaryAction.label}
                    onPress={primaryAction.onPress}
                    variant={primaryAction.variant ?? 'primary'}
                    {...(primaryAction.disabled !== undefined
                      ? { disabled: primaryAction.disabled }
                      : {})}
                    {...(primaryAction.loading !== undefined
                      ? { loading: primaryAction.loading }
                      : {})}
                  />
                ) : null}
              </Inline>
            ) : null}
          </Stack>
        </Box>
      </Box>
    </BaseModal>
  );
});
