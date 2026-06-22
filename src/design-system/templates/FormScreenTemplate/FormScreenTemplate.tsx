import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
import { Alert } from '../../components/Alert';
import { Card } from '../../components/Card';
import { Heading } from '../../components/Heading';
import { Text } from '../../components/Text';
import { useTheme } from '../../hooks';
import { BaseScreenTemplate } from '../BaseScreenTemplate';
import { BottomActionTemplate } from '../BottomActionTemplate';
import type { FormScreenTemplateProps } from './FormScreenTemplate.types';
import { createFormScreenTemplateStyles } from './FormScreenTemplate.styles';

export const FormScreenTemplate = memo(function FormScreenTemplate({
  title,
  subtitle,
  sections,
  submitLabel,
  onSubmit,
  secondaryAction,
  validationSummary = [],
  unsavedChanges = false,
  unsavedChangesMessage = 'You have unsaved changes.',
  loading = false,
  submitDisabled = false,
  state = { type: 'content' },
  onBack,
  headerRight,
  requiredLabel = 'Required',
  testID,
}: FormScreenTemplateProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createFormScreenTemplateStyles(theme), [theme]);
  const footer = (
    <BottomActionTemplate
      primaryAction={{
        label: submitLabel,
        onPress: onSubmit,
        loading,
        disabled: submitDisabled,
      }}
      {...(secondaryAction ? { secondaryAction } : {})}
    />
  );

  return (
    <BaseScreenTemplate
      testID={testID}
      title={title}
      subtitle={subtitle}
      showBackButton={Boolean(onBack)}
      onBack={onBack}
      headerRight={headerRight}
      state={state}
      scrollable
      keyboardAvoiding
      loading={loading}
      footer={footer}
      padding="comfortable"
    >
      <View style={styles.sections}>
        {unsavedChanges ? (
          <Alert tone="warning" title={unsavedChangesMessage} />
        ) : null}
        {validationSummary.length > 0 ? (
          <Alert
            tone="error"
            title="Review the following fields"
            description={validationSummary.map(item => item.message).join('\n')}
          />
        ) : null}
        {sections.map(section => (
          <Card key={section.id} size="large">
            <View style={styles.section}>
              {section.title || section.description ? (
                <View style={styles.sectionHeader}>
                  {section.title ? (
                    <View style={styles.sectionTitle}>
                      <Heading title={section.title} level={5} />
                      {section.required ? (
                        <Text value={requiredLabel} variant="caption" tone="error" />
                      ) : null}
                    </View>
                  ) : null}
                  {section.description ? (
                    <Text
                      value={section.description}
                      variant="bodySmall"
                      tone="secondary"
                    />
                  ) : null}
                </View>
              ) : null}
              {section.content}
              {section.error ? (
                <Text
                  value={section.error}
                  accessibilityRole="alert"
                  variant="caption"
                  tone="error"
                />
              ) : null}
            </View>
          </Card>
        ))}
      </View>
    </BaseScreenTemplate>
  );
});
