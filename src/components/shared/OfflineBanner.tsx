import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, CheckCircle2, Wifi } from 'lucide-react';
import { powerSync } from '../../lib/powersync';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

type SyncState = 'connecting' | 'syncing' | 'synced' | 'offline';

const OfflineBanner = () => {
  const isOnline = useOnlineStatus();
  const [syncState, setSyncState] = useState<SyncState>('connecting');
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const update = () => {
      const status = powerSync.currentStatus;
      if (!status || !status.connected) { setSyncState('offline'); return; }
      if (status.dataFlowStatus?.uploading || status.dataFlowStatus?.downloading) {
        setSyncState('syncing'); return;
      }
      if (status.lastSyncedAt) {
        setSyncState('synced');
        setLastSynced(new Date(status.lastSyncedAt));
      } else {
        setSyncState('connecting');
      }
    };
    update();
    const unsub = powerSync.registerListener({ statusChanged: update });
    return () => unsub?.();
  }, []);

  useEffect(() => {
    if (isOnline && syncState === 'synced') {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(t);
    }
    setVisible(true);
  }, [syncState, isOnline]);

  if (!visible) return null;

  const formatTime = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 10) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  if (!isOnline) {
    return (
      <div className="w-full bg-orange-500 text-white text-xs font-semibold px-4 py-2.5 flex items-center justify-center gap-2">
        <WifiOff size={13} />
        You're offline - browsing cached data. Changes will sync when you reconnect.
      </div>
    );
  }

  return (
    <div className={`w-full text-xs font-medium px-4 py-1.5 flex items-center justify-center gap-2 transition-all duration-500 ${
      syncState === 'syncing'    ? 'bg-indigo-600 text-white' :
      syncState === 'synced'     ? 'bg-green-500 text-white' :
                                   'bg-gray-700 text-gray-200'
    }`}>
      {syncState === 'connecting' && <><RefreshCw size={11} className="animate-spin" /> Connecting to PowerSync...</>}
      {syncState === 'syncing'    && <><RefreshCw size={11} className="animate-spin" /> Syncing your data...</>}
      {syncState === 'synced'     && <><CheckCircle2 size={11} /> All data synced {lastSynced ? formatTime(lastSynced) : ''} <Wifi size={10} className="ml-1 opacity-70" /></>}
      {syncState === 'offline'    && <><WifiOff size={11} /> PowerSync disconnected — using local data</>}
    </div>
  );
};

export default OfflineBanner;