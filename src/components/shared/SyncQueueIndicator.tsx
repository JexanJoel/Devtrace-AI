// src/components/shared/SyncQueueIndicator.tsx
import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Clock, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { useSyncQueue } from '../../store/useSyncQueue';

const SyncQueueIndicator = () => {
  const { items, clearDone } = useSyncQueue();
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hideTimer, setHideTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const pending  = items.filter((i) => i.status === 'pending');
  const syncing  = items.filter((i) => i.status === 'syncing');
  const done     = items.filter((i) => i.status === 'done');
  const errored  = items.filter((i) => i.status === 'error');

  const total      = items.length;
  const activeCount = pending.length + syncing.length;

  useEffect(() => {
    // Show immediately when any item arrives
    if (total > 0) {
      setVisible(true);
      if (hideTimer) clearTimeout(hideTimer);
    }

    // Hide 3s after everything is done
    if (total > 0 && activeCount === 0 && errored.length === 0) {
      const t = setTimeout(() => {
        setVisible(false);
        clearDone();
        setExpanded(false);
      }, 3000);
      setHideTimer(t);
      return () => clearTimeout(t);
    }
  }, [total, activeCount, errored.length]);

  // Always render the container — use opacity/transform to animate in/out
  return (
    <div className={`fixed bottom-5 left-5 z-50 flex flex-col items-start gap-2 transition-all duration-300 ${
      visible && total > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
    }`}>

      {/* Expanded list */}
      {expanded && total > 0 && (
        <div className="w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Action Queue
            </p>
            <span className="text-xs text-gray-400">{items.length} action{items.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="max-h-52 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                {item.status === 'pending'  && <Clock        size={13} className="text-orange-400 flex-shrink-0" />}
                {item.status === 'syncing'  && <Loader2      size={13} className="text-indigo-500 animate-spin flex-shrink-0" />}
                {item.status === 'done'     && <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />}
                {item.status === 'error'    && <AlertCircle  size={13} className="text-red-500 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate">{item.label}</p>
                  <p className={`text-xs mt-0.5 ${
                    item.status === 'pending' ? 'text-orange-400' :
                    item.status === 'syncing' ? 'text-indigo-400' :
                    item.status === 'done'    ? 'text-emerald-500' :
                                               'text-red-400'
                  }`}>
                    {item.status === 'pending' ? 'Queued' :
                     item.status === 'syncing' ? 'Syncing...' :
                     item.status === 'done'    ? 'Synced' : 'Failed'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary pill */}
      {total > 0 && (() => {
        const isSyncing  = syncing.length > 0;
        const allDone    = activeCount === 0 && errored.length === 0 && done.length > 0;
        const hasErrors  = errored.length > 0;
        const hasPending = pending.length > 0 && !isSyncing;

        return (
          <button
            onClick={() => setExpanded((e) => !e)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full shadow-lg text-xs font-semibold transition-all duration-200 ${
              hasErrors  ? 'bg-red-500 text-white' :
              isSyncing  ? 'bg-indigo-600 text-white' :
              allDone    ? 'bg-emerald-500 text-white' :
                           'bg-orange-500 text-white'
            }`}>
            {isSyncing  && <Loader2      size={13} className="animate-spin" />}
            {allDone    && <CheckCircle2 size={13} />}
            {hasPending && <Clock        size={13} />}
            {hasErrors  && <AlertCircle  size={13} />}

            <span>
              {isSyncing  ? `Syncing ${syncing.length + pending.length} change${syncing.length + pending.length !== 1 ? 's' : ''}...` :
               allDone    ? 'All changes synced' :
               hasPending ? `${pending.length} change${pending.length !== 1 ? 's' : ''} pending` :
                            `${errored.length} action${errored.length !== 1 ? 's' : ''} failed`}
            </span>

            {expanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          </button>
        );
      })()}
    </div>
  );
};

export default SyncQueueIndicator;