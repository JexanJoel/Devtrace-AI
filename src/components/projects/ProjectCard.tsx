import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bug, Clock, Github, ExternalLink } from 'lucide-react';
import type { Project } from '../../hooks/useProjects';
import type { DebugSession } from '../../hooks/useSessions';
import { computeHealthScore } from '../../lib/projectHealth';

interface Props {
  project: Project;
  sessions?: DebugSession[];
}

const LANGUAGE_COLORS: Record<string, string> = {
  javascript: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  typescript: 'bg-blue-100 text-blue-700 border-blue-200',
  react: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  nextjs: 'bg-gray-100 text-gray-700 border-gray-200',
  nodejs: 'bg-green-100 text-green-700 border-green-200',
  express: 'bg-gray-100 text-gray-700 border-gray-200',
  python: 'bg-blue-100 text-blue-700 border-blue-200',
  other: 'bg-purple-100 text-purple-700 border-purple-200',
};

const LANGUAGE_LABELS: Record<string, string> = {
  javascript: 'JavaScript', typescript: 'TypeScript', react: 'React',
  nextjs: 'Next.js', nodejs: 'Node.js', express: 'Express',
  python: 'Python', other: 'Other',
};

const ProjectCard = ({ project, sessions = [] }: Props) => {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);

  const health = computeHealthScore(sessions);

  // Compute live counts from actual session rows — never trust stale cached columns
  const errorCount = sessions.filter(s => s.error_message).length;
  const sessionCount = sessions.length;

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
    <div onClick={() => navigate(`/projects/${project.id}`)}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:border-indigo-200 hover:shadow-md transition cursor-pointer group">

      {/* Top row — name + health badge */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 transition">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-gray-400 text-xs mt-0.5 truncate">{project.description}</p>
          )}
        </div>

        {/* Health score badge with tooltip */}
        <div className="relative flex-shrink-0"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={(e) => e.stopPropagation()}>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold ring-2 ${health.bg} ${health.color} ${health.ring} cursor-help`}>
            <span>{health.score}</span>
            <span className="font-medium opacity-70 hidden sm:inline">{health.label}</span>
          </div>

          {showTooltip && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 p-3"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-900 dark:text-white">Project Health</p>
                <span className={`text-xs font-bold ${health.color}`}>{health.score}/100</span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mb-3 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${health.bar}`} style={{ width: `${health.score}%` }} />
              </div>
              {health.deductions.length === 0 && health.bonus === 0 ? (
                <p className="text-xs text-green-600 font-medium">✓ No issues found</p>
              ) : (
                <div className="space-y-1">
                  {health.deductions.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 truncate flex-1">{d.reason}</span>
                      <span className="text-red-500 font-semibold ml-2 flex-shrink-0">−{d.points}</span>
                    </div>
                  ))}
                  {health.bonus > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">High resolution rate</span>
                      <span className="text-green-500 font-semibold">+{health.bonus}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Language + GitHub */}
      <div className="flex items-center gap-2 mb-4">
        {project.language && (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${LANGUAGE_COLORS[project.language] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {LANGUAGE_LABELS[project.language] ?? project.language}
          </span>
        )}
        {project.github_url && (
          <a href={project.github_url} target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-6 h-6 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition">
            <Github size={12} />
          </a>
        )}
      </div>

      {/* Health bar */}
      <div className="mb-4">
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${health.bar}`}
            style={{ width: `${health.score}%` }} />
        </div>
      </div>

      {/* Stats — live from session rows, not stale cached columns */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Bug size={13} className="text-red-400" />
          <span>{errorCount} errors</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <ExternalLink size={13} className="text-blue-400" />
          <span>{sessionCount} sessions</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Clock size={12} />
          {timeAgo(project.updated_at)}
        </div>
        <span className="text-xs text-indigo-500 font-medium opacity-0 group-hover:opacity-100 transition">
          Open →
        </span>
      </div>
    </div>
  );
};

export default ProjectCard;