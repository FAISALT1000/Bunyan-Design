import type React from 'react';

export interface NetworkState {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type?: string;
}

export interface NetworkStatusAdapter {
  getCurrentState(): Promise<NetworkState>;
  subscribe(listener: (state: NetworkState) => void): () => void;
}

export interface ClipboardAdapter {
  getString(): Promise<string>;
  setString(value: string): Promise<void>;
}

export type HapticImpactStyle = 'light' | 'medium' | 'heavy' | 'soft' | 'rigid';
export type HapticNotificationType = 'success' | 'warning' | 'error';

export interface HapticsAdapter {
  impact(style?: HapticImpactStyle): Promise<void> | void;
  notification(type: HapticNotificationType): Promise<void> | void;
  selection(): Promise<void> | void;
}

export type PermissionStatus =
  | 'unavailable'
  | 'denied'
  | 'limited'
  | 'granted'
  | 'blocked';

export interface PermissionsAdapter<TPermission extends string = string> {
  check(permission: TPermission): Promise<PermissionStatus>;
  request(permission: TPermission): Promise<PermissionStatus>;
  openSettings?(): Promise<void>;
}

export interface SecureScreenAdapter {
  enable(): Promise<void> | void;
  disable(): Promise<void> | void;
}

export type ShareContent = {
  title?: string;
} & (
  | { message: string; url?: string }
  | { message?: string; url: string }
);

export interface ShareAdapter {
  share(content: ShareContent): Promise<void>;
}

export interface LoggerAdapter {
  debug(message: string, context?: Readonly<Record<string, unknown>>): void;
  info(message: string, context?: Readonly<Record<string, unknown>>): void;
  warn(message: string, context?: Readonly<Record<string, unknown>>): void;
  error(
    message: string,
    error?: unknown,
    context?: Readonly<Record<string, unknown>>,
  ): void;
}

export interface AnalyticsAdapter {
  track(
    event: string,
    properties?: Readonly<Record<string, unknown>>,
  ): Promise<void> | void;
}

export interface ApplicationAdapters<TPermission extends string = string> {
  network?: NetworkStatusAdapter;
  clipboard?: ClipboardAdapter;
  haptics?: HapticsAdapter;
  permissions?: PermissionsAdapter<TPermission>;
  secureScreen?: SecureScreenAdapter;
  share?: ShareAdapter;
  logger?: LoggerAdapter;
  analytics?: AnalyticsAdapter;
}

export interface ApplicationAdapterProviderProps<TPermission extends string = string> {
  adapters: ApplicationAdapters<TPermission>;
  children: React.ReactNode;
}
