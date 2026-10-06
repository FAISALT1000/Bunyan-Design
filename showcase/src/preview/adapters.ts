import {
  createApplicationAdapters,
  type NetworkState,
} from '@bunyan/design-system';

let clipboardValue = '';

const onlineState: NetworkState = {
  isConnected: true,
  isInternetReachable: true,
  type: 'preview',
};

export const previewAdapters = createApplicationAdapters<'camera' | 'notifications'>({
  clipboard: {
    async getString() {
      return clipboardValue;
    },
    async setString(value: string) {
      clipboardValue = value;
    },
  },
  haptics: {
    impact: async () => undefined,
    notification: async () => undefined,
    selection: async () => undefined,
  },
  network: {
    async getCurrentState() {
      return onlineState;
    },
    subscribe(listener) {
      listener(onlineState);
      return () => undefined;
    },
  },
  permissions: {
    async check() {
      return 'granted';
    },
    async request() {
      return 'granted';
    },
    async openSettings() {
      return undefined;
    },
  },
  logger: {
    debug: () => undefined,
    info: () => undefined,
    warn: () => undefined,
    error: () => undefined,
  },
  analytics: {
    track: async () => undefined,
  },
});
