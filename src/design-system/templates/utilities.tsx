import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Spinner } from '../components/Spinner';
import { Text } from '../components/Text';
import type { Theme } from '../themes';
import type {
  ScreenState,
  TemplateAction,
  TemplateBackground,
  TemplatePadding,
} from './types';

export const backgroundFor = (theme: Theme, background: TemplateBackground) => {
  if (background === 'secondary') return theme.color.background.secondary;
  if (background === 'surface') return theme.color.surface.primary;
  return theme.color.background.primary;
};

export const paddingFor = (theme: Theme, padding: TemplatePadding) => {
  if (padding === 'none') return theme.spacing.none;
  if (padding === 'compact') return theme.spacing.lg;
  return theme.spacing.xxl;
};

export function actionButton(action: TemplateAction, fullWidth = false) {
  return (
    <Button
      key={action.label}
      title={action.label}
      variant={action.variant ?? 'primary'}
      fullWidth={fullWidth}
      onPress={action.onPress}
      {...(action.disabled !== undefined ? { disabled: action.disabled } : {})}
      {...(action.loading !== undefined ? { loading: action.loading } : {})}
      {...(action.accessibilityLabel
        ? { accessibilityLabel: action.accessibilityLabel }
        : {})}
    />
  );
}

export function renderScreenState(
  state: Exclude<ScreenState, { type: 'content' }>,
  theme: Theme,
) {
  const styles = StyleSheet.create({
    loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xxxl,
    },
    error: {
      gap: theme.spacing.md,
    },
  });

  if (state.type === 'loading') {
    return (
      <View style={styles.loading}>
        <Spinner size="large" label={state.label ?? 'Loading'} />
      </View>
    );
  }

  if (state.type === 'empty') {
    return (
      <EmptyState
        title={state.title}
        {...(state.description ? { description: state.description } : {})}
        {...(state.action
          ? {
              actionLabel: state.action.label,
              onAction: state.action.onPress,
            }
          : {})}
      />
    );
  }

  if (state.type === 'error') {
    return (
      <View style={styles.error}>
        <ErrorState
          title={state.title ?? 'Something went wrong'}
          description={state.message}
          {...(state.retryAction
            ? {
                retryLabel: state.retryAction.label,
                onRetry: state.retryAction.onPress,
              }
            : {})}
        />
        {state.referenceCode ? (
          <Text
            value={`Reference: ${state.referenceCode}`}
            variant="caption"
            tone="tertiary"
            align="center"
          />
        ) : null}
      </View>
    );
  }

  return (
    <EmptyState
      title={state.title}
      {...(state.description ? { description: state.description } : {})}
      icon="success"
    />
  );
}
