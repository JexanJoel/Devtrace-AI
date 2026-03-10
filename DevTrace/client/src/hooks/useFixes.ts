// src/hooks/useFixes.ts
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
    const tags = Array.isArray(data.tags) ? JSON.stringify(data.tags) : (data.tags ?? null);

    await powerSync.writeTransaction(async (tx) => {
      await tx.execute(
        `INSERT INTO fixes (id, user_id, session_id, project_id, title, error_pattern, fix_content, language, tags, use_count, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, user.id, data.session_id ?? null, data.project_id ?? null,
         data.title, data.error_pattern ?? null, data.fix_content,
         data.language ?? null, tags, 0, now]
      );
    });

    return { id, user_id: user.id, use_count: 0, created_at: now, ...data } as Fix;
  };

  const deleteFix = async (id: string) => {
    await powerSync.writeTransaction(async (tx) => {
      await tx.execute('DELETE FROM fixes WHERE id = ?', [id]);
    });
    return true;
  };

  const incrementUseCount = async (id: string) => {
    const fix = fixes.find(f => f.id === id);
    if (!fix) return;
    await powerSync.writeTransaction(async (tx) => {
      await tx.execute('UPDATE fixes SET use_count = ? WHERE id = ?', [(fix.use_count ?? 0) + 1, id]);
    });
  };

  return { fixes, loading: false, createFix, deleteFix, incrementUseCount };
};

export default useFixes;