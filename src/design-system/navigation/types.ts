import type React from 'react';

export type ScreenParamList = Record<string, unknown>;
export type ScreenName<TParams extends ScreenParamList> = Extract<keyof TParams, string>;
export type NavigationResult = Promise<string | void>;

export interface NavigationIdentifiers<
  TStack extends string = string,
  TTab extends string = string,
  TModal extends string = string,
  TOverlay extends string = string,
  TComponent extends string = string,
> {
  stack: TStack;
  tab: TTab;
  modal: TModal;
  overlay: TOverlay;
  component: TComponent;
}

export type DefaultNavigationIdentifiers = NavigationIdentifiers;
export type NavigationComponentId<TIdentifiers extends NavigationIdentifiers> =
  TIdentifiers[keyof TIdentifiers];

export type ScreenPassProps<TParams extends ScreenParamList, TName extends ScreenName<TParams>> =
  TParams[TName] extends undefined ? undefined : TParams[TName];

export interface NavigationTarget<
  TParams extends ScreenParamList,
  TOptions,
  TName extends ScreenName<TParams> = ScreenName<TParams>,
> {
  name: TName;
  id?: string;
  passProps?: ScreenPassProps<TParams, TName>;
  options?: TOptions;
}

export interface NavigationCommandOptions<TOptions> {
  options?: TOptions;
}

export interface NavigationAdapter<
  TParams extends ScreenParamList,
  TLayout,
  TOptions,
  TComponentId extends string = string,
> {
  push<TName extends ScreenName<TParams>>(
    componentId: TComponentId,
    target: NavigationTarget<TParams, TOptions, TName>,
  ): NavigationResult;
  pop(componentId: TComponentId, options?: TOptions): NavigationResult;
  popTo(componentId: TComponentId, options?: TOptions): NavigationResult;
  popToRoot(componentId: TComponentId, options?: TOptions): NavigationResult;
  setAppRoot(layout: TLayout): NavigationResult;
  showModal<TName extends ScreenName<TParams>>(
    target: NavigationTarget<TParams, TOptions, TName>,
  ): NavigationResult;
  dismissModal(componentId: TComponentId, options?: TOptions): NavigationResult;
  dismissAllModals(options?: TOptions): NavigationResult;
  showOverlay<TName extends ScreenName<TParams>>(
    target: NavigationTarget<TParams, TOptions, TName>,
  ): NavigationResult;
  dismissOverlay(componentId: TComponentId): NavigationResult;
  mergeOptions(componentId: TComponentId, options: TOptions): void;
  setStackRoot(
    componentId: TComponentId,
    targets: readonly NavigationTarget<TParams, TOptions>[],
  ): NavigationResult;
}

export interface NavigationScopeProps<TComponentId extends string = string> {
  componentId: TComponentId;
  children: React.ReactNode;
}

export interface NavigationScreenProviderProps<
  TParams extends ScreenParamList,
  TLayout,
  TOptions,
  TComponentId extends string = string,
> extends NavigationProviderProps<TParams, TLayout, TOptions, TComponentId> {
  componentId: TComponentId;
}

export interface NavigationProviderProps<
  TParams extends ScreenParamList,
  TLayout,
  TOptions,
  TComponentId extends string = string,
> {
  adapter: NavigationAdapter<TParams, TLayout, TOptions, TComponentId>;
  children: React.ReactNode;
}

export interface NavigationContextValue<
  TParams extends ScreenParamList,
  TLayout,
  TOptions,
  TComponentId extends string = string,
> {
  adapter: NavigationAdapter<TParams, TLayout, TOptions, TComponentId>;
  componentId?: TComponentId | undefined;
}

export interface ScreenOptions<TOptions> {
  id?: string;
  options?: TOptions;
}

export type ScreenInvocation<
  TParams extends ScreenParamList,
  TName extends ScreenName<TParams>,
  TOptions,
> = TParams[TName] extends undefined
  ? [name: TName, params?: undefined, configuration?: ScreenOptions<TOptions>]
  : [name: TName, params: TParams[TName], configuration?: ScreenOptions<TOptions>];

export interface NavigationActions<
  TParams extends ScreenParamList,
  TLayout,
  TOptions,
  TComponentId extends string = string,
> {
  componentId?: TComponentId | undefined;
  push<TName extends ScreenName<TParams>>(
    ...args: ScreenInvocation<TParams, TName, TOptions>
  ): NavigationResult;
  pop(options?: TOptions): NavigationResult;
  popTo(componentId: TComponentId, options?: TOptions): NavigationResult;
  popToRoot(options?: TOptions): NavigationResult;
  setAppRoot(layout: TLayout): NavigationResult;
  showModal<TName extends ScreenName<TParams>>(
    ...args: ScreenInvocation<TParams, TName, TOptions>
  ): NavigationResult;
  dismissModal(componentId?: TComponentId, options?: TOptions): NavigationResult;
  dismissAllModals(options?: TOptions): NavigationResult;
  showOverlay<TName extends ScreenName<TParams>>(
    ...args: ScreenInvocation<TParams, TName, TOptions>
  ): NavigationResult;
  dismissOverlay(componentId?: TComponentId): NavigationResult;
  mergeOptions(options: TOptions, componentId?: TComponentId): void;
  setStackRoot(
    targets: readonly NavigationTarget<TParams, TOptions>[],
    componentId?: TComponentId,
  ): NavigationResult;
}
