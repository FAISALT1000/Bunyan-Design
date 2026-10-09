/**
 * `@bunyan/design-system/icons`: the categorized icon set.
 *
 * ```tsx
 * import { WalletIcon, iconCategories } from '@bunyan/design-system/icons';
 * <WalletIcon size="lg" tone="primary" />
 * ```
 */
export { glyphs, iconCategories, type BuiltInIconName, type IconCategory } from './glyphs';
export { createIcon, type NamedIconProps } from './createIcon';
export * from './components';
export {
  Icon,
  getIconNames,
  registerIcons,
  type CustomIcons,
  type IconName,
  type IconProps,
  type IconSize,
  type IconTone,
} from '../components/Icon/Icon';
