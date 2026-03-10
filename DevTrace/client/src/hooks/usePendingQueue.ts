// src/hooks/usePendingQueue.ts
// Persists offline-created items to localStorage so they survive navigation
import { useState, useEffect } from 'react';

export function usePendingQueue<T extends { id: string }>(key: string) {
  const storageKey = `devtrace_pending_${key}`;

  const [pending, setPending] = useState<T[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  // Keep localStorage in sync whenever pending changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(pending));
    } catch {}
  }, [pending, storageKey]);

  const addPending = (item: T) => {
    setPending(prev => {
      const updated = [item, ...prev.filter(p => p.id !== item.id)];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

  const removePending = (id: string) => {
    setPending(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

  const clearPending = () => {
    setPending([]);
    localStorage.removeItem(storageKey);
  };

  return { pending, addPending, removePending, clearPending };
}