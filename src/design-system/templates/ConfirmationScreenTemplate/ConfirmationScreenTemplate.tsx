import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Checkbox } from '../../components/Checkbox';
import { Divider } from '../../components/Divider';
import { Heading } from '../../components/Heading';
import { Text } from '../../components/Text';
import { useTheme } from '../../hooks';
import { BaseScreenTemplate } from '../BaseScreenTemplate';
import { BottomActionTemplate } from '../BottomActionTemplate';
import type { ConfirmationScreenTemplateProps } from './ConfirmationScreenTemplate.types';
import { createConfirmationScreenTemplateStyles } from './ConfirmationScreenTemplate.styles';

export const ConfirmationScreenTemplate = memo(function ConfirmationScreenTemplate({
  title,
  subtitle,
  sections,
  amountSummary,
  terms,
  confirmationLabel = 'I confirm that the information is correct.',
  confirmed = false,
  onConfirmedChange,
  confirmationRequired = false,
  primaryAction,
  secondaryAction,
  state = { type: 'content' },
  error,
  loading = false,
  onBack,
  testID,
}: ConfirmationScreenTemplateProps) {
  const { theme, direction } = useTheme();
  const styles = useMemo(
    () => createConfirmationScreenTemplateStyles(theme, direction),
    [direction, theme],
  );
  const actionDisabled =
    primaryAction.disabled || (confirmationRequired && !confirmed);
  const footer = (
    <BottomActionTemplate
      primaryAction={{
        ...primaryAction,
        disabled: actionDisabled,
        loading: loading || Boolean(primaryAction.loading),
      }}
      {...(secondaryAction ? { secondaryAction } : {})}
      layout={secondaryAction ? 'inline' : 'stacked'}
    />
  );

  return (
    <BaseScreenTemplate
      testID={testID}
      title={title}
      subtitle={subtitle}
      showBackButton={Boolean(onBack)}
      onBack={onBack}
      state={state}
      loading={loading}
      footer={footer}
    >
      <View style={styles.content}>
        {error ? <Alert tone="error" title={error} /> : null}
        {sections.map(section => (
          <Card key={section.id} padding="large">
            <View style={styles.section}>
              {section.title ? <Heading level={5}>{section.title}</Heading> : null}
              {section.rows.map((row, index) => (
                <React.Fragment key={row.id}>
                  {index > 0 ? <Divider /> : null}
                  <View style={styles.row}>
                    <View style={styles.rowContent}>
                      <Text variant="bodySmall" tone="secondary">{row.label}</Text>
                      {typeof row.value === 'string' || typeof row.value === 'number' ? (
                        <Text weight="semibold">{row.value}</Text>
                      ) : row.value}
                    </View>
                    {row.onEdit ? (
                      <View style={styles.rowActions}>
                        <Button variant="ghost" size="small" onPress={row.onEdit}>
                          {row.editLabel ?? 'Edit'}
                        </Button>
                      </View>
                    ) : null}
                  </View>
                </React.Fragment>
              ))}
            </View>
          </Card>
        ))}
        {amountSummary ? (
          <Card variant="filled" padding="large">
            <View style={styles.amount}>
              <View style={styles.amountRow}>
                <Text tone="secondary">{amountSummary.label}</Text>
                {amountSummary.amount}
              </View>
              {amountSummary.fees ? (
                <View style={styles.amountRow}>
                  <Text tone="secondary">Fees</Text>
                  {amountSummary.fees}
                </View>
              ) : null}
              {amountSummary.total ? (
                <>
                  <Divider />
                  <View style={styles.amountRow}>
                    <Text weight="semibold">Total</Text>
                    {amountSummary.total}
                  </View>
                </>
              ) : null}
            </View>
          </Card>
        ) : null}
        {terms || confirmationRequired ? (
          <View style={styles.terms}>
            {terms}
            {confirmationRequired && onConfirmedChange ? (
              <Checkbox
                checked={confirmed}
                onChange={onConfirmedChange}
                label={confirmationLabel}
                error={Boolean(error)}
              />
            ) : null}
          </View>
        ) : null}
      </View>
    </BaseScreenTemplate>
  );
});
