import { useEffect, useState } from 'react';
import { powerSync } from '../../lib/powersync';
import { WifiOff, RefreshCw, CheckCircle2, Wifi } from 'lucide-react';

type SyncState = 'connecting' | 'syncing' | 'synced' | 'offline';

const SyncStatusBar = () => {
  const [syncState, setSyncState] = useState<SyncState>('connecting');
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  const checkOnline = async () => {
    try {
      await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD', cache: 'no-store',
        signal: AbortSignal.timeout(3000),
      });
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    }
  };

  const updateSyncState = () => {
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

  useEffect(() => {
    checkOnline();
    updateSyncState();
    const interval = setInterval(() => { checkOnline(); updateSyncState(); }, 3000);
    const unsub = powerSync.registerListener({ statusChanged: updateSyncState });
    return () => { clearInterval(interval); unsub?.(); };
  }, []);

  const formatTime = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 10) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  const offline = !isOnline || syncState === 'offline';

  const configs = {
    offline:    { icon: <WifiOff size={10} />,                              label: 'Offline',                                               cls: 'bg-orange-50 dark:bg-orange-950 text-orange-600 border-orange-200 dark:border-orange-800' },
    connecting: { icon: <RefreshCw size={10} className="animate-spin" />,   label: 'Connecting',                                            cls: 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700' },
    syncing:    { icon: <RefreshCw size={10} className="animate-spin" />,   label: 'Syncing...',                                            cls: 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 border-indigo-200 dark:border-indigo-800' },
    synced:     { icon: <CheckCircle2 size={10} />,                         label: lastSynced ? `Synced ${formatTime(lastSynced)}` : 'Synced', cls: 'bg-green-50 dark:bg-green-950 text-green-600 border-green-200 dark:border-green-800' },
  };

  const key = offline ? 'offline' : syncState;
  const { icon, label, cls } = configs[key];

  return (
    <div className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all duration-300 ${cls}`}>
      {icon}
      <span>{label}</span>
      {key === 'synced' && <Wifi size={9} className="ml-0.5 opacity-60" />}
    </div>
  );
};

export default SyncStatusBar;