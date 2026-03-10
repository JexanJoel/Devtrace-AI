// src/components/shared/OfflineBanner.tsx
import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, CheckCircle2, Wifi } from 'lucide-react';
import { powerSync } from '../../lib/powersync';

type SyncState = 'connecting' | 'syncing' | 'synced' | 'offline';

const OfflineBanner = () => {
  const [syncState, setSyncState] = useState<SyncState>('connecting');
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const updateStatus = () => {
      const status = powerSync.currentStatus;

      // No status or not connected = offline
      if (!status || !status.connected) {
        setSyncState('offline');
        return;
      }

      if (status.dataFlowStatus?.uploading || status.dataFlowStatus?.downloading) {
        setSyncState('syncing');
      } else if (status.lastSyncedAt) {
        setSyncState('synced');
        setLastSynced(new Date(status.lastSyncedAt));
      } else {
        setSyncState('connecting');
      }
    };

    updateStatus();
    const unsub = powerSync.registerListener({ statusChanged: updateStatus });
    return () => unsub?.();
  }, []);

  // Auto-hide 4s after synced, but always show when offline/syncing/connecting
  useEffect(() => {
    if (syncState === 'synced') {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(t);
    }
    setVisible(true);
  }, [syncState]);

  if (!visible) return null;

  const formatLastSynced = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 10) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  // Offline — orange persistent banner
  if (syncState === 'offline') {
    return (
      <div className="w-full bg-orange-500 text-white text-xs font-semibold px-4 py-2.5 flex items-center justify-center gap-2">
        <WifiOff size={13} />
        You're offline — browsing cached data. Changes will sync when you reconnect.
      </div>
    );
  }

  // Online states — slim colored bar
  return (
    <div className={`w-full text-xs font-medium px-4 py-1.5 flex items-center justify-center gap-2 transition-all duration-500 ${
      syncState === 'syncing'    ? 'bg-indigo-600 text-white' :
      syncState === 'synced'     ? 'bg-green-500 text-white' :
                                   'bg-gray-700 text-gray-200'
    }`}>
      {syncState === 'connecting' && <><RefreshCw size={11} className="animate-spin" /> Connecting to PowerSync...</>}
      {syncState === 'syncing'    && <><RefreshCw size={11} className="animate-spin" /> Syncing your data...</>}
      {syncState === 'synced'     && <><CheckCircle2 size={11} /> All data synced {lastSynced ? formatLastSynced(lastSynced) : ''} <Wifi size={10} className="ml-1 opacity-70" /></>}
    </div>
  );
};

export default OfflineBanner;