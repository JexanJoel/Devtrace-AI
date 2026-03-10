import { useQuery } from '@powersync/react';
import { powerSync } from '../lib/powersync';
import { useAuthStore } from '../store/authStore';
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

const useFixes = () => {
  const { user } = useAuthStore();
  const uid = user?.id ?? '';

  const { data: fixes = [] } = useQuery<Fix>(
    'SELECT * FROM fixes WHERE user_id = ? ORDER BY created_at DESC', [uid]
  );

  const createFix = async (data: Partial<Fix>) => {
    if (!user) return null;
    const id = uuidv4();
    const now = new Date().toISOString();
    const row = { id, user_id: user.id, use_count: 0, created_at: now, ...data };

    await powerSync.execute(
      `INSERT INTO fixes (id, user_id, session_id, project_id, title, error_pattern, fix_content, language, tags, use_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [row.id, row.user_id, row.session_id ?? null, row.project_id ?? null,
       row.title, row.error_pattern ?? null, row.fix_content,
       row.language ?? null,
       Array.isArray(row.tags) ? JSON.stringify(row.tags) : (row.tags ?? null),
       0, now]
    );

    return row as Fix;
  };

  const deleteFix = async (id: string) => {
    await powerSync.execute('DELETE FROM fixes WHERE id = ?', [id]);
    return true;
  };

  const incrementUseCount = async (id: string) => {
    const fix = fixes.find(f => f.id === id);
    if (!fix) return;
    await powerSync.execute(
      'UPDATE fixes SET use_count = ? WHERE id = ?',
      [(fix.use_count ?? 0) + 1, id]
    );
  };

  return { fixes, loading: false, createFix, deleteFix, incrementUseCount };
};

export default useFixes;