import React, { memo, useMemo, useRef } from 'react';
import { Box } from '../../base/Box';
import { Inline } from '../../base/Inline';
import { BasePressable } from '../../base/Pressable';
import { Stack } from '../../base/Stack';
import { useHaptics, useTheme } from '../../hooks';
import {
  resolveLocalizedText,
  useOptionalLocalization,
} from '../../localization';
import {
  inferLineType,
  normalizeLineType,
} from '../../utilities/normalizeLineType';
import { normalizeTextItem } from '../../utilities/normalizeTextItem';
import {
  createAccessibilityLabel,
  createAccessibilityState,
} from '../../utilities/accessibility';
import { Button } from '../Button';
import { Divider } from '../Divider';
import { Icon } from '../Icon';
import { Skeleton } from '../Skeleton';
import { Text } from '../Text';
import { createLineStyles } from './Line.styles';
import type {
  LineButtonConfig,
  LineIconConfig,
  LineProps,
  LineTextGroup,
} from './Line.types';

const textKeys = ['text1', 'text2', 'text3'] as const;

function visibleTextValues(
  group: LineTextGroup | undefined,
  count: 1 | 2 | 3,
) {
  return textKeys.slice(0, count)
    .map(key => normalizeTextItem(group?.[key]))
    .filter(item => item !== undefined);
}

function TextGroup({
  group,
  count,
  side,
}: {
  group?: LineTextGroup | undefined;
  count: 1 | 2 | 3;
  side: 'start' | 'end';
}) {
  const { theme } = useTheme();
  const items = visibleTextValues(group, count);
  if (items.length === 0) return null;

  return (
    <Stack
      gap="xs"
      flexShrink={1}
      minWidth={theme.spacing.none}
      alignItems={side === 'end' ? 'flex-end' : 'flex-start'}
    >
      {items.map((item, index) => (
        <Text
          key={`${index}-${String(item.value ?? item.localize)}`}
          {...(item.localize ? { localize: item.localize } : {})}
          {...(item.value !== undefined ? { value: item.value } : {})}
          {...(item.translationOptions
            ? { translationOptions: item.translationOptions }
            : {})}
          variant={item.variant ?? (
            index === 0
              ? theme.components.line.titleTextVariant
              : index === 1
                ? theme.components.line.subtitleTextVariant
                : theme.components.line.tertiaryTextVariant
          )}
          tone={item.tone ?? (index === 0 ? 'primary' : 'secondary')}
          weight={item.weight ?? (index === 0 ? 'medium' : 'regular')}
          align={side}
          numberOfLines={item.numberOfLines ?? 1}
          {...(item.accessibilityLabel
            ? { accessibilityLabel: item.accessibilityLabel }
            : {})}
        />
      ))}
    </Stack>
  );
}

function ConfiguredIcon({
  config,
  end = false,
}: {
  config?: LineIconConfig | undefined;
  end?: boolean;
}) {
  if (!config) return null;
  return (
    <Icon
      name={config.name}
      size={config.size ?? 'md'}
      tone={config.tone ?? 'secondary'}
      mirroredInRTL={end || config.name === 'chevron-end'}
      {...(config.accessibilityLabel
        ? { accessibilityLabel: config.accessibilityLabel }
        : {})}
      {...(config.testID ? { testID: config.testID } : {})}
    />
  );
}

function ConfiguredButton({ config }: { config?: LineButtonConfig | undefined }) {
  if (!config) return null;
  return (
    <Button
      title={config.title}
      onPress={config.onPress}
      variant={config.variant ?? 'ghost'}
      size={config.size ?? 'small'}
      {...(config.leftIcon ? { leftIcon: config.leftIcon } : {})}
      {...(config.rightIcon ? { rightIcon: config.rightIcon } : {})}
      {...(config.titleLocalize
        ? { titleLocalize: config.titleLocalize }
        : {})}
      {...(config.titleTranslationOptions
        ? { titleTranslationOptions: config.titleTranslationOptions }
        : {})}
      {...(config.disabled !== undefined ? { disabled: config.disabled } : {})}
      {...(config.loading !== undefined ? { loading: config.loading } : {})}
      {...(config.accessibilityLabel
        ? { accessibilityLabel: config.accessibilityLabel }
        : {})}
      {...(config.testID ? { testID: config.testID } : {})}
    />
  );
}

