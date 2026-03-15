import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import DevTraceChatbot from '../shared/DevTraceChatbot';
import { useSyncOnReconnect } from '../../hooks/useSyncOnReconnect';
import { useSyncQueue } from '../../store/useSyncQueue';

interface Props {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: Props) => {
  const { user } = useAuthStore();
  const { loadTheme } = useThemeStore();
  const { loadFromDB } = useSyncQueue();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useSyncOnReconnect();

  useEffect(() => {
    if (!user) return;
    loadTheme(user.id);
    loadFromDB(user.id);
  }, [user]);

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 flex">

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content — takes all remaining width */}
      <div className="flex flex-col flex-1 lg:ml-60 min-w-0 min-h-screen">
        <div className="sticky top-0 z-30">
          <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        </div>
        <main className="flex-1 p-4 sm:p-6 w-full">
          {children}
        </main>
      </div>

      <DevTraceChatbot />
    </div>
  );
};

export default DashboardLayout;