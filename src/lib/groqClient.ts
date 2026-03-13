const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const groqFetch = async (messages: { role: string; content: string }[], maxTokens = 2048) => {
  if (!GROQ_API_KEY) throw new Error('VITE_GROQ_API_KEY is not set');
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.3,
      max_tokens: maxTokens,
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Groq API error ${response.status}: ${JSON.stringify(err)}`);
  }
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content ?? '';
  return text.replace(/```json|```/g, '').trim();
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

// ─── Legacy export (used in existing code) ───────────────────────────────────

export interface AIFixResponse {
  fix: string;
  explanation: string;
  confidence: number;
}

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
      fix: bestFix ? `**${bestFix.title}**\n\n${bestFix.code}\n\n${bestFix.explanation}` : result.plain_english,
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

export const analyzeSession = async (input: AnalyzeSessionInput): Promise<AIAnalysis | null> => {
  const prompt = `You are an expert debugger specializing in: Vite + React + TypeScript + Supabase + PowerSync + Groq AI apps.

Analyze this bug and return a comprehensive JSON analysis.

SESSION TITLE: ${input.title ?? 'Unknown'}
ERROR MESSAGE: ${input.errorMessage}
${input.stackTrace ? `STACK TRACE:\n${input.stackTrace}` : ''}
${input.codeSnippet ? `RELATED CODE:\n${input.codeSnippet}` : ''}
${input.expectedBehavior ? `EXPECTED BEHAVIOR: ${input.expectedBehavior}` : ''}
${input.language ? `LANGUAGE/FRAMEWORK: ${input.language}` : ''}
${input.environment ? `ENVIRONMENT: ${input.environment}` : ''}

Respond ONLY with valid JSON, no markdown, no extra text:
{
  "plain_english": "explain what went wrong in 2-3 sentences a beginner can understand",
  "root_cause": "the actual technical root cause",
  "symptom_vs_cause": "what the error shows (symptom) vs what actually broke (cause)",
  "category": "one of: react_state | typescript | supabase_auth | supabase_db | supabase_rls | powersync | groq_api | env_config | network | deployment | unknown",
  "category_reason": "one sentence why this falls into that category",
  "timeline": [
    "1. App starts / component mounts",
    "2. ...",
    "3. ...",
    "4. Error thrown here"
  ],
  "fixes": [
    {
      "type": "quick_patch",
      "title": "Short title",
      "code": "actual code fix or empty string if not applicable",
      "explanation": "what this fix does",
      "pros": "why this is good",
      "cons": "tradeoffs"
    },
    {
      "type": "proper_fix",
      "title": "Short title",
      "code": "actual code fix",
      "explanation": "what this fix does",
      "pros": "why this is good",
      "cons": "tradeoffs"
    },
    {
      "type": "workaround",
      "title": "Short title",
      "code": "actual code or steps",
      "explanation": "what this fix does",
      "pros": "why this is good",
      "cons": "tradeoffs"
    }
  ],
  "best_fix_index": 1,
  "checklist": [
    { "item": "actionable check", "priority": "high" },
    { "item": "actionable check", "priority": "medium" },
    { "item": "actionable check", "priority": "low" }
  ],
  "files_to_check": ["list of files/components to inspect"],
  "confidence": 85,
  "follow_up_questions": [
    "Question to help narrow down the issue?",
    "Another clarifying question?"
  ],
  "reproduction_steps": [
    "Step 1 to reproduce",
    "Step 2"
  ],
  "test_cases": [
    "Test: what to verify",
    "Edge case to check"
  ],
  "verify_fix": "What should happen after applying the fix to confirm it worked",
  "is_frontend": true,
  "is_backend": false
}`;

  try {
    const text = await groqFetch([{ role: 'user', content: prompt }], 2048);
    return JSON.parse(text) as AIAnalysis;
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
  const systemPrompt = `You are an expert debugger helping analyze this specific bug.

Original error: ${originalInput.errorMessage}
Your previous analysis summary: ${originalAnalysis.plain_english}
Root cause identified: ${originalAnalysis.root_cause}
Category: ${originalAnalysis.category}

Answer the user's follow-up questions concisely. If new info changes your diagnosis, say so clearly.
Keep responses under 200 words. Be practical and specific.`;

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map(m => ({ role: m.role, content: m.content })),
    ];
    return await groqFetch(messages, 512);
  } catch (err) {
    console.error('sendFollowUp error:', err);
    return null;
  }
};

// ─── Log Analyzer ─────────────────────────────────────────────────────────────

export const analyzeLogs = async (rawLogs: string): Promise<LogAnalysis | null> => {
  const prompt = `You are a log analysis expert. Analyze these logs and extract what matters.

LOGS:
${rawLogs.slice(0, 3000)}

Respond ONLY with valid JSON:
{
  "important_lines": [
    { "line": "the actual log line", "reason": "why this matters" }
  ],
  "root_cause": "what these logs reveal as the root cause",
  "noise_summary": "brief description of the irrelevant log noise",
  "next_action": "the single most important thing to do next",
  "confidence": 80
}`;

  try {
    const text = await groqFetch([{ role: 'user', content: prompt }], 1024);
    return JSON.parse(text) as LogAnalysis;
  } catch (err) {
    console.error('analyzeLogs error:', err);
    return null;
  }
};

// ─── Structure Analyzer ───────────────────────────────────────────────────────

export const analyzeStructure = async (fileTree: string): Promise<StructureAnalysis | null> => {
  const prompt = `You are a React/TypeScript architecture expert familiar with Vite + Supabase + PowerSync apps.

Analyze this project file structure and identify issues and improvements.

FILE TREE:
${fileTree.slice(0, 2000)}

Respond ONLY with valid JSON:
{
  "issues": [
    { "path": "src/someFile.ts", "problem": "what is wrong", "suggestion": "how to fix it" }
  ],
  "auth_separation": "analysis of how auth is structured and if it's well separated",
  "reusable_components": ["components that could be extracted or reused better"],
  "architecture_summary": "2-3 sentence overall assessment",
  "improvements": ["specific actionable improvement 1", "improvement 2"]
}`;

  try {
    const text = await groqFetch([{ role: 'user', content: prompt }], 1024);
    return JSON.parse(text) as StructureAnalysis;
  } catch (err) {
    console.error('analyzeStructure error:', err);
    return null;
  }
};