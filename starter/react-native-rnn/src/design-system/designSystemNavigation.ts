import {
  createNavigation,
  createReactNativeNavigationAdapter,
} from '@bunyan/design-system';
import {
  Navigation,
  type Layout,
  type Options,
} from 'react-native-navigation';

/**
 * Replace this broad map with the consuming application's screen contract.
 * No screen names are owned by the design-system package.
 */
export type AppScreenParams = Record<string, undefined>;
export type AppComponentId = string;

export const navigationAdapter = createReactNativeNavigationAdapter<
  AppScreenParams,
  Layout,
  Options,
  AppComponentId
>({
  navigation: Navigation,
});

export const {
  NavigationProvider,
  NavigationScope,
  NavigationScreenProvider,
  useNavigation,
} = createNavigation<
  AppScreenParams,
  Layout,
  Options,
  AppComponentId
>();
