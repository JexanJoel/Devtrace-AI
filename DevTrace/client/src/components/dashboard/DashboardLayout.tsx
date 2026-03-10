// DashboardLayout.tsx — fixed topbar positioning

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

interface Props {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: Props) => {
  const { user } = useAuthStore();
  const { loadTheme } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) loadTheme(user.id);
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed, always w-60 */}
      <div className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Right side — offset by sidebar width on lg */}
      <div className="flex flex-col flex-1 lg:ml-60 min-w-0">

        {/* Topbar — sticky at top of this column, NOT fixed */}
        <div className="sticky top-0 z-30">
          <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;