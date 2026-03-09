// Topbar — top navigation bar with search, notifications, user avatar

import { useNavigate } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import useProfile from '../../hooks/useProfile';

interface Props {
  title: string;
}

const Topbar = ({ title }: Props) => {
  const { user } = useAuthStore();
  const { profile } = useProfile();
  const navigate = useNavigate();

  // Get initials for avatar fallback
  const getInitials = () => {
    if (profile?.name) {
      return profile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() ?? 'U';
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 fixed top-0 right-0 left-60 z-10">

      {/* Page title */}
      <h1 className="text-lg font-bold text-gray-900">{title}</h1>

      {/* Right side actions */}
      <div className="flex items-center gap-3">

        {/* Search bar */}
        <div className="relative hidden sm:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-gray-50 border border-gray-100 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-600 focus:outline-none focus:border-indigo-300 w-48 transition placeholder-gray-400"
          />
        </div>

        {/* Notifications */}
        <button className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition relative">
          <Bell size={16} />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>

        {/* Avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2.5 hover:opacity-80 transition"
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="avatar"
              className="w-9 h-9 rounded-xl object-cover border border-gray-200"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
              {getInitials()}
            </div>
          )}
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-gray-900 leading-none">
              {profile?.name || 'Developer'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Topbar;