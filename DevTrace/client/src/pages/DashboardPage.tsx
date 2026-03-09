// DashboardPage — main overview with stat cards + recent activity

import { useNavigate } from 'react-router-dom';
import {
  FolderOpen, Bug, CheckCircle,
  Wifi, Plus, ArrowRight, Clock
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import { useAuthStore } from '../store/authStore';
import useProfile from '../hooks/useProfile';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { profile } = useProfile();

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = profile?.name || user?.email?.split('@')[0] || 'Developer';

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">

        {/* Greeting banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h2 className="text-white text-xl font-bold">
              {getGreeting()}, {displayName}! 👋
            </h2>
            <p className="text-indigo-100 text-sm mt-1">
              Ready to squash some bugs today?
            </p>
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 bg-white text-indigo-600 font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-indigo-50 transition"
          >
            <Plus size={16} />
            New Project
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Projects"
            value={0}
            icon={<FolderOpen size={18} />}
            color="indigo"
            subtitle="No projects yet"
          />
          <StatCard
            title="Debug Sessions"
            value={0}
            icon={<Bug size={18} />}
            color="blue"
            subtitle="Start debugging"
          />
          <StatCard
            title="Resolved Errors"
            value={0}
            icon={<CheckCircle size={18} />}
            color="green"
            subtitle="Errors fixed"
          />
          <StatCard
            title="Sync Status"
            value="Synced"
            icon={<Wifi size={18} />}
            color="orange"
            subtitle="All data up to date"
          />
        </div>

        {/* Recent Projects + Recent Sessions side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Projects */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">Recent Projects</h3>
              <button
                onClick={() => navigate('/projects')}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </button>
            </div>

            {/* Empty state */}
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-3">
                <FolderOpen size={22} className="text-indigo-400" />
              </div>
              <p className="text-gray-700 font-medium text-sm">No projects yet</p>
              <p className="text-gray-400 text-xs mt-1 mb-4">
                Create your first project to start debugging
              </p>
              <button
                onClick={() => navigate('/projects')}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-4 py-2 rounded-xl transition"
              >
                <Plus size={13} />
                Create Project
              </button>
            </div>
          </div>

          {/* Recent Debug Sessions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">Recent Sessions</h3>
              <button
                onClick={() => navigate('/sessions')}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </button>
            </div>

            {/* Empty state */}
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
                <Clock size={22} className="text-blue-400" />
              </div>
              <p className="text-gray-700 font-medium text-sm">No sessions yet</p>
              <p className="text-gray-400 text-xs mt-1 mb-4">
                Log your first debug session to get started
              </p>
              <button
                onClick={() => navigate('/sessions')}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-xl transition"
              >
                <Plus size={13} />
                New Session
              </button>
            </div>
          </div>
        </div>

        {/* Quick actions row */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'New Project', icon: <FolderOpen size={18} />, color: 'text-indigo-600 bg-indigo-50', to: '/projects' },
              { label: 'Log Error', icon: <Bug size={18} />, color: 'text-blue-600 bg-blue-50', to: '/sessions' },
              { label: 'Fix Library', icon: <CheckCircle size={18} />, color: 'text-green-600 bg-green-50', to: '/library' },
              { label: 'Edit Profile', icon: <ArrowRight size={18} />, color: 'text-orange-600 bg-orange-50', to: '/profile' },
            ].map((a, i) => (
              <button
                key={i}
                onClick={() => navigate(a.to)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-gray-50 transition"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${a.color}`}>
                  {a.icon}
                </div>
                <span className="text-xs font-medium text-gray-700">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;