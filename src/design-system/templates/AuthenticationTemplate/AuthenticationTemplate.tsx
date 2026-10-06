import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { Heading } from '../../components/Heading';
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
          <Heading title={title} level={2} align="center" />
          {description ? (
            <Text value={description} tone="secondary" align="center" />
          ) : null}
        </View>
        {error ? <Alert tone="error" title={error} /> : null}
        <View style={styles.form}>{form}</View>
        {primaryAction || biometricAction || secondaryActions.length > 0 ? (
          <View style={styles.actions}>
            {primaryAction ? (
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
              />
            ) : null}
            {biometricAction ? (
              <Button
                title={biometricAction.label}
                fullWidth
                variant={biometricAction.variant ?? 'outline'}
                onPress={biometricAction.onPress}
                {...(biometricAction.disabled !== undefined
                  ? { disabled: biometricAction.disabled }
                  : {})}
              />
            ) : null}
            {secondaryActions.length > 0 ? (
              <View style={styles.secondaryActions}>
                {secondaryActions.map(action => (
                  <Button
                    key={action.label}
                    title={action.label}
                    variant="link"
                    actionType="navigation"
                    onPress={action.onPress}
                  />
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
