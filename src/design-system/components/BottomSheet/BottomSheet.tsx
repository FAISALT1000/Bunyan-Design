import React, { memo } from 'react';
import { Box } from '../../base/Box';
import { Inline } from '../../base/Inline';
import { BaseModal } from '../../base/Modal';
import { BasePressable } from '../../base/Pressable';
import { ScrollContainer } from '../../base/ScrollContainer';
import { Stack } from '../../base/Stack';
import { useTheme } from '../../hooks';
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

  return (
    <BaseModal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={dismissible ? onClose : undefined}
      statusBarTranslucent
    >
      <Box
        flex={1}
        justifyContent="flex-end"
        internalStyle={{ backgroundColor: theme.color.overlay.scrim }}
      >
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
    </BaseModal>
  );
});
