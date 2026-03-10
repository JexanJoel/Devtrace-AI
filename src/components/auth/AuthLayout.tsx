import type { ReactNode } from 'react';
import { Terminal } from 'lucide-react';

interface Props { children: ReactNode; }

const AuthLayout = ({ children }: Props) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="w-full max-w-md">
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
          <Terminal size={17} className="text-white" />
        </div>
        <span className="font-bold text-gray-900 text-lg">DevTrace AI</span>
      </div>
      {children}
    </div>
  </div>
);

export default AuthLayout;