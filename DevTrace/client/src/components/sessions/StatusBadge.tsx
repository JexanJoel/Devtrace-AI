// StatusBadge — colored badge for session status and severity

import type { Status, Severity } from '../../hooks/useSessions';

interface StatusProps { status: Status; }
interface SeverityProps { severity: Severity; }

export const StatusBadge = ({ status }: StatusProps) => {
  const map: Record<Status, string> = {
    open: 'bg-red-50 text-red-600 border-red-200',
    in_progress: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    resolved: 'bg-green-50 text-green-600 border-green-200',
  };
  const labels: Record<Status, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${map[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'open' ? 'bg-red-500' :
        status === 'in_progress' ? 'bg-yellow-500' : 'bg-green-500'
      }`} />
      {labels[status]}
    </span>
  );
};

export const SeverityBadge = ({ severity }: SeverityProps) => {
  const map: Record<Severity, string> = {
    low: 'bg-gray-50 text-gray-600 border-gray-200',
    medium: 'bg-blue-50 text-blue-600 border-blue-200',
    high: 'bg-orange-50 text-orange-600 border-orange-200',
    critical: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border capitalize ${map[severity]}`}>
      {severity}
    </span>
  );
};