import { useMemo } from 'react';
import { useNavigationContext } from '../navigation/NavigationProvider';
import type {
  NavigationActions,
  NavigationTarget,
  ScreenInvocation,
  ScreenName,
  ScreenParamList,
} from '../navigation/types';

function requireComponentId<TComponentId extends string>(
  componentId: TComponentId | undefined,
  command: string,
) {
  if (!componentId) {
    throw new Error(
      `${command} requires a componentId. Pass one to useNavigation(componentId) ` +
      'or render the screen inside NavigationScope.',
    );
  }

  return componentId;
}

function targetFromInvocation<
  TParams extends ScreenParamList,
  TName extends ScreenName<TParams>,
  TOptions,
>(
  args: ScreenInvocation<TParams, TName, TOptions>,
): NavigationTarget<TParams, TOptions, TName> {
  const [name, params, configuration] = args;

  return {
    name,
    ...(params !== undefined ? { passProps: params } : {}),
    ...(configuration?.id !== undefined ? { id: configuration.id } : {}),
    ...(configuration?.options !== undefined ? { options: configuration.options } : {}),
  } as NavigationTarget<TParams, TOptions, TName>;
}

export function useNavigation<
  TParams extends ScreenParamList,
  TLayout = unknown,
  TOptions = unknown,
  TComponentId extends string = string,
>(
  componentIdOverride?: TComponentId,
): NavigationActions<TParams, TLayout, TOptions, TComponentId> {
  const context = useNavigationContext<TParams, TLayout, TOptions, TComponentId>();
  const componentId = componentIdOverride ?? context.componentId;

  return useMemo(
    () => ({
      componentId,
      push: <TName extends ScreenName<TParams>>(
        ...args: ScreenInvocation<TParams, TName, TOptions>
      ) => context.adapter.push(
        requireComponentId(componentId, 'push'),
        targetFromInvocation(args),
      ),
      pop: (options?: TOptions) =>
        context.adapter.pop(requireComponentId(componentId, 'pop'), options),
      popTo: (targetComponentId: TComponentId, options?: TOptions) =>
        context.adapter.popTo(targetComponentId, options),
      popToRoot: (options?: TOptions) =>
        context.adapter.popToRoot(requireComponentId(componentId, 'popToRoot'), options),
      setAppRoot: (layout: TLayout) => context.adapter.setAppRoot(layout),
      showModal: <TName extends ScreenName<TParams>>(
        ...args: ScreenInvocation<TParams, TName, TOptions>
      ) => context.adapter.showModal(targetFromInvocation(args)),
      dismissModal: (targetComponentId?: TComponentId, options?: TOptions) =>
        context.adapter.dismissModal(
          targetComponentId ?? requireComponentId(componentId, 'dismissModal'),
          options,
        ),
      dismissAllModals: (options?: TOptions) => context.adapter.dismissAllModals(options),
      showOverlay: <TName extends ScreenName<TParams>>(
        ...args: ScreenInvocation<TParams, TName, TOptions>
      ) => context.adapter.showOverlay(targetFromInvocation(args)),
      dismissOverlay: (targetComponentId?: TComponentId) =>
        context.adapter.dismissOverlay(
          targetComponentId ?? requireComponentId(componentId, 'dismissOverlay'),
        ),
      mergeOptions: (options: TOptions, targetComponentId?: TComponentId) =>
        context.adapter.mergeOptions(
          targetComponentId ?? requireComponentId(componentId, 'mergeOptions'),
          options,
        ),
      setStackRoot: (
        targets: readonly NavigationTarget<TParams, TOptions>[],
        targetComponentId?: TComponentId,
      ) => context.adapter.setStackRoot(
        targetComponentId ?? requireComponentId(componentId, 'setStackRoot'),
        targets,
      ),
    }),
    [componentId, context.adapter],
  );
}
