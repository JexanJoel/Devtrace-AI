import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, BarChart2, Activity, Shield,
  Zap, Clock, CheckCircle, TrendingUp, AlertTriangle
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import useSessions from '../hooks/useSessions';

const CATEGORY_META: Record<string, { label: string; color: string; bar: string; bg: string }> = {
  react_state:   { label: 'React State',   color: 'text-cyan-600',    bar: 'bg-cyan-500',    bg: 'bg-cyan-50 dark:bg-cyan-950' },
  typescript:    { label: 'TypeScript',    color: 'text-blue-600',    bar: 'bg-blue-500',    bg: 'bg-blue-50 dark:bg-blue-950' },
  supabase_auth: { label: 'Supabase Auth', color: 'text-green-600',   bar: 'bg-green-500',   bg: 'bg-green-50 dark:bg-green-950' },
  supabase_db:   { label: 'Supabase DB',   color: 'text-emerald-600', bar: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950' },
  supabase_rls:  { label: 'Supabase RLS',  color: 'text-teal-600',    bar: 'bg-teal-500',    bg: 'bg-teal-50 dark:bg-teal-950' },
  powersync:     { label: 'PowerSync',     color: 'text-violet-600',  bar: 'bg-violet-500',  bg: 'bg-violet-50 dark:bg-violet-950' },
  groq_api:      { label: 'Groq API',      color: 'text-orange-600',  bar: 'bg-orange-500',  bg: 'bg-orange-50 dark:bg-orange-950' },
  env_config:    { label: 'Env / Config',  color: 'text-yellow-600',  bar: 'bg-yellow-400',  bg: 'bg-yellow-50 dark:bg-yellow-950' },
  network:       { label: 'Network',       color: 'text-red-600',     bar: 'bg-red-500',     bg: 'bg-red-50 dark:bg-red-950' },
  deployment:    { label: 'Deployment',    color: 'text-pink-600',    bar: 'bg-pink-500',    bg: 'bg-pink-50 dark:bg-pink-950' },
  unknown:       { label: 'Unknown',       color: 'text-gray-500',    bar: 'bg-gray-400',    bg: 'bg-gray-50 dark:bg-gray-800' },
};

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

const AIInsightsPage = () => {
  const navigate = useNavigate();
  const { sessions } = useSessions();

  // ── All computations from PowerSync local SQLite ──
  const analyzedSessions = sessions.filter(s => s.ai_analysis != null);
  const totalAnalyses = analyzedSessions.length;

  const avgConfidence = totalAnalyses > 0
    ? Math.round(analyzedSessions.reduce((sum, s) => sum + (s.ai_analysis?.confidence ?? 0), 0) / totalAnalyses)
    : 0;

  const aiResolvedCount = analyzedSessions.filter(s => s.status === 'resolved').length;
  const aiResolutionRate = totalAnalyses > 0 ? Math.round((aiResolvedCount / totalAnalyses) * 100) : 0;

  const openCount     = analyzedSessions.filter(s => s.status === 'open').length;
  const inProgressCount = analyzedSessions.filter(s => s.status === 'in_progress').length;

  // Category counts
  const categoryCounts: Record<string, number> = {};
  analyzedSessions.forEach(s => {
    const cat = s.ai_analysis?.category ?? 'unknown';
    categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
  });
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0]?.[0] ?? null;
  const maxCategoryCount = sortedCategories[0]?.[1] ?? 1;

  // Confidence distribution
  const highConf = analyzedSessions.filter(s => (s.ai_analysis?.confidence ?? 0) >= 80).length;
  const medConf  = analyzedSessions.filter(s => { const c = s.ai_analysis?.confidence ?? 0; return c >= 60 && c < 80; }).length;
  const lowConf  = analyzedSessions.filter(s => (s.ai_analysis?.confidence ?? 0) < 60).length;

  // Top flagged files
  const fileCounts: Record<string, number> = {};
  analyzedSessions.forEach(s => {
    (s.ai_analysis?.files_to_check ?? []).forEach((f: string) => {
      fileCounts[f] = (fileCounts[f] ?? 0) + 1;
    });
  });
  const topFiles = Object.entries(fileCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Most common fixes by type
  const fixTypeCounts = { quick_patch: 0, proper_fix: 0, workaround: 0 };
  analyzedSessions.forEach(s => {
    const best = s.ai_analysis?.fixes?.[s.ai_analysis?.best_fix_index ?? 0];
    if (best?.type && best.type in fixTypeCounts) {
      fixTypeCounts[best.type as keyof typeof fixTypeCounts]++;
    }
  });

  // Severity of analyzed sessions
  const severityCounts: Record<string, number> = {};
  analyzedSessions.forEach(s => {
    severityCounts[s.severity] = (severityCounts[s.severity] ?? 0) + 1;
  });

  // Recent analyses
  const recentAnalyses = [...analyzedSessions]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 8);

  if (totalAnalyses === 0) return (
    <DashboardLayout title="AI Insights">
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950 rounded-2xl flex items-center justify-center mb-4">
          <Sparkles size={28} className="text-indigo-400" />
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">No AI analyses yet</h3>
        <p className="text-gray-400 text-sm max-w-xs mb-6">
          Open a debug session and click "Analyze Bug" to start seeing AI insights here
        </p>
        <button onClick={() => navigate('/sessions')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition">
          Go to Sessions <ArrowRight size={14} />
        </button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="AI Insights">
      <div className="space-y-6">

        {/* Header */}
        <div className="rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4"
          style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-indigo-200" />
              <p className="text-indigo-200 text-sm font-medium">AI Observability</p>
            </div>
            <h2 className="text-2xl font-bold text-white">AI Insights</h2>
            <p className="text-indigo-200 text-sm mt-1">
              {totalAnalyses} analyses · powered by Groq Llama 3.3 70B · data from local SQLite
            </p>
          </div>
          <button onClick={() => navigate('/sessions')}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/20 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition">
            Analyze a Bug <ArrowRight size={14} />
          </button>
        </div>

        {/* Top stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Analyses Run',
              value: totalAnalyses,
              sub: `of ${sessions.length} total sessions`,
              icon: <Sparkles size={20} />,
              color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950',
            },
            {
              label: 'Avg Confidence',
              value: `${avgConfidence}%`,
              sub: avgConfidence >= 80 ? '🟢 High accuracy' : avgConfidence >= 60 ? '🟡 Medium' : '🔴 Low',
              icon: <Zap size={20} />,
              color: avgConfidence >= 80 ? 'text-green-600' : avgConfidence >= 60 ? 'text-yellow-600' : 'text-red-500',
              bg: avgConfidence >= 80 ? 'bg-green-50 dark:bg-green-950' : avgConfidence >= 60 ? 'bg-yellow-50 dark:bg-yellow-950' : 'bg-red-50 dark:bg-red-950',
            },
            {
              label: 'AI Resolution Rate',
              value: `${aiResolutionRate}%`,
              sub: `${aiResolvedCount} of ${totalAnalyses} resolved`,
              icon: <CheckCircle size={20} />,
              color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950',
            },
            {
              label: 'Top Category',
              value: topCategory ? (CATEGORY_META[topCategory]?.label ?? topCategory) : '—',
              sub: topCategory ? `${categoryCounts[topCategory]} sessions` : 'No data',
              icon: <BarChart2 size={20} />,
              color: topCategory ? (CATEGORY_META[topCategory]?.color ?? 'text-gray-600') : 'text-gray-400',
              bg: topCategory ? (CATEGORY_META[topCategory]?.bg ?? 'bg-gray-50') : 'bg-gray-50 dark:bg-gray-800',
            },
          ].map((c, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center ${c.color} mb-3`}>{c.icon}</div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{c.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{c.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Middle row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Category breakdown — full */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <BarChart2 size={16} className="text-violet-500" /> Error Category Breakdown
            </h3>
            <p className="text-xs text-gray-400 mb-5">How your bugs are classified by the AI across all sessions</p>
            <div className="space-y-4">
              {sortedCategories.map(([cat, count]) => {
                const meta = CATEGORY_META[cat] ?? CATEGORY_META.unknown;
                const pct = Math.round((count / maxCategoryCount) * 100);
                const totalPct = Math.round((count / totalAnalyses) * 100);
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${meta.bar}`} />
                        <span className={`text-sm font-medium ${meta.color}`}>{meta.label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{totalPct}% of analyses</span>
                        <span className="font-bold text-gray-700 dark:text-gray-300">{count} session{count !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${meta.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confidence + Fix type + Status */}
          <div className="space-y-4">

            {/* Confidence distribution */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                <Activity size={14} className="text-blue-500" /> Confidence Distribution
              </h4>
              <div className="space-y-3">
                {[
                  { label: 'High (80–100%)', count: highConf, color: 'bg-green-500', text: 'text-green-600' },
                  { label: 'Medium (60–79%)', count: medConf,  color: 'bg-yellow-400', text: 'text-yellow-600' },
                  { label: 'Low (< 60%)',    count: lowConf,  color: 'bg-red-400',    text: 'text-red-500' },
                ].map((band, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className={`text-xs font-medium ${band.text}`}>{band.label}</span>
                      <span className="text-xs text-gray-500 font-semibold">{band.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${band.color}`}
                        style={{ width: `${totalAnalyses > 0 ? (band.count / totalAnalyses) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fix type preference */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                <Zap size={14} className="text-yellow-500" /> Best Fix Types
              </h4>
              <div className="space-y-2">
                {[
                  { key: 'proper_fix',  label: 'Proper Fix',  color: 'bg-green-500',  text: 'text-green-600' },
                  { key: 'quick_patch', label: 'Quick Patch', color: 'bg-yellow-400', text: 'text-yellow-600' },
                  { key: 'workaround',  label: 'Workaround',  color: 'bg-purple-400', text: 'text-purple-600' },
                ].map((t) => {
                  const count = fixTypeCounts[t.key as keyof typeof fixTypeCounts];
                  const pct = totalAnalyses > 0 ? Math.round((count / totalAnalyses) * 100) : 0;
                  return (
                    <div key={t.key}>
                      <div className="flex justify-between mb-1">
                        <span className={`text-xs font-medium ${t.text}`}>{t.label}</span>
                        <span className="text-xs text-gray-400">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${t.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Top flagged files */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <Shield size={16} className="text-orange-500" /> Most Flagged Files
            </h3>
            <p className="text-xs text-gray-400 mb-4">Files most frequently flagged across all AI analyses</p>
            {topFiles.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No file data yet</p>
            ) : (
              <div className="space-y-2">
                {topFiles.map(([file, count], i) => (
                  <div key={file} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                      i === 0 ? 'bg-orange-100 text-orange-600' :
                      i === 1 ? 'bg-gray-200 text-gray-600' :
                      i === 2 ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>{i + 1}</span>
                    <span className="text-xs font-mono text-gray-700 dark:text-gray-300 flex-1 truncate">{file}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <AlertTriangle size={10} className="text-orange-400" />
                      <span className="text-xs text-gray-400 font-semibold">{count}x</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent analyses list */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-500" /> Recent Analyses
              </h3>
              <button onClick={() => navigate('/sessions')} className="text-xs text-indigo-500 font-medium flex items-center gap-1">
                View all <ArrowRight size={11} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">Last analyzed sessions with category and confidence</p>
            <div className="space-y-2">
              {recentAnalyses.map(s => {
                const cat = s.ai_analysis?.category ?? 'unknown';
                const meta = CATEGORY_META[cat] ?? CATEGORY_META.unknown;
                const conf = s.ai_analysis?.confidence ?? 0;
                return (
                  <div key={s.id} onClick={() => navigate(`/sessions/${s.id}`)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition group border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      conf >= 80 ? 'bg-green-500' : conf >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-indigo-600 transition">{s.title}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={9} /> {timeAgo(s.updated_at)}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${meta.bg} ${meta.color}`}>
                      {meta.label}
                    </span>
                    <span className="text-xs font-bold text-gray-500 flex-shrink-0 w-9 text-right">{conf}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Severity of analyzed sessions */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" /> Severity of AI-Analyzed Sessions
          </h3>
          <p className="text-xs text-gray-400 mb-5">Breakdown of how severe the bugs were that went through AI analysis</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { key: 'critical', label: 'Critical', color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-950',      border: 'border-red-100 dark:border-red-900' },
              { key: 'high',     label: 'High',     color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950',border: 'border-orange-100 dark:border-orange-900' },
              { key: 'medium',   label: 'Medium',   color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950',border: 'border-yellow-100 dark:border-yellow-900' },
              { key: 'low',      label: 'Low',      color: 'text-gray-500',   bg: 'bg-gray-50 dark:bg-gray-800',    border: 'border-gray-100 dark:border-gray-700' },
            ].map(s => (
              <div key={s.key} className={`rounded-2xl border-2 ${s.border} ${s.bg} p-4 text-center`}>
                <p className={`text-3xl font-bold ${s.color}`}>{severityCounts[s.key] ?? 0}</p>
                <p className={`text-sm font-medium mt-1 ${s.color}`}>{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {totalAnalyses > 0 ? Math.round(((severityCounts[s.key] ?? 0) / totalAnalyses) * 100) : 0}%
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AIInsightsPage;