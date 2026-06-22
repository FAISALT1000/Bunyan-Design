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
          <Card key={section.id} size="large">
            <View style={styles.section}>
              {section.title ? <Heading title={section.title} level={5} /> : null}
              {section.rows.map((row, index) => (
                <React.Fragment key={row.id}>
                  {index > 0 ? <Divider /> : null}
                  <View style={styles.row}>
                    <View style={styles.rowContent}>
                      <Text value={row.label} variant="bodySmall" tone="secondary" />
                      {typeof row.value === 'string' || typeof row.value === 'number' ? (
                        <Text value={row.value} weight="semibold" />
                      ) : row.value}
                    </View>
                    {row.onEdit ? (
                      <View style={styles.rowActions}>
                        <Button
                          title={row.editLabel ?? 'Edit'}
                          variant="ghost"
                          size="small"
                          onPress={row.onEdit}
                        />
                      </View>
                    ) : null}
                  </View>
                </React.Fragment>
              ))}
            </View>
          </Card>
        ))}
        {amountSummary ? (
          <Card variant="tertiary" size="large">
            <View style={styles.amount}>
              <View style={styles.amountRow}>
                <Text value={amountSummary.label} tone="secondary" />
                {amountSummary.amount}
              </View>
              {amountSummary.fees ? (
                <View style={styles.amountRow}>
                  <Text value="Fees" tone="secondary" />
                  {amountSummary.fees}
                </View>
              ) : null}
              {amountSummary.total ? (
                <>
                  <Divider />
                  <View style={styles.amountRow}>
                    <Text value="Total" weight="semibold" />
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
