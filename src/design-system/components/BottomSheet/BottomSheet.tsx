import React, { memo } from 'react';
import { Box } from '../../base/Box';
import { Inline } from '../../base/Inline';
import { BaseModal } from '../../base/Modal';
import { BasePressable } from '../../base/Pressable';
import { ScrollContainer } from '../../base/ScrollContainer';
import { Stack } from '../../base/Stack';
import { useKeyboard, useSafeArea, useTheme } from '../../hooks';
import { KeyboardAvoidingView } from '../RNTheme';
import { Heading } from '../Heading';
import { IconButton } from '../IconButton';
import { Text } from '../Text';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  closeAccessibilityLabel?: string;
  accessibilityLabel?: string;
  testID?: string;
}

export const BottomSheet = memo(function BottomSheet({
  visible,
  onClose,
  title,
  description,
  children,
  dismissible = true,
  closeAccessibilityLabel = 'Close bottom sheet',
  accessibilityLabel,
  testID,
}: BottomSheetProps) {
  const { theme } = useTheme();
  const { bottom } = useSafeArea();
  const keyboard = useKeyboard();
  // Keep the last row above the home indicator / Android navigation bar.
  // While the keyboard is open it already covers that area.
  const bottomPadding = theme.spacing.xxl + (keyboard.isVisible ? 0 : bottom);

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
          <Box
            accessibilityViewIsModal
            accessibilityLabel={accessibilityLabel ?? title}
            testID={testID}
            maxHeight="90%"
            padding="xxl"
            internalStyle={[
              {
                paddingBottom: bottomPadding,
                borderTopStartRadius: theme.radius.xl,
                borderTopEndRadius: theme.radius.xl,
                backgroundColor: theme.color.surface.elevated,
              },
              theme.shadow.lg,
            ]}
          >
            <Stack gap="lg">
              <Box
                alignSelf="center"
                width={theme.componentHeight.xl}
                height={theme.borderWidth.thick}
                radius="pill"
                internalStyle={{ backgroundColor: theme.color.border.primary }}
              />
              <Inline gap="md" alignItems="flex-start">
                <Stack flex={1} gap="xs">
                  <Heading title={title} level={4} />
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
              <ScrollContainer keyboardShouldPersistTaps="handled">
                {children}
              </ScrollContainer>
            </Stack>
          </Box>
        </Box>
      </KeyboardAvoidingView>
    </BaseModal>
  );
});
