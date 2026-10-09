import React, { memo } from 'react';
import { Box } from '../../base/Box';
import { Inline } from '../../base/Inline';
import { BaseModal } from '../../base/Modal';
import { BasePressable } from '../../base/Pressable';
import { ScrollContainer } from '../../base/ScrollContainer';
import { Stack } from '../../base/Stack';
import { useSafeArea, useTheme } from '../../hooks';
import { useText, type TextValue } from '../../i18n';
import { Button } from '../../components/Button';
import { IconButton } from '../../components/IconButton';
import { Text } from '../../components/Text';
import { useActionButton } from '../cards/ValueCards';
import type { PresetAction } from '../shared';
import { StatusIcon, statusColors, type StatusKind } from './StatusIcon';

interface StatusContentProps {
  status: StatusKind;
  title: TextValue;
  subtitle?: TextValue;
  /** Your own content, rendered between the subtitle and the buttons. */
  children?: React.ReactNode;
  primaryAction?: PresetAction;
  secondaryAction?: PresetAction;
  /** Default true. */
  animated?: boolean;
  /** Replaces the built-in icon, e.g. a Lottie view. */
  animation?: React.ReactNode;
  /** Success / error notification haptic. Default true. */
  haptics?: boolean;
  onAnimationEnd?: () => void;
  testID?: string;
}

export type StatusScreenProps = StatusContentProps;

function StatusBody({
  status,
  title,
  subtitle,
  children,
  animated = true,
  animation,
  haptics = true,
  onAnimationEnd,
  iconSize,
  testID,
}: StatusContentProps & { iconSize: number }) {
  const t = useText();
  const titleText = t(title) ?? '';
  const subtitleText = t(subtitle);
  return (
    <Stack gap="md" alignItems="center">
      {animation ?? (
        <StatusIcon
          status={status}
          size={iconSize}
          animated={animated}
          haptics={haptics}
          {...(onAnimationEnd ? { onAnimationEnd } : {})}
          {...(testID ? { testID: `${testID}-icon` } : {})}
        />
      )}
      <Stack gap="xs" alignItems="center">
        <Text
          value={titleText}
          variant="headingMedium"
          weight="bold"
          align="center"
          accessibilityRole="header"
          accessibilityLiveRegion={status === 'error' ? 'assertive' : 'polite'}
        />
        {subtitleText ? <Text value={subtitleText} variant="bodyMedium" tone="secondary" align="center" /> : null}
      </Stack>
      {children ? <Box width="100%">{children}</Box> : null}
    </Stack>
  );
}

function StatusButtons({ primaryAction, secondaryAction }: Pick<StatusContentProps, 'primaryAction' | 'secondaryAction'>) {
  const renderAction = useActionButton();
  if (!primaryAction && !secondaryAction) return null;
  return (
    <Stack gap="sm">
      {primaryAction ? renderAction(primaryAction, { fullWidth: true }) : null}
      {secondaryAction ? renderAction({ variant: 'ghost', ...secondaryAction }, { fullWidth: true }) : null}
    </Stack>
  );
}

/**
 * Full-screen result for success, error and pending.
 *
 * ```tsx
 * <StatusScreen status={state} title="Transfer sent" subtitle="1,250.00 SAR to Ahmed"
 *   primaryAction={{ title: 'Done', onPress: goHome }}
 *   secondaryAction={{ title: 'Share receipt', onPress: share }}>
 *   <DetailsCard rows={[{ label: 'Reference', value: 'TRX-482193' }]} />
 * </StatusScreen>
 * ```
 */
export const StatusScreen = memo(function StatusScreen(props: StatusScreenProps) {
  const { theme } = useTheme();
  const { top, bottom } = useSafeArea();
  return (
    <Box
      flex={1}
      {...(props.testID ? { testID: props.testID } : {})}
      internalStyle={{
        backgroundColor: theme.color.background.primary,
        paddingTop: top + theme.spacing.xl,
        paddingBottom: bottom + theme.spacing.lg,
        paddingHorizontal: theme.spacing.xl,
      }}
    >
      <ScrollContainer paddingVertical="xl" contentInternalStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <StatusBody {...props} iconSize={88} />
      </ScrollContainer>
      <StatusButtons {...props} />
    </Box>
  );
});

