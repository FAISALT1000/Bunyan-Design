import type {
  NavigationTarget,
  NavigationResult,
  ScreenName,
  ScreenParamList,
} from '../../navigation/types';

export interface WixComponentLayout<TOptions = unknown> {
  component: {
    name: string;
    id?: string;
    passProps?: object;
    options?: TOptions;
  };
}

export type WixLayout<TOptions = unknown> =
  | WixComponentLayout<TOptions>
  | {
      stack: {
        id?: string;
        children: readonly WixLayout<TOptions>[];
        options?: TOptions;
      };
    }
  | {
      bottomTabs: {
        id?: string;
        children: readonly WixLayout<TOptions>[];
        options?: TOptions;
      };
    }
  | Record<string, unknown>;

export interface WixNavigationCommands<TLayout, TOptions> {
  push(componentId: string, layout: TLayout): NavigationResult;
  pop(componentId: string, options?: TOptions): NavigationResult;
  popTo(componentId: string, options?: TOptions): NavigationResult;
  popToRoot(componentId: string, options?: TOptions): NavigationResult;
  setRoot(layout: { root: TLayout }): NavigationResult;
  showModal(layout: TLayout): NavigationResult;
  dismissModal(componentId: string, options?: TOptions): NavigationResult;
  dismissAllModals(options?: TOptions): NavigationResult;
  showOverlay(layout: TLayout): NavigationResult;
  dismissOverlay(componentId: string): NavigationResult;
  mergeOptions(componentId: string, options: TOptions): void;
  setStackRoot(componentId: string, layouts: TLayout[]): NavigationResult;
}

export interface ReactNativeNavigationAdapterConfiguration<
  TParams extends ScreenParamList,
  TLayout,
  TOptions,
> {
  navigation: WixNavigationCommands<TLayout, TOptions>;
  createComponentLayout?: <
    TName extends ScreenName<TParams>,
  >(target: NavigationTarget<TParams, TOptions, TName>) => TLayout;
}
