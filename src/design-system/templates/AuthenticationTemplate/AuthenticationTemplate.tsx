import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { Heading } from '../../components/Heading';
import { Link } from '../../components/Link';
import { Text } from '../../components/Text';
import { useTheme } from '../../hooks';
import { BaseScreenTemplate } from '../BaseScreenTemplate';
import type { AuthenticationTemplateProps } from './AuthenticationTemplate.types';
import { createAuthenticationTemplateStyles } from './AuthenticationTemplate.styles';

export const AuthenticationTemplate = memo(function AuthenticationTemplate({
  mode,
  title,
  description,
  logo,
  form,
  error,
  primaryAction,
  secondaryActions = [],
  biometricAction,
  footer,
  loading = false,
  onBack,
  background = 'primary',
  testID,
}: AuthenticationTemplateProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createAuthenticationTemplateStyles(theme), [theme]);

  return (
    <BaseScreenTemplate
      testID={testID}
      showBackButton={Boolean(onBack)}
      onBack={onBack}
      scrollable
      keyboardAvoiding
      loading={loading}
      background={background}
      contentAccessibilityLabel={`${mode} authentication`}
    >
      <View style={styles.content}>
        {logo ? <View style={styles.logo}>{logo}</View> : null}
        <View style={styles.heading}>
          <Heading level={2} align="center">{title}</Heading>
          {description ? <Text tone="secondary" align="center">{description}</Text> : null}
        </View>
        {error ? <Alert tone="error" title={error} /> : null}
        <View style={styles.form}>{form}</View>
        {primaryAction || biometricAction || secondaryActions.length > 0 ? (
          <View style={styles.actions}>
            {primaryAction ? (
              <Button
                fullWidth
                variant={primaryAction.variant ?? 'primary'}
                onPress={primaryAction.onPress}
                {...(primaryAction.disabled !== undefined
                  ? { disabled: primaryAction.disabled }
                  : {})}
                {...(primaryAction.loading !== undefined
                  ? { loading: primaryAction.loading }
                  : {})}
              >
                {primaryAction.label}
              </Button>
            ) : null}
            {biometricAction ? (
              <Button
                fullWidth
                variant={biometricAction.variant ?? 'outline'}
                onPress={biometricAction.onPress}
                {...(biometricAction.disabled !== undefined
                  ? { disabled: biometricAction.disabled }
                  : {})}
              >
                {biometricAction.label}
              </Button>
            ) : null}
            {secondaryActions.length > 0 ? (
              <View style={styles.secondaryActions}>
                {secondaryActions.map(action => (
                  <Link key={action.label} onPress={action.onPress}>{action.label}</Link>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </BaseScreenTemplate>
  );
});