export interface StatusModalProps extends StatusContentProps {
  visible: boolean;
  /** Back button / backdrop. Not called while pending unless `dismissible` is true. */
  onClose?: () => void;
  /** Default: true for success / error, false for pending. */
  dismissible?: boolean;
  /** Show a close (X) button. Default false. */
  showClose?: boolean;
}

/** The same status content in a dialog over the current screen. */
export const StatusModal = memo(function StatusModal({ visible, onClose, dismissible, showClose = false, ...props }: StatusModalProps) {
  const { theme } = useTheme();
  const canDismiss = (dismissible ?? props.status !== 'pending') && Boolean(onClose);
  return (
    <BaseModal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={canDismiss ? onClose : () => undefined}
    >
      <Box flex={1} justifyContent="center" padding="xl" internalStyle={{ backgroundColor: theme.color.overlay.scrim }}>
        {canDismiss ? (
          <BasePressable
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            minTouchTarget={false}
            onPress={onClose}
            baseStyle={{ position: 'absolute', top: 0, bottom: 0, start: 0, end: 0 }}
          >
            <Box flex={1} />
          </BasePressable>
        ) : null}
        <Box
          accessibilityViewIsModal
          {...(props.testID ? { testID: props.testID } : {})}
          internalStyle={[
            {
              backgroundColor: theme.color.surface.elevated,
              borderRadius: theme.radius.xl,
              padding: theme.spacing.xl,
              gap: theme.spacing.lg,
            },
            theme.shadow.lg,
          ]}
        >
          {showClose && canDismiss ? (
            <Box alignSelf="flex-end" internalStyle={{ marginBottom: -theme.spacing.lg }}>
              <IconButton icon="close" size="small" tone="secondary" accessibilityLabel="Close" onPress={() => onClose?.()} />
            </Box>
          ) : null}
          <StatusBody {...props} iconSize={64} />
          <StatusButtons {...props} />
        </Box>
      </Box>
    </BaseModal>
  );
});

export interface StatusBannerProps {
  status: StatusKind;
  title: TextValue;
  subtitle?: TextValue;
  action?: { title: TextValue; onPress: () => void };
  /** Adds a close button. */
  onDismiss?: () => void;
  animated?: boolean;
  testID?: string;
}

/**
 * Inline status bar at the top of a screen or section ("No internet connection").
 * Named Banner so it does not clash with React Native's StatusBar.
 */
export const StatusBanner = memo(function StatusBanner({ status, title, subtitle, action, onDismiss, animated = true, testID }: StatusBannerProps) {
  const { theme } = useTheme();
  const t = useText();
  const colors = statusColors(theme, status);
  return (
    <Box
      {...(testID ? { testID } : {})}
      accessibilityRole={status === 'error' ? 'alert' : 'summary'}
      paddingHorizontal="md"
      paddingVertical="sm"
      radius="md"
      internalStyle={{ backgroundColor: colors.halo }}
    >
      <Inline gap="sm" alignItems="center">
        <StatusIcon status={status} size={20} halo={false} animated={animated} />
        <Stack flex={1} gap="none">
          <Text value={t(title) ?? ''} variant="bodySmall" weight="semibold" />
          {subtitle ? <Text value={t(subtitle) ?? ''} variant="caption" tone="secondary" /> : null}
        </Stack>
        {action ? <Button title={t(action.title) ?? ''} variant="link" size="small" onPress={action.onPress} /> : null}
        {onDismiss ? <IconButton icon="close" size="small" tone="secondary" accessibilityLabel="Dismiss" onPress={onDismiss} /> : null}
      </Inline>
    </Box>
  );
});
