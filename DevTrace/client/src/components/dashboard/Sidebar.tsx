// Sidebar.tsx — dashboard navigation

import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, Bug,
  BookOpen, User, Settings, Terminal, LogOut
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/projects', icon: <FolderOpen size={18} />, label: 'Projects' },
  { to: '/sessions', icon: <Bug size={18} />, label: 'Debug Sessions' },
  { to: '/fixes', icon: <BookOpen size={18} />, label: 'Fix Library' },
];

const BOTTOM_NAV = [
  { to: '/profile', icon: <User size={18} />, label: 'Profile' },
  { to: '/settings', icon: <Settings size={18} />, label: 'Settings' },
];

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out');
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
      isActive
        ? 'bg-indigo-50 text-indigo-600'
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    }`;

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-100 flex flex-col z-30">

      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Terminal size={15} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">DevTrace AI</p>
            <p className="text-xs text-gray-400">Debug smarter</p>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass}>
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        {BOTTOM_NAV.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass}>
            {item.icon}
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;