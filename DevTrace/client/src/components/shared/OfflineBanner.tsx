// src/components/shared/OfflineBanner.tsx
// Shows on every page when offline — uses browser online/offline events
// Also shows PowerSync sync status when online

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { powerSync } from '../../lib/powersync';

type SyncState = 'connecting' | 'syncing' | 'synced' | 'offline';

const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncState, setSyncState] = useState<SyncState>('connecting');
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [showSyncBar, setShowSyncBar] = useState(true);

  // Browser online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // PowerSync status
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

  // Auto-hide sync bar 4 seconds after synced
  useEffect(() => {
    if (syncState === 'synced') {
      setShowSyncBar(true);
      const t = setTimeout(() => setShowSyncBar(false), 4000);
      return () => clearTimeout(t);
    } else {
      setShowSyncBar(true);
    }
  }, [syncState]);

  const formatLastSynced = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 10) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  // OFFLINE — show persistent warning banner
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-orange-500 text-white text-xs font-semibold px-4 py-2.5 flex items-center justify-center gap-2 shadow-lg">
        <WifiOff size={13} />
        You're offline — browsing cached data. Changes will sync when you reconnect.
      </div>
    );
  }

  // ONLINE but syncing/connecting — show slim top bar
  if (!showSyncBar) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[9999] text-xs font-medium px-4 py-1.5 flex items-center justify-center gap-2 transition-all duration-500 ${
      syncState === 'syncing' ? 'bg-indigo-600 text-white' :
      syncState === 'synced' ? 'bg-green-500 text-white' :
      syncState === 'connecting' ? 'bg-gray-700 text-gray-200' : 'bg-orange-500 text-white'
    }`}>
      {syncState === 'connecting' && (
        <><RefreshCw size={11} className="animate-spin" /> Connecting to PowerSync...</>
      )}
      {syncState === 'syncing' && (
        <><RefreshCw size={11} className="animate-spin" /> Syncing your data...</>
      )}
      {syncState === 'synced' && (
        <><CheckCircle2 size={11} /> All data synced {lastSynced ? formatLastSynced(lastSynced) : ''}</>
      )}
      {syncState === 'offline' && (
        <><WifiOff size={11} /> PowerSync disconnected — using local data</>
      )}
    </div>
  );
};

export default OfflineBanner;