// src/hooks/useDashboardStats.ts — reads from PowerSync SQLite only
import { useAuthStore } from '../store/authStore';
import { useQuery } from '@powersync/react';
import type { DebugSession } from './useSessions';

export interface DashboardStats {
  totalProjects: number;
  totalSessions: number;
  totalErrors: number;
  resolvedCount: number;
  resolvedPercent: number;
  recentSessions: DebugSession[];
  recentProjects: { id: string; name: string; language: string | null; updated_at: string; session_count: number; error_count: number }[];
}

const useDashboardStats = () => {
  const { user } = useAuthStore();
  const uid = user?.id ?? '';

  const { data: projectStats = [] } = useQuery(
    'SELECT id, status FROM projects WHERE user_id = ?', [uid]
  );
  const { data: sessionStats = [] } = useQuery(
    'SELECT id, status, error_message FROM debug_sessions WHERE user_id = ?', [uid]
  );
  const { data: recentSessionsRaw = [] } = useQuery(
    `SELECT ds.*, p.name as project_name, p.language as project_language
     FROM debug_sessions ds
     LEFT JOIN projects p ON ds.project_id = p.id
     WHERE ds.user_id = ?
     ORDER BY ds.created_at DESC LIMIT 5`, [uid]
  );
  const { data: recentProjectsRaw = [] } = useQuery(
    `SELECT id, name, language, updated_at, session_count, error_count
     FROM projects WHERE user_id = ?
     ORDER BY updated_at DESC LIMIT 3`, [uid]
  );

  const totalProjects   = projectStats.length;
  const totalSessions   = sessionStats.length;
  const resolvedCount   = (sessionStats as any[]).filter(s => s.status === 'resolved').length;
  const totalErrors     = (sessionStats as any[]).filter(s => s.error_message).length;
  const resolvedPercent = totalSessions > 0 ? Math.round((resolvedCount / totalSessions) * 100) : 0;

  const recentSessions = (recentSessionsRaw as any[]).map(s => ({
    ...s,
    project: s.project_name
      ? { name: s.project_name, language: s.project_language ?? undefined }
      : undefined,
  })) as DebugSession[];

  const stats: DashboardStats = {
    totalProjects,
    totalSessions,
    totalErrors,
    resolvedCount,
    resolvedPercent,
    recentSessions,
    recentProjects: recentProjectsRaw as any[],
  };

  return { stats, loading: false, fetchStats: () => {} };
};

export default useDashboardStats;