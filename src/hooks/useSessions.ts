import { useQuery } from '@powersync/react';
import { powerSync } from '../lib/powersync';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { usePendingQueue } from './usePendingQueue';
import { syncQueueAddItem, syncQueueUpdateItem } from '../store/useSyncQueue';
import { v4 as uuidv4 } from 'uuid';
import { useOnlineStatus } from './useOnlineStatus';

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
  // raw JOIN columns from PowerSync query
  project_name?: string;
  project_language?: string;
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
  const isOnline = useOnlineStatus();

  // ✅ JOIN projects so session.project is always populated
  const query = projectId
    ? `SELECT ds.*, p.name as project_name, p.language as project_language
       FROM debug_sessions ds
       LEFT JOIN projects p ON ds.project_id = p.id
       WHERE ds.user_id = ? AND ds.project_id = ?
       ORDER BY ds.created_at DESC`
    : `SELECT ds.*, p.name as project_name, p.language as project_language
       FROM debug_sessions ds
       LEFT JOIN projects p ON ds.project_id = p.id
       WHERE ds.user_id = ?
       ORDER BY ds.created_at DESC`;
  const params = projectId ? [uid, projectId] : [uid];

  const { data: rawSessions = [] } = useQuery<DebugSession>(query, params);

  // Map JOIN columns → nested project object
  const syncedSessions = rawSessions.map(s => ({
    ...s,
    project: s.project_name ? { name: s.project_name, language: s.project_language ?? undefined } : undefined,
  }));

  const syncedIds = new Set(syncedSessions.map(s => s.id));
  const pendingOnly = pending.filter(s =>
    !syncedIds.has(s.id) && (!projectId || s.project_id === projectId)
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
    return { ...s, project: s.project_name ? { name: s.project_name, language: s.project_language } : undefined } as DebugSession;
  };

  const createSession = async (data: CreateSessionInput) => {
    if (!user) return null;
    const id = uuidv4();
    const qid = `create_session_${id}`;
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
      created_at: now, updated_at: now, _pending: true,
    };

    addPending(row);
    syncQueueAddItem({ id: qid, action: 'create_session', label: `Create session "${data.title}"`, status: 'pending' });

    await new Promise(r => setTimeout(r, 80));
    syncQueueUpdateItem(qid, { status: 'syncing' });

    const { error } = await supabase.from('debug_sessions').insert({
      id, user_id: user.id, status: row.status, severity: row.severity,
      created_at: now, updated_at: now, ...data,
    });

    if (!error) {
      removePending(id);
      syncQueueUpdateItem(qid, { status: 'done' });
    } else {
      syncQueueUpdateItem(qid, { status: isOnline ? 'error' : 'pending' });
    }

    return row;
  };

  const updateSession = async (id: string, data: Partial<DebugSession>) => {
    const qid = `update_session_${id}_${Date.now()}`;
    const session = sessions.find(s => s.id === id);
    const label = data.status
      ? `Mark "${session?.title ?? 'session'}" as ${data.status.replace('_', ' ')}`
      : data.notes !== undefined
        ? `Update notes on "${session?.title ?? 'session'}"`
        : data.ai_fix
          ? `Save AI fix for "${session?.title ?? 'session'}"`
          : `Update "${session?.title ?? 'session'}"`;

    syncQueueAddItem({ id: qid, action: 'update_session', label, status: 'syncing' });
    const { error } = await supabase.from('debug_sessions')
      .update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
    syncQueueUpdateItem(qid, { status: error ? 'error' : 'done' });
    return !error;
  };

  const deleteSession = async (id: string) => {
    const qid = `delete_session_${id}`;
    const session = sessions.find(s => s.id === id);
    syncQueueAddItem({ id: qid, action: 'delete_session', label: `Delete "${session?.title ?? 'session'}"`, status: 'syncing' });
    removePending(id);
    const { error } = await supabase.from('debug_sessions').delete().eq('id', id);
    syncQueueUpdateItem(qid, { status: error ? 'error' : 'done' });
    return !error;
  };

  return { sessions, loading: false, getSession, createSession, updateSession, deleteSession };
};

export default useSessions;