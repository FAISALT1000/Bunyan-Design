import type {
  NavigationAdapter,
  NavigationTarget,
  ScreenName,
  ScreenParamList,
} from '../../navigation/types';
import type {
  ReactNativeNavigationAdapterConfiguration,
  WixComponentLayout,
} from './types';

function defaultComponentLayout<
  TParams extends ScreenParamList,
  TOptions,
  TName extends ScreenName<TParams>,
>(
  target: NavigationTarget<TParams, TOptions, TName>,
): WixComponentLayout<TOptions> {
  return {
    component: {
      name: target.name,
      ...(target.id !== undefined ? { id: target.id } : {}),
      ...(target.passProps !== undefined
        ? { passProps: target.passProps as object }
        : {}),
      ...(target.options !== undefined ? { options: target.options } : {}),
    },
  };
}

export function createReactNativeNavigationAdapter<
  TParams extends ScreenParamList,
  TLayout = WixComponentLayout<unknown>,
  TOptions = unknown,
  TComponentId extends string = string,
>({
  navigation,
  createComponentLayout,
}: ReactNativeNavigationAdapterConfiguration<TParams, TLayout, TOptions>): NavigationAdapter<
  TParams,
  TLayout,
  TOptions,
  TComponentId
> {
  const toLayout = <TName extends ScreenName<TParams>>(
    target: NavigationTarget<TParams, TOptions, TName>,
  ): TLayout => {
    if (createComponentLayout) {
      return createComponentLayout(target);
    }

    return defaultComponentLayout(target) as TLayout;
  };

  return {
    push: (componentId, target) => navigation.push(componentId, toLayout(target)),
    pop: (componentId, options) => navigation.pop(componentId, options),
    popTo: (componentId, options) => navigation.popTo(componentId, options),
    popToRoot: (componentId, options) => navigation.popToRoot(componentId, options),
    setAppRoot: layout => navigation.setRoot({ root: layout }),
    showModal: target => navigation.showModal(toLayout(target)),
    dismissModal: (componentId, options) => navigation.dismissModal(componentId, options),
    dismissAllModals: options => navigation.dismissAllModals(options),
    showOverlay: target => navigation.showOverlay(toLayout(target)),
    dismissOverlay: componentId => navigation.dismissOverlay(componentId),
    mergeOptions: (componentId, options) => navigation.mergeOptions(componentId, options),
    setStackRoot: (componentId, targets) =>
      navigation.setStackRoot(componentId, targets.map(target => toLayout(target))),
  };
}
