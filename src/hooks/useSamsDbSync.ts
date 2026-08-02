import { useEffect } from 'react';

export function useSamsDbSync(callback: () => void, targetKeys?: string[]) {
  useEffect(() => {
    const handleSync = (e: Event) => {
      if (targetKeys && e instanceof CustomEvent && e.detail?.key) {
        if (!targetKeys.includes(e.detail.key)) return;
      }
      callback();
    };

    const handleStorage = (e: StorageEvent) => {
      if (targetKeys && e.key) {
        if (!targetKeys.includes(e.key)) return;
      }
      if (e.key?.startsWith('sams_v2_')) {
        callback();
      }
    };

    window.addEventListener('sams_db_sync', handleSync);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('sams_db_sync', handleSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, [callback, targetKeys]);
}
