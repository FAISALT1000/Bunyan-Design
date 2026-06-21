import React, { memo } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
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
}

export const BottomSheet = memo(function BottomSheet({
  visible,
  onClose,
  title,
  description,
  children,
  dismissible = true,
}: BottomSheetProps) {
  const { theme, direction } = useTheme();
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={dismissible ? onClose : undefined} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: theme.color.overlay.scrim }}>
        {dismissible ? <Pressable accessibilityLabel="Close bottom sheet overlay" onPress={onClose} style={{ flex: 1 }} /> : null}
        <View
          accessibilityViewIsModal
          style={{
            maxHeight: '90%',
            padding: theme.spacing.xxl,
            gap: theme.spacing.lg,
            borderTopLeftRadius: theme.radius.xl,
            borderTopRightRadius: theme.radius.xl,
            backgroundColor: theme.color.surface.elevated,
            ...theme.shadow.lg,
          }}
        >
          <View style={{ alignSelf: 'center', width: theme.componentHeight.xl, height: theme.borderWidth.thick, borderRadius: theme.radius.pill, backgroundColor: theme.color.border.primary }} />
          <View style={{ flexDirection: direction === 'rtl' ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: theme.spacing.md }}>
            <View style={{ flex: 1 }}>
              <Heading level={4}>{title}</Heading>
              {description ? <Text tone="secondary">{description}</Text> : null}
            </View>
            {dismissible ? <IconButton icon="close" accessibilityLabel="Close bottom sheet" onPress={onClose} /> : null}
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
});
