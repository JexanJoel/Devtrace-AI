import { useQuery } from '@powersync/react';
import { powerSync } from '../lib/powersync';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { syncQueueAddItem, syncQueueUpdateItem } from '../store/useSyncQueue';
import { v4 as uuidv4 } from 'uuid';
import type { AIAnalysis } from '../lib/groqClient';

export type Status = 'open' | 'in_progress' | 'resolved';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type Environment = 'development' | 'staging' | 'production';

export interface DebugSession {
  id: string;
  user_id: string;
  project_id?: string;
  title: string;
  error_message?: string;
  stack_trace?: string;
  code_snippet?: string;
  expected_behavior?: string;
  environment?: Environment;
  severity: Severity;
  status: Status;
  ai_fix?: string;
  ai_analysis?: AIAnalysis | null;
  notes?: string;
  created_at: string;
  updated_at: string;
  project?: { name: string; language?: string };
  project_name?: string;
  project_language?: string;
}

export interface CreateSessionInput {
  title: string;
  project_id?: string;
  error_message?: string;
  stack_trace?: string;
  code_snippet?: string;
  expected_behavior?: string;
  environment?: Environment;
  severity?: Severity;
  status?: Status;
  notes?: string;
}

// Real SQLite columns that are safe to write through PowerSync's mutation queue.
// ai_analysis and ai_fix are intentionally excluded — they are large blobs that
// crash PowerSync's WASM crud reader. They go direct to Supabase instead.
const POWERSYNC_COLUMNS = new Set([
  'project_id', 'title', 'error_message', 'stack_trace', 'code_snippet',
  'expected_behavior', 'environment', 'severity', 'status', 'notes', 'updated_at',
]);

// ai_analysis and ai_fix are written directly to Supabase (bypassing PowerSync
// mutation queue) then synced back down via WAL — same end result, no WASM crash.
const SUPABASE_DIRECT_COLUMNS = new Set(['ai_analysis', 'ai_fix']);

const useSessions = (projectId?: string) => {
  const { user } = useAuthStore();
  const uid = user?.id ?? '';

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

  const sessions = rawSessions.map(s => ({
    ...s,
    ai_analysis: s.ai_analysis
      ? (typeof s.ai_analysis === 'string' ? JSON.parse(s.ai_analysis) : s.ai_analysis)
      : null,
    project: s.project_name
      ? { name: s.project_name, language: s.project_language ?? undefined }
      : undefined,
  }));

  // ── getSession ────────────────────────────────────────────────────────────
  const getSession = async (id: string): Promise<DebugSession | null> => {
    const results = await powerSync.getAll<any>(
      `SELECT ds.*, p.name as project_name, p.language as project_language
       FROM debug_sessions ds
       LEFT JOIN projects p ON ds.project_id = p.id
       WHERE ds.id = ? LIMIT 1`,
      [id]
    );
    if (!results.length) return null;
    const s = results[0];
    return {
      ...s,
      ai_analysis: s.ai_analysis
        ? (typeof s.ai_analysis === 'string' ? JSON.parse(s.ai_analysis) : s.ai_analysis)
        : null,
      project: s.project_name
        ? { name: s.project_name, language: s.project_language }
        : undefined,
    } as DebugSession;
  };

  // ── createSession ─────────────────────────────────────────────────────────
  const createSession = async (data: CreateSessionInput) => {
    if (!user) return null;
    const id = uuidv4();
    const qid = `create_session_${id}`;
    const now = new Date().toISOString();

    syncQueueAddItem({
      id: qid,
      action: 'create_session',
      label: `Create session "${data.title}"`,
      status: 'syncing',
    });

    try {
      await powerSync.execute(
        `INSERT INTO debug_sessions (
          id, user_id, project_id, title, error_message, stack_trace,
          code_snippet, expected_behavior, environment, severity, status,
          notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, user.id,
          data.project_id ?? null,
          data.title,
          data.error_message ?? null,
          data.stack_trace ?? null,
          data.code_snippet ?? null,
          data.expected_behavior ?? null,
          data.environment ?? 'development',
          data.severity ?? 'medium',
          data.status ?? 'open',
          data.notes ?? null,
          now, now,
        ]
      );

      syncQueueUpdateItem(qid, { status: 'done' });
      return await getSession(id);
    } catch (err) {
      console.error('createSession error:', err);
      syncQueueUpdateItem(qid, { status: 'error' });
      return null;
    }
  };

  // ── updateSession ─────────────────────────────────────────────────────────
  const updateSession = async (id: string, data: Partial<DebugSession>) => {
    const qid = `update_session_${id}_${Date.now()}`;
    const session = sessions.find(s => s.id === id);
    const label = data.status
      ? `Mark "${session?.title ?? 'session'}" as ${data.status.replace('_', ' ')}`
      : data.notes !== undefined
        ? `Update notes on "${session?.title ?? 'session'}"`
        : data.ai_fix
          ? `Save AI fix for "${session?.title ?? 'session'}"`
          : data.ai_analysis
            ? `Save AI analysis for "${session?.title ?? 'session'}"`
            : `Update "${session?.title ?? 'session'}"`;

    syncQueueAddItem({ id: qid, action: 'update_session', label, status: 'syncing' });

    try {
      const now = new Date().toISOString();

      // ── Path A: small fields → PowerSync mutation queue ──────────────────
      const psPayload: Record<string, any> = { updated_at: now };
      for (const [key, value] of Object.entries(data)) {
        if (POWERSYNC_COLUMNS.has(key)) {
          psPayload[key] = value ?? null;
        }
      }

      if (Object.keys(psPayload).length > 1) {
        const keys = Object.keys(psPayload);
        const setClauses = keys.map(k => `${k} = ?`).join(', ');
        const values = keys.map(k => psPayload[k]);
        await powerSync.execute(
          `UPDATE debug_sessions SET ${setClauses} WHERE id = ?`,
          [...values, id]
        );
      }

      // ── Path B: large blob fields → direct Supabase, syncs back via WAL ──
      const hasDirectFields = Object.keys(data).some(k => SUPABASE_DIRECT_COLUMNS.has(k));
      if (hasDirectFields) {
        const directPayload: Record<string, any> = { updated_at: now };
        if (data.ai_analysis !== undefined) {
          directPayload.ai_analysis = data.ai_analysis ?? null;
        }
        if (data.ai_fix !== undefined) {
          directPayload.ai_fix = data.ai_fix ?? null;
        }
        const { error } = await supabase
          .from('debug_sessions')
          .update(directPayload)
          .eq('id', id);
        if (error) throw error;
      }

      syncQueueUpdateItem(qid, { status: 'done' });
      return true;
    } catch (err) {
      console.error('updateSession error:', err);
      syncQueueUpdateItem(qid, { status: 'error' });
      return false;
    }
  };

  // ── deleteSession ─────────────────────────────────────────────────────────
  const deleteSession = async (id: string) => {
    const qid = `delete_session_${id}`;
    const session = sessions.find(s => s.id === id);
    syncQueueAddItem({
      id: qid,
      action: 'delete_session',
      label: `Delete "${session?.title ?? 'session'}"`,
      status: 'syncing',
    });

    try {
      await powerSync.execute(`DELETE FROM debug_sessions WHERE id = ?`, [id]);
      syncQueueUpdateItem(qid, { status: 'done' });
      return true;
    } catch (err) {
      console.error('deleteSession error:', err);
      syncQueueUpdateItem(qid, { status: 'error' });
      return false;
    }
  };

  return { sessions, loading: false, getSession, createSession, updateSession, deleteSession };
};

export default useSessions;