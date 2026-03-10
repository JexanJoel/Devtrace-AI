// Sidebar.tsx — dark mode + mobile close button

import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, Bug, BookOpen,
  User, Settings, Terminal, LogOut, BarChart2, X
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useThemeStore } from '../../store/themeStore';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/projects', icon: <FolderOpen size={18} />, label: 'Projects' },
  { to: '/sessions', icon: <Bug size={18} />, label: 'Debug Sessions' },
  { to: '/fixes', icon: <BookOpen size={18} />, label: 'Fix Library' },
  { to: '/analytics', icon: <BarChart2 size={18} />, label: 'Analytics' },
];

const BOTTOM_NAV = [
  { to: '/profile', icon: <User size={18} />, label: 'Profile' },
  { to: '/settings', icon: <Settings size={18} />, label: 'Settings' },
];

interface Props {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: Props) => {
  const navigate = useNavigate();
  const { isDark } = useThemeStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out');
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
      isActive
        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
    }`;

  return (
    <aside className="w-60 h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col">

      {/* Logo + mobile close */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Terminal size={15} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm">DevTrace AI</p>
            <p className="text-xs text-gray-400">Debug smarter</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass} onClick={onClose}>
            {item.icon} {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
        {BOTTOM_NAV.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass} onClick={onClose}>
            {item.icon} {item.label}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400 transition"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;