import { useState } from 'react';
import { X, Bug, Loader2 } from 'lucide-react';
import type { CreateSessionInput, Severity } from '../../hooks/useSessions';
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

const CreateSessionModal = ({ onClose, onCreate, defaultProjectId }: Props) => {
  // ✅ Read from local SQLite via PowerSync — works offline
  const { projects } = useProjects();

  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId ?? '');
  const [errorMessage, setErrorMessage] = useState('');
  const [stackTrace, setStackTrace] = useState('');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    const result = await onCreate({
      title: title.trim(),
      project_id: projectId || undefined,
      error_message: errorMessage.trim() || undefined,
      stack_trace: stackTrace.trim() || undefined,
      severity,
    });
    setLoading(false);
    if (result) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Bug size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">New Debug Session</h2>
              <p className="text-xs text-gray-400">Log an error to start debugging</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Session Title <span className="text-red-400">*</span>
            </label>
            <input type="text" placeholder="e.g. TypeError on user login"
              value={title} onChange={(e) => setTitle(e.target.value)} autoFocus
              className="w-full border-2 border-gray-100 focus:border-indigo-400 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-300"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Project <span className="text-gray-300">(optional)</span>
            </label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)}
              className="w-full border-2 border-gray-100 focus:border-indigo-400 text-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition bg-white">
              <option value="">No project</option>
              {/* ✅ Projects from local SQLite — available offline */}
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Severity</label>
            <div className="flex gap-2">
              {SEVERITIES.map((s) => (
                <button key={s.value} onClick={() => setSeverity(s.value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition ${
                    severity === s.value
                      ? s.color + ' ring-2 ring-indigo-400 ring-offset-1'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Error Message <span className="text-gray-300">(optional)</span>
            </label>
            <textarea placeholder="TypeError: Cannot read properties of undefined (reading 'map')"
              value={errorMessage} onChange={(e) => setErrorMessage(e.target.value)} rows={3}
              className="w-full border-2 border-gray-100 focus:border-indigo-400 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-300 resize-none font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Stack Trace <span className="text-gray-300">(optional)</span>
            </label>
            <textarea placeholder={"at ProductList.jsx:45\nat renderWithHooks..."}
              value={stackTrace} onChange={(e) => setStackTrace(e.target.value)} rows={4}
              className="w-full border-2 border-gray-100 focus:border-indigo-400 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-300 resize-none font-mono"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 border-2 border-gray-100 hover:border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-medium transition">
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