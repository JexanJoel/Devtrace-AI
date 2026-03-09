// DashboardPage — placeholder after login (Phase 2 will replace this)

import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { LogOut, Terminal, Zap } from 'lucide-react';

const DashboardPage = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Topbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Terminal size={16} className="text-white" />
          </div>
          <span className="font-semibold text-gray-900 font-display">DevTrace AI</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition font-medium"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-8 pt-20 text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Zap size={28} className="text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 font-display mb-2">
          You're in! 🎉
        </h1>
        <p className="text-gray-500 mb-8">
          Logged in as <span className="text-indigo-600 font-medium">{user?.email}</span>
        </p>

        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <p className="text-gray-400 text-sm">
            🏗️ Full dashboard coming in <span className="text-gray-700 font-medium">Phase 2</span> —
            projects, debug sessions, AI analyzer and more.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;