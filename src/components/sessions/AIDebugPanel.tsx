import { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Loader2, RotateCcw, BookOpen, ChevronRight,
  AlertTriangle, Info, Zap, Shield,
  MessageSquare, Send, ClipboardList, GitBranch, FlaskConical,
  FileText, FolderTree, Copy, Check, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  analyzeSession, sendFollowUp, analyzeLogs, analyzeStructure,
  type AIAnalysis, type ChatMessage, type IssueCategory, type AnalyzeSessionInput
} from '../../lib/groqClient';
import type { DebugSession } from '../../hooks/useSessions';
import CollaborativeChecklist from './CollaborativeChecklist';

// ─── Category badge ───────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<IssueCategory, { label: string; color: string }> = {
  react_state:    { label: 'React State',     color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  typescript:     { label: 'TypeScript',      color: 'bg-blue-100 text-blue-700 border-blue-200' },
  supabase_auth:  { label: 'Supabase Auth',   color: 'bg-green-100 text-green-700 border-green-200' },
  supabase_db:    { label: 'Supabase DB',     color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  supabase_rls:   { label: 'Supabase RLS',    color: 'bg-teal-100 text-teal-700 border-teal-200' },
  powersync:      { label: 'PowerSync',       color: 'bg-violet-100 text-violet-700 border-violet-200' },
  groq_api:       { label: 'Groq API',        color: 'bg-orange-100 text-orange-700 border-orange-200' },
  env_config:     { label: 'Env / Config',    color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  network:        { label: 'Network',         color: 'bg-red-100 text-red-700 border-red-200' },
  deployment:     { label: 'Deployment',      color: 'bg-pink-100 text-pink-700 border-pink-200' },
  unknown:        { label: 'Unknown',         color: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const CategoryBadge = ({ category }: { category: IssueCategory }) => {
  const s = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.unknown;
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${s.color}`}>{s.label}</span>;
};

const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  if (!code?.trim()) return null;
  return (
    <div className="relative group">
      <pre className="bg-gray-900 rounded-xl p-4 text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
        {code}
      </pre>
      <button onClick={copy} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-2 py-1 text-xs flex items-center gap-1">
        {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
      </button>
    </div>
  );
};

const ConfidenceMeter = ({ value }: { value: number }) => {
  const color = value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  const label = value >= 80 ? 'High confidence' : value >= 60 ? 'Medium confidence' : 'Low confidence';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-28 text-right">{value}% · {label}</span>
    </div>
  );
};

type Tab = 'overview' | 'fixes' | 'timeline' | 'checklist' | 'followup' | 'tests' | 'logs' | 'structure';

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'overview',   label: 'Overview',   icon: <Info size={13} /> },
  { key: 'fixes',      label: 'Fixes',      icon: <Zap size={13} /> },
  { key: 'timeline',   label: 'Timeline',   icon: <GitBranch size={13} /> },
  { key: 'checklist',  label: 'Checklist',  icon: <ClipboardList size={13} /> },
  { key: 'followup',   label: 'Follow-up',  icon: <MessageSquare size={13} /> },
  { key: 'tests',      label: 'Tests',      icon: <FlaskConical size={13} /> },
  { key: 'logs',       label: 'Logs',       icon: <FileText size={13} /> },
  { key: 'structure',  label: 'Structure',  icon: <FolderTree size={13} /> },
];

interface Props {
  session: DebugSession;
  onSaveAnalysis: (analysis: AIAnalysis) => Promise<void>;
  onSaveToLibrary: () => Promise<void>;
  savingToLib: boolean;
  // Collaboration props — passed from SessionDetailPage
  isChecked: (index: number) => boolean;
  checkedBy: (index: number) => string | null;
  onToggleChecklist: (index: number, currentChecked: boolean) => void;
  completedCount: number;
  isCollaborative: boolean;
  currentUserName: string;
}

const AIDebugPanel = ({
  session, onSaveAnalysis, onSaveToLibrary, savingToLib,
  isChecked, checkedBy, onToggleChecklist, completedCount, isCollaborative, currentUserName,
}: Props) => {
  const [tab, setTab] = useState<Tab>('overview');
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(session.ai_analysis ?? null);
  const [analyzing, setAnalyzing] = useState(false);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [expandedFix, setExpandedFix] = useState<number | null>(null);

  const [rawLogs, setRawLogs] = useState('');
  const [logAnalysis, setLogAnalysis] = useState<any>(null);
  const [analyzingLogs, setAnalyzingLogs] = useState(false);

  const [fileTree, setFileTree] = useState('');
  const [structureAnalysis, setStructureAnalysis] = useState<any>(null);
  const [analyzingStructure, setAnalyzingStructure] = useState(false);

  useEffect(() => {
    if (session.ai_analysis) setAnalysis(session.ai_analysis);
  }, [session.ai_analysis]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleAnalyze = async () => {
    if (!session.error_message) return;
    setAnalyzing(true);
    setTab('overview');
    const input: AnalyzeSessionInput = {
      title: session.title,
      errorMessage: session.error_message,
      stackTrace: session.stack_trace,
      codeSnippet: session.code_snippet,
      expectedBehavior: session.expected_behavior,
      language: session.project?.language,
      environment: session.environment,
    };
    const result = await analyzeSession(input);
    if (result) { setAnalysis(result); await onSaveAnalysis(result); }
    setAnalyzing(false);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !analysis) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput.trim() };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setChatInput('');
    setChatLoading(true);
    const reply = await sendFollowUp(analysis, {
      title: session.title,
      errorMessage: session.error_message ?? '',
      stackTrace: session.stack_trace,
      codeSnippet: session.code_snippet,
    }, newHistory);
    if (reply) setChatHistory(h => [...h, { role: 'assistant', content: reply }]);
    setChatLoading(false);
  };

  const handleAnalyzeLogs = async () => {
    if (!rawLogs.trim()) return;
    setAnalyzingLogs(true);
    const result = await analyzeLogs(rawLogs);
    if (result) setLogAnalysis(result);
    setAnalyzingLogs(false);
  };

  const handleAnalyzeStructure = async () => {
    if (!fileTree.trim()) return;
    setAnalyzingStructure(true);
    const result = await analyzeStructure(fileTree);
    if (result) setStructureAnalysis(result);
    setAnalyzingStructure(false);
  };

  const hasError = !!session.error_message;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">

      <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-950 rounded-xl flex items-center justify-center">
            <Sparkles size={15} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">AI Debug Panel</h3>
            <p className="text-xs text-gray-400">Powered by Groq · Llama 3.3 70B</p>
          </div>
          {analysis && <CategoryBadge category={analysis.category} />}
        </div>
        <div className="flex items-center gap-2">
          {analysis && (
            <button onClick={onSaveToLibrary} disabled={savingToLib}
              className="flex items-center gap-1.5 border border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 text-xs font-medium px-3 py-1.5 rounded-xl transition disabled:opacity-40">
              {savingToLib ? <Loader2 size={12} className="animate-spin" /> : <BookOpen size={12} />}
              Save to Library
            </button>
          )}
          <button onClick={handleAnalyze} disabled={analyzing || !hasError}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed">
            {analyzing
              ? <><Loader2 size={13} className="animate-spin" /> Analyzing...</>
              : analysis ? <><RotateCcw size={13} /> Re-analyze</> : <><Sparkles size={13} /> Analyze Bug</>
            }
          </button>
        </div>
      </div>

      {!hasError && (
        <div className="p-8 text-center">
          <AlertTriangle size={24} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Add an error message to enable AI analysis</p>
        </div>
      )}

      {analyzing && (
        <div className="p-10 text-center space-y-3">
          <Loader2 size={28} className="animate-spin text-indigo-500 mx-auto" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Analyzing your bug...</p>
          <p className="text-xs text-gray-400">Groq AI is examining error, stack trace, and code context</p>
        </div>
      )}

      {hasError && !analyzing && !analysis && (
        <div className="p-8 text-center">
          <Sparkles size={24} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Ready to analyze</p>
          <p className="text-gray-400 text-xs">Click "Analyze Bug" to get a full AI breakdown</p>
        </div>
      )}

      {hasError && !analyzing && analysis && (
        <>
          <div className="flex gap-0.5 px-4 pt-3 pb-0 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-medium transition whitespace-nowrap border-b-2 ${
                  tab === t.key
                    ? 'text-indigo-600 border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                    : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="p-5 space-y-4">

            {tab === 'overview' && (
              <div className="space-y-4">
                <ConfidenceMeter value={analysis.confidence} />
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Plain English</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{analysis.plain_english}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500 mb-1.5">Root Cause</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{analysis.root_cause}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500 mb-1.5">Symptom vs Cause</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{analysis.symptom_vs_cause}</p>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-1.5">Why this category: <span className="text-indigo-500">{CATEGORY_STYLES[analysis.category]?.label}</span></p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{analysis.category_reason}</p>
                </div>
                {analysis.files_to_check.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Files to inspect</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.files_to_check.map((f, i) => (
                        <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-lg font-mono border border-gray-200 dark:border-gray-700">{f}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 rounded-xl p-4">
                  <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">How to verify fix</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{analysis.verify_fix}</p>
                </div>
              </div>
            )}

            {tab === 'fixes' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400">Best fix recommended: <span className="font-semibold text-indigo-600">Option {analysis.best_fix_index + 1}</span></p>
                {analysis.fixes.map((fix, i) => (
                  <div key={i} className={`rounded-xl border-2 overflow-hidden transition ${i === analysis.best_fix_index ? 'border-indigo-300 dark:border-indigo-700' : 'border-gray-100 dark:border-gray-800'}`}>
                    <button onClick={() => setExpandedFix(expandedFix === i ? null : i)}
                      className={`w-full flex items-center justify-between p-4 text-left ${i === analysis.best_fix_index ? 'bg-indigo-50 dark:bg-indigo-950' : 'bg-gray-50 dark:bg-gray-800'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${
                          fix.type === 'quick_patch' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                          fix.type === 'proper_fix' ? 'bg-green-100 text-green-700 border-green-200' :
                          'bg-purple-100 text-purple-700 border-purple-200'
                        }`}>
                          {fix.type === 'quick_patch' ? 'Quick Patch' : fix.type === 'proper_fix' ? 'Proper Fix' : 'Workaround'}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{fix.title}</span>
                        {i === analysis.best_fix_index && <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">⭐ Best</span>}
                      </div>
                      {expandedFix === i ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
                    </button>
                    {expandedFix === i && (
                      <div className="p-4 space-y-3 bg-white dark:bg-gray-900">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{fix.explanation}</p>
                        <CodeBlock code={fix.code} />
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3">
                            <p className="text-xs font-semibold text-green-600 mb-1">✓ Pros</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300">{fix.pros}</p>
                          </div>
                          <div className="bg-orange-50 dark:bg-orange-950 rounded-lg p-3">
                            <p className="text-xs font-semibold text-orange-600 mb-1">⚠ Cons</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300">{fix.cons}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === 'timeline' && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400 mb-3">How the crash happened step by step</p>
                {analysis.timeline.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        i === analysis.timeline.length - 1
                          ? 'bg-red-100 text-red-600 border-2 border-red-300'
                          : 'bg-indigo-100 text-indigo-600 border-2 border-indigo-200'
                      }`}>{i + 1}</div>
                      {i < analysis.timeline.length - 1 && <div className="w-0.5 h-6 bg-gray-200 dark:bg-gray-700 mt-1" />}
                    </div>
                    <div className={`flex-1 pb-3 ${i === analysis.timeline.length - 1 ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                      <p className="text-sm">{step.replace(/^\d+\.\s*/, '')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── CHECKLIST — now collaborative ──────────────────────────── */}
            {tab === 'checklist' && (
              <CollaborativeChecklist
                items={analysis.checklist}
                isChecked={isChecked}
                checkedBy={checkedBy}
                onToggle={onToggleChecklist}
                completedCount={completedCount}
                isCollaborative={isCollaborative}
                currentUserName={currentUserName}
              />
            )}

            {tab === 'followup' && (
              <div className="space-y-3">
                {chatHistory.length === 0 && analysis.follow_up_questions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400">AI wants to know more. Click a question or type your own:</p>
                    {analysis.follow_up_questions.map((q, i) => (
                      <button key={i} onClick={() => setChatInput(q)}
                        className="w-full text-left text-sm bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 px-4 py-2.5 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900 transition flex items-center gap-2">
                        <ChevronRight size={13} /> {q}
                      </button>
                    ))}
                  </div>
                )}
                {chatHistory.length > 0 && (
                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {chatHistory.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                          msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-sm'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                        }`}>{msg.content}</div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-2.5">
                          <Loader2 size={14} className="animate-spin text-gray-400" />
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendChat()}
                    placeholder="Ask a follow-up question..."
                    className="flex-1 border-2 border-gray-100 dark:border-gray-700 focus:border-indigo-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition placeholder-gray-300" />
                  <button onClick={handleSendChat} disabled={!chatInput.trim() || chatLoading}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-40">
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}

            {tab === 'tests' && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Reproduction Steps</p>
                  <div className="space-y-2">
                    {analysis.reproduction_steps.map((step, i) => (
                      <div key={i} className="flex gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                        <span className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{step.replace(/^\d+\.\s*/, '')}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Test Cases</p>
                  <div className="space-y-2">
                    {analysis.test_cases.map((tc, i) => (
                      <div key={i} className="flex gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                        <FlaskConical size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">{tc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'logs' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Paste raw logs</label>
                  <textarea value={rawLogs} onChange={e => setRawLogs(e.target.value)} rows={7}
                    placeholder="Paste your console output, server logs, or network logs here..."
                    className="w-full border-2 border-gray-100 dark:border-gray-700 focus:border-indigo-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-xl px-4 py-3 text-xs font-mono focus:outline-none transition placeholder-gray-300 resize-none" />
                  <button onClick={handleAnalyzeLogs} disabled={analyzingLogs || !rawLogs.trim()}
                    className="mt-2 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition disabled:opacity-40">
                    {analyzingLogs ? <><Loader2 size={13} className="animate-spin" /> Analyzing logs...</> : <><FileText size={13} /> Analyze Logs</>}
                  </button>
                </div>
                {logAnalysis && (
                  <div className="space-y-3">
                    <div className="bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-xl p-4">
                      <p className="text-xs font-semibold text-red-600 mb-1">Root Cause from Logs</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{logAnalysis.root_cause}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">Important Lines</p>
                      {logAnalysis.important_lines?.map((l: any, i: number) => (
                        <div key={i} className="bg-gray-900 rounded-xl p-3 mb-2">
                          <p className="text-xs text-yellow-300 font-mono mb-1">{l.line}</p>
                          <p className="text-xs text-gray-400">{l.reason}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-950 rounded-xl p-4">
                      <p className="text-xs font-semibold text-indigo-600 mb-1">Next Action</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{logAnalysis.next_action}</p>
                    </div>
                    <ConfidenceMeter value={logAnalysis.confidence} />
                  </div>
                )}
              </div>
            )}

            {tab === 'structure' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Paste your file tree</label>
                  <textarea value={fileTree} onChange={e => setFileTree(e.target.value)} rows={7}
                    placeholder={"src/\n  components/\n    auth/\n    dashboard/\n  hooks/\n  pages/\n  store/\n  lib/"}
                    className="w-full border-2 border-gray-100 dark:border-gray-700 focus:border-indigo-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-xl px-4 py-3 text-xs font-mono focus:outline-none transition placeholder-gray-300 resize-none" />
                  <button onClick={handleAnalyzeStructure} disabled={analyzingStructure || !fileTree.trim()}
                    className="mt-2 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition disabled:opacity-40">
                    {analyzingStructure ? <><Loader2 size={13} className="animate-spin" /> Analyzing...</> : <><FolderTree size={13} /> Analyze Structure</>}
                  </button>
                </div>
                {structureAnalysis && (
                  <div className="space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Architecture Summary</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{structureAnalysis.architecture_summary}</p>
                    </div>
                    {structureAnalysis.issues?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">Issues Found</p>
                        {structureAnalysis.issues.map((issue: any, i: number) => (
                          <div key={i} className="bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-xl p-3 mb-2">
                            <p className="text-xs font-mono text-red-600 mb-1">{issue.path}</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300 mb-1">{issue.problem}</p>
                            <p className="text-xs text-green-600">→ {issue.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {structureAnalysis.improvements?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">Improvements</p>
                        {structureAnalysis.improvements.map((imp: string, i: number) => (
                          <div key={i} className="flex gap-2 bg-green-50 dark:bg-green-950 rounded-lg p-2.5 mb-1.5">
                            <Shield size={13} className="text-green-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-700 dark:text-gray-300">{imp}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </>
      )}
    </div>
  );
};

export default AIDebugPanel;