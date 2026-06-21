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

export interface ApplicationAdapters<TPermission extends string = string> {
  network?: NetworkStatusAdapter;
  clipboard?: ClipboardAdapter;
  haptics?: HapticsAdapter;
  permissions?: PermissionsAdapter<TPermission>;
}

export interface ApplicationAdapterProviderProps<TPermission extends string = string> {
  adapters: ApplicationAdapters<TPermission>;
  children: React.ReactNode;
}
