// SessionsPage.tsx — list all sessions with export all button

import { useState } from 'react';
import { Plus, Bug, Search, Download } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import SessionRow from '../components/sessions/SessionRow';
import CreateSessionModal from '../components/sessions/CreateSessionModal';
import useSessions from '../hooks/useSessions';
import type { Status } from '../hooks/useSessions';
import { exportAllSessionsAsMarkdown } from '../hooks/exportUtils';
import toast from 'react-hot-toast';

const FILTERS: { label: string; value: Status | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
];

const SessionsPage = () => {
  const { sessions, loading, createSession } = useSessions();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Status | 'all'>('all');

  const filtered = sessions.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.error_message?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || s.status === filter;
    return matchesSearch && matchesFilter;
  });

  const counts = {
    all: sessions.length,
    open: sessions.filter((s) => s.status === 'open').length,
    in_progress: sessions.filter((s) => s.status === 'in_progress').length,
    resolved: sessions.filter((s) => s.status === 'resolved').length,
  };

  const handleExportAll = () => {
    if (sessions.length === 0) { toast.error('No sessions to export'); return; }
    exportAllSessionsAsMarkdown(sessions);
    toast.success(`Exported ${sessions.length} sessions!`);
  };

  return (
    <DashboardLayout title="Debug Sessions">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAll}
              className="flex items-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-600 font-medium px-4 py-2.5 rounded-xl text-sm transition"
            >
              <Download size={15} /> Export All
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition"
            >
              <Plus size={16} /> New Session
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                filter === f.value ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'
              }`}>
                {counts[f.value]}
              </span>
            </button>
          ))}
        </div>

        {/* Sessions list */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
                <div className="h-6 bg-gray-100 rounded w-20" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <Bug size={28} className="text-blue-400" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">
              {search || filter !== 'all' ? 'No sessions found' : 'No sessions yet'}
            </h3>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              {search || filter !== 'all'
                ? 'Try adjusting your search or filter'
                : 'Log your first debug session to start tracking errors'
              }
            </p>
            {!search && filter === 'all' && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition"
              >
                <Plus size={15} /> Log First Session
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-400 font-medium">
                {filtered.length} session{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="divide-y divide-gray-50 p-2">
              {filtered.map((session) => (
                <SessionRow key={session.id} session={session} />
              ))}
            </div>
          </div>
        )}

      </div>

      {showModal && (
        <CreateSessionModal
          onClose={() => setShowModal(false)}
          onCreate={createSession}
        />
      )}
    </DashboardLayout>
  );
};

export default SessionsPage;