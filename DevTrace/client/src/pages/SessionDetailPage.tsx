// SessionDetailPage — full session view with AI fix via Gemini

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, Trash2, Save,
  Sparkles, ChevronDown, Clock, FolderOpen,
  CheckCircle, AlertCircle, RotateCcw
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { StatusBadge, SeverityBadge } from '../components/sessions/StatusBadge';
import useSessions from '../hooks/useSessions';
import type { DebugSession, Status } from '../hooks/useSessions';
import { getAIFix } from '../lib/groqClient';
import toast from 'react-hot-toast';

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

const SessionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSession, updateSession, deleteSession } = useSessions();

  const [session, setSession] = useState<DebugSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [gettingFix, setGettingFix] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadSession();
  }, [id]);

  const loadSession = async () => {
    setLoading(true);
    const data = await getSession(id!);
    if (data) {
      setSession(data);
      setNotes(data.notes ?? '');
    }
    setLoading(false);
  };

  const handleStatusChange = async (status: Status) => {
    if (!session) return;
    setShowStatusMenu(false);
    const ok = await updateSession(session.id, { status });
    if (ok) setSession((s) => s ? { ...s, status } : s);
  };

  const handleSaveNotes = async () => {
    if (!session) return;
    setSavingNotes(true);
    const ok = await updateSession(session.id, { notes });
    if (ok) {
      setSession((s) => s ? { ...s, notes } : s);
      toast.success('Notes saved!');
    }
    setSavingNotes(false);
  };

  const handleGetAIFix = async () => {
    if (!session?.error_message) {
      toast.error('Add an error message first to get an AI fix');
      return;
    }
    setGettingFix(true);
    toast.loading('Asking Gemini AI...', { id: 'ai-fix' });

    const result = await getAIFix(
      session.error_message,
      session.stack_trace ?? undefined,
      session.project?.language ?? undefined
    );

    toast.dismiss('ai-fix');

    if (!result) {
      toast.error('Failed to get AI fix. Check your Gemini API key.');
      setGettingFix(false);
      return;
    }

    const aiFix = `**Fix (${result.confidence}% confidence)**\n\n${result.fix}\n\n**Why this happens:**\n${result.explanation}`;
    const ok = await updateSession(session.id, { ai_fix: aiFix });
    if (ok) {
      setSession((s) => s ? { ...s, ai_fix: aiFix } : s);
      toast.success('AI fix generated!');
    }
    setGettingFix(false);
  };

  const handleDelete = async () => {
    if (!session) return;
    if (!confirm(`Delete "${session.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    const ok = await deleteSession(session.id);
    if (ok) navigate('/sessions');
    setDeleting(false);
  };

  const formatAIFix = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  if (loading) {
    return (
      <DashboardLayout title="Session">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-indigo-500" size={28} />
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout title="Session">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-500 mb-4">Session not found</p>
          <button onClick={() => navigate('/sessions')} className="text-indigo-600 font-medium text-sm">
            Back to Sessions
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={session.title}>
      <div className="max-w-3xl space-y-5">

        {/* Back */}
        <button
          onClick={() => navigate('/sessions')}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition"
        >
          <ArrowLeft size={14} /> All Sessions
        </button>

        {/* Session header card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{session.title}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={session.status} />
                <SeverityBadge severity={session.severity} />
                {session.project && (
                  <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                    <FolderOpen size={11} />
                    {session.project.name}
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={11} />
                  {new Date(session.created_at).toLocaleDateString()} at{' '}
                  {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Status changer */}
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="flex items-center gap-2 border border-gray-200 hover:border-indigo-300 text-gray-600 px-3 py-2 rounded-xl text-sm font-medium transition"
              >
                Change Status <ChevronDown size={14} />
              </button>
              {showStatusMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden min-w-[160px]">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleStatusChange(opt.value)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition flex items-center gap-2 ${
                        session.status === opt.value ? 'text-indigo-600 font-medium bg-indigo-50' : 'text-gray-700'
                      }`}
                    >
                      {session.status === opt.value && <CheckCircle size={13} />}
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error message */}
        {session.error_message && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={16} className="text-red-500" />
              <h3 className="font-bold text-gray-900 text-sm">Error Message</h3>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 font-mono text-sm text-red-800 whitespace-pre-wrap">
              {session.error_message}
            </div>
          </div>
        )}

        {/* Stack trace */}
        {session.stack_trace && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Stack Trace</h3>
            <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto">
              {session.stack_trace}
            </div>
          </div>
        )}

        {/* AI Fix section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Sparkles size={14} className="text-indigo-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">AI Fix</h3>
              <span className="text-xs bg-indigo-50 text-indigo-500 border border-indigo-100 px-2 py-0.5 rounded-full">
                Gemini
              </span>
            </div>
            <button
              onClick={handleGetAIFix}
              disabled={gettingFix || !session.error_message}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {gettingFix
                ? <><Loader2 size={13} className="animate-spin" /> Analyzing...</>
                : session.ai_fix
                  ? <><RotateCcw size={13} /> Regenerate</>
                  : <><Sparkles size={13} /> Get AI Fix</>
              }
            </button>
          </div>

          {session.ai_fix ? (
            <div
              className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatAIFix(session.ai_fix) }}
            />
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
              <Sparkles size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">
                {session.error_message
                  ? 'Click "Get AI Fix" to analyze this error with Gemini'
                  : 'Add an error message to enable AI fix suggestions'
                }
              </p>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 text-sm mb-3">Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your debugging notes, observations, or next steps..."
            rows={4}
            className="w-full border-2 border-gray-100 focus:border-indigo-400 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-300 resize-none"
          />
          <button
            onClick={handleSaveNotes}
            disabled={savingNotes || notes === session.notes}
            className="mt-3 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition disabled:opacity-40"
          >
            {savingNotes ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {savingNotes ? 'Saving...' : 'Save Notes'}
          </button>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-red-100 p-6">
          <h3 className="font-bold text-red-600 mb-4">Danger Zone</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Delete Session</p>
              <p className="text-xs text-gray-400">Permanently delete this session and all its data</p>
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium px-4 py-2 rounded-xl text-sm transition border border-red-200 disabled:opacity-50"
            >
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