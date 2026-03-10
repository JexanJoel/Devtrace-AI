// src/components/providers/PowerSyncProvider.tsx
import { useEffect, useState } from 'react';
import { PowerSyncContext } from '@powersync/react';
import { powerSync } from '../../lib/powersync';
import { SupabaseConnector } from '../../lib/SupabaseConnector';
import { useAuthStore } from '../../store/authStore';
import type { ReactNode } from 'react';

interface Props { children: ReactNode; }

export const PowerSyncProvider = ({ children }: Props) => {
  const { user } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!user) return;

    const connector = new SupabaseConnector();

    const init = async () => {
      try {
        await powerSync.init();
        // Connect but don't wait — works offline too
        powerSync.connect(connector).catch(() => {
          // Connection failed (offline) — that's fine, local data still works
          console.log('PowerSync connect failed — offline mode');
        });
      } catch (e) {
        console.error('PowerSync init error:', e);
      } finally {
        // Always mark as initialized so UI renders with local data
        setInitialized(true);
      }
    };

    init();

    return () => {
      powerSync.disconnect();
    };
  }, [user]);

  // Always render children — even before user logs in (for landing/login pages)
  // Once initialized, wrap with PowerSyncContext so useQuery hooks work
  if (!user || !initialized) {
    return <>{children}</>;
  }

  return (
    <PowerSyncContext.Provider value={powerSync}>
      {children}
    </PowerSyncContext.Provider>
  );
};