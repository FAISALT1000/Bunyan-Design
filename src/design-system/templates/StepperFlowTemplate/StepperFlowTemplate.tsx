import React, { memo, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Heading } from '../../components/Heading';
import { Icon } from '../../components/Icon';
import { Text } from '../../components/Text';
import { useTheme } from '../../hooks';
import { BaseScreenTemplate } from '../BaseScreenTemplate';
import { BottomActionTemplate } from '../BottomActionTemplate';
import type { StepperFlowTemplateProps } from './StepperFlowTemplate.types';
import { createStepperFlowTemplateStyles } from './StepperFlowTemplate.styles';

export const StepperFlowTemplate = memo(function StepperFlowTemplate({
  title,
  steps,
  currentStep,
  onNext,
  onBack,
  onSaveAndExit,
  onStepPress,
  canContinue = true,
  loading = false,
  state = { type: 'content' },
  continueLabel = 'Continue',
  previousLabel = 'Back',
  saveAndExitLabel = 'Save and exit',
  nextAction,
  testID,
}: StepperFlowTemplateProps) {
  const { theme, direction } = useTheme();
  const styles = useMemo(
    () => createStepperFlowTemplateStyles(theme, direction),
    [direction, theme],
  );
  const visibleSteps = useMemo(() => steps.filter(step => !step.hidden), [steps]);
  const boundedStep = Math.max(0, Math.min(currentStep, visibleSteps.length - 1));
  const activeStep = visibleSteps[boundedStep];
  const isFirst = boundedStep === 0;
  const isLast = boundedStep === visibleSteps.length - 1;

  if (!activeStep) return null;

  const primaryAction = {
    label: nextAction?.label ?? (isLast ? 'Finish' : continueLabel),
    onPress: nextAction?.onPress ?? onNext,
    variant: nextAction?.variant ?? 'primary' as const,
    disabled: Boolean(!canContinue || activeStep.disabled || nextAction?.disabled),
    loading: Boolean(loading || nextAction?.loading),
  };
  const secondaryAction = !isFirst && onBack
    ? { label: previousLabel, onPress: onBack, variant: 'outline' as const }
    : undefined;
  const footer = (
    <BottomActionTemplate
      primaryAction={primaryAction}
      {...(secondaryAction ? { secondaryAction } : {})}
      layout={secondaryAction ? 'inline' : 'stacked'}
    >
      {onSaveAndExit ? (
        <Pressable accessibilityRole="button" onPress={onSaveAndExit}>
          <Text tone="link" weight="semibold" align="center">{saveAndExitLabel}</Text>
        </Pressable>
      ) : null}
    </BottomActionTemplate>
  );

  return (
    <BaseScreenTemplate
      testID={testID}
      title={title}
      state={state}
      footer={footer}
      loading={loading}
    >
      <View style={styles.content}>
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 1,
            max: visibleSteps.length,
            now: boundedStep + 1,
            text: `Step ${boundedStep + 1} of ${visibleSteps.length}`,
          }}
          style={styles.progress}
        >
          {visibleSteps.map((step, index) => {
            const status = index < boundedStep
              ? 'completed'
              : index === boundedStep
              ? 'current'
              : 'pending';
            const canNavigate = Boolean(onStepPress) && index <= boundedStep;
            return (
              <Pressable
                key={step.id}
                accessibilityRole={canNavigate ? 'button' : 'text'}
                accessibilityLabel={`${step.title}, ${status}`}
                accessibilityState={{ selected: status === 'current', disabled: !canNavigate }}
                disabled={!canNavigate}
                onPress={() => onStepPress?.(index, step)}
                style={styles.step}
              >
                <View style={styles.stepIndicatorRow}>
                  <View style={[
                    index > 0 ? styles.connector : styles.connectorPlaceholder,
                    index > 0 && index <= boundedStep ? styles.connectorComplete : undefined,
                  ]} />
                  <View style={[
                    styles.circle,
                    status === 'current' ? styles.circleCurrent : undefined,
                    status === 'completed' ? styles.circleCompleted : undefined,
                  ]}>
                    {status === 'completed' ? (
                      <Icon name="check" size="sm" tone="inverse" />
                    ) : (
                      <Text
                        variant="caption"
                        weight="semibold"
                        tone={status === 'current' ? 'link' : 'secondary'}
                      >
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  <View style={[
                    index < visibleSteps.length - 1
                      ? styles.connector
                      : styles.connectorPlaceholder,
                    index < boundedStep ? styles.connectorComplete : undefined,
                  ]} />
                </View>
                <View style={styles.stepLabel}>
                  <Text
                    variant="caption"
                    weight={status === 'current' ? 'semibold' : 'regular'}
                    align="center"
                  >
                    {step.title}
                  </Text>
                  {step.optional ? <Text variant="caption" tone="tertiary">Optional</Text> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.body}>
          <View style={styles.heading}>
            <Heading level={3}>{activeStep.title}</Heading>
            {activeStep.description ? (
              <Text tone="secondary">{activeStep.description}</Text>
            ) : null}
          </View>
          {activeStep.content}
        </View>
      </View>
    </BaseScreenTemplate>
  );
});
