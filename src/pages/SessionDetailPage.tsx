import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, Trash2, Save,
  ChevronDown, Clock, FolderOpen,
  CheckCircle, Download, Share2
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { StatusBadge, SeverityBadge } from '../components/sessions/StatusBadge';
import AIDebugPanel from '../components/sessions/AIDebugPanel';
import useSessions from '../hooks/useSessions';
import type { Status } from '../hooks/useSessions';
import useFixes from '../hooks/useFixes';
import type { AIAnalysis } from '../lib/groqClient';
import { exportSessionAsMarkdown } from '../hooks/exportUtils';
import ShareModal from '../components/shared/ShareModal';
import toast from 'react-hot-toast';

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

const ENV_COLORS: Record<string, string> = {
  development: 'bg-blue-50 text-blue-600 border-blue-200',
  staging: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  production: 'bg-red-50 text-red-600 border-red-200',
};

const SessionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { sessions, updateSession, deleteSession } = useSessions();
  const { createFix } = useFixes();

  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savingToLib, setSavingToLib] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [localStatus, setLocalStatus] = useState<Status | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const session = sessions.find(s => s.id === id) ?? null;
  const loading = sessions.length === 0 && !session;

  useEffect(() => {
    if (session) setNotes(session.notes ?? '');
  }, [session?.id]);

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

  const handleSaveAnalysis = async (analysis: AIAnalysis) => {
    if (!session) return;
    const bestFix = analysis.fixes[analysis.best_fix_index] ?? analysis.fixes[0];
    const ai_fix = bestFix
      ? `**Fix (${analysis.confidence}% confidence)**\n\n${bestFix.code}\n\n**Why this happens:**\n${analysis.root_cause}`
      : analysis.plain_english;
    await updateSession(session.id, { ai_analysis: analysis, ai_fix });
    toast.success('Analysis saved!');
  };

  const handleSaveToLibrary = async () => {
    if (!session?.ai_analysis && !session?.ai_fix) return;
    setSavingToLib(true);
    const analysis = session.ai_analysis;
    const bestFix = analysis?.fixes[analysis.best_fix_index ?? 0] ?? analysis?.fixes[0];
    await createFix({
      title: session.title,
      fix_content: bestFix
        ? `**${bestFix.title}**\n\n${bestFix.code}\n\n${bestFix.explanation}`
        : session.ai_fix ?? '',
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
    exportSessionAsMarkdown({ ...session, status: effectiveStatus });
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
    <>
    <DashboardLayout title="Session">
      {/* overflow-hidden on the root prevents any child from blowing out the width */}
      <div className="space-y-5 overflow-x-hidden">

        {/* Top bar — back + share + export
            Key fix: min-w-0 on the left side, buttons never grow, row never wraps wide */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <button
            onClick={() => navigate('/sessions')}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition flex-shrink-0"
          >
            <ArrowLeft size={14} />
            <span className="hidden xs:inline">All Sessions</span>
          </button>

          {/* Action buttons — icons only on mobile, labels on sm+ */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 px-2.5 py-2 sm:px-3 rounded-xl text-sm font-medium transition"
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-600 dark:text-gray-400 px-2.5 py-2 sm:px-3 rounded-xl text-sm font-medium transition"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export .md</span>
            </button>
          </div>
        </div>

        {/* Session header card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6 min-w-0">

          {/* Title — truncate on mobile, wrap on sm+ */}
          <div className="mb-3 min-w-0">
            <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white leading-snug
                           truncate sm:whitespace-normal sm:break-words min-w-0">
              {session.title}
            </h2>
          </div>

          {/* Badges + status button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <StatusBadge status={effectiveStatus} />
              <SeverityBadge severity={session.severity} />
              {session.environment && (
                <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium capitalize flex-shrink-0 ${ENV_COLORS[session.environment] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                  {session.environment}
                </span>
              )}
              {session.project && (
                <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 max-w-[120px] min-w-0">
                  <FolderOpen size={11} className="flex-shrink-0" />
                  <span className="truncate">{session.project.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                <Clock size={11} />
                <span className="hidden sm:inline">
                  {new Date(session.created_at).toLocaleDateString()} at{' '}
                  {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="sm:hidden">
                  {new Date(session.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Status dropdown */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-600 dark:text-gray-400 px-3 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap"
              >
                Change Status <ChevronDown size={14} />
              </button>
              {showStatusMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 overflow-hidden min-w-[160px]">
                  {STATUS_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => handleStatusChange(opt.value)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-2 ${
                        effectiveStatus === opt.value
                          ? 'text-indigo-600 font-medium bg-indigo-50 dark:bg-indigo-950'
                          : 'text-gray-700 dark:text-gray-300'
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

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 min-w-0">

          <div className="lg:col-span-2 space-y-5 min-w-0">

            {session.error_message && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6 min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Error Message</p>
                <div className="bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-xl p-4 font-mono text-xs sm:text-sm text-red-800 dark:text-red-300 whitespace-pre-wrap break-all overflow-x-auto">
                  {session.error_message}
                </div>
              </div>
            )}

            {session.stack_trace && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6 min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Stack Trace</p>
                <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto max-h-48 overflow-y-auto">
                  {session.stack_trace}
                </div>
              </div>
            )}

            {session.code_snippet && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6 min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Related Code</p>
                <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto max-h-48 overflow-y-auto">
                  {session.code_snippet}
                </div>
              </div>
            )}

            {session.expected_behavior && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5 min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Expected Behavior</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 break-words">{session.expected_behavior}</p>
              </div>
            )}

            <AIDebugPanel
              session={session}
              onSaveAnalysis={handleSaveAnalysis}
              onSaveToLibrary={handleSaveToLibrary}
              savingToLib={savingToLib}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your debugging notes, observations, or next steps..."
                rows={5}
                className="w-full border-2 border-gray-100 dark:border-gray-700 focus:border-indigo-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-300 resize-none"
              />
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes || notes === (session.notes ?? '')}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition disabled:opacity-40"
              >
                {savingNotes ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Session Info</h3>
              <div className="space-y-2">
                {[
                  { label: 'Status',      value: <StatusBadge status={effectiveStatus} /> },
                  { label: 'Severity',    value: <SeverityBadge severity={session.severity} /> },
                  { label: 'Environment', value: (
                    <span className={`text-xs px-2 py-0.5 rounded-lg border font-medium capitalize ${ENV_COLORS[session.environment ?? 'development'] ?? ''}`}>
                      {session.environment ?? 'development'}
                    </span>
                  )},
                  { label: 'Project', value: (
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[100px] text-right block">
                      {session.project?.name ?? '—'}
                    </span>
                  )},
                  { label: 'Created', value: (
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {new Date(session.created_at).toLocaleDateString()}
                    </span>
                  )},
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-800 last:border-0 gap-2 min-w-0">
                    <span className="text-xs text-gray-400 flex-shrink-0">{item.label}</span>
                    <div className="flex-shrink-0 min-w-0">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-red-100 dark:border-red-900 p-4 sm:p-6">
              <h3 className="font-bold text-red-600 mb-4">Danger Zone</h3>
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-xl space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Delete Session</p>
                  <p className="text-xs text-gray-400 mt-0.5">Permanently delete this session and all its data.</p>
                </div>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition disabled:opacity-50 w-full justify-center"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  {deleting ? 'Deleting...' : 'Delete Session'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>

    {showShareModal && session && (
      <ShareModal
        resourceType="session"
        resourceId={session.id}
        resourceName={session.title}
        onClose={() => setShowShareModal(false)}
      />
    )}
    </>
  );
};

export default SessionDetailPage;