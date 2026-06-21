import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
import { Accordion } from '../../components/Accordion';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Divider } from '../../components/Divider';
import { Heading } from '../../components/Heading';
import { Text } from '../../components/Text';
import { useTheme } from '../../hooks';
import { BaseScreenTemplate } from '../BaseScreenTemplate';
import { BottomActionTemplate } from '../BottomActionTemplate';
import type { DetailRow } from '../types';
import type { DetailsScreenTemplateProps } from './DetailsScreenTemplate.types';
import { createDetailsScreenTemplateStyles } from './DetailsScreenTemplate.styles';

export const DetailsScreenTemplate = memo(function DetailsScreenTemplate({
  title,
  subtitle,
  headerSection,
  status,
  summary,
  sections,
  primaryAction,
  secondaryAction,
  shareAction,
  downloadAction,
  state = { type: 'content' },
  loading = false,
  onBack,
  testID,
}: DetailsScreenTemplateProps) {
  const { theme, direction } = useTheme();
  const styles = useMemo(
    () => createDetailsScreenTemplateStyles(theme, direction),
    [direction, theme],
  );
  const renderRows = (rows: readonly DetailRow[]) => (
    <>
      {rows.map((row, index) => (
        <React.Fragment key={row.id}>
          {index > 0 ? <Divider /> : null}
          <View style={styles.row}>
            <View style={styles.rowLabel}>
              <Text variant="bodySmall" tone="secondary">{row.label}</Text>
              {row.description ? (
                <Text variant="caption" tone="tertiary">{row.description}</Text>
              ) : null}
            </View>
            <View style={styles.rowValue}>
              {typeof row.value === 'string' || typeof row.value === 'number' ? (
                <Text weight="semibold" align="end">{row.value}</Text>
              ) : row.value}
            </View>
          </View>
        </React.Fragment>
      ))}
    </>
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
      title={title}
      subtitle={subtitle}
      showBackButton={Boolean(onBack)}
      onBack={onBack}
      state={state}
      loading={loading}
      footer={footer}
    >
      <View style={styles.content}>
        {headerSection || status || shareAction || downloadAction ? (
          <View style={styles.header}>
            {headerSection}
            <View style={styles.statusRow}>
              {status ? <Badge tone={status.tone ?? 'neutral'}>{status.label}</Badge> : <View />}
              <View style={styles.utilityActions}>
                {shareAction ? (
                  <Button variant="ghost" size="small" onPress={shareAction.onPress}>
                    {shareAction.label}
                  </Button>
                ) : null}
                {downloadAction ? (
                  <Button variant="ghost" size="small" onPress={downloadAction.onPress}>
                    {downloadAction.label}
                  </Button>
                ) : null}
              </View>
            </View>
          </View>
        ) : null}
        {summary ? <Card variant="filled" padding="large">{summary}</Card> : null}
        <View style={styles.sections}>
          {sections.map(section => {
            const sectionContent = (
              <View style={styles.section}>
                {!section.expandable && (section.title || section.description) ? (
                  <View style={styles.sectionHeader}>
                    {section.title ? <Heading level={5}>{section.title}</Heading> : null}
                    {section.description ? (
                      <Text variant="bodySmall" tone="secondary">{section.description}</Text>
                    ) : null}
                  </View>
                ) : null}
                {section.rows ? renderRows(section.rows) : section.content}
              </View>
            );
            return section.expandable && section.title ? (
              <Card key={section.id} padding="large">
                <Accordion title={section.title} defaultExpanded={Boolean(section.defaultExpanded)}>
                  {sectionContent}
                </Accordion>
              </Card>
            ) : (
              <Card key={section.id} padding="large">{sectionContent}</Card>
            );
          })}
        </View>
      </View>
    </BaseScreenTemplate>
  );
});
