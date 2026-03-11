import { CloudOff, HardDrive, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

const OfflineModeBar = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="w-full bg-orange-50 dark:bg-orange-950/30 border-b border-orange-200 dark:border-orange-800/50 px-4 sm:px-6 py-2 flex items-center gap-3 flex-wrap">

      {/* Mode label */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
        <span className="text-orange-600 dark:text-orange-400 font-semibold text-xs tracking-wide uppercase">
          Offline Mode
        </span>
      </div>

      <div className="w-px h-3 bg-orange-200 dark:bg-orange-700 flex-shrink-0" />

      {/* Pills */}
      <div className="flex items-center gap-2 flex-wrap">

        <span className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 px-2 py-0.5 rounded-md">
          <CloudOff size={10} />
          Cloud AI unavailable
        </span>

        <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded-md">
          <HardDrive size={10} />
          Local history &amp; fixes available
        </span>

        <span className="flex items-center gap-1 text-xs text-orange-500 dark:text-orange-400 bg-orange-100/60 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/50 px-2 py-0.5 rounded-md">
          <RefreshCw size={10} />
          Syncs on reconnect
        </span>

      </div>
    </div>
  );
};

export default OfflineModeBar;