// ProjectDetailPage — single project view with tabs

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Github, Bug, Clock,
  Settings, BarChart2, Trash2, Loader2,
  Save, ExternalLink, Plus
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import useProjects from '../hooks/useProjects';
import type { Project } from '../hooks/useProjects';

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

type Tab = 'overview' | 'settings';

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject, updateProject, deleteProject } = useProjects();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');

  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadProject();
  }, [id]);

  const loadProject = async () => {
    setLoading(true);
    const data = await getProject(id!);
    if (data) {
      setProject(data);
      setEditName(data.name);
      setEditDesc(data.description ?? '');
      setEditGithub(data.github_url ?? '');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!project) return;
    setSaving(true);
    const ok = await updateProject(project.id, {
      name: editName.trim(),
      description: editDesc.trim() || undefined,
      github_url: editGithub.trim() || undefined,
    });
    if (ok) setProject((p) => p ? { ...p, name: editName, description: editDesc, github_url: editGithub } : p);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!project) return;
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    const ok = await deleteProject(project.id);
    if (ok) navigate('/projects');
    setDeleting(false);
  };

  if (loading) {
    return (
      <DashboardLayout title="Project">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-indigo-500" size={28} />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout title="Project">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-500 mb-4">Project not found</p>
          <button
            onClick={() => navigate('/projects')}
            className="text-indigo-600 font-medium text-sm"
          >
            Back to Projects
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={project.name}>
      <div className="space-y-6">

        <div>
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition mb-4"
          >
            <ArrowLeft size={14} /> All Projects
          </button>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
                  {project.language && (
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${LANGUAGE_COLORS[project.language] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {LANGUAGE_LABELS[project.language] ?? project.language}
                    </span>
                  )}
                </div>
                {project.description && (
                  <p className="text-gray-400 text-sm mt-1">{project.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <Clock size={11} />
                  Created {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>

              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-600 px-3 py-2 rounded-xl text-sm font-medium transition"
                >
                  <Github size={15} />
                  View Repo
                  <ExternalLink size={12} />
                </a>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
              {[
                { label: 'Debug Sessions', value: project.session_count, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Total Errors', value: project.error_count, color: 'text-red-600', bg: 'bg-red-50' },
                { label: 'Fix Rate', value: '—', color: 'text-green-600', bg: 'bg-green-50' },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} rounded-xl p-3 text-center`}>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {([
            { key: 'overview', label: 'Overview', icon: <BarChart2 size={14} /> },
            { key: 'settings', label: 'Settings', icon: <Settings size={14} /> },
          ] as { key: Tab; label: string; icon: any }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === t.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">Debug Sessions</h3>
              <button
                onClick={() => navigate('/sessions')}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-2 rounded-xl transition"
              >
                <Plus size={13} /> New Session
              </button>
            </div>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
                <Bug size={22} className="text-blue-400" />
              </div>
              <p className="text-gray-700 font-medium text-sm">No sessions yet</p>
              <p className="text-gray-400 text-xs mt-1 mb-4">
                Start a debug session to track errors in this project
              </p>
              <button
                onClick={() => navigate('/sessions')}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-xl transition"
              >
                <Plus size={13} /> Start Session
              </button>
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="space-y-4 max-w-lg">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h3 className="font-bold text-gray-900">Project Settings</h3>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Project Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border-2 border-gray-100 focus:border-indigo-400 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Description
                </label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={2}
                  className="w-full border-2 border-gray-100 focus:border-indigo-400 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={editGithub}
                  onChange={(e) => setEditGithub(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="w-full border-2 border-gray-100 focus:border-indigo-400 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-300"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !editName.trim()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-red-100 p-6">
              <h3 className="font-bold text-red-600 mb-4">Danger Zone</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Delete Project</p>
                  <p className="text-xs text-gray-400">Permanently delete this project and all its data</p>
                </div>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium px-4 py-2 rounded-xl text-sm transition border border-red-200 disabled:opacity-50"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default ProjectDetailPage;