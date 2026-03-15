import { useQuery } from '@powersync/react';
import { powerSync } from '../lib/powersync';
import { useAuthStore } from '../store/authStore';
import { syncQueueAddItem, syncQueueUpdateItem } from '../store/useSyncQueue';
import { v4 as uuidv4 } from 'uuid';

export interface Fix {
  id: string;
  user_id: string;
  session_id?: string;
  project_id?: string;
  title: string;
  error_pattern?: string;
  fix_content: string;
  language?: string;
  tags?: string;
  use_count: number;
  created_at: string;
}

export interface CreateFixInput {
  title: string;
  fix_content: string;
  session_id?: string;
  project_id?: string;
  error_pattern?: string;
  language?: string;
  tags?: string[];
}

const useFixes = () => {
  const { user } = useAuthStore();
  const uid = user?.id ?? '';

  // ── Reads: local SQLite via PowerSync ────────────────────────────────────
  const { data: fixes = [] } = useQuery<Fix>(
    'SELECT * FROM fixes WHERE user_id = ? ORDER BY created_at DESC',
    [uid]
  );

  // ── createFix ─────────────────────────────────────────────────────────────
  const createFix = async (data: CreateFixInput) => {
    if (!user) return null;
    const id = uuidv4();
    const qid = `save_fix_${id}`;
    const now = new Date().toISOString();

    syncQueueAddItem({
      id: qid,
      action: 'save_fix',
      label: `Save fix "${data.title ?? 'fix'}"`,
      status: 'syncing',
    });

    try {
      // tags array → comma-separated text for SQLite
      const tagsText = Array.isArray(data.tags) ? data.tags.join(',') : (data.tags ?? null);

      await powerSync.execute(
        `INSERT INTO fixes (
          id, user_id, session_id, project_id, title, error_pattern,
          fix_content, language, tags, use_count, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          user.id,
          data.session_id ?? null,
          data.project_id ?? null,
          data.title,
          data.error_pattern ?? null,
          data.fix_content,
          data.language ?? null,
          tagsText,
          0,
          now,
        ]
      );

      syncQueueUpdateItem(qid, { status: 'done' });

      return { id, user_id: user.id, use_count: 0, created_at: now, ...data } as Fix;
    } catch (err) {
      console.error('createFix error:', err);
      syncQueueUpdateItem(qid, { status: 'error' });
      return null;
    }
  };

  // ── deleteFix ─────────────────────────────────────────────────────────────
  const deleteFix = async (id: string) => {
    const qid = `delete_fix_${id}`;
    const fix = fixes.find(f => f.id === id);
    syncQueueAddItem({
      id: qid,
      action: 'delete_fix',
      label: `Delete fix "${fix?.title ?? 'fix'}"`,
      status: 'syncing',
    });

    try {
      await powerSync.execute(`DELETE FROM fixes WHERE id = ?`, [id]);
      syncQueueUpdateItem(qid, { status: 'done' });
      return true;
    } catch (err) {
      console.error('deleteFix error:', err);
      syncQueueUpdateItem(qid, { status: 'error' });
      return false;
    }
  };

  // ── incrementUseCount ─────────────────────────────────────────────────────
  const incrementUseCount = async (id: string) => {
    const fix = fixes.find(f => f.id === id);
    if (!fix) return;

    try {
      await powerSync.execute(
        `UPDATE fixes SET use_count = ? WHERE id = ?`,
        [(fix.use_count ?? 0) + 1, id]
      );
    } catch (err) {
      console.error('incrementUseCount error:', err);
    }
  };

  return { fixes, loading: false, createFix, deleteFix, incrementUseCount };
};

export default useFixes;