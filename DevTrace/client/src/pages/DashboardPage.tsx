import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Bug, BookOpen, CheckCircle, BarChart2, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { StatusBadge } from '../components/sessions/StatusBadge';
import OnboardingModal from '../components/onboarding/OnboardingModal';
import { useAuthStore } from '../store/authStore';
import useDashboardStats from '../hooks/useDashboardStats';
import { supabase } from '../lib/supabaseClient';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { stats, loading } = useDashboardStats();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = user?.user_metadata?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'Developer';

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('onboarded').eq('id', user.id).single()
      .then(({ data }) => { if (data && !data.onboarded) setShowOnboarding(true); });
  }, [user]);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return 'Just now';
  };

  const LANG: Record<string, string> = {
    javascript: 'JS', typescript: 'TS', react: 'React',
    nextjs: 'Next', nodejs: 'Node', python: 'Python', other: '?',
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">

        {/* Greeting */}
        <div className="rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4"
          style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}>
          <div>
            <p className="text-indigo-200 text-sm mb-1">{greeting} 👋</p>
            <h2 className="text-2xl font-bold text-white">{name}</h2>
            <p className="text-indigo-200 text-sm mt-1">
              {loading ? 'Loading...' : stats?.totalSessions === 0 ? 'Log your first session!' : `${stats?.totalSessions} sessions logged`}
            </p>
          </div>
          <button onClick={() => navigate('/projects')}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/20 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition">
            <Plus size={16} /> New Project
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 animate-pulse">
              <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-16 mb-2" />
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" />
            </div>
          )) : [
            { label: 'Total Projects', value: stats?.totalProjects ?? 0, icon: <FolderOpen size={20} />, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950', route: '/projects' },
            { label: 'Debug Sessions', value: stats?.totalSessions ?? 0, icon: <Bug size={20} />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950', route: '/sessions' },
            { label: 'Errors Logged', value: stats?.totalErrors ?? 0, icon: <BarChart2 size={20} />, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950', route: '/analytics' },
            { label: 'Resolved', value: `${stats?.resolvedPercent ?? 0}%`, icon: <CheckCircle size={20} />, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950', route: '/sessions' },
          ].map((c, i) => (
            <button key={i} onClick={() => navigate(c.route)}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 text-left hover:border-indigo-200 hover:shadow-sm transition">
              <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center ${c.color} mb-3`}>{c.icon}</div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{c.value}</p>
              <p className="text-sm text-gray-400 mt-0.5">{c.label}</p>
            </button>
          ))}
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent sessions */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Bug size={16} className="text-blue-500" /> Recent Sessions</h3>
              <button onClick={() => navigate('/sessions')} className="text-xs text-indigo-500 font-medium flex items-center gap-1">View all <ArrowRight size={12} /></button>
            </div>
            {loading ? [...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse mb-3">
                <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700 mt-2" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                </div>
              </div>
            )) : stats?.recentSessions.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <Bug size={24} className="text-gray-300 mb-2" />
                <p className="text-gray-400 text-sm mb-3">No sessions yet</p>
                <button onClick={() => navigate('/sessions')} className="text-xs text-indigo-500 font-medium hover:underline">Log your first session →</button>
              </div>
            ) : (
              <div className="space-y-1">
                {stats?.recentSessions.map((s) => (
                  <div key={s.id} onClick={() => navigate(`/sessions/${s.id}`)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition group">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.status === 'open' ? 'bg-red-500' : s.status === 'in_progress' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-indigo-600 transition">{s.title}</p>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} /> {timeAgo(s.created_at)}</span>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent projects */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><FolderOpen size={16} className="text-indigo-500" /> Recent Projects</h3>
              <button onClick={() => navigate('/projects')} className="text-xs text-indigo-500 font-medium flex items-center gap-1">View all <ArrowRight size={12} /></button>
            </div>
            {loading ? [...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-3 p-3 mb-2">
                <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                </div>
              </div>
            )) : stats?.recentProjects.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <FolderOpen size={24} className="text-gray-300 mb-2" />
                <p className="text-gray-400 text-sm mb-3">No projects yet</p>
                <button onClick={() => navigate('/projects')} className="text-xs text-indigo-500 font-medium hover:underline">Create your first project →</button>
              </div>
            ) : (
              <div className="space-y-1">
                {stats?.recentProjects.map((p) => (
                  <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition group">
                    <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-950 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                      {p.language ? LANG[p.language] ?? '?' : <FolderOpen size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-indigo-600 transition">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.session_count} sessions · {timeAgo(p.updated_at)}</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-300 group-hover:text-indigo-400 transition" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'New Session', icon: <Bug size={18} />, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100', route: '/sessions' },
            { label: 'New Project', icon: <Plus size={18} />, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100', route: '/projects' },
            { label: 'Fix Library', icon: <BookOpen size={18} />, color: 'text-green-600 bg-green-50 dark:bg-green-950 hover:bg-green-100', route: '/fixes' },
            { label: 'Analytics', icon: <TrendingUp size={18} />, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950 hover:bg-orange-100', route: '/analytics' },
          ].map((a, i) => (
            <button key={i} onClick={() => navigate(a.route)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition font-medium text-sm ${a.color}`}>
              {a.icon}{a.label}
            </button>
          ))}
        </div>

      </div>
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </DashboardLayout>
  );
};

export default DashboardPage;