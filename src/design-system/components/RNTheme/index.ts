import * as RNThemeNamespace from './RNTheme';

export * from './RNTheme';

/**
 * Namespace form for app code: `<RNTheme.View />`, `RNTheme.Platform.OS`.
 * (Plain re-export instead of `export * as`, which Metro's Babel preset rejects.)
 */
export { RNThemeNamespace as RNTheme };
