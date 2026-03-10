import { useQuery } from '@powersync/react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';
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
  _pending?: boolean;
}

const useFixes = () => {
  const { user } = useAuthStore();
  const uid = user?.id ?? '';

  const { data: syncedFixes = [] } = useQuery<Fix>(
    'SELECT * FROM fixes WHERE user_id = ? ORDER BY created_at DESC', [uid]
  );
  const [pendingFixes, setPendingFixes] = useState<Fix[]>([]);

  const syncedIds = new Set(syncedFixes.map(f => f.id));
  const pendingOnly = pendingFixes.filter(f => !syncedIds.has(f.id));
  const fixes = [...syncedFixes, ...pendingOnly].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const createFix = async (data: Partial<Fix>) => {
    if (!user) return null;
    const id = uuidv4();
    const now = new Date().toISOString();
    const row: Fix = { id, user_id: user.id, use_count: 0, created_at: now, _pending: true, ...data } as Fix;

    setPendingFixes(prev => [row, ...prev]);

    const { error } = await supabase.from('fixes').insert({
      id, user_id: user.id, use_count: 0, created_at: now, ...data,
    });

    if (error) {
      console.log('Offline — fix queued locally');
    } else {
      setPendingFixes(prev => prev.filter(f => f.id !== id));
    }

    return row;
  };

  const deleteFix = async (id: string) => {
    setPendingFixes(prev => prev.filter(f => f.id !== id));
    const { error } = await supabase.from('fixes').delete().eq('id', id);
    return !error;
  };

  const incrementUseCount = async (id: string) => {
    const fix = fixes.find(f => f.id === id);
    if (!fix) return;
    await supabase.from('fixes').update({ use_count: (fix.use_count ?? 0) + 1 }).eq('id', id);
  };

  return { fixes, loading: false, createFix, deleteFix, incrementUseCount };
};

export default useFixes;