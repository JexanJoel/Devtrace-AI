import { useState } from 'react';
import {
  Brain, Loader2, ChevronDown, ChevronUp, Sparkles,
  RefreshCw, AlertCircle, CheckCircle2, Code2,
  FileSearch, ShieldAlert, Lightbulb, ArrowRight
} from 'lucide-react';
import type { DebugSession } from '../../hooks/useSessions';
import useMastraAgent, { type MastraSessionResult } from '../../hooks/useMastraAgent';

interface Props {
  session: DebugSession;
}

// ── Category badge ────────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  react_state:   'bg-cyan-100 text-cyan-700 border-cyan-200',
  typescript:    'bg-blue-100 text-blue-700 border-blue-200',
  supabase_auth: 'bg-green-100 text-green-700 border-green-200',
  supabase_db:   'bg-emerald-100 text-emerald-700 border-emerald-200',
  supabase_rls:  'bg-yellow-100 text-yellow-700 border-yellow-200',
  powersync:     'bg-indigo-100 text-indigo-700 border-indigo-200',
  groq_api:      'bg-orange-100 text-orange-700 border-orange-200',
  env_config:    'bg-red-100 text-red-700 border-red-200',
  network:       'bg-slate-100 text-slate-700 border-slate-200',
  deployment:    'bg-violet-100 text-violet-700 border-violet-200',
  unknown:       'bg-gray-100 text-gray-600 border-gray-200',
};

// ── Confidence meter ──────────────────────────────────────────────────────────
const ConfidenceMeter = ({ value }: { value: number }) => {
  const color = value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = value >= 80 ? 'text-green-600' : value >= 60 ? 'text-amber-600' : 'text-red-600';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className={`text-xs font-bold ${textColor}`}>{value}%</span>
    </div>
  );
};

// ── Code diff block ───────────────────────────────────────────────────────────
const CodeDiff = ({ before, after, language }: { before: string; after: string; language: string }) => {
  const [showAfter, setShowAfter] = useState(true);
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowAfter(false)}
          className={`flex-1 px-4 py-2 text-xs font-semibold transition ${!showAfter ? 'bg-red-50 dark:bg-red-950 text-red-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-600'}`}
        >
          Before (broken)
        </button>
        <button
          onClick={() => setShowAfter(true)}
          className={`flex-1 px-4 py-2 text-xs font-semibold transition ${showAfter ? 'bg-green-50 dark:bg-green-950 text-green-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-600'}`}
        >
          After (fixed)
        </button>
      </div>
      <pre className={`p-4 text-xs font-mono overflow-x-auto leading-relaxed ${showAfter ? 'bg-green-950/50 text-green-300' : 'bg-red-950/50 text-red-300'}`}>
        {showAfter ? after : before}
      </pre>
      <div className="px-4 py-1.5 bg-gray-900 border-t border-gray-700">
        <span className="text-[10px] text-gray-500 font-mono">{language}</span>
      </div>
    </div>
  );
};

