import React, {
  type ComponentType,
  type PropsWithChildren,
} from 'react';
import { Navigation } from 'react-native-navigation';
import {
  DesignSystemSetup,
  type DesignSystemSetupProps,
} from './DesignSystemSetup';
import {
  NavigationScreenProvider,
  navigationAdapter,
} from './designSystemNavigation';

export interface NavigationComponentProps {
  componentId: string;
}

export type ApplicationProviders = ComponentType<PropsWithChildren>;

export function registerAppScreen<
  TProps extends NavigationComponentProps,
>(
  name: string,
  Screen: ComponentType<TProps>,
  getSetupProps: () => Omit<DesignSystemSetupProps, 'children'>,
  ApplicationProvider?: ApplicationProviders,
) {
  Navigation.registerComponent(name, () => {
    function RegisteredScreen(props: TProps) {
      const screen = (
        <DesignSystemSetup {...getSetupProps()}>
          <NavigationScreenProvider
            adapter={navigationAdapter}
            componentId={props.componentId}
          >
            <Screen {...props} />
          </NavigationScreenProvider>
        </DesignSystemSetup>
      );

      if (ApplicationProvider) {
        return <ApplicationProvider>{screen}</ApplicationProvider>;
      }

      return screen;
    }

    return RegisteredScreen;
  });
}
