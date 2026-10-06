import {
  NavigationProvider,
  NavigationScope,
  NavigationScreenProvider,
} from './NavigationProvider';
import type { ScreenParamList } from './types';
import { useNavigation as useGenericNavigation } from '../hooks/useNavigation';

export function createNavigation<
  TParams extends ScreenParamList,
  TLayout = unknown,
  TOptions = unknown,
  TComponentId extends string = string,
>() {
  return {
    NavigationProvider: NavigationProvider<TParams, TLayout, TOptions, TComponentId>,
    NavigationScope: NavigationScope<TComponentId>,
    NavigationScreenProvider: NavigationScreenProvider<
      TParams,
      TLayout,
      TOptions,
      TComponentId
    >,
    useNavigation: (componentId?: TComponentId) =>
      useGenericNavigation<TParams, TLayout, TOptions, TComponentId>(
        componentId,
      ),
  };
}
