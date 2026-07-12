import { useCallback, useEffect, useState } from 'react';
import { useApplicationAdapters } from '../application';
import type { PermissionStatus } from '../application/types';

export function usePermissions<TPermission extends string>(permission: TPermission) {
  const { permissions } = useApplicationAdapters<TPermission>();
  const [status, setStatus] = useState<PermissionStatus>();
  const [loading, setLoading] = useState(false);

  const check = useCallback(async () => {
    if (!permissions) {
      setStatus('unavailable');
      return 'unavailable' as const;
    }
    setLoading(true);
    try {
      const nextStatus = await permissions.check(permission);
      setStatus(nextStatus);
      return nextStatus;
    } finally {
      setLoading(false);
    }
  }, [permission, permissions]);

  const request = useCallback(async () => {
    if (!permissions) {
      setStatus('unavailable');
      return 'unavailable' as const;
    }
    setLoading(true);
    try {
      const nextStatus = await permissions.request(permission);
      setStatus(nextStatus);
      return nextStatus;
    } finally {
      setLoading(false);
    }
  }, [permission, permissions]);

  const openSettings = useCallback(
    async () => {
      await permissions?.openSettings?.();
    },
    [permissions],
  );

  useEffect(() => {
    void check();
  }, [check]);

  return {
    status,
    loading,
    check,
    request,
    openSettings,
    isGranted: status === 'granted' || status === 'limited',
    isBlocked: status === 'blocked',
    isSupported: Boolean(permissions),
  };
}
