// GitHubStatsCard.tsx — shows live GitHub repo stats on project detail

import { useEffect } from 'react';
import { Star, GitFork, AlertCircle, Clock, ExternalLink, Loader2, Github } from 'lucide-react';
import useGitHubStats from '../../hooks/useGitHubStats';

interface Props {
  githubUrl: string;
}

const GitHubStatsCard = ({ githubUrl }: Props) => {
  const { stats, loading, error, fetchStats } = useGitHubStats();

  useEffect(() => {
    if (githubUrl) fetchStats(githubUrl);
  }, [githubUrl]);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    if (days > 30) return `${Math.floor(days / 30)}mo ago`;
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-3">
        <Loader2 size={16} className="animate-spin text-gray-400" />
        <span className="text-sm text-gray-400">Fetching GitHub stats...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl border border-red-100 p-5 flex items-center gap-3">
        <AlertCircle size={16} className="text-red-400" />
        <span className="text-sm text-red-500">{error}</span>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <img src={stats.owner_avatar} className="w-6 h-6 rounded-full" alt="" />
          <div className="flex items-center gap-1.5">
            <Github size={15} className="text-gray-500" />
            <span className="font-bold text-gray-900 text-sm">{stats.name}</span>
          </div>
          {stats.language && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">
              {stats.language}
            </span>
          )}
        </div>
        <a
          href={stats.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium transition"
        >
          Open <ExternalLink size={11} />
        </a>
      </div>

      {stats.description && (
        <p className="text-xs text-gray-400 mb-4 leading-relaxed">{stats.description}</p>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-yellow-50 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1">
            <Star size={13} />
          </div>
          <p className="font-bold text-gray-900 text-lg">{stats.stars.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Stars</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
            <GitFork size={13} />
          </div>
          <p className="font-bold text-gray-900 text-lg">{stats.forks.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Forks</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
            <AlertCircle size={13} />
          </div>
          <p className="font-bold text-gray-900 text-lg">{stats.open_issues}</p>
          <p className="text-xs text-gray-400">Issues</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
        <Clock size={11} />
        Last push {timeAgo(stats.last_push)}
      </div>
    </div>
  );
};

export default GitHubStatsCard;