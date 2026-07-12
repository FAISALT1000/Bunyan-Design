import type { ApplicationAdapters } from './types';

export function createApplicationAdapters<TPermission extends string = string>(
  adapters: ApplicationAdapters<TPermission>,
): ApplicationAdapters<TPermission> {
  return adapters;
}
