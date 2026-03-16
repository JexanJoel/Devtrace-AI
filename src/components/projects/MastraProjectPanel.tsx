import { useState } from 'react';
import { Brain, Loader2, ChevronDown, ChevronUp, BarChart2, Sparkles } from 'lucide-react';
import type { DebugSession } from '../../hooks/useSessions';
import useMastraAgent from '../../hooks/useMastraAgent';

interface Props {
  projectName: string;
  projectLanguage?: string;
  sessions: DebugSession[];
}

// Simple line renderer — same as MastraAgentPanel
const renderResult = (text: string) => {
  return text.split('\n').map((line, i) => {
    if (/^\d+\.\s+[A-Z\s]+:/.test(line)) {
      return (
        <p key={i} className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide mt-4 mb-1">
          {line}
        </p>
      );
    }
    if (/^\d+\.\s/.test(line)) {
      return <p key={i} className="text-sm text-gray-700 dark:text-gray-300 pl-4">{line}</p>;
    }
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return (
        <p key={i} className="text-sm text-gray-600 dark:text-gray-400 pl-4 flex gap-2">
          <span className="text-purple-400 flex-shrink-0">•</span>
          <span>{line.replace(/^[-•]\s/, '')}</span>
        </p>
      );
    }
    if (!line.trim()) return <div key={i} className="h-2" />;
    return <p key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{line}</p>;
  });
};

const MastraProjectPanel = ({ projectName, projectLanguage, sessions }: Props) => {
  const { analyzeProject, loadingProject, projectAnalysis, error, clearProjectAnalysis } = useMastraAgent();
  const [expanded, setExpanded] = useState(true);

  const handleAnalyze = async () => {
    await analyzeProject({
      projectName,
      projectLanguage,
      sessions: sessions.map(s => ({
        title: s.title,
        status: s.status,
        severity: s.severity,
        error_message: s.error_message,
        ai_analysis: s.ai_analysis
          ? { category: s.ai_analysis.category, root_cause: s.ai_analysis.root_cause }
          : null,
      })),
    });
    setExpanded(true);
  };

  const hasSessions = sessions.length > 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-purple-100 dark:border-purple-900 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-purple-50 dark:border-purple-900/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-50 dark:bg-purple-950 rounded-xl flex items-center justify-center">
            <BarChart2 size={15} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Mastra Project Analysis</h3>
            <p className="text-xs text-gray-400">Project Analyzer Agent · Pattern recognition</p>
          </div>
          <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
            Mastra Cloud
          </span>
        </div>
        {projectAnalysis && (
          <button onClick={() => setExpanded(v => !v)} className="text-gray-400 hover:text-gray-600 transition">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      {/* No sessions */}
      {!hasSessions && (
        <div className="p-8 text-center">
          <BarChart2 size={24} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Log some debug sessions first to enable project analysis</p>
        </div>
      )}

      {/* Loading */}
      {loadingProject && (
        <div className="p-10 text-center space-y-3">
          <Loader2 size={28} className="animate-spin text-purple-500 mx-auto" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Mastra agent analyzing patterns...</p>
          <p className="text-xs text-gray-400">Project Analyzer is scanning {sessions.length} sessions for recurring issues</p>
        </div>
      )}

      {/* Error */}
      {error && !loadingProject && (
        <div className="p-6 text-center space-y-3">
          <p className="text-sm text-red-500">{error}</p>
          <button onClick={handleAnalyze} className="text-xs text-indigo-600 hover:underline">Try again</button>
        </div>
      )}

      {/* Ready */}
      {hasSessions && !loadingProject && !projectAnalysis && !error && (
        <div className="p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950 rounded-2xl flex items-center justify-center mx-auto">
            <Brain size={22} className="text-purple-500" />
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
              Mastra Project Analyzer
            </p>
            <p className="text-gray-400 text-xs max-w-sm mx-auto leading-relaxed">
              Scans all {sessions.length} sessions to find recurring error patterns, systemic issues, and gives concrete recommendations to improve your project's health.
            </p>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loadingProject}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition shadow-sm hover:shadow-md disabled:opacity-40"
          >
            <Sparkles size={14} />
            Analyze {sessions.length} Sessions
          </button>
        </div>
      )}

      {/* Result */}
      {projectAnalysis && !loadingProject && expanded && (
        <div className="p-5 space-y-3">
          <div className="space-y-1">
            {renderResult(projectAnalysis)}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => clearProjectAnalysis()}
              className="text-xs text-gray-400 hover:text-gray-600 transition"
            >
              Clear
            </button>
            <button
              onClick={handleAnalyze}
              className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 font-medium transition"
            >
              Re-analyze
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MastraProjectPanel;