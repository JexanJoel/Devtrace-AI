// useGitHubStats.ts — fetch public GitHub repo stats, no API key needed

import { useState } from 'react';

export interface GitHubStats {
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  open_issues: number;
  language: string | null;
  last_push: string;
  url: string;
  owner_avatar: string;
}

const useGitHubStats = () => {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async (githubUrl: string) => {
    // Parse owner/repo from URL
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) { setError('Invalid GitHub URL'); return; }

    const [, owner, repo] = match;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo.replace(/\.git$/, '')}`);
      if (!res.ok) {
        setError(res.status === 404 ? 'Repository not found' : 'Failed to fetch repo stats');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setStats({
        name: data.name,
        description: data.description,
        stars: data.stargazers_count,
        forks: data.forks_count,
        open_issues: data.open_issues_count,
        language: data.language,
        last_push: data.pushed_at,
        url: data.html_url,
        owner_avatar: data.owner.avatar_url,
      });
    } catch {
      setError('Network error fetching repo stats');
    }
    setLoading(false);
  };

  const clear = () => { setStats(null); setError(null); };

  return { stats, loading, error, fetchStats, clear };
};

export default useGitHubStats;