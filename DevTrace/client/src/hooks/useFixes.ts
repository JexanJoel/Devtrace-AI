// useFixes.ts — fetch, create, delete fixes from Fix Library

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export interface Fix {
  id: string;
  user_id: string;
  session_id: string | null;
  project_id: string | null;
  title: string;
  error_pattern: string | null;
  fix_content: string;
  language: string | null;
  tags: string[] | null;
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
  const [fixes, setFixes] = useState<Fix[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchFixes();
  }, [user]);

  const fetchFixes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('fixes')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (error) toast.error('Failed to load fix library');
    else setFixes(data ?? []);
    setLoading(false);
  };

  const createFix = async (input: CreateFixInput) => {
    const { data, error } = await supabase
      .from('fixes')
      .insert({ ...input, user_id: user!.id })
      .select()
      .single();

    if (error) { toast.error('Failed to save fix'); return null; }
    setFixes((prev) => [data, ...prev]);
    toast.success('Fix saved to library!');
    return data as Fix;
  };

  const deleteFix = async (id: string) => {
    const { error } = await supabase.from('fixes').delete().eq('id', id);
    if (error) { toast.error('Failed to delete fix'); return false; }
    setFixes((prev) => prev.filter((f) => f.id !== id));
    toast.success('Fix deleted');
    return true;
  };

  const incrementUseCount = async (id: string) => {
    await supabase.rpc('increment_fix_use_count', { fix_id: id });
    setFixes((prev) => prev.map((f) => f.id === id ? { ...f, use_count: f.use_count + 1 } : f));
  };

  return { fixes, loading, fetchFixes, createFix, deleteFix, incrementUseCount };
};

export default useFixes;