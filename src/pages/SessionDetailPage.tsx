import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, Trash2, Save,
  Sparkles, ChevronDown, Clock, FolderOpen,
  CheckCircle, AlertCircle, RotateCcw, Download, BookOpen
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { StatusBadge, SeverityBadge } from '../components/sessions/StatusBadge';
import useSessions from '../hooks/useSessions';
import type { Status } from '../hooks/useSessions';
import useFixes from '../hooks/useFixes';
import { getAIFix } from '../lib/groqClient';
import { exportSessionAsMarkdown } from '../hooks/exportUtils';
import toast from 'react-hot-toast';

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

const SessionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ✅ Use reactive sessions list — includes pending from localStorage
  const { sessions, updateSession, deleteSession } = useSessions();
  const { createFix } = useFixes();

  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [gettingFix, setGettingFix] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savingToLib, setSavingToLib] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [localAiFix, setLocalAiFix] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState<Status | null>(null);

  // ✅ Find session from reactive list — works offline + pending
  const session = sessions.find(s => s.id === id) ?? null;
  const loading = sessions.length === 0 && !session;

  useEffect(() => {
    if (session) setNotes(session.notes ?? '');
  }, [session?.id]);

  const effectiveAiFix = localAiFix ?? session?.ai_fix ?? null;
  const effectiveStatus = localStatus ?? session?.status ?? 'open';

  const handleStatusChange = async (status: Status) => {
    if (!session) return;
    setShowStatusMenu(false);
    setLocalStatus(status);
    await updateSession(session.id, { status });
  };

  const handleSaveNotes = async () => {
    if (!session) return;
    setSavingNotes(true);
    await updateSession(session.id, { notes });
    toast.success('Notes saved!');
    setSavingNotes(false);
  };

  const handleGetAIFix = async () => {
    if (!session?.error_message) { toast.error('Add an error message first to get an AI fix'); return; }
    setGettingFix(true);
    toast.loading('Asking Groq AI...', { id: 'ai-fix' });

    const result = await getAIFix(
      session.error_message,
      session.stack_trace ?? undefined,
      session.project?.language ?? undefined
    );

    toast.dismiss('ai-fix');

    if (!result) { toast.error('Failed to get AI fix. Check your Groq API key.'); setGettingFix(false); return; }

    const aiFix = `**Fix (${result.confidence}% confidence)**\n\n${result.fix}\n\n**Why this happens:**\n${result.explanation}`;
    setLocalAiFix(aiFix);
    await updateSession(session.id, { ai_fix: aiFix });
    toast.success('AI fix generated!');
    setGettingFix(false);
  };

  const handleSaveToLibrary = async () => {
    if (!effectiveAiFix || !session) return;
    setSavingToLib(true);
    await createFix({
      title: session.title,
      fix_content: effectiveAiFix,
      session_id: session.id,
      project_id: session.project_id ?? undefined,
      error_pattern: session.error_message ?? undefined,
      language: session.project?.language ?? undefined,
    });
    setSavingToLib(false);
    toast.success('Saved to Fix Library!');
  };

  const handleExport = () => {
    if (!session) return;
    exportSessionAsMarkdown({ ...session, ai_fix: effectiveAiFix ?? undefined, status: effectiveStatus });
    toast.success('Session exported as Markdown!');
  };

  const handleDelete = async () => {
    if (!session) return;
    if (!confirm(`Delete "${session.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    const ok = await deleteSession(session.id);
    if (ok) navigate('/sessions');
    setDeleting(false);
  };

  const formatAIFix = (text: string) =>
    text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');

  if (loading) return (
    <DashboardLayout title="Session">
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-indigo-500" size={28} />
      </div>
    </DashboardLayout>
  );

  if (!session) return (
    <DashboardLayout title="Session">
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-gray-500 mb-4">Session not found</p>
        <button onClick={() => navigate('/sessions')} className="text-indigo-600 font-medium text-sm">
          Back to Sessions
        </button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title={session.title}>
      <div className="max-w-3xl space-y-5">

        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/sessions')}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition">
            <ArrowLeft size={14} /> All Sessions
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-600 px-3 py-2 rounded-xl text-sm font-medium transition">
            <Download size={14} /> Export .md
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {session.title}
                {session._pending && (
                  <span className="ml-2 text-xs font-normal text-orange-400 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-lg">
                    Pending sync
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={effectiveStatus} />
                <SeverityBadge severity={session.severity} />
                {session.project && (
                  <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700">
                    <FolderOpen size={11} /> {session.project.name}
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={11} />
                  {new Date(session.created_at).toLocaleDateString()} at{' '}
                  {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            <div className="relative">
              <button onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="flex items-center gap-2 border border-gray-200 hover:border-indigo-300 text-gray-600 dark:text-gray-400 px-3 py-2 rounded-xl text-sm font-medium transition">
                Change Status <ChevronDown size={14} />
              </button>
              {showStatusMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 overflow-hidden min-w-[160px]">
                  {STATUS_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => handleStatusChange(opt.value)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-2 ${
                        effectiveStatus === opt.value ? 'text-indigo-600 font-medium bg-indigo-50 dark:bg-indigo-950' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                      {effectiveStatus === opt.value && <CheckCircle size={13} />}
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {session.error_message && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={16} className="text-red-500" />
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Error Message</h3>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 font-mono text-sm text-red-800 whitespace-pre-wrap">
              {session.error_message}
            </div>
          </div>
        )}

        {session.stack_trace && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Stack Trace</h3>
            <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto">
              {session.stack_trace}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-50 dark:bg-indigo-950 rounded-lg flex items-center justify-center">
                <Sparkles size={14} className="text-indigo-600" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">AI Fix</h3>
              <span className="text-xs bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full">Groq · Llama 3</span>
            </div>
            <div className="flex items-center gap-2">
              {effectiveAiFix && (
                <button onClick={handleSaveToLibrary} disabled={savingToLib}
                  className="flex items-center gap-1.5 border border-indigo-200 hover:bg-indigo-50 text-indigo-600 text-xs font-medium px-3 py-1.5 rounded-xl transition disabled:opacity-40">
                  {savingToLib ? <Loader2 size={12} className="animate-spin" /> : <BookOpen size={12} />}
                  Save to Library
                </button>
              )}
              <button onClick={handleGetAIFix} disabled={gettingFix || !session.error_message}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed">
                {gettingFix
                  ? <><Loader2 size={13} className="animate-spin" /> Analyzing...</>
                  : effectiveAiFix
                    ? <><RotateCcw size={13} /> Regenerate</>
                    : <><Sparkles size={13} /> Get AI Fix</>
                }
              </button>
            </div>
          </div>
          {effectiveAiFix ? (
            <div className="bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 rounded-xl p-4 text-sm text-gray-800 dark:text-gray-200 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatAIFix(effectiveAiFix) }} />
          ) : (
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
              <Sparkles size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">
                {session.error_message ? 'Click "Get AI Fix" to analyze this error with Groq AI' : 'Add an error message to enable AI fix suggestions'}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Notes</h3>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your debugging notes, observations, or next steps..."
            rows={4}
            className="w-full border-2 border-gray-100 dark:border-gray-700 focus:border-indigo-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-300 resize-none" />
          <button onClick={handleSaveNotes} disabled={savingNotes || notes === (session.notes ?? '')}
            className="mt-3 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition disabled:opacity-40">
            {savingNotes ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {savingNotes ? 'Saving...' : 'Save Notes'}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-red-100 dark:border-red-900 p-6">
          <h3 className="font-bold text-red-600 mb-4">Danger Zone</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Delete Session</p>
              <p className="text-xs text-gray-400">Permanently delete this session and all its data</p>
            </div>
            <button onClick={handleDelete} disabled={deleting}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-950 text-red-600 font-medium px-4 py-2 rounded-xl text-sm transition border border-red-200 dark:border-red-800 disabled:opacity-50">
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Delete
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default SessionDetailPage;