import React, { forwardRef, memo } from 'react';
import { Pressable, type PressableProps, type ViewRef } from '../RNTheme';
import { useTheme } from '../../hooks';
import { heightForSize, iconTokenForSize, type ComponentSize } from '../../utilities/styles';
import { Icon, type IconName, type IconTone } from '../Icon';

export interface IconButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  icon: IconName;
  accessibilityLabel: string;
  variant?: 'filled' | 'outline' | 'ghost';
  size?: ComponentSize;
  tone?: IconTone;
  selected?: boolean;
  /** Mirror the glyph in RTL. Defaults to automatic (directional icons only). */
  mirroredInRTL?: boolean;
}

export const IconButton = memo(forwardRef<ViewRef, IconButtonProps>(function IconButton(
  {
    icon,
    accessibilityLabel,
    variant = 'ghost',
    size = 'medium',
    tone = 'primary',
    selected = false,
    disabled = false,
    mirroredInRTL,
    accessibilityState,
    hitSlop,
    ...props
  },
  ref,
) {
  const { theme } = useTheme();
  const isDisabled = Boolean(disabled);
  const dimension = heightForSize(theme, size);
  const touchSlop = Math.max(0, (theme.componentHeight.md - dimension) / 2);

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ ...accessibilityState, disabled: isDisabled, selected }}
      disabled={isDisabled}
      hitSlop={hitSlop ?? (touchSlop > 0 ? touchSlop : undefined)}
      {...props}
      style={({ pressed }) => ({
        width: dimension,
        height: dimension,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radius.pill,
        borderWidth: variant === 'outline' ? theme.borderWidth.thin : theme.borderWidth.none,
        borderColor: theme.color.border.primary,
        backgroundColor: selected
          ? theme.color.primary.subtle
          : variant === 'filled'
          ? theme.color.neutral.subtle
          : pressed
          ? theme.color.overlay.subtle
          : theme.color.overlay.transparent,
        opacity: isDisabled
          ? theme.opacity.disabled
          : pressed && (selected || variant === 'filled')
          ? theme.opacity.strong
          : theme.opacity.opaque,
      })}
    >
      <Icon name={icon} size={iconTokenForSize(size)} tone={tone} {...(mirroredInRTL !== undefined ? { mirroredInRTL } : {})} />
    </Pressable>
  );
}));
