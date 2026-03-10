// src/hooks/useSessions.ts
import { useQuery } from '@powersync/react';
import { powerSync } from '../lib/powersync';
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
    const severity = data.severity ?? 'medium';
    const status = data.status ?? 'open';

    await powerSync.writeTransaction(async (tx) => {
      await tx.execute(
        `INSERT INTO debug_sessions (id, user_id, project_id, title, error_message, stack_trace, severity, status, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, user.id, data.project_id ?? null, data.title, data.error_message ?? null,
         data.stack_trace ?? null, severity, status, data.notes ?? null, now, now]
      );
    });

    return { id, user_id: user.id, severity, status, created_at: now, updated_at: now, ...data } as DebugSession;
  };

  const updateSession = async (id: string, data: Partial<DebugSession>) => {
    const now = new Date().toISOString();
    const fields = { ...data, updated_at: now };
    const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
    await powerSync.writeTransaction(async (tx) => {
      await tx.execute(
        `UPDATE debug_sessions SET ${setClauses} WHERE id = ?`,
        [...Object.values(fields), id]
      );
    });
    return true;
  };

  const deleteSession = async (id: string) => {
    await powerSync.writeTransaction(async (tx) => {
      await tx.execute('DELETE FROM debug_sessions WHERE id = ?', [id]);
    });
    return true;
  };

  return { sessions, loading: false, getSession, createSession, updateSession, deleteSession };
};

export default useSessions;