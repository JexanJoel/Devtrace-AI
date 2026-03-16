import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MastraSessionAnalysis {
  agentId: 'session-debugger';
  result: string; // Rich markdown response from the agent
}

export interface MastraProjectAnalysis {
  agentId: 'project-analyzer';
  result: string; // Rich markdown response from the agent
}

// ── Helper — call the mastra-agent Edge Function ──────────────────────────────

const callMastraEdgeFunction = async (
  action: string,
  payload: Record<string, unknown>
): Promise<string> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mastra-agent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ action, ...payload }),
    }
  );

  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.result as string;
};

// ── Hook ──────────────────────────────────────────────────────────────────────

const useMastraAgent = () => {
  const [loadingSession, setLoadingSession] = useState(false);
  const [loadingProject, setLoadingProject] = useState(false);
  const [sessionAnalysis, setSessionAnalysis] = useState<string | null>(null);
  const [projectAnalysis, setProjectAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Session Debugger — deep dive on a single session ─────────────────────
  const debugSession = useCallback(async (params: {
    errorMessage: string;
    stackTrace?: string;
    codeSnippet?: string;
    sessionTitle?: string;
    projectLanguage?: string;
  }) => {
    setLoadingSession(true);
    setError(null);
    setSessionAnalysis(null);

    try {
      const result = await callMastraEdgeFunction('debugSession', params);
      setSessionAnalysis(result);
      return result;
    } catch (err: any) {
      const msg = err.message ?? 'Mastra agent failed';
      setError(msg);
      return null;
    } finally {
      setLoadingSession(false);
    }
  }, []);

  // ── Project Analyzer — patterns across all sessions ───────────────────────
  const analyzeProject = useCallback(async (params: {
    projectName: string;
    projectLanguage?: string;
    sessions: Array<{
      title: string;
      status: string;
      severity: string;
      error_message?: string;
      ai_analysis?: { category?: string; root_cause?: string } | null;
    }>;
  }) => {
    setLoadingProject(true);
    setError(null);
    setProjectAnalysis(null);

    try {
      const result = await callMastraEdgeFunction('analyzeProject', params);
      setProjectAnalysis(result);
      return result;
    } catch (err: any) {
      const msg = err.message ?? 'Mastra agent failed';
      setError(msg);
      return null;
    } finally {
      setLoadingProject(false);
    }
  }, []);

  const clearSessionAnalysis = useCallback(() => setSessionAnalysis(null), []);
  const clearProjectAnalysis = useCallback(() => setProjectAnalysis(null), []);

  return {
    // Session Debugger
    debugSession,
    loadingSession,
    sessionAnalysis,

    // Project Analyzer
    analyzeProject,
    loadingProject,
    projectAnalysis,

    // Shared
    error,
    clearSessionAnalysis,
    clearProjectAnalysis,
  };
};

export default useMastraAgent;