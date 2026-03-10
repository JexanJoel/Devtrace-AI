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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) return;

    const connector = new SupabaseConnector();

    const init = async () => {
      await powerSync.init();
      await powerSync.connect(connector);
      setReady(true);
    };

    init().catch(console.error);

    return () => {
      powerSync.disconnect();
    };
  }, [user]);

  if (!user || !ready) return <>{children}</>;

  return (
    <PowerSyncContext.Provider value={powerSync}>
      {children}
    </PowerSyncContext.Provider>
  );
};