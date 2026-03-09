// ProjectCard — single project card in the grid

import { useNavigate } from 'react-router-dom';
import { Bug, Clock, Github, ExternalLink } from 'lucide-react';
import type { Project } from '../../hooks/useProjects';

interface Props {
  project: Project;
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
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  react: 'React',
  nextjs: 'Next.js',
  nodejs: 'Node.js',
  express: 'Express',
  python: 'Python',
  other: 'Other',
};

const ProjectCard = ({ project }: Props) => {
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
      onClick={() => navigate(`/projects/${project.id}`)}
      className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-md transition cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-gray-400 text-xs mt-0.5 truncate">{project.description}</p>
          )}
        </div>

        {project.github_url && (
          <a
            href={project.github_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="ml-2 w-7 h-7 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition flex-shrink-0"
          >
            <Github size={14} />
          </a>
        )}
      </div>

      {project.language && (
        <div className="mb-4">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${LANGUAGE_COLORS[project.language] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {LANGUAGE_LABELS[project.language] ?? project.language}
          </span>
        </div>
      )}

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Bug size={13} className="text-red-400" />
          <span>{project.error_count} errors</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <ExternalLink size={13} className="text-blue-400" />
          <span>{project.session_count} sessions</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
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