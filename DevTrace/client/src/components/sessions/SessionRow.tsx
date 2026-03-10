// SessionRow — single session row in the list

import { useNavigate } from 'react-router-dom';
import { Clock, FolderOpen, ChevronRight } from 'lucide-react';
import type { DebugSession } from '../../hooks/useSessions';
import { StatusBadge, SeverityBadge } from './StatusBadge';

interface Props {
  session: DebugSession;
}

const SessionRow = ({ session }: Props) => {
  const navigate = useNavigate();

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return 'Just now';
  };

  return (
    <div
      onClick={() => navigate(`/sessions/${session.id}`)}
      className="flex items-center gap-4 p-4 hover:bg-gray-50 transition cursor-pointer group rounded-xl"
    >
      {/* Status dot */}
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
        session.status === 'open' ? 'bg-red-500' :
        session.status === 'in_progress' ? 'bg-yellow-500' : 'bg-green-500'
      }`} />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-indigo-600 transition">
            {session.title}
          </p>
          <SeverityBadge severity={session.severity} />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {session.error_message && (
            <p className="text-xs text-gray-400 font-mono truncate max-w-xs">
              {session.error_message}
            </p>
          )}
          {session.project && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <FolderOpen size={11} />
              {session.project.name}
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={11} />
            {timeAgo(session.created_at)}
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <StatusBadge status={session.status} />
        {session.ai_fix && (
          <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-1 rounded-lg font-medium">
            AI Fix
          </span>
        )}
        <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-400 transition" />
      </div>
    </div>
  );
};

export default SessionRow;