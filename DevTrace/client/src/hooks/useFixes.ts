// src/hooks/useFixes.ts — PowerSync version
import { useQuery } from '@powersync/react';
import { supabase } from '../lib/supabaseClient';
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

  // Read from local SQLite
  const { data: fixes = [] } = useQuery<Fix>(
    'SELECT * FROM fixes WHERE user_id = ? ORDER BY created_at DESC',
    [user?.id ?? '']
  );

  const createFix = async (data: Partial<Fix>) => {
    if (!user) return null;
    const id = uuidv4();
    const now = new Date().toISOString();
    const { data: result, error } = await supabase
      .from('fixes')
      .insert({ id, user_id: user.id, use_count: 0, created_at: now, ...data })
      .select().single();
    if (error) { console.error(error); return null; }
    return result;
  };

  const deleteFix = async (id: string) => {
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