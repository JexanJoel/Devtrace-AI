import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  bg?: string;
  onClick?: () => void;
}

const StatCard = ({ label, value, icon, color = 'text-indigo-600', bg = 'bg-indigo-50', onClick }: Props) => (
  <button
    onClick={onClick}
    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 text-left hover:border-indigo-200 hover:shadow-sm transition w-full"
  >
    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center ${color} mb-3`}>{icon}</div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    <p className="text-sm text-gray-400 mt-0.5">{label}</p>
  </button>
);

export default StatCard;