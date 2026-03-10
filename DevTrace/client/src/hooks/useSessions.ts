import { useQuery } from '@powersync/react';
import { powerSync } from '../lib/powersync';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { useOnlineStatus } from './useOnlineStatus';
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
  const isOnline = useOnlineStatus();

  const query = projectId
    ? 'SELECT * FROM debug_sessions WHERE user_id = ? AND project_id = ? ORDER BY created_at DESC'
    : 'SELECT * FROM debug_sessions WHERE user_id = ? ORDER BY created_at DESC';
  const params = projectId ? [uid, projectId] : [uid];

  const { data: sessions = [] } = useQuery<DebugSession>(query, params);

  const getSession = async (id: string): Promise<DebugSession | null> => {
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
    const row = {
      id, user_id: user.id,
      status: data.status ?? 'open',
      severity: data.severity ?? 'medium',
      created_at: now, updated_at: now,
      ...data,
    };

    // Write to local SQLite first — works offline
    await powerSync.execute(
      `INSERT INTO debug_sessions (id, user_id, project_id, title, error_message, stack_trace, severity, status, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [row.id, row.user_id, row.project_id ?? null, row.title, row.error_message ?? null,
       row.stack_trace ?? null, row.severity, row.status, row.notes ?? null, now, now]
    );

    if (isOnline) {
      const { error } = await supabase.from('debug_sessions').insert(row);
      if (error) console.error('Supabase sync error (will retry):', error);
    }

    return row as DebugSession;
  };

  const updateSession = async (id: string, data: Partial<DebugSession>) => {
    const now = new Date().toISOString();
    const fields = { ...data, updated_at: now };

    const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
    await powerSync.execute(
      `UPDATE debug_sessions SET ${setClauses} WHERE id = ?`,
      [...Object.values(fields), id]
    );

    if (isOnline) {
      const { error } = await supabase.from('debug_sessions').update(fields).eq('id', id);
      if (error) console.error('Supabase sync error (will retry):', error);
    }
    return true;
  };

  const deleteSession = async (id: string) => {
    await powerSync.execute('DELETE FROM debug_sessions WHERE id = ?', [id]);
    if (isOnline) {
      const { error } = await supabase.from('debug_sessions').delete().eq('id', id);
      if (error) console.error('Supabase sync error (will retry):', error);
    }
    return true;
  };

  return { sessions, loading: false, getSession, createSession, updateSession, deleteSession };
};

export default useSessions;