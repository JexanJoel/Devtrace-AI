import { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Loader2, RotateCcw, BookOpen, ChevronRight,
  AlertTriangle, Info, Zap,
  MessageSquare, Send, ClipboardList, GitBranch, FlaskConical,
  FileText, FolderTree, Copy, Check, ChevronDown, Save, CheckCircle,
  Download, Github
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
  // Use unused props to satisfy linter or remove them if not needed
  // In this case, they are needed for CollaborativeChecklist
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
  
  const handleDownloadTest = () => {
    if (!analysis) return;
    const testCode = `
import { describe, it, expect, vi } from 'vitest';

/**
 * Reproduction test for: ${analysis.category}
 * Error: ${session.error_message}
 * 
 * Generated by DevTrace AI
 */
describe('Reproduction: ${session.title}', () => {
  it('should replicate the crash', () => {
    // reproduction steps:
    ${analysis.reproduction_steps.map(s => `// - ${s}`).join('\n    ')}
    
    // AI Suggestion:
    // ${analysis.verify_fix}
    
    // TODO: Implement the specific test logic below
    expect(true).toBe(true);
  });
});
    `.trim();
    
    const blob = new Blob([testCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bug_reproduction_${session.id.slice(0, 8)}.test.ts`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportGitHub = () => {
    if (!analysis) return;
    const body = `
## 🐛 Bug Report: ${session.title}

### 🔍 AI Analysis
**Category:** ${analysis.category}
**Root Cause:** ${analysis.root_cause}

### ⚡ Suggested Fix
${analysis.plain_english}

### 🧪 Reproduction Steps
${analysis.reproduction_steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

### 🛠️ Verification Plan
${analysis.verify_fix}

---
*Generated by [DevTrace AI](https://github.com/JexanJoel/DevTrace-AI)*
    `.trim();
    
    const title = encodeURIComponent(`Bug: ${session.title}`);
    const encodedBody = encodeURIComponent(body);
    window.open(`https://github.com/JexanJoel/DevTrace-AI/issues/new?title=${title}&body=${encodedBody}`, '_blank');
  };

  const hasError = !!session.error_message;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 h-full flex flex-col overflow-hidden animate-fade-in">

      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex-wrap gap-3 glass dark:glass-dark">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
            <Sparkles size={15} className="text-indigo-600 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm whitespace-nowrap">AI Debug Panel</h3>
            <p className="text-[10px] text-gray-400 hidden sm:block">Powered by Groq · Llama 3.3 70B</p>
          </div>
          {analysis && <div className="hidden xs:block"><CategoryBadge category={analysis.category} /></div>}
        </div>
        <div className="flex items-center gap-2">
          {analysis && (
            <button onClick={handleExportGitHub}
              className="flex items-center gap-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-lg hover:scale-105 active:scale-95">
              <Github size={13} />
              <span>Export to GitHub</span>
            </button>
          )}
          {analysis && (
            <button onClick={onSaveToLibrary} disabled={savingToLib}
              className="flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold px-3 py-1.5 rounded-xl transition disabled:opacity-40">
              {savingToLib ? <Loader2 size={12} className="animate-spin" /> : <BookOpen size={12} />}
              <span className="hidden xs:inline">Save</span>
            </button>
          )}
          <button onClick={handleAnalyze} disabled={analyzing || !hasError}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 sm:px-4 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-100 dark:shadow-none hover:scale-105 active:scale-95">
            {analyzing
              ? <><Loader2 size={13} className="animate-spin" /> <span className="hidden xs:inline">Analyzing...</span></>
              : analysis ? <><RotateCcw size={13} /> <span className="hidden xs:inline">Re-analyze</span></> : <><Sparkles size={13} /> <span className="hidden xs:inline">Analyze Bug</span></>
            }
          </button>
        </div>
      </div>

      {!hasError && (
        <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
          <AlertTriangle size={32} className="text-gray-300 mb-2" />
          <p className="text-gray-400 text-sm">Add an error message to enable AI analysis</p>
        </div>
      )}

      {analyzing && (
        <div className="p-10 text-center space-y-3 flex-1 flex flex-col items-center justify-center">
          <div className="relative">
             <Loader2 size={40} className="animate-spin text-indigo-500" />
             <Sparkles size={16} className="absolute inset-0 m-auto text-indigo-300 animate-pulse" />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Analyzing your bug...</p>
          <p className="text-xs text-gray-400">Groq AI is examining error, stack trace, and code context</p>
        </div>
      )}

      {hasError && !analyzing && !analysis && (
        <div className="p-10 text-center space-y-6 flex-1 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center animate-float">
            <Sparkles size={40} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-glow">Ready to Analyze</h3>
            <p className="text-gray-500 max-w-sm">Get a deep breakdown of this bug using Groq + Llama 3.3 70B.</p>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-2xl transition shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-105"
          >
            <Sparkles size={18} /> Analyze Bug
          </button>
        </div>
      )}

      {hasError && !analyzing && analysis && (
        <>
          <div className="flex gap-0.5 px-2 sm:px-4 pt-3 pb-0 overflow-x-auto border-b border-gray-50 dark:border-gray-800/50 custom-scrollbar">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-t-xl text-[11px] uppercase tracking-wider font-bold transition whitespace-nowrap border-b-2 ${
                  tab === t.key
                    ? 'text-indigo-600 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/50'
                    : 'text-gray-400 border-transparent hover:text-gray-600 dark:hover:text-gray-200'
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6 relative">
            <div key={tab} className="animate-slide-up space-y-6">
              {tab === 'overview' && (
                <div className="space-y-6">
                  <ConfidenceMeter value={analysis.confidence} />
                  <div className="bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-5 shadow-sm">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-indigo-500 mb-2">Plain English Breakdown</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">{analysis.plain_english}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">Root Cause</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{analysis.root_cause}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">Symptom vs Cause</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{analysis.symptom_vs_cause}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">Architectural Reason</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      This was categorized as <CategoryBadge category={analysis.category} /> because {analysis.category_reason}
                    </p>
                  </div>
                  {analysis.files_to_check.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">Files to Inspect</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.files_to_check.map((f, i) => (
                          <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-xl font-mono border border-gray-200 dark:border-gray-700 hover:border-indigo-300 transition-colors cursor-default">{f}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-5">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 mb-2">Verification Strategy</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{analysis.verify_fix}</p>
                  </div>
                </div>
              )}

              {tab === 'fixes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-400">Recommended fix: <span className="font-bold text-indigo-600">Option {analysis.best_fix_index + 1}</span></p>
                    <button onClick={onSaveToLibrary} className="text-[10px] font-bold text-indigo-500 uppercase flex items-center gap-1 hover:underline">
                      <Save size={10} /> Add to fix library
                    </button>
                  </div>
                  {analysis.fixes.map((fix, i) => (
                    <div key={i} className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${i === analysis.best_fix_index ? 'border-indigo-400/50 shadow-lg shadow-indigo-100/50' : 'border-gray-100 dark:border-gray-800'}`}>
                      <button onClick={() => setExpandedFix(expandedFix === i ? null : i)}
                        className={`w-full flex items-center justify-between p-5 text-left transition-colors ${i === analysis.best_fix_index ? 'bg-indigo-50/50 dark:bg-indigo-950/50' : 'bg-gray-50/50 dark:bg-gray-800/50'}`}>
                        <div className="flex items-center gap-4">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                            fix.type === 'quick_patch' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            fix.type === 'proper_fix' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            'bg-violet-100 text-violet-700 border-violet-200'
                          }`}>
                            {fix.type.replace('_', ' ')}
                          </span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{fix.title}</span>
                          {i === analysis.best_fix_index && <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">OPTIMAL</span>}
                        </div>
                        <div className={`transition-transform duration-300 ${expandedFix === i ? 'rotate-180' : ''}`}>
                          <ChevronDown size={18} className="text-gray-400" />
                        </div>
                      </button>
                      {expandedFix === i && (
                        <div className="p-5 space-y-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 animate-slide-up">
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{fix.explanation}</p>
                          <CodeBlock code={fix.code} />
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30">
                              <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1.5 flex items-center gap-1.5"><CheckCircle size={10} /> Trade-offs: Pros</p>
                              <p className="text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed font-semibold">{fix.pros}</p>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-950/30 rounded-2xl p-4 border border-orange-100 dark:border-orange-900/30">
                              <p className="text-[10px] font-bold text-orange-600 uppercase mb-1.5 flex items-center gap-1.5"><AlertTriangle size={10} /> Trade-offs: Cons</p>
                              <p className="text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed font-semibold">{fix.cons}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {tab === 'timeline' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-gray-400">Sequence of events leading to the failure</p>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/50 px-2 py-1 rounded-lg">Step-by-Step</span>
                  </div>
                  <div className="relative pl-2">
                    <div className="absolute left-[20px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-indigo-200 to-red-200 dark:from-indigo-900 dark:to-red-900" />
                    {analysis.timeline.map((step, i) => (
                      <div key={i} className="flex gap-6 mb-6 last:mb-0 relative group">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black flex-shrink-0 z-10 transition-all duration-300 group-hover:scale-110 ${
                          i === analysis.timeline.length - 1
                            ? 'bg-red-500 text-white shadow-lg shadow-red-200 ring-4 ring-red-100 dark:ring-red-900/30'
                            : 'bg-white dark:bg-gray-800 text-indigo-600 border-2 border-indigo-100 dark:border-indigo-900'
                        }`}>
                          {i === analysis.timeline.length - 1 ? '!' : i + 1}
                        </div>
                        <div className={`flex-1 pt-1 ${i === analysis.timeline.length - 1 ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          <p className={`text-sm leading-relaxed ${i === analysis.timeline.length - 1 ? 'font-bold' : 'font-medium'}`}>
                            {step.replace(/^\d+\.\s*/, '')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'checklist' && (
                <div className="space-y-4">
                  <CollaborativeChecklist
                    items={analysis.checklist}
                    isChecked={isChecked}
                    checkedBy={checkedBy}
                    onToggle={onToggleChecklist}
                    completedCount={completedCount}
                    isCollaborative={isCollaborative}
                    currentUserName={currentUserName}
                  />
                </div>
              )}

              {tab === 'followup' && (
                <div className="space-y-4">
                  {chatHistory.length === 0 && analysis.follow_up_questions.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Recommended Follow-ups</p>
                      {analysis.follow_up_questions.map((q, i) => (
                        <button key={i} onClick={() => setChatInput(q)}
                          className="w-full text-left text-sm bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-5 py-3 rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-all flex items-center gap-3 group">
                          <ChevronRight size={14} className="text-indigo-400 group-hover:translate-x-1 transition-transform" /> 
                          <span className="font-semibold">{q}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {chatHistory.length > 0 && (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-3xl px-5 py-3 text-sm font-medium shadow-sm transition-all hover:shadow-md ${
                            msg.role === 'user'
                              ? 'bg-indigo-600 text-white rounded-br-sm'
                              : 'glass-dark text-gray-800 dark:text-gray-200 rounded-bl-sm border border-gray-100 dark:border-gray-800'
                          }`}>{msg.content}</div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                          </div>
                        </div>
                      )}
                      <div ref={chatBottomRef} />
                    </div>
                  )}
                  <div className="flex gap-2 sticky bottom-0 bg-white dark:bg-gray-900 pt-2 border-t border-gray-50 dark:border-gray-800">
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendChat()}
                      placeholder="Ask a follow-up question..."
                      className="flex-1 glass dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 focus:border-indigo-400 text-gray-900 dark:text-white rounded-2xl px-6 py-3 text-sm font-semibold focus:outline-none transition shadow-sm" />
                    <button onClick={handleSendChat} disabled={!chatInput.trim() || chatLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-lg shadow-indigo-200 hover:scale-110 active:scale-95 disabled:opacity-40">
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              )}

              {tab === 'tests' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-950/20 px-4 py-3 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Failure Reproduction Steps</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Automated test suite generation powered by Llama 3.3</p>
                    </div>
                    <button onClick={handleDownloadTest}
                      className="flex items-center gap-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-all shadow-md hover:scale-105 active:scale-95">
                      <Download size={14} /> Download .test.ts
                    </button>
                  </div>
                    <div className="space-y-2">
                      {analysis.reproduction_steps.map((step, i) => (
                        <div key={i} className="flex gap-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                          <span className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
                          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{step.replace(/^\d+\.\s*/, '')}</p>
                        </div>
                      ))}
                    </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-3">Validation Test Cases</p>
                    <div className="grid grid-cols-1 gap-2">
                      {analysis.test_cases.map((tc, i) => (
                        <div key={i} className="flex gap-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30 group hover:border-emerald-400 transition-colors">
                          <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                             <FlaskConical size={14} />
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">{tc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'logs' && (
                <div className="space-y-6">
                  <div className="glass-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-3 block">Raw Log Parser</label>
                    <textarea value={rawLogs} onChange={e => setRawLogs(e.target.value)} rows={8}
                      placeholder="Paste terminal output, browser console, or server logs..."
                      className="w-full bg-gray-900 text-yellow-300 rounded-2xl px-5 py-4 text-xs font-mono focus:outline-none transition border-2 border-transparent focus:border-indigo-500/50 placeholder-gray-600 resize-none custom-scrollbar" />
                    <button onClick={handleAnalyzeLogs} disabled={analyzingLogs || !rawLogs.trim()}
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl font-bold transition shadow-lg shadow-indigo-100 hover:scale-[1.02] disabled:opacity-40">
                      {analyzingLogs ? <><Loader2 size={16} className="animate-spin" /> Deep Diving into Logs...</> : <><FileText size={16} /> Analyze Logs</>}
                    </button>
                  </div>
                  {logAnalysis && (
                    <div className="animate-slide-up space-y-6">
                      <div className="bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/50 rounded-2xl p-5">
                        <p className="text-[10px] uppercase font-bold text-red-600 mb-2 tracking-widest">Crucial Log Insight</p>
                        <p className="text-sm text-gray-800 dark:text-gray-200 font-bold leading-relaxed shadow-text">{logAnalysis.root_cause}</p>
                      </div>
                      <div className="space-y-3">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Evidence Found</p>
                        {logAnalysis.important_lines?.map((l: any, i: number) => (
                          <div key={i} className="bg-gray-900 rounded-2xl p-5 border border-indigo-900/30 group hover:border-indigo-500 transition-colors">
                            <p className="text-xs text-yellow-400 font-mono mb-2 break-all">{l.line}</p>
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-800">
                               <Info size={11} className="text-indigo-400" />
                               <p className="text-[11px] text-gray-400 font-medium italic">{l.reason}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-xl shadow-indigo-100">
                        <p className="text-[10px] uppercase font-bold opacity-70 mb-2 tracking-widest">Next Recommended Step</p>
                        <p className="text-sm font-bold leading-relaxed">{logAnalysis.next_action}</p>
                      </div>
                      <ConfidenceMeter value={logAnalysis.confidence} />
                    </div>
                  )}
                </div>
              )}

              {tab === 'structure' && (
                <div className="space-y-6">
                  <div className="glass-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-3 block">Architecture Analyzer</label>
                    <textarea value={fileTree} onChange={e => setFileTree(e.target.value)} rows={6}
                      placeholder={"src/\n  components/\n  hooks/"}
                      className="w-full bg-gray-900 text-emerald-400 rounded-2xl px-5 py-4 text-xs font-mono focus:outline-none border-2 border-transparent focus:border-indigo-500/50 placeholder-gray-600 resize-none" />
                    <button onClick={handleAnalyzeStructure} disabled={analyzingStructure || !fileTree.trim()}
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl font-bold transition shadow-lg shadow-indigo-100 hover:scale-[1.02] disabled:opacity-40">
                      {analyzingStructure ? <><Loader2 size={16} className="animate-spin" /> Scanning Folders...</> : <><FolderTree size={16} /> Map Project Memory</>}
                    </button>
                  </div>
                  {structureAnalysis && (
                    <div className="animate-slide-up space-y-6">
                      <div className="bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                        <p className="text-[10px] uppercase font-bold text-indigo-600 mb-2 tracking-widest">Architecture DNA</p>
                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-bold">{structureAnalysis.architecture_summary}</p>
                      </div>
                      <div className="space-y-3">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Potential Fragility</p>
                        {structureAnalysis.issues?.map((issue: any, i: number) => (
                          <div key={i} className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 rounded-2xl p-5 group hover:border-red-500 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                               <AlertTriangle size={12} className="text-red-500" />
                               <p className="text-xs font-black text-red-600 font-mono truncate">{issue.path}</p>
                            </div>
                            <p className="text-xs text-gray-700 dark:text-gray-300 font-bold mb-3">{issue.problem}</p>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900 group-hover:bg-emerald-50 transition-colors">
                               <p className="text-xs text-emerald-600 font-black">Recommendation: <span className="text-gray-900 dark:text-gray-100 font-bold">{issue.suggestion}</span></p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIDebugPanel;