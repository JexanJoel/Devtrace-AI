import { useState } from 'react';
import { Brain, Loader2, ChevronDown, ChevronUp, ExternalLink, Sparkles } from 'lucide-react';
import type { DebugSession } from '../../hooks/useSessions';
import useMastraAgent from '../../hooks/useMastraAgent';

interface Props {
  session: DebugSession;
}

// Simple markdown-ish renderer — converts **bold**, `code`, and numbered lists
const renderResult = (text: string) => {
  return text
    .split('\n')
    .map((line, i) => {
      // Numbered heading like "1. ROOT CAUSE"
      if (/^\d+\.\s+[A-Z\s]+:/.test(line)) {
        return (
          <p key={i} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mt-4 mb-1">
            {line}
          </p>
        );
      }
      // Regular numbered list
      if (/^\d+\.\s/.test(line)) {
        return (
          <p key={i} className="text-sm text-gray-700 dark:text-gray-300 pl-4">
            {line}
          </p>
        );
      }
      // Bullet
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <p key={i} className="text-sm text-gray-600 dark:text-gray-400 pl-4 flex gap-2">
            <span className="text-indigo-400 flex-shrink-0">•</span>
            <span>{line.replace(/^[-•]\s/, '')}</span>
          </p>
        );
      }
      // Code block (backtick wrapped)
      if (line.startsWith('```') || line.startsWith('    ')) {
        return (
          <code key={i} className="block text-xs font-mono bg-gray-900 text-green-300 px-3 py-0.5 rounded">
            {line.replace(/^```\w*/, '').replace(/^    /, '')}
          </code>
        );
      }
      // Empty line
      if (!line.trim()) return <div key={i} className="h-2" />;
      // Default
      return (
        <p key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {line}
        </p>
      );
    });
};

const MastraAgentPanel = ({ session }: Props) => {
  const { debugSession, loadingSession, sessionAnalysis, error, clearSessionAnalysis } = useMastraAgent();
  const [expanded, setExpanded] = useState(true);

  const handleDebug = async () => {
    if (!session.error_message) return;
    await debugSession({
      errorMessage: session.error_message,
      stackTrace: session.stack_trace,
      codeSnippet: session.code_snippet,
      sessionTitle: session.title,
      projectLanguage: session.project?.language,
    });
    setExpanded(true);
  };

  const hasError = !!session.error_message;

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
            <p className="text-xs text-gray-400">Session Debugger Agent · Multi-step reasoning</p>
          </div>
          <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
            Mastra Cloud
          </span>
        </div>

        {sessionAnalysis && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      {/* No error message */}
      {!hasError && (
        <div className="p-8 text-center">
          <Brain size={24} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Add an error message to enable Mastra deep analysis</p>
        </div>
      )}

      {/* Loading */}
      {loadingSession && (
        <div className="p-10 text-center space-y-3">
          <Loader2 size={28} className="animate-spin text-purple-500 mx-auto" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Mastra agent reasoning...</p>
          <p className="text-xs text-gray-400">Session Debugger is reading your stack trace and analyzing code context</p>
        </div>
      )}

      {/* Error */}
      {error && !loadingSession && (
        <div className="p-6 text-center space-y-3">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={handleDebug}
            className="text-xs text-indigo-600 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Ready to analyze */}
      {hasError && !loadingSession && !sessionAnalysis && !error && (
        <div className="p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950 rounded-2xl flex items-center justify-center mx-auto">
            <Brain size={22} className="text-purple-500" />
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
              Mastra Session Debugger
            </p>
            <p className="text-gray-400 text-xs max-w-sm mx-auto leading-relaxed">
              Unlike standard AI analysis, the Mastra agent uses multi-step reasoning — it reads your stack trace, inspects code context, and produces a precise diff-format fix.
            </p>
          </div>
          <button
            onClick={handleDebug}
            disabled={loadingSession}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition shadow-sm hover:shadow-md disabled:opacity-40"
          >
            <Sparkles size={14} />
            Run Deep Analysis
          </button>
        </div>
      )}

      {/* Result */}
      {sessionAnalysis && !loadingSession && expanded && (
        <div className="p-5 space-y-3">
          <div className="space-y-1">
            {renderResult(sessionAnalysis)}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => { clearSessionAnalysis(); }}
              className="text-xs text-gray-400 hover:text-gray-600 transition"
            >
              Clear
            </button>
            <button
              onClick={handleDebug}
              className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 font-medium transition"
            >
              <ExternalLink size={11} /> Re-run analysis
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MastraAgentPanel;