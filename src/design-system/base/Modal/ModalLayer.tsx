import React, { createContext, useContext, useEffect, useRef } from 'react';

/**
 * Lets app-wide layers (toasts) render inside the top-most open modal.
 * React Native modals are separate native windows, so anything rendered at
 * the app root (like the toast stack) is hidden behind them. Each open
 * `BaseModal` registers here; the provider renders its layer in the newest
 * one, or at the root when no modal is open.
 */
export interface ModalLayerValue {
  /** Ids of open modals, oldest first. */
  hosts: readonly number[];
  register: (id: number) => void;
  unregister: (id: number) => void;
  /** What to draw inside the top-most modal. */
  content: React.ReactNode;
}

export const ModalLayerContext = createContext<ModalLayerValue | null>(null);

let nextHostId = 0;

/** Rendered by BaseModal inside the native modal window. */
export function ModalLayerSlot({ active }: { active: boolean }) {
  const layer = useContext(ModalLayerContext);
  const id = useRef<number | null>(null);
  if (id.current === null) {
    nextHostId += 1;
    id.current = nextHostId;
  }
  const register = layer?.register;
  const unregister = layer?.unregister;
  useEffect(() => {
    const hostId = id.current;
    if (!active || !register || !unregister || hostId === null) return undefined;
    register(hostId);
    return () => unregister(hostId);
  }, [active, register, unregister]);
  if (!layer || !active || layer.hosts[layer.hosts.length - 1] !== id.current) return null;
  return <>{layer.content}</>;
}
