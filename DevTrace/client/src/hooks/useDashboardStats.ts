// useDashboardStats.ts — real stats from Supabase for dashboard

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    setLoading(true);

    const [projectsRes, sessionsRes, recentSessionsRes, recentProjectsRes] = await Promise.all([
      supabase.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
      supabase.from('debug_sessions').select('id, status, error_message', { count: 'exact' }).eq('user_id', user!.id),
      supabase.from('debug_sessions')
        .select('*, project:projects(name, language)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase.from('projects')
        .select('id, name, language, updated_at, session_count, error_count')
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false })
        .limit(3),
    ]);

    const totalProjects = projectsRes.count ?? 0;
    const allSessions = sessionsRes.data ?? [];
    const totalSessions = sessionsRes.count ?? 0;
    const resolvedCount = allSessions.filter((s) => s.status === 'resolved').length;
    const totalErrors = allSessions.filter((s) => s.error_message).length;
    const resolvedPercent = totalSessions > 0 ? Math.round((resolvedCount / totalSessions) * 100) : 0;

    setStats({
      totalProjects,
      totalSessions,
      totalErrors,
      resolvedCount,
      resolvedPercent,
      recentSessions: (recentSessionsRes.data ?? []) as DebugSession[],
      recentProjects: recentProjectsRes.data ?? [],
    });

    setLoading(false);
  };

  return { stats, loading, fetchStats };
};

export default useDashboardStats;