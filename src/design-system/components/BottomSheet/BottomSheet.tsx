import React, { memo } from 'react';
import { KeyboardAvoidingView, Pressable, RNModal, ScrollView, StyleSheet, View } from '../RNTheme';
import { useTheme } from '../../hooks';
import { logicalRow } from '../../utilities/styles';
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
  closeLabel?: string;
  testID?: string;
}

export const BottomSheet = memo(function BottomSheet({
  visible,
  onClose,
  title,
  description,
  children,
  dismissible = true,
  closeLabel = 'Close bottom sheet',
  testID,
}: BottomSheetProps) {
  const { theme, direction } = useTheme();
  return (
    <RNModal
      transparent
      visible={visible}
      animationType="slide"
      // Android back button: always handled so it never closes a non-dismissible sheet by default.
      onRequestClose={() => {
        if (dismissible) onClose();
      }}
      statusBarTranslucent
    >
      {/* Lifts the sheet above the keyboard (e.g. searchable Select). */}
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: theme.color.overlay.scrim }}>
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
            <View style={[logicalRow(direction), { alignItems: 'flex-start', gap: theme.spacing.md }]}>
              <View style={{ flex: 1 }}>
                <Heading level={4}>{title}</Heading>
                {description ? <Text tone="secondary">{description}</Text> : null}
              </View>
              {dismissible ? <IconButton icon="close" accessibilityLabel={closeLabel} onPress={onClose} /> : null}
            </View>
            {/* flexShrink lets long content scroll inside the 90% sheet instead of overflowing it. */}
            <ScrollView style={{ flexShrink: 1 }}>{children}</ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
});
