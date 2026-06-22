import React, { forwardRef, memo } from 'react';
import {
  BasePressable,
  type BasePressableHandle,
  type BasePressableProps,
} from '../../base/Pressable';
import { Inline } from '../../base/Inline';
import { useTheme } from '../../hooks';
import {
  resolveLocalizedText,
  type TranslationOptions,
  useOptionalLocalization,
} from '../../localization';
import {
  heightForSize,
  horizontalPaddingForSize,
  type ComponentSize,
} from '../../utilities/styles';
import {
  createAccessibilityLabel,
  createAccessibilityState,
} from '../../utilities/accessibility';
import { warnDeprecated } from '../../utilities/deprecations';
import { Icon, type IconName, type IconTone } from '../Icon';
import { Spinner } from '../Spinner';
import { Text, type TextTone } from '../Text';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'outline'
  | 'ghost'
  | 'danger';
export type ButtonSize = ComponentSize;

interface SharedButtonProps {
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  titleLocalize?: string;
  titleTranslationOptions?: TranslationOptions;
}

export type ButtonProps = SharedButtonProps & (
  | {
      title: string;
      children?: never;
    }
  | {
      title?: never;
      /**
       * @deprecated Use the title prop. Scheduled for removal in 1.0.0.
       */
      children: string;
    }
);

export const Button = memo(forwardRef<BasePressableHandle, ButtonProps>(function Button(
  {
    title,
    children,
    titleLocalize,
    titleTranslationOptions,
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    accessibilityLabel,
    accessibilityHint,
    testID,
    onPress,
  },
  ref,
) {
  const { theme } = useTheme();
  const localization = useOptionalLocalization();
  const titleFallback = title ?? children;
  const resolvedTitle = resolveLocalizedText({
    ...(titleLocalize ? { localize: titleLocalize } : {}),
    value: titleFallback,
    ...(titleTranslationOptions
      ? { translationOptions: titleTranslationOptions }
      : {}),
    ...(localization ? { localization } : {}),
  });
  if (title === undefined && children !== undefined) {
    warnDeprecated('Button children is deprecated. Use <Button title="..." />. It will be removed in 1.0.0.');
  }
  const isDisabled = disabled || loading;
  const variants: Record<
    ButtonVariant,
    {
      background: string;
      pressedBackground: string;
      border: string;
      textTone: TextTone;
      iconTone: IconTone;
    }
  > = {
    primary: {
      background: theme.color.primary.default,
      pressedBackground: theme.color.primary.pressed,
      border: theme.color.primary.default,
      textTone: 'inverse',
      iconTone: 'inverse',
    },
    secondary: {
      background: theme.color.secondary.default,
      pressedBackground: theme.color.secondary.pressed,
      border: theme.color.secondary.default,
      textTone: 'inverse',
      iconTone: 'inverse',
    },
    tertiary: {
      background: theme.color.neutral.subtle,
      pressedBackground: theme.color.overlay.subtle,
      border: theme.color.border.secondary,
      textTone: 'primary',
      iconTone: 'primary',
    },
    outline: {
      background: theme.color.overlay.transparent,
      pressedBackground: theme.color.overlay.subtle,
      border: theme.color.border.primary,
      textTone: 'primary',
      iconTone: 'primary',
    },
    ghost: {
      background: theme.color.overlay.transparent,
      pressedBackground: theme.color.overlay.subtle,
      border: theme.color.overlay.transparent,
      textTone: 'info',
      iconTone: 'information',
    },
    danger: {
      background: theme.color.error.default,
      pressedBackground: theme.color.error.text,
      border: theme.color.error.default,
      textTone: 'inverse',
      iconTone: 'inverse',
    },
  };
  const current = variants[variant];
  const iconSize = size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'md';
  const baseStyle: BasePressableProps['baseStyle'] = {
    minHeight: heightForSize(theme, size),
    paddingHorizontal: horizontalPaddingForSize(theme, size),
    borderRadius: theme.radius.md,
    borderWidth: theme.borderWidth.thin,
    borderColor: current.border,
    backgroundColor: current.background,
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
    justifyContent: 'center',
  };

  return (
    <BasePressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel
        ?? createAccessibilityLabel([
          resolvedTitle,
          loading ? 'Loading' : undefined,
        ])
      }
      accessibilityHint={accessibilityHint}
      accessibilityState={createAccessibilityState({
        disabled: isDisabled,
        busy: loading,
      })}
      testID={testID}
      disabled={isDisabled}
      onPress={onPress}
      stopPropagation
      baseStyle={baseStyle}
      pressedStyle={{ backgroundColor: current.pressedBackground }}
      focusedStyle={{
        borderColor: theme.color.border.focus,
        borderWidth: theme.borderWidth.medium,
      }}
      disabledStyle={{
        backgroundColor: theme.color.disabled.background,
        borderColor: theme.color.disabled.border,
        opacity: theme.opacity.disabled,
      }}
    >
      <Inline
        gap="sm"
        alignItems="center"
        justifyContent="center"
      >
        {loading ? (
          <Spinner
            size="small"
            tone={current.textTone === 'inverse' ? 'inverse' : 'primary'}
            label="Loading"
            showLabel={false}
            accessible={false}
          />
        ) : leftIcon ? (
          <Icon name={leftIcon} size={iconSize} tone={current.iconTone} />
        ) : null}
        <Text
          value={titleFallback}
          {...(titleLocalize ? { localize: titleLocalize } : {})}
          {...(titleTranslationOptions
            ? { translationOptions: titleTranslationOptions }
            : {})}
          variant="labelMedium"
          weight="semibold"
          tone={isDisabled ? 'disabled' : current.textTone}
        />
        {!loading && rightIcon ? (
          <Icon name={rightIcon} size={iconSize} tone={current.iconTone} mirroredInRTL />
        ) : null}
      </Inline>
    </BasePressable>
  );
}));
