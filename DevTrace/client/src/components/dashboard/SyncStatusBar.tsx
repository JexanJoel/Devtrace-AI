// src/components/dashboard/SyncStatusBar.tsx
// Compact pill in the topbar showing live sync state
import { useEffect, useState } from 'react';
import { powerSync } from '../../lib/powersync';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

type SyncState = 'connecting' | 'syncing' | 'synced' | 'offline';

const SyncStatusBar = () => {
  const [syncState, setSyncState] = useState<SyncState>('connecting');
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      const status = powerSync.currentStatus;
      if (!status || !status.connected) { setSyncState('offline'); return; }
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

  const formatTime = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 10) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  const configs = {
    connecting: { icon: <RefreshCw size={10} className="animate-spin" />, label: 'Connecting', cls: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700' },
    syncing:    { icon: <RefreshCw size={10} className="animate-spin" />, label: 'Syncing...', cls: 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' },
    synced:     { icon: <CheckCircle2 size={10} />, label: lastSynced ? `Synced ${formatTime(lastSynced)}` : 'Synced', cls: 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' },
    offline:    { icon: <WifiOff size={10} />, label: 'Offline', cls: 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
  };

  const { icon, label, cls } = configs[syncState];

  return (
    <div className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border ${cls} transition-all duration-300`}>
      {icon}
      <span>{label}</span>
      {syncState === 'synced' && <Wifi size={9} className="ml-0.5 opacity-60" />}
    </div>
  );
};

export default SyncStatusBar;