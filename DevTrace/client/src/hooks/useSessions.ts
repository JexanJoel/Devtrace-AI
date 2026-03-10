// src/hooks/useSessions.ts — PowerSync version
import { useState } from 'react';
import { useQuery } from '@powersync/react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { v4 as uuidv4 } from 'uuid';

export type Status = 'open' | 'in_progress' | 'resolved';
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface DebugSession {
  id: string;
  user_id: string;
  project_id?: string;
  title: string;
  error_message?: string;
  stack_trace?: string;
  severity: Severity;
  status: Status;
  ai_fix?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  project?: { name: string; language?: string };
}

const useSessions = (projectId?: string) => {
  const { user } = useAuthStore();
  const [loading] = useState(false);

  const query = projectId
    ? 'SELECT * FROM debug_sessions WHERE user_id = ? AND project_id = ? ORDER BY created_at DESC'
    : 'SELECT * FROM debug_sessions WHERE user_id = ? ORDER BY created_at DESC';

  const params = projectId ? [user?.id ?? '', projectId] : [user?.id ?? ''];

  // Read from local SQLite
  const { data: sessions = [] } = useQuery<DebugSession>(query, params);

  const getSession = async (id: string): Promise<DebugSession | null> => {
    const { data, error } = await supabase
      .from('debug_sessions')
      .select('*, project:projects(name, language)')
      .eq('id', id)
      .single();
    if (error) return null;
    return data as DebugSession;
  };

  const createSession = async (data: Partial<DebugSession>) => {
    if (!user) return null;
    const id = uuidv4();
    const now = new Date().toISOString();
    const { data: result, error } = await supabase
      .from('debug_sessions')
      .insert({ id, user_id: user.id, status: 'open', severity: 'medium', created_at: now, updated_at: now, ...data })
      .select().single();
    if (error) { console.error(error); return null; }
    return result;
  };

  const updateSession = async (id: string, data: Partial<DebugSession>) => {
    const { error } = await supabase
      .from('debug_sessions')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);
    return !error;
  };

  const deleteSession = async (id: string) => {
    const { error } = await supabase.from('debug_sessions').delete().eq('id', id);
    return !error;
  };

  return { sessions, loading, getSession, createSession, updateSession, deleteSession };
};

export default useSessions;