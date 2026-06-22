import React, { memo, useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heading } from '../../components/Heading';
import { IconButton } from '../../components/IconButton';
import { Spinner } from '../../components/Spinner';
import { Text } from '../../components/Text';
import { useTheme } from '../../hooks';
import { renderScreenState } from '../utilities';
import type { BaseScreenTemplateProps } from './BaseScreenTemplate.types';
import { createBaseScreenTemplateStyles } from './BaseScreenTemplate.styles';

export const BaseScreenTemplate = memo(function BaseScreenTemplate({
  children,
  header,
  title,
  subtitle,
  showBackButton = false,
  backLabel = 'Go back',
  onBack,
  headerLeft,
  headerRight,
  scrollable = true,
  keyboardAvoiding = true,
  keyboardBehavior,
  keyboardVerticalOffset = 0,
  loading = false,
  loadingLabel = 'Loading',
  state = { type: 'content' },
  errorBanner,
  bottomContent,
  footer,
  stickyFooter = true,
  background = 'primary',
  padding = 'comfortable',
  safeArea = true,
  statusBar,
  refreshControl,
  contentAccessibilityLabel,
  testID,
}: BaseScreenTemplateProps) {
  const { theme, direction } = useTheme();
  const styles = useMemo(
    () => createBaseScreenTemplateStyles(theme, direction, background, padding),
    [background, direction, padding, theme],
  );
  const resolvedHeader = {
    title: header?.title ?? title,
    subtitle: header?.subtitle ?? subtitle,
    showBackButton: header?.showBackButton ?? showBackButton,
    backLabel: header?.backLabel ?? backLabel,
    onBack: header?.onBack ?? onBack,
    leading: header?.leading ?? headerLeft,
    actions: header?.actions ?? headerRight,
  };
  const hasHeader = Boolean(
    resolvedHeader.title ||
      resolvedHeader.subtitle ||
      resolvedHeader.showBackButton ||
      resolvedHeader.leading ||
      resolvedHeader.actions,
  );
  const resolvedKeyboardBehavior =
    keyboardBehavior ?? (Platform.OS === 'ios' ? 'padding' : undefined);
  const statusBarStyle =
    statusBar?.style ?? (theme.mode === 'light' ? 'dark-content' : 'light-content');

  const content =
    state.type === 'content' ? (
      <View
        {...(contentAccessibilityLabel
          ? { accessible: true, accessibilityLabel: contentAccessibilityLabel }
          : {})}
        style={styles.content}
      >
        {errorBanner}
        {children}
      </View>
    ) : (
      <View style={styles.state}>{renderScreenState(state, theme)}</View>
    );

  const body = scrollable ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      refreshControl={refreshControl}
    >
      {content}
    </ScrollView>
  ) : (
    <View style={styles.fixedContent}>{content}</View>
  );

  const screen = (
    <View testID={testID} style={styles.screen}>
      <StatusBar
        barStyle={statusBarStyle}
        hidden={statusBar?.hidden}
        animated={statusBar?.animated}
        backgroundColor={background === 'secondary'
          ? theme.color.background.secondary
          : theme.color.background.primary}
      />
      {hasHeader ? (
        <View style={styles.header}>
          {resolvedHeader.showBackButton && resolvedHeader.onBack ? (
            <IconButton
              icon="chevron-left"
              accessibilityLabel={resolvedHeader.backLabel}
              onPress={resolvedHeader.onBack}
            />
          ) : resolvedHeader.leading}
          <View style={styles.headerTitles}>
            {resolvedHeader.title ? (
              <Heading title={resolvedHeader.title} level={4} />
            ) : null}
            {resolvedHeader.subtitle ? (
              <Text
                value={resolvedHeader.subtitle}
                variant="bodySmall"
                tone="secondary"
              />
            ) : null}
          </View>
          {resolvedHeader.actions ? (
            <View style={styles.headerActions}>{resolvedHeader.actions}</View>
          ) : null}
        </View>
      ) : null}
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={resolvedKeyboardBehavior}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          {body}
          {bottomContent ? <View style={styles.bottomContent}>{bottomContent}</View> : null}
          {footer ? <View style={stickyFooter ? styles.footer : undefined}>{footer}</View> : null}
        </KeyboardAvoidingView>
      ) : (
        <>
          {body}
          {bottomContent ? <View style={styles.bottomContent}>{bottomContent}</View> : null}
          {footer ? <View style={stickyFooter ? styles.footer : undefined}>{footer}</View> : null}
        </>
      )}
      {loading ? (
        <View
          accessible
          accessibilityViewIsModal
          accessibilityRole="progressbar"
          accessibilityLabel={loadingLabel}
          style={styles.loadingOverlay}
        >
          <Spinner
            size="large"
            label={loadingLabel}
            tone="inverse"
            accessible={false}
          />
        </View>
      ) : null}
    </View>
  );

  return safeArea ? (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      {screen}
    </SafeAreaView>
  ) : screen;
});
