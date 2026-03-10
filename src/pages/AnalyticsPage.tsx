import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { TrendingUp, Bug, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import useSessions from '../hooks/useSessions';

const STATUS_COLORS = { open: '#ef4444', in_progress: '#f59e0b', resolved: '#22c55e' };
const SEVERITY_COLORS = { low: '#94a3b8', medium: '#3b82f6', high: '#f97316', critical: '#ef4444' };

const AnalyticsPage = () => {
  const { sessions, loading } = useSessions();
  const navigate = useNavigate();

  const sessionsOverTime = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days[key] = 0;
    }
    sessions.forEach((s) => {
      const key = new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (key in days) days[key]++;
    });
    return Object.entries(days).map(([date, count]) => ({ date, count }));
  }, [sessions]);

  const statusData = useMemo(() => {
    const counts = { open: 0, in_progress: 0, resolved: 0 };
    sessions.forEach((s) => { counts[s.status]++; });
    return [
      { name: 'Open', value: counts.open, color: STATUS_COLORS.open },
      { name: 'In Progress', value: counts.in_progress, color: STATUS_COLORS.in_progress },
      { name: 'Resolved', value: counts.resolved, color: STATUS_COLORS.resolved },
    ].filter((d) => d.value > 0);
  }, [sessions]);

  const severityData = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0, critical: 0 };
    sessions.forEach((s) => { counts[s.severity]++; });
    return [
      { name: 'Low', count: counts.low, fill: SEVERITY_COLORS.low },
      { name: 'Medium', count: counts.medium, fill: SEVERITY_COLORS.medium },
      { name: 'High', count: counts.high, fill: SEVERITY_COLORS.high },
      { name: 'Critical', count: counts.critical, fill: SEVERITY_COLORS.critical },
    ];
  }, [sessions]);

  const topErrors = useMemo(() => {
    const patterns: Record<string, number> = {};
    sessions.forEach((s) => {
      if (!s.error_message) return;
      const key = s.error_message.split(':')[0].trim().slice(0, 50);
      patterns[key] = (patterns[key] ?? 0) + 1;
    });
    return Object.entries(patterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pattern, count]) => ({ pattern, count }));
  }, [sessions]);

  const resolvedPct = sessions.length > 0
    ? Math.round((sessions.filter(s => s.status === 'resolved').length / sessions.length) * 100)
    : 0;

  const withFixes = sessions.filter(s => s.ai_fix).length;

  if (loading) {
    return (
      <DashboardLayout title="Analytics">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-indigo-500" size={28} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Analytics">
      <div className="space-y-6">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Sessions', value: sessions.length, icon: <Bug size={18} />, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Resolved', value: `${resolvedPct}%`, icon: <CheckCircle size={18} />, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'AI Fixes Used', value: withFixes, icon: <TrendingUp size={18} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Open Issues', value: sessions.filter(s => s.status === 'open').length, icon: <AlertCircle size={18} />, color: 'text-red-600', bg: 'bg-red-50' },
          ].map((c, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <div className={`w-9 h-9 ${c.bg} rounded-xl flex items-center justify-center ${c.color} mb-3`}>{c.icon}</div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{c.value}</p>
              <p className="text-sm text-gray-400 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <Bug size={32} className="text-gray-300 mb-3" />
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">No data yet</h3>
            <p className="text-gray-400 text-sm mb-5">Log some debug sessions to see analytics</p>
            <button onClick={() => navigate('/sessions')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition">
              Go to Sessions
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Sessions Over Time</h3>
              <p className="text-xs text-gray-400 mb-5">Last 14 days</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={sessionsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval={2} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: 12 }} labelStyle={{ fontWeight: 600 }} />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} name="Sessions" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Status Breakdown</h3>
                <p className="text-xs text-gray-400 mb-4">Distribution of session statuses</p>
                {statusData.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-10">No data</p>
                ) : (
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width="50%" height={180}>
                      <PieChart>
                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                          {statusData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {statusData.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                          <span className="text-gray-600 dark:text-gray-400">{d.name}</span>
                          <span className="font-bold text-gray-900 dark:text-white ml-auto pl-4">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Severity Breakdown</h3>
                <p className="text-xs text-gray-400 mb-4">Sessions by severity level</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={severityData} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: 12 }} />
                    <Bar dataKey="count" name="Sessions" radius={[6, 6, 0, 0]}>
                      {severityData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {topErrors.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Top Error Patterns</h3>
                <p className="text-xs text-gray-400 mb-5">Most frequent error types</p>
                <div className="space-y-3">
                  {topErrors.map((e, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-xs font-bold text-gray-400 w-5 text-right">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-mono text-gray-700 dark:text-gray-300 truncate">{e.pattern}</p>
                          <span className="text-xs font-bold text-gray-500 ml-3 flex-shrink-0">{e.count}x</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-400 rounded-full transition-all"
                            style={{ width: `${(e.count / topErrors[0].count) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;