// useSessions — fetch, create, update, delete debug sessions

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'open' | 'in_progress' | 'resolved';

export interface DebugSession {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  error_message: string | null;
  stack_trace: string | null;
  severity: Severity;
  status: Status;
  ai_fix: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  project?: { name: string; language: string | null };
}

export interface CreateSessionInput {
  title: string;
  project_id?: string;
  error_message?: string;
  stack_trace?: string;
  severity?: Severity;
}

const useSessions = (projectId?: string) => {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<DebugSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchSessions();
  }, [user, projectId]);

  const fetchSessions = async () => {
    setLoading(true);
    let query = supabase
      .from('debug_sessions')
      .select('*, project:projects(name, language)')
      .eq('user_id', user!.id)
      .order('updated_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    if (error) toast.error('Failed to load sessions');
    else setSessions(data ?? []);
    setLoading(false);
  };

  const createSession = async (input: CreateSessionInput) => {
    const { data, error } = await supabase
      .from('debug_sessions')
      .insert({ ...input, user_id: user!.id })
      .select('*, project:projects(name, language)')
      .single();

    if (error) { toast.error('Failed to create session'); return null; }
    setSessions((prev) => [data, ...prev]);
    toast.success('Session created!');

    // Increment project session_count
    if (input.project_id) {
      await supabase.rpc('increment_session_count', { project_id: input.project_id });
    }

    return data;
  };

  const updateSession = async (id: string, updates: Partial<DebugSession>) => {
    const { error } = await supabase
      .from('debug_sessions')
      .update(updates)
      .eq('id', id);

    if (error) { toast.error('Failed to update session'); return false; }
    setSessions((prev) => prev.map((s) => s.id === id ? { ...s, ...updates } : s));
    return true;
  };

  const deleteSession = async (id: string) => {
    const session = sessions.find((s) => s.id === id);
    const { error } = await supabase
      .from('debug_sessions')
      .delete()
      .eq('id', id);

    if (error) { toast.error('Failed to delete session'); return false; }
    setSessions((prev) => prev.filter((s) => s.id !== id));

    // Decrement project session_count
    if (session?.project_id) {
      await supabase.rpc('decrement_session_count', { project_id: session.project_id });
    }

    toast.success('Session deleted');
    return true;
  };

  const getSession = async (id: string) => {
    const { data, error } = await supabase
      .from('debug_sessions')
      .select('*, project:projects(name, language)')
      .eq('id', id)
      .single();

    if (error) { toast.error('Session not found'); return null; }
    return data as DebugSession;
  };

  return {
    sessions, loading,
    fetchSessions, createSession,
    updateSession, deleteSession, getSession,
  };
};

export default useSessions;