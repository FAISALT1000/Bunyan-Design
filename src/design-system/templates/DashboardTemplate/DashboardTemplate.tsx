import React, { memo, useMemo } from 'react';
import { RefreshControl, View } from 'react-native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Heading } from '../../components/Heading';
import { Icon } from '../../components/Icon';
import { Skeleton } from '../../components/Skeleton';
import { Text } from '../../components/Text';
import { useTheme } from '../../hooks';
import { BaseScreenTemplate } from '../BaseScreenTemplate';
import type { DashboardTemplateProps } from './DashboardTemplate.types';
import { createDashboardTemplateStyles } from './DashboardTemplate.styles';

export const DashboardTemplate = memo(function DashboardTemplate({
  greeting,
  subtitle,
  profileAction,
  balanceSummary,
  quickActions = [],
  promotionalBanner,
  sections = [],
  recentActivity,
  state = { type: 'content' },
  loading = false,
  refreshing = false,
  onRefresh,
  testID,
}: DashboardTemplateProps) {
  const { theme, direction } = useTheme();
  const styles = useMemo(
    () => createDashboardTemplateStyles(theme, direction),
    [direction, theme],
  );

  return (
    <BaseScreenTemplate
      testID={testID}
      state={state}
      loading={loading}
      background="secondary"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.color.primary.default}
            colors={[theme.color.primary.default]}
          />
        ) : undefined
      }
    >
      <View style={styles.content}>
        <View style={styles.greeting}>
          <View style={styles.greetingText}>
            <Heading level={3}>{greeting}</Heading>
            {subtitle ? <Text tone="secondary">{subtitle}</Text> : null}
          </View>
          {profileAction}
        </View>
        {loading ? (
          <View style={styles.skeletons}>
            <Skeleton height={theme.componentHeight.xl * 2} radius="large" />
            <Skeleton lines={3} />
          </View>
        ) : (
          <>
            {balanceSummary ? (
              <Card variant="elevated" padding="large">{balanceSummary}</Card>
            ) : null}
            {quickActions.length > 0 ? (
              <View style={styles.quickActions}>
                {quickActions.map(action => (
                  <View key={action.id} style={styles.quickAction}>
                    <Card
                      accessibilityLabel={action.label}
                      onPress={action.onPress}
                      padding="medium"
                    >
                      <View style={styles.quickActionContent}>
                        {action.icon ? <Icon name={action.icon} tone="primary" /> : null}
                        <Text variant="label" weight="semibold">{action.label}</Text>
                      </View>
                    </Card>
                  </View>
                ))}
              </View>
            ) : null}
            {promotionalBanner}
            {sections.map(section => (
              <View key={section.id} style={styles.section}>
                {section.title || section.action ? (
                  <View style={styles.sectionHeader}>
                    {section.title ? <Heading level={4}>{section.title}</Heading> : <View />}
                    {section.action ? (
                      <Button variant="ghost" size="small" onPress={section.action.onPress}>
                        {section.action.label}
                      </Button>
                    ) : null}
                  </View>
                ) : null}
                {section.content}
              </View>
            ))}
            {recentActivity ? (
              <View style={styles.section}>
                <Heading level={4}>Recent activity</Heading>
                {recentActivity}
              </View>
            ) : null}
          </>
        )}
      </View>
    </BaseScreenTemplate>
  );
});
