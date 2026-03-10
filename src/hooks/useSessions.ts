import { useQuery } from '@powersync/react';
import { powerSync } from '../lib/powersync';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { usePendingQueue } from './usePendingQueue';
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
  _pending?: boolean;
  project?: { name: string; language?: string };
}

export interface CreateSessionInput {
  title: string;
  project_id?: string;
  error_message?: string;
  stack_trace?: string;
  severity?: Severity;
  status?: Status;
  notes?: string;
}

const useSessions = (projectId?: string) => {
  const { user } = useAuthStore();
  const uid = user?.id ?? '';
  const { pending, addPending, removePending } = usePendingQueue<DebugSession>('sessions');

  const query = projectId
    ? 'SELECT * FROM debug_sessions WHERE user_id = ? AND project_id = ? ORDER BY created_at DESC'
    : 'SELECT * FROM debug_sessions WHERE user_id = ? ORDER BY created_at DESC';
  const params = projectId ? [uid, projectId] : [uid];

  const { data: syncedSessions = [] } = useQuery<DebugSession>(query, params);

  const syncedIds = new Set(syncedSessions.map(s => s.id));
  const pendingOnly = pending.filter(s =>
    !syncedIds.has(s.id) &&
    (!projectId || s.project_id === projectId)
  );

  const sessions = [
    ...pendingOnly,
    ...syncedSessions,
  ].filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i)
   .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const getSession = async (id: string): Promise<DebugSession | null> => {
    const p = pending.find(s => s.id === id);
    if (p) return p;
    const results = await powerSync.getAll<any>(
      `SELECT ds.*, p.name as project_name, p.language as project_language
       FROM debug_sessions ds
       LEFT JOIN projects p ON ds.project_id = p.id
       WHERE ds.id = ? LIMIT 1`, [id]
    );
    if (!results.length) return null;
    const s = results[0];
    return {
      ...s,
      project: s.project_name ? { name: s.project_name, language: s.project_language } : undefined,
    } as DebugSession;
  };

  const createSession = async (data: CreateSessionInput) => {
    if (!user) return null;
    const id = uuidv4();
    const now = new Date().toISOString();
    const row: DebugSession = {
      id, user_id: user.id,
      severity: data.severity ?? 'medium',
      status: data.status ?? 'open',
      title: data.title,
      project_id: data.project_id,
      error_message: data.error_message,
      stack_trace: data.stack_trace,
      notes: data.notes,
      created_at: now, updated_at: now,
      _pending: true,
    };

    addPending(row);

    const { error } = await supabase.from('debug_sessions').insert({
      id, user_id: user.id, status: row.status, severity: row.severity,
      created_at: now, updated_at: now, ...data,
    });

    if (!error) removePending(id);

    return row;
  };

  const updateSession = async (id: string, data: Partial<DebugSession>) => {
    const { error } = await supabase.from('debug_sessions')
      .update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
    return !error;
  };

  const deleteSession = async (id: string) => {
    removePending(id);
    const { error } = await supabase.from('debug_sessions').delete().eq('id', id);
    return !error;
  };

  return { sessions, loading: false, getSession, createSession, updateSession, deleteSession };
};

export default useSessions;