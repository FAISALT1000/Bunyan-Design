import React, { createContext, useContext, useMemo } from 'react';
import type {
  ApplicationAdapterProviderProps,
  ApplicationAdapters,
} from './types';

const ApplicationAdapterContext = createContext<ApplicationAdapters>({});

export function ApplicationAdapterProvider<TPermission extends string = string>({
  adapters,
  children,
}: ApplicationAdapterProviderProps<TPermission>) {
  const value = useMemo(
    () => adapters as ApplicationAdapters,
    [adapters],
  );

  return (
    <ApplicationAdapterContext.Provider value={value}>
      {children}
    </ApplicationAdapterContext.Provider>
  );
}

export function useApplicationAdapters<TPermission extends string = string>() {
  return useContext(ApplicationAdapterContext) as ApplicationAdapters<TPermission>;
}
