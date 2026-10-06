import React, { createContext, useContext, useMemo } from 'react';
import type {
  NavigationAdapter,
  NavigationContextValue,
  NavigationProviderProps,
  NavigationScreenProviderProps,
  NavigationScopeProps,
  ScreenParamList,
} from './types';

const NavigationContext = createContext<
  NavigationContextValue<ScreenParamList, unknown, unknown> | undefined
>(undefined);

export function NavigationProvider<
  TParams extends ScreenParamList,
  TLayout,
  TOptions,
  TComponentId extends string = string,
>({
  adapter,
  children,
}: NavigationProviderProps<TParams, TLayout, TOptions, TComponentId>) {
  const value = useMemo(
    () => ({ adapter, componentId: undefined }),
    [adapter],
  );

  return (
    <NavigationContext.Provider
      value={value as unknown as NavigationContextValue<ScreenParamList, unknown, unknown>}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function NavigationScope<TComponentId extends string = string>({
  componentId,
  children,
}: NavigationScopeProps<TComponentId>) {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error('NavigationScope must be rendered inside NavigationProvider.');
  }

  const value = useMemo(
    () => ({ ...context, componentId }),
    [componentId, context],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function NavigationScreenProvider<
  TParams extends ScreenParamList,
  TLayout,
  TOptions,
  TComponentId extends string = string,
>({
  adapter,
  componentId,
  children,
}: NavigationScreenProviderProps<TParams, TLayout, TOptions, TComponentId>) {
  return (
    <NavigationProvider adapter={adapter}>
      <NavigationScope componentId={componentId}>{children}</NavigationScope>
    </NavigationProvider>
  );
}

export function useNavigationContext<
  TParams extends ScreenParamList,
  TLayout,
  TOptions,
  TComponentId extends string = string,
>(): NavigationContextValue<TParams, TLayout, TOptions, TComponentId> {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error('useNavigation must be used inside NavigationProvider.');
  }

  return context as unknown as NavigationContextValue<
    TParams,
    TLayout,
    TOptions,
    TComponentId
  >;
}

export function createNavigationProvider<
  TParams extends ScreenParamList,
  TLayout,
  TOptions,
  TComponentId extends string = string,
>() {
  return {
    Provider: NavigationProvider<TParams, TLayout, TOptions, TComponentId>,
    Scope: NavigationScope<TComponentId>,
    ScreenProvider: NavigationScreenProvider<
      TParams,
      TLayout,
      TOptions,
      TComponentId
    >,
  };
}

export type AnyNavigationAdapter = NavigationAdapter<
  ScreenParamList,
  unknown,
  unknown,
  string
>;
