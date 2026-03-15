import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Eye, Clock, FolderOpen } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { StatusBadge, SeverityBadge } from '../components/sessions/StatusBadge';
import AIDebugPanel from '../components/sessions/AIDebugPanel';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import type { DebugSession } from '../hooks/useSessions';

const ENV_COLORS: Record<string, string> = {
  development: 'bg-blue-50 text-blue-600 border-blue-200',
  staging: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  production: 'bg-red-50 text-red-600 border-red-200',
};

const SharedSessionView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthStore();

  const [session, setSession] = useState<DebugSession | null>(null);
  const [sharedBy, setSharedBy] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id || !user || authLoading) return;
      setLoading(true);

      // Check for direct session share
      const { data: directShares } = await supabase
        .from('shares')
        .select('owner_id')
        .eq('resource_type', 'session')
        .eq('resource_id', id)
        .eq('invitee_id', user.id)
        .limit(1);

      let ownerId = directShares?.[0]?.owner_id ?? null;

      // If not a direct share, check if session belongs to a shared project
      if (!ownerId) {
        const { data: sessList } = await supabase
          .from('debug_sessions')
          .select('project_id')
          .eq('id', id)
          .limit(1);

        const projectId = sessList?.[0]?.project_id ?? null;

        if (projectId) {
          const { data: projShares } = await supabase
            .from('shares')
            .select('owner_id')
            .eq('resource_type', 'project')
            .eq('resource_id', projectId)
            .eq('invitee_id', user.id)
            .limit(1);

          ownerId = projShares?.[0]?.owner_id ?? null;
        }
      }

      if (!ownerId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Fetch owner profile
      const { data: ownerProfiles } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', ownerId)
        .limit(1);
      const op = ownerProfiles?.[0];
      setSharedBy(op?.name || op?.email || 'Someone');

      // Fetch session with project info
      const { data: rawList } = await supabase
        .from('debug_sessions')
        .select('*, projects(name, language)')
        .eq('id', id)
        .limit(1);

      const raw = rawList?.[0] ?? null;
      if (!raw) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setSession({
        ...raw,
        ai_analysis: raw.ai_analysis
          ? (typeof raw.ai_analysis === 'string' ? JSON.parse(raw.ai_analysis) : raw.ai_analysis)
          : null,
        project: raw.projects
          ? { name: raw.projects.name, language: raw.projects.language }
          : undefined,
      });

      setLoading(false);
    };
    load();
  }, [id, user?.id, authLoading]);

  if (loading) return (
    <DashboardLayout title="Shared Session">
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-indigo-500" size={28} />
      </div>
    </DashboardLayout>
  );

  if (notFound || !session) return (
    <DashboardLayout title="Shared Session">
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-gray-500 mb-4">This session isn't shared with you or no longer exists.</p>
        <button onClick={() => navigate('/shared')} className="text-indigo-600 font-medium text-sm">
          Back to Shared with Me
        </button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title={session.title}>
      <div className="space-y-5">

        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition">
          <ArrowLeft size={14} /> Back
        </button>

        {/* Read-only banner */}
        <div className="flex items-center gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl">
          <Eye size={15} className="text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            <strong>Read only</strong> · Shared by <span className="font-semibold">{sharedBy}</span>
          </p>
        </div>

        {/* Session header */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-snug break-words mb-3">
            {session.title}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={session.status} />
            <SeverityBadge severity={session.severity} />
            {session.environment && (
              <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium capitalize ${ENV_COLORS[session.environment] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                {session.environment}
              </span>
            )}
            {session.project && (
              <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700">
                <FolderOpen size={11} />
                <span className="truncate max-w-[120px]">{session.project.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={11} />
              {new Date(session.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {session.error_message && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sm:p-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Error Message</p>
              <div className="bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-xl p-4 font-mono text-xs sm:text-sm text-red-800 dark:text-red-300 whitespace-pre-wrap break-all">
                {session.error_message}
              </div>
            </div>
          )}

          {session.stack_trace && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sm:p-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Stack Trace</p>
              <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto max-h-48 overflow-y-auto">
                {session.stack_trace}
              </div>
            </div>
          )}

          {session.code_snippet && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sm:p-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Related Code</p>
              <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto max-h-48 overflow-y-auto">
                {session.code_snippet}
              </div>
            </div>
          )}

          {session.expected_behavior && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Expected Behavior</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{session.expected_behavior}</p>
            </div>
          )}

          {session.ai_analysis && (
            <AIDebugPanel
              session={session}
              onSaveAnalysis={async () => {}}
              onSaveToLibrary={async () => {}}
              savingToLib={false}
              // Read-only view — collaboration features disabled
              isChecked={() => false}
              checkedBy={() => null}
              onToggleChecklist={() => {}}
              completedCount={0}
              isCollaborative={false}
              currentUserName=""
            />
          )}

          {session.notes && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sm:p-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Notes</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{session.notes}</p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default SharedSessionView;