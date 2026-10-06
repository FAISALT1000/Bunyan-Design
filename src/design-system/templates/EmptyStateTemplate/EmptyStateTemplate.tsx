import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
import { Button } from '../../components/Button';
import { Heading } from '../../components/Heading';
import { Icon } from '../../components/Icon';
import { Text } from '../../components/Text';
import { useTheme } from '../../hooks';
import { BaseScreenTemplate } from '../BaseScreenTemplate';
import type { EmptyStateTemplateProps } from './EmptyStateTemplate.types';
import { createEmptyStateTemplateStyles } from './EmptyStateTemplate.styles';

export const EmptyStateTemplate = memo(function EmptyStateTemplate({
  title,
  description,
  illustration,
  icon = 'info',
  primaryAction,
  secondaryAction,
  supportingContent,
  variant = 'fullScreen',
  testID,
}: EmptyStateTemplateProps) {
  const { theme } = useTheme();
  const styles = useMemo(
    () => createEmptyStateTemplateStyles(theme, variant),
    [theme, variant],
  );
  const content = (
    <View testID={testID} style={styles.container}>
      {illustration ? (
        <View style={styles.illustration}>{illustration}</View>
      ) : (
        <View style={styles.icon}>
          <Icon name={icon} size="xl" tone="secondary" />
        </View>
      )}
      <Heading
        title={title}
        level={variant === 'fullScreen' ? 3 : 4}
        align="center"
      />
      {description ? (
        <Text value={description} tone="secondary" align="center" />
      ) : null}
      {supportingContent}
      {primaryAction || secondaryAction ? (
        <View style={styles.actions}>
          {primaryAction ? (
            <Button title={primaryAction.label} onPress={primaryAction.onPress} />
          ) : null}
          {secondaryAction ? (
            <Button
              title={secondaryAction.label}
              variant="ghost"
              onPress={secondaryAction.onPress}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );

  return variant === 'fullScreen' ? (
    <BaseScreenTemplate scrollable={false} padding="none">{content}</BaseScreenTemplate>
  ) : content;
});
