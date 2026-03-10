import { useEffect, useState } from 'react';
import { powerSync } from '../../lib/powersync';
import { WifiOff, RefreshCw, CheckCircle2, Wifi } from 'lucide-react';

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

const SyncStatusBar = () => {
  const [syncState, setSyncState] = useState<SyncState>('connecting');
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const update = () => {
    const { state, lastSynced } = getState();
    setSyncState(state);
    if (lastSynced) setLastSynced(lastSynced);
  };

  useEffect(() => {
    update();
    // Listen to PowerSync events
    const unsub = powerSync.registerListener({ statusChanged: update });
    // Also poll every 3s as fallback (DevTools offline doesn't always fire events)
    const interval = setInterval(update, 3000);
    return () => { unsub?.(); clearInterval(interval); };
  }, []);

  const formatTime = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 10) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  const configs = {
    connecting: { icon: <RefreshCw size={10} className="animate-spin" />, label: 'Connecting', cls: 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700' },
    syncing:    { icon: <RefreshCw size={10} className="animate-spin" />, label: 'Syncing...', cls: 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 border-indigo-200 dark:border-indigo-800' },
    synced:     { icon: <CheckCircle2 size={10} />, label: lastSynced ? `Synced ${formatTime(lastSynced)}` : 'Synced', cls: 'bg-green-50 dark:bg-green-950 text-green-600 border-green-200 dark:border-green-800' },
    offline:    { icon: <WifiOff size={10} />, label: 'Offline', cls: 'bg-orange-50 dark:bg-orange-950 text-orange-600 border-orange-200 dark:border-orange-800' },
  };

  const { icon, label, cls } = configs[syncState];

  return (
    <div className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all duration-300 ${cls}`}>
      {icon}
      <span>{label}</span>
      {syncState === 'synced' && <Wifi size={9} className="ml-0.5 opacity-60" />}
    </div>
  );
};

export default SyncStatusBar;