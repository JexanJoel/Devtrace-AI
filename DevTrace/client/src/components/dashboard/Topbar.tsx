// Topbar.tsx — no fixed positioning, reads avatar from profiles

import { useEffect, useState } from 'react';
import { Bell, Menu, Moon, Sun, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { supabase } from '../../lib/supabaseClient';

interface Props {
  title: string;
  onMenuClick: () => void;
}

const Topbar = ({ title, onMenuClick }: Props) => {
  const { user } = useAuthStore();
  const { isDark, toggleDark } = useThemeStore();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('avatar_url, name')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
        setDisplayName(data?.name ?? user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User');
      });
  }, [user]);

  const email = user?.email ?? '';
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <header className="h-16 w-full bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 sm:px-6 gap-3">

      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden w-9 h-9 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 transition flex-shrink-0"
      >
        <Menu size={20} />
      </button>

      {/* Title */}
      <h1 className="font-bold text-gray-900 dark:text-white text-base flex-1 truncate">{title}</h1>

      {/* Search */}
      <div className="hidden sm:flex relative flex-shrink-0">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-300 transition placeholder-gray-400 w-44"
        />
      </div>

      {/* Dark mode */}
      <button
        onClick={() => user && toggleDark(user.id)}
        className="flex-shrink-0 w-9 h-9 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 transition"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Bell */}
      <button className="flex-shrink-0 relative w-9 h-9 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 transition">
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
      </button>

      {/* Avatar + name */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            className="w-8 h-8 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700"
            alt={displayName}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
        )}
        <div className="hidden md:block">
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none max-w-[120px] truncate">{displayName}</p>
          <p className="text-xs text-gray-400 leading-none mt-0.5 max-w-[120px] truncate">{email}</p>
        </div>
      </div>

    </header>
  );
};

export default Topbar;