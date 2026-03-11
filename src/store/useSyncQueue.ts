// src/store/useSyncQueue.ts
// Global queue store — tracks all pending actions across hooks
import { create } from 'zustand';

export type QueueAction =
  | 'create_project'
  | 'rename_project'
  | 'delete_project'
  | 'create_session'
  | 'update_session'
  | 'delete_session'
  | 'save_fix'
  | 'delete_fix';

export interface QueueItem {
  id: string;         // unique action id
  action: QueueAction;
  label: string;      // human readable e.g. "Create project"
  status: 'pending' | 'syncing' | 'done' | 'error';
  createdAt: number;
}

interface SyncQueueState {
  items: QueueItem[];
  addItem: (item: Omit<QueueItem, 'createdAt'>) => void;
  updateItem: (id: string, updates: Partial<QueueItem>) => void;
  removeItem: (id: string) => void;
  clearDone: () => void;
}

export const useSyncQueue = create<SyncQueueState>((set) => ({
  items: [],

  addItem: (item) =>
    set((state) => ({
      items: [{ ...item, createdAt: Date.now() }, ...state.items],
    })),

  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    })),

  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  clearDone: () =>
    set((state) => ({ items: state.items.filter((i) => i.status !== 'done') })),
}));