import { useState } from 'react';
import { X, Bug, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import type { CreateSessionInput, Severity, Environment } from '../../hooks/useSessions';
import useProjects from '../../hooks/useProjects';

interface Props {
  onClose: () => void;
  onCreate: (input: CreateSessionInput) => Promise<any>;
  defaultProjectId?: string;
}

const SEVERITIES: { value: Severity; label: string; color: string }[] = [
  { value: 'low',      label: 'Low',      color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { value: 'medium',   label: 'Medium',   color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'high',     label: 'High',     color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-700 border-red-200' },
];

const ENVIRONMENTS: { value: Environment; label: string }[] = [
  { value: 'development', label: 'Development' },
  { value: 'staging',     label: 'Staging' },
  { value: 'production',  label: 'Production' },
];

const CreateSessionModal = ({ onClose, onCreate, defaultProjectId }: Props) => {
  const { projects } = useProjects();

  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId ?? '');
  const [errorMessage, setErrorMessage] = useState('');
  const [stackTrace, setStackTrace] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [environment, setEnvironment] = useState<Environment>('development');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    const result = await onCreate({
      title: title.trim(),
      project_id: projectId || undefined,
      error_message: errorMessage.trim() || undefined,
      stack_trace: stackTrace.trim() || undefined,
      code_snippet: codeSnippet.trim() || undefined,
      expected_behavior: expectedBehavior.trim() || undefined,
      environment,
      severity,
    });
    setLoading(false);
    if (result) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 dark:bg-blue-950 rounded-xl flex items-center justify-center">
              <Bug size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">New Debug Session</h2>
              <p className="text-xs text-gray-400">Log an error to start debugging</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 transition">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Session Title <span className="text-red-400">*</span>
            </label>
            <input type="text" placeholder="e.g. TypeError on user login"
              value={title} onChange={(e) => setTitle(e.target.value)} autoFocus
              className="w-full border-2 border-gray-100 dark:border-gray-700 focus:border-indigo-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-300"
            />
          </div>

          {/* Project + Environment row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Project</label>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)}
                className="w-full border-2 border-gray-100 dark:border-gray-700 focus:border-indigo-400 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition bg-white dark:bg-gray-800">
                <option value="">No project</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Environment</label>
              <select value={environment} onChange={(e) => setEnvironment(e.target.value as Environment)}
                className="w-full border-2 border-gray-100 dark:border-gray-700 focus:border-indigo-400 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition bg-white dark:bg-gray-800">
                {ENVIRONMENTS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Severity</label>
            <div className="flex gap-2">
              {SEVERITIES.map((s) => (
                <button key={s.value} onClick={() => setSeverity(s.value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition ${
                    severity === s.value ? s.color + ' ring-2 ring-indigo-400 ring-offset-1' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Error Message <span className="text-gray-300">(optional)</span>
            </label>
            <textarea placeholder="TypeError: Cannot read properties of undefined (reading 'map')"
              value={errorMessage} onChange={(e) => setErrorMessage(e.target.value)} rows={2}
              className="w-full border-2 border-gray-100 dark:border-gray-700 focus:border-indigo-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-300 resize-none font-mono"
            />
          </div>

          {/* Stack Trace */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Stack Trace <span className="text-gray-300">(optional)</span>
            </label>
            <textarea placeholder={"at ProductList.jsx:45\nat renderWithHooks..."}
              value={stackTrace} onChange={(e) => setStackTrace(e.target.value)} rows={3}
              className="w-full border-2 border-gray-100 dark:border-gray-700 focus:border-indigo-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-300 resize-none font-mono"
            />
          </div>

          {/* Advanced toggle */}
          <button onClick={() => setShowAdvanced(v => !v)}
            className="flex items-center gap-2 text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition">
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showAdvanced ? 'Hide' : 'Show'} advanced fields (code snippet, expected behavior)
          </button>

          {showAdvanced && (
            <div className="space-y-4 pt-1">
              {/* Code Snippet */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Related Code <span className="text-gray-300">(optional — helps AI give better fixes)</span>
                </label>
                <textarea
                  placeholder={"const data = await fetchUser();\nreturn data.map(u => u.name); // crashes here"}
                  value={codeSnippet} onChange={(e) => setCodeSnippet(e.target.value)} rows={5}
                  className="w-full border-2 border-gray-100 dark:border-gray-700 focus:border-indigo-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-300 resize-none font-mono"
                />
              </div>

              {/* Expected Behavior */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Expected Behavior <span className="text-gray-300">(optional)</span>
                </label>
                <input type="text"
                  placeholder="The user list should render without crashing"
                  value={expectedBehavior} onChange={(e) => setExpectedBehavior(e.target.value)}
                  className="w-full border-2 border-gray-100 dark:border-gray-700 focus:border-indigo-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-300"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 border-2 border-gray-100 dark:border-gray-700 hover:border-gray-200 text-gray-600 dark:text-gray-400 rounded-xl py-2.5 text-sm font-medium transition">
              Cancel
            </button>
            <button onClick={handleCreate} disabled={loading || !title.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed">
              {loading && <Loader2 size={14} className="animate-spin" />}
              Log Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSessionModal;