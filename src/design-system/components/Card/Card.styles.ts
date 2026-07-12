import type { Theme } from '../../themes';
import type { PlatformTokens } from '../../platform';
import type {
  CardSize,
  CardVariant,
} from './Card.types';

export function createCardStyles(
  theme: Theme,
  variant: CardVariant,
  size: CardSize,
  selected: boolean,
  showBorder: boolean | undefined,
  platformTokens: PlatformTokens,
) {
  const variantTokens = theme.components.card.variants[variant];
  const sizeTokens = theme.components.card.size[size];
  const shouldShowBorder = showBorder ?? variantTokens.borderWidth > theme.borderWidth.none;

  return {
    container: {
      padding: sizeTokens.padding,
      gap: sizeTokens.gap,
      borderRadius: theme.components.card.radius,
      borderWidth: selected
        ? theme.borderWidth.medium
        : shouldShowBorder
          ? variantTokens.borderWidth
          : theme.borderWidth.none,
      borderColor: selected
        ? theme.components.card.selectedBorderColor
        : variantTokens.borderColor,
      backgroundColor: variantTokens.background,
      ...platformTokens.elevation[
        variantTokens.shadow === 'sm'
          ? 'low'
          : variantTokens.shadow === 'md'
            ? 'medium'
            : variantTokens.shadow === 'lg'
              ? 'high'
              : 'none'
      ],
    },
    pressed: {
      backgroundColor: variantTokens.pressedBackground,
    },
    focused: {
      borderColor: theme.components.card.focusedBorderColor,
      borderWidth: platformTokens.interaction.focusRingWidth,
    },
    disabled: {
      opacity: theme.components.card.disabledOpacity,
    },
  };
}
