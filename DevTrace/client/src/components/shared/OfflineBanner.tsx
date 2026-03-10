import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, CheckCircle2, Wifi } from 'lucide-react';
import { powerSync } from '../../lib/powersync';

type SyncState = 'connecting' | 'syncing' | 'synced' | 'offline';

const getState = (): { state: SyncState; lastSynced: Date | null } => {
  const status = powerSync.currentStatus;
  if (!status || !status.connected) return { state: 'offline', lastSynced: null };
  if (status.dataFlowStatus?.uploading || status.dataFlowStatus?.downloading)
    return { state: 'syncing', lastSynced: null };
  if (status.lastSyncedAt)
    return { state: 'synced', lastSynced: new Date(status.lastSyncedAt) };
  return { state: 'connecting', lastSynced: null };
};

const OfflineBanner = () => {
  const [syncState, setSyncState] = useState<SyncState>('connecting');
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [visible, setVisible] = useState(true);

  const update = () => {
    const { state, lastSynced } = getState();
    setSyncState(state);
    if (lastSynced) setLastSynced(lastSynced);
  };

  useEffect(() => {
    update();
    const unsub = powerSync.registerListener({ statusChanged: update });
    // Poll every 3s — catches DevTools offline toggle which doesn't fire events
    const interval = setInterval(update, 3000);
    return () => { unsub?.(); clearInterval(interval); };
  }, []);

  // Auto-hide 4s after synced
  useEffect(() => {
    if (syncState === 'synced') {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(t);
    }
    setVisible(true);
  }, [syncState]);

  if (!visible) return null;

  const formatTime = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 10) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  if (syncState === 'offline') {
    return (
      <div className="w-full bg-orange-500 text-white text-xs font-semibold px-4 py-2.5 flex items-center justify-center gap-2">
        <WifiOff size={13} />
        You're offline — browsing cached data. Changes will sync when you reconnect.
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
    </div>
  );
};

export default OfflineBanner;