// DashboardLayout — wraps all dashboard pages with sidebar + topbar

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface Props {
  children: ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: Props) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Fixed sidebar */}
      <Sidebar />

      {/* Main content — offset by sidebar width */}
      <div className="flex-1 ml-60">

        {/* Fixed topbar */}
        <Topbar title={title} />

        {/* Page content — offset by topbar height */}
        <main className="pt-16 min-h-screen">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;