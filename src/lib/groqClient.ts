import { supabase } from './supabaseClient';

// ─── Internal: call the analyze-bug Edge Function ─────────────────────────────

const callEdgeFunction = async (action: string, payload: Record<string, unknown>) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-bug`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ action, ...payload }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`analyze-bug error ${response.status}: ${JSON.stringify(err)}`);
  }

  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.result;
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type IssueCategory =
  | 'react_state'
  | 'typescript'
  | 'supabase_auth'
  | 'supabase_db'
  | 'supabase_rls'
  | 'powersync'
  | 'groq_api'
  | 'env_config'
  | 'network'
  | 'deployment'
  | 'unknown';

export interface FixOption {
  type: 'quick_patch' | 'proper_fix' | 'workaround';
  title: string;
  code: string;
  explanation: string;
  pros: string;
  cons: string;
}

export interface AIAnalysis {
  plain_english: string;
  root_cause: string;
  symptom_vs_cause: string;
  category: IssueCategory;
  category_reason: string;
  timeline: string[];
  fixes: FixOption[];
  best_fix_index: number;
  checklist: { item: string; priority: 'high' | 'medium' | 'low' }[];
  files_to_check: string[];
  confidence: number;
  follow_up_questions: string[];
  reproduction_steps: string[];
  test_cases: string[];
  verify_fix: string;
  is_frontend: boolean;
  is_backend: boolean;
}

export interface LogAnalysis {
  important_lines: { line: string; reason: string }[];
  root_cause: string;
  noise_summary: string;
  next_action: string;
  confidence: number;
}

export interface StructureAnalysis {
  issues: { path: string; problem: string; suggestion: string }[];
  auth_separation: string;
  reusable_components: string[];
  architecture_summary: string;
  improvements: string[];
}

export interface AIFixResponse {
  fix: string;
  explanation: string;
  confidence: number;
}

// ─── Legacy export (used in existing code) ───────────────────────────────────

export const getAIFix = async (
  errorMessage: string,
  stackTrace?: string,
  language?: string
): Promise<AIFixResponse | null> => {
  try {
    const result = await analyzeSession({ errorMessage, stackTrace, language });
    if (!result) return null;
    const bestFix = result.fixes[result.best_fix_index] ?? result.fixes[0];
    return {
      fix: bestFix
        ? `**${bestFix.title}**\n\n${bestFix.code}\n\n${bestFix.explanation}`
        : result.plain_english,
      explanation: result.root_cause,
      confidence: result.confidence,
    };
  } catch {
    return null;
  }
};

// ─── Main Analysis ────────────────────────────────────────────────────────────

export interface AnalyzeSessionInput {
  errorMessage: string;
  stackTrace?: string;
  codeSnippet?: string;
  expectedBehavior?: string;
  language?: string;
  environment?: string;
  title?: string;
}

export const analyzeSession = async (
  input: AnalyzeSessionInput
): Promise<AIAnalysis | null> => {
  try {
    return await callEdgeFunction('analyzeSession', { input }) as AIAnalysis;
  } catch (err) {
    console.error('analyzeSession error:', err);
    return null;
  }
};

// ─── Follow-up Chat ───────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const sendFollowUp = async (
  originalAnalysis: AIAnalysis,
  originalInput: AnalyzeSessionInput,
  chatHistory: ChatMessage[]
): Promise<string | null> => {
  try {
    return await callEdgeFunction('sendFollowUp', {
      originalAnalysis,
      originalInput,
      chatHistory,
    }) as string;
  } catch (err) {
    console.error('sendFollowUp error:', err);
    return null;
  }
};

// ─── Log Analyzer ─────────────────────────────────────────────────────────────

export const analyzeLogs = async (rawLogs: string): Promise<LogAnalysis | null> => {
  try {
    return await callEdgeFunction('analyzeLogs', { rawLogs }) as LogAnalysis;
  } catch (err) {
    console.error('analyzeLogs error:', err);
    return null;
  }
};

// ─── Structure Analyzer ───────────────────────────────────────────────────────

export const analyzeStructure = async (
  fileTree: string
): Promise<StructureAnalysis | null> => {
  try {
    return await callEdgeFunction('analyzeStructure', { fileTree }) as StructureAnalysis;
  } catch (err) {
    console.error('analyzeStructure error:', err);
    return null;
  }
};