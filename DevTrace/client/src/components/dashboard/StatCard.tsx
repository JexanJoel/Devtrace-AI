// StatCard — reusable stat display card for dashboard overview

import { ReactNode } from 'react';

interface Props {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: 'indigo' | 'green' | 'blue' | 'orange';
  subtitle?: string;
}

// Color map for different card types
const colorMap = {
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'bg-indigo-100 text-indigo-600',
    value: 'text-indigo-600',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-600',
    value: 'text-green-600',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    value: 'text-blue-600',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'bg-orange-100 text-orange-600',
    value: 'text-orange-600',
  },
};

const StatCard = ({ title, value, icon, color, subtitle }: Props) => {
  const colors = colorMap[color];

  return (
    <div className={`${colors.bg} rounded-2xl p-5 border border-white`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${colors.value}`}>{value}</p>
          {subtitle && (
            <p className="text-gray-400 text-xs mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${colors.icon} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;