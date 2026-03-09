// AuthLayout — clean bright wrapper for all auth pages

import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Terminal } from 'lucide-react';

interface Props {
  children: ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout = ({ children, title, subtitle }: Props) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Top nav */}
      <nav className="flex items-center justify-between px-8 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Terminal size={16} className="text-white" />
          </div>
          <span className="font-semibold text-gray-900 font-display">DevTrace AI</span>
        </Link>
      </nav>

      {/* Centered card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 font-display">{title}</h1>
            <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;