import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
import { Badge, type BadgeTone } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Divider } from '../../components/Divider';
import { Heading } from '../../components/Heading';
import { Icon, type IconName, type IconTone } from '../../components/Icon';
import { Text } from '../../components/Text';
import { useTheme } from '../../hooks';
import { BaseScreenTemplate } from '../BaseScreenTemplate';
import { BottomActionTemplate } from '../BottomActionTemplate';
import type { BuiltInResultStatus } from '../types';
import type { ResultScreenTemplateProps } from './ResultScreenTemplate.types';
import { createResultScreenTemplateStyles } from './ResultScreenTemplate.styles';

const builtInStatus: Record<
  BuiltInResultStatus,
  { label: string; icon: IconName; tone: BadgeTone; iconTone: IconTone }
> = {
  success: { label: 'Success', icon: 'success', tone: 'success', iconTone: 'success' },
  error: { label: 'Failed', icon: 'error', tone: 'error', iconTone: 'error' },
  pending: { label: 'Pending', icon: 'info', tone: 'information', iconTone: 'information' },
  warning: { label: 'Warning', icon: 'warning', tone: 'warning', iconTone: 'warning' },
  underReview: { label: 'Under review', icon: 'search', tone: 'information', iconTone: 'information' },
  blocked: { label: 'Blocked', icon: 'alert-circle', tone: 'error', iconTone: 'error' },
};

export const ResultScreenTemplate = memo(function ResultScreenTemplate({
  status,
  title,
  description,
  referenceNumber,
  dateTime,
  details = [],
  primaryAction,
  secondaryAction,
  shareAction,
  downloadAction,
  state = { type: 'content' },
  onBack,
  testID,
}: ResultScreenTemplateProps) {
  const { theme, direction } = useTheme();
  const resolved = status.type === 'custom'
    ? {
        label: status.label,
        icon: status.icon,
        tone: status.tone,
        iconTone: status.tone === 'primary'
          ? 'primary' as const
          : status.tone === 'neutral'
          ? 'secondary' as const
          : status.tone,
      }
    : builtInStatus[status.type];
  const statusBackground =
    resolved.tone === 'success'
      ? theme.color.success.subtle
      : resolved.tone === 'error'
      ? theme.color.error.subtle
      : resolved.tone === 'warning'
      ? theme.color.warning.subtle
      : resolved.tone === 'information'
      ? theme.color.information.subtle
      : theme.color.neutral.subtle;
  const styles = useMemo(
    () => createResultScreenTemplateStyles(theme, direction, statusBackground),
    [direction, statusBackground, theme],
  );
  const footer = primaryAction ? (
    <BottomActionTemplate
      primaryAction={primaryAction}
      {...(secondaryAction ? { secondaryAction } : {})}
      layout={secondaryAction ? 'inline' : 'stacked'}
    />
  ) : undefined;

  return (
    <BaseScreenTemplate
      testID={testID}
      showBackButton={Boolean(onBack)}
      onBack={onBack}
      state={state}
      footer={footer}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name={resolved.icon} size="xl" tone={resolved.iconTone} />
        </View>
        <View style={styles.heading}>
          <Badge label={resolved.label} tone={resolved.tone} />
          <Heading title={title} level={2} align="center" />
          {description ? (
            <Text value={description} tone="secondary" align="center" />
          ) : null}
        </View>
        {referenceNumber || dateTime ? (
          <Card variant="tertiary" size="large">
            <View style={styles.meta}>
              {referenceNumber ? (
                <View style={styles.metaRow}>
                  <Text value="Reference number" tone="secondary" />
                  <Text value={referenceNumber} weight="semibold" />
                </View>
              ) : null}
              {referenceNumber && dateTime ? <Divider /> : null}
              {dateTime ? (
                <View style={styles.metaRow}>
                  <Text value="Date and time" tone="secondary" />
                  <Text value={dateTime} weight="semibold" />
                </View>
              ) : null}
            </View>
          </Card>
        ) : null}
        {details.length > 0 ? (
          <Card size="large">
            <View style={styles.details}>
              {details.map((detail, index) => (
                <React.Fragment key={detail.id}>
                  {index > 0 ? <Divider /> : null}
                  <View style={styles.metaRow}>
                    <Text value={detail.label} tone="secondary" />
                    {typeof detail.value === 'string' || typeof detail.value === 'number'
                      ? <Text value={detail.value} weight="semibold" />
                      : detail.value}
                  </View>
                </React.Fragment>
              ))}
            </View>
          </Card>
        ) : null}
        {shareAction || downloadAction ? (
          <View style={styles.utilityActions}>
            {shareAction ? (
              <Button
                title={shareAction.label}
                variant="outline"
                onPress={shareAction.onPress}
              />
            ) : null}
            {downloadAction ? (
              <Button
                title={downloadAction.label}
                variant="outline"
                onPress={downloadAction.onPress}
              />
            ) : null}
          </View>
        ) : null}
      </View>
    </BaseScreenTemplate>
  );
});