// ── Structured result renderer ────────────────────────────────────────────────
const StructuredResult = ({ data, onRerun }: { data: MastraSessionResult; onRerun: () => void }) => {
  const [showAlts, setShowAlts] = useState(false);

  return (
    <div className="p-5 space-y-5">

      {/* Overview strip */}
      <div className="flex flex-wrap items-center gap-3">
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border capitalize ${CATEGORY_COLORS[data.category] ?? CATEGORY_COLORS.unknown}`}>
          {data.category.replace(/_/g, ' ')}
        </span>
        <div className="flex-1 min-w-[140px]">
          <p className="text-[10px] text-gray-400 mb-1">Confidence</p>
          <ConfidenceMeter value={data.confidence} />
        </div>
      </div>

      {/* Root cause */}
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <AlertCircle size={13} className="text-red-500 flex-shrink-0" />
          <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">Root Cause</p>
        </div>
        <p className="text-sm font-medium text-red-800 dark:text-red-300 leading-relaxed">{data.root_cause}</p>
      </div>

      {/* Plain english */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">What happened</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{data.plain_english}</p>
      </div>

      {/* Why this happens */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Lightbulb size={13} className="text-amber-500" />
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Why This Happens</p>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pl-5">{data.why_this_happens}</p>
      </div>

      {/* The fix */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Code2 size={13} className="text-green-600" />
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Exact Fix — {data.exact_fix.title}
          </p>
        </div>
        <CodeDiff
          before={data.exact_fix.before}
          after={data.exact_fix.after}
          language={data.exact_fix.language}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pl-1">{data.exact_fix.explanation}</p>
      </div>

      {/* Alternative fixes */}
      {data.alternative_fixes?.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowAlts(v => !v)}
            className="flex items-center gap-2 text-xs text-purple-600 font-medium hover:text-purple-700 transition"
          >
            {showAlts ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {data.alternative_fixes.length} alternative {data.alternative_fixes.length === 1 ? 'approach' : 'approaches'}
          </button>
          {showAlts && (
            <div className="space-y-3 pl-1">
              {data.alternative_fixes.map((alt, i) => (
                <div key={i} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{alt.title}</p>
                  </div>
                  <pre className="p-3 text-xs font-mono text-gray-300 bg-gray-900 overflow-x-auto leading-relaxed">{alt.code}</pre>
                  <p className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800">{alt.tradeoff}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Verification */}
      {data.verification_steps?.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={13} className="text-green-500" />
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Verify the Fix</p>
          </div>
          <div className="space-y-1.5 pl-5">
            {data.verification_steps.map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-950 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related risks */}
      {data.related_risks?.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldAlert size={13} className="text-amber-500" />
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Watch Out For</p>
          </div>
          <div className="space-y-1">
            {data.related_risks.map((risk, i) => (
              <div key={i} className="flex items-start gap-2">
                <ArrowRight size={11} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">{risk}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files to check */}
      {data.files_to_check?.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileSearch size={13} className="text-indigo-500" />
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Files to Inspect</p>
          </div>
          <div className="flex flex-wrap gap-1.5 pl-5">
            {data.files_to_check.map((f, i) => (
              <code key={i} className="text-[11px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 px-2 py-0.5 rounded-lg font-mono">
                {f}
              </code>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
        <p className="text-[10px] text-gray-400">Mastra Session Debugger Agent</p>
        <button
          onClick={onRerun}
          className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 font-medium transition"
        >
          <RefreshCw size={11} /> Re-analyze
        </button>
      </div>
    </div>
  );
};

// ── Fallback prose renderer (when agent ignores JSON instruction) ─────────────
const ProseResult = ({ text, onRerun }: { text: string; onRerun: () => void }) => (
  <div className="p-5 space-y-3">
    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl px-4 py-2.5">
      <p className="text-xs text-amber-700 dark:text-amber-400">Agent returned unstructured response — re-run for enhanced output</p>
    </div>
    <div className="space-y-1">
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;
        if (line.startsWith('#')) return <p key={i} className="text-xs font-bold text-purple-600 uppercase tracking-wide mt-3">{line.replace(/^#+\s/, '')}</p>;
        if (line.startsWith('- ') || line.startsWith('• ')) return (
          <p key={i} className="text-sm text-gray-600 dark:text-gray-400 pl-4 flex gap-2">
            <span className="text-purple-400 flex-shrink-0">•</span>
            <span>{line.replace(/^[-•]\s/, '')}</span>
          </p>
        );
        return <p key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{line}</p>;
      })}
    </div>
    <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
      <button onClick={onRerun} className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 font-medium transition">
        <RefreshCw size={11} /> Re-run for structured output
      </button>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const MastraAgentPanel = ({ session }: Props) => {
  const { debugSession, loadingSession, sessionResult, sessionRaw, error, clearSession } = useMastraAgent();
  const [expanded, setExpanded] = useState(true);

  const hasResult = !!(sessionResult || sessionRaw);

  const handleDebug = async () => {
    if (!session.error_message) return;
    clearSession();
    await debugSession({
      errorMessage: session.error_message,
      stackTrace: session.stack_trace,
      codeSnippet: session.code_snippet,
      sessionTitle: session.title,
      projectLanguage: session.project?.language,
    });
    setExpanded(true);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-purple-100 dark:border-purple-900 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-purple-50 dark:border-purple-900/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-50 dark:bg-purple-950 rounded-xl flex items-center justify-center">
            <Brain size={15} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Mastra Deep Analysis</h3>
            <p className="text-xs text-gray-400">Session Debugger Agent · Diff-format precision fix</p>
          </div>
          <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
            Mastra Cloud
          </span>
        </div>
        {hasResult && (
          <button onClick={() => setExpanded(v => !v)} className="text-gray-400 hover:text-gray-600 transition">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      {/* No error message */}
      {!session.error_message && (
        <div className="p-8 text-center">
          <Brain size={24} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Add an error message to enable Mastra deep analysis</p>
        </div>
      )}

      {/* Loading */}
      {loadingSession && (
        <div className="p-10 text-center space-y-3">
          <div className="relative mx-auto w-10 h-10">
            <Loader2 size={40} className="animate-spin text-purple-200 dark:text-purple-900" />
            <Brain size={16} className="text-purple-600 absolute inset-0 m-auto" />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Mastra agent reasoning...</p>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            Analyzing stack trace, identifying root cause, generating diff-format fix
          </p>
        </div>
      )}

      {/* Error */}
      {error && !loadingSession && (
        <div className="p-6 text-center space-y-3">
          <div className="w-10 h-10 bg-red-50 dark:bg-red-950 rounded-xl flex items-center justify-center mx-auto">
            <AlertCircle size={18} className="text-red-500" />
          </div>
          <p className="text-sm text-red-500">{error}</p>
          <button onClick={handleDebug} className="text-xs text-indigo-600 hover:underline font-medium">Try again</button>
        </div>
      )}

      {/* Ready to analyze */}
      {session.error_message && !loadingSession && !hasResult && !error && (
        <div className="p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-950 dark:to-indigo-950 rounded-2xl flex items-center justify-center mx-auto">
            <Brain size={24} className="text-purple-600" />
          </div>
          <div>
            <p className="text-gray-800 dark:text-gray-200 text-sm font-bold mb-1">Mastra Session Debugger</p>
            <p className="text-gray-400 text-xs max-w-sm mx-auto leading-relaxed">
              Goes deeper than standard AI analysis.
            </p>
          </div>
          <div className="flex items-center justify-center gap-4 text-[11px] text-gray-400">
            <span className="flex items-center gap-1"><Code2 size={11} className="text-purple-400" /> Diff-format fix</span>
            <span className="flex items-center gap-1"><ShieldAlert size={11} className="text-amber-400" /> Risk analysis</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={11} className="text-green-400" /> Verification steps</span>
          </div>
          <button
            onClick={handleDebug}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition shadow-sm hover:shadow-md"
          >
            <Sparkles size={14} /> Run Deep Analysis
          </button>
        </div>
      )}

      {/* Structured result */}
      {sessionResult && !loadingSession && expanded && (
        <StructuredResult data={sessionResult} onRerun={handleDebug} />
      )}

      {/* Prose fallback */}
      {sessionRaw && !loadingSession && expanded && (
        <ProseResult text={sessionRaw} onRerun={handleDebug} />
      )}

    </div>
  );
};

export default MastraAgentPanel;