export const Line = memo(function Line({
  type,
  leftText,
  rightText,
  leftIcon,
  rightIcon,
  leftButton,
  rightButton,
  leftContent,
  rightContent,
  onPress,
  disabled = false,
  loading = false,
  preventDoublePressMs = 0,
  hapticFeedback = false,
  align = 'start',
  verticalAlign = 'center',
  padding = 'medium',
  gap = 'medium',
  showDivider = false,
  dividerInset = 'none',
  accessibilityLabel,
  accessibilityHint,
  testID,
}: LineProps) {
  const { theme, direction } = useTheme();
  const localization = useOptionalLocalization();
  const { selection } = useHaptics();
  const lastPress = useRef(0);
  const lineCount = type
    ? normalizeLineType(type)
    : inferLineType(leftText, rightText);
  const styles = useMemo(
    () => createLineStyles(theme, direction, padding, gap, verticalAlign),
    [direction, gap, padding, theme, verticalAlign],
  );
  const visibleLabel = createAccessibilityLabel([
    ...visibleTextValues(leftText, lineCount),
    ...visibleTextValues(rightText, lineCount),
  ].map(item => (
    item.accessibilityLabel
    ?? resolveLocalizedText({
      ...(item.localize ? { localize: item.localize } : {}),
      ...(item.value !== undefined ? { value: item.value } : {}),
      ...(item.translationOptions
        ? { translationOptions: item.translationOptions }
        : {}),
      ...(localization ? { localization } : {}),
    })
  )));
  const resolvedAccessibilityLabel = accessibilityLabel ?? visibleLabel;
  const content = loading ? (
    <Inline gap="lg" justifyContent="space-between" alignItems="center">
      <Box flex={1}><Skeleton lines={lineCount} /></Box>
      <Box flex={1} alignItems="flex-end"><Skeleton lines={lineCount} /></Box>
    </Inline>
  ) : (
    <Box
      {...(testID ? { testID: `${testID}-content` } : {})}
      internalStyle={styles.row}
    >
      <Box
        {...(align !== 'end' ? { flex: 1 } : {})}
        internalStyle={styles.section}
      >
        <ConfiguredIcon config={leftIcon} />
        {leftContent}
        <TextGroup group={leftText} count={lineCount} side="start" />
        <ConfiguredButton config={leftButton} />
      </Box>
      <Box
        {...(align !== 'start' ? { flex: 1 } : {})}
        justifyContent="flex-end"
        internalStyle={styles.section}
      >
        <ConfiguredButton config={rightButton} />
        <TextGroup group={rightText} count={lineCount} side="end" />
        {rightContent}
        <ConfiguredIcon config={rightIcon} end />
      </Box>
    </Box>
  );

  const body = onPress ? (
    <BasePressable
      accessibilityRole="button"
      accessibilityLabel={resolvedAccessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={createAccessibilityState({ disabled, busy: loading })}
      testID={testID}
      disabled={disabled || loading}
      onPress={() => {
        const now = Date.now();
        if (preventDoublePressMs > 0 && now - lastPress.current < preventDoublePressMs) return;
        lastPress.current = now;
        if (hapticFeedback) void selection();
        onPress();
      }}
      baseStyle={styles.container}
      pressedStyle={styles.pressed}
      focusedStyle={styles.focused}
      hoveredStyle={styles.pressed}
      disabledStyle={styles.disabled}
    >
      {content}
    </BasePressable>
  ) : (
    <Box
      accessibilityState={createAccessibilityState({ disabled, busy: loading })}
      {...(testID ? { testID } : {})}
      {...(resolvedAccessibilityLabel
        ? { accessibilityLabel: resolvedAccessibilityLabel }
        : {})}
      {...(accessibilityHint ? { accessibilityHint } : {})}
      {...(disabled
        ? { opacity: theme.components.line.disabledOpacity }
        : {})}
      internalStyle={styles.container}
    >
      {content}
    </Box>
  );

  return (
    <Stack gap="none">
      {body}
      {showDivider ? (
        <Divider
          inset={
            dividerInset === 'none'
              ? 'none'
              : dividerInset === 'content'
                ? 'medium'
                : 'large'
          }
        />
      ) : null}
    </Stack>
  );
});
