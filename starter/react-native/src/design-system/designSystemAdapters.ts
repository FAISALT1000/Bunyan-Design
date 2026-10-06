import {
  createApplicationAdapters,
  type ApplicationAdapters,
} from '@bunyan/design-system';

export type AppPermission = string;

export const designSystemAdapters = createApplicationAdapters<AppPermission>(
  {},
);

export const testDesignSystemAdapters: ApplicationAdapters<AppPermission> = {
  haptics: {
    impact: () => undefined,
    notification: () => undefined,
    selection: () => undefined,
  },
  clipboard: {
    getString: async () => '',
    setString: async () => undefined,
  },
  secureScreen: {
    enable: () => undefined,
    disable: () => undefined,
  },
  share: {
    share: async () => undefined,
  },
  logger: {
    debug: () => undefined,
    info: () => undefined,
    warn: () => undefined,
    error: () => undefined,
  },
  analytics: {
    track: () => undefined,
  },
};
