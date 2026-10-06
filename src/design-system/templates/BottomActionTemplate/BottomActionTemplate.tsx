import React, { memo, useMemo } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { useTheme } from '../../hooks';
import type { BottomActionTemplateProps } from './BottomActionTemplate.types';
import { createBottomActionTemplateStyles } from './BottomActionTemplate.styles';

export const BottomActionTemplate = memo(function BottomActionTemplate({
  primaryAction,
  secondaryAction,
  children,
  layout = 'stacked',
  safeArea = true,
  keyboardAware = true,
  testID,
}: BottomActionTemplateProps) {
  const { theme, direction } = useTheme();
  const styles = useMemo(
    () => createBottomActionTemplateStyles(theme, direction, layout),
    [direction, layout, theme],
  );
  const actions = (
    <View testID={testID} style={styles.container}>
      {children ? <View style={styles.content}>{children}</View> : null}
      {secondaryAction ? (
        <View style={styles.action}>
          <Button
            title={secondaryAction.label}
            fullWidth
            variant={secondaryAction.variant ?? 'outline'}
            onPress={secondaryAction.onPress}
            {...(secondaryAction.disabled !== undefined
              ? { disabled: secondaryAction.disabled }
              : {})}
            {...(secondaryAction.loading !== undefined
              ? { loading: secondaryAction.loading }
              : {})}
            {...(secondaryAction.accessibilityLabel
              ? { accessibilityLabel: secondaryAction.accessibilityLabel }
              : {})}
          />
        </View>
      ) : null}
      <View style={styles.action}>
        <Button
          title={primaryAction.label}
          fullWidth
          variant={primaryAction.variant ?? 'primary'}
          onPress={primaryAction.onPress}
          {...(primaryAction.disabled !== undefined
            ? { disabled: primaryAction.disabled }
            : {})}
          {...(primaryAction.loading !== undefined
            ? { loading: primaryAction.loading }
            : {})}
          {...(primaryAction.accessibilityLabel
            ? { accessibilityLabel: primaryAction.accessibilityLabel }
            : {})}
        />
      </View>
    </View>
  );
  const keyboardContent = keyboardAware ? (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {actions}
    </KeyboardAvoidingView>
  ) : actions;

  return safeArea ? (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      {keyboardContent}
    </SafeAreaView>
  ) : keyboardContent;
});
