import type { Theme } from '../../themes';
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
      ...theme.shadow[variantTokens.shadow],
    },
    pressed: {
      backgroundColor: variantTokens.pressedBackground,
    },
    focused: {
      borderColor: theme.components.card.focusedBorderColor,
      borderWidth: theme.borderWidth.medium,
    },
    disabled: {
      opacity: theme.components.card.disabledOpacity,
    },
  };
}
