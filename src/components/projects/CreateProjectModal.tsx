// CreateProjectModal — modal to create a new project

import { useState } from 'react';
import { X, FolderOpen, Loader2, Github, FileCode2 } from 'lucide-react';
import type { CreateProjectInput } from '../../hooks/useProjects';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'typescript', label: 'TypeScript', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'react', label: 'React', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  { value: 'nextjs', label: 'Next.js', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { value: 'nodejs', label: 'Node.js', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'express', label: 'Express', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { value: 'python', label: 'Python', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'other', label: 'Other', color: 'bg-purple-100 text-purple-700 border-purple-200' },
];

interface Props {
  onClose: () => void;
  onCreate: (input: CreateProjectInput) => Promise<any>;
}

const CreateProjectModal = ({ onClose, onCreate }: Props) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const result = await onCreate({
      name: name.trim(),
      description: description.trim() || undefined,
      language: language || undefined,
      github_url: githubUrl.trim() || undefined,
    });
    setLoading(false);
    if (result) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <FolderOpen size={18} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">New Project</h2>
              <p className="text-xs text-gray-400">Set up your debugging workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Project name */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Project Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. my-awesome-app"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-full border-2 border-gray-100 focus:border-indigo-400 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-300"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Description <span className="text-gray-300">(optional)</span>
            </label>
            <textarea
              placeholder="What does this project do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border-2 border-gray-100 focus:border-indigo-400 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-300 resize-none"
            />
          </div>

          {/* Language selector */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
              <span className="flex items-center gap-1.5">
                <FileCode2 size={12} /> Language / Framework
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setLanguage(language === lang.value ? '' : lang.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    language === lang.value
                      ? lang.color + ' ring-2 ring-indigo-400 ring-offset-1'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* GitHub URL */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              <span className="flex items-center gap-1.5">
                <Github size={12} /> GitHub Repo <span className="text-gray-300">(optional)</span>
              </span>
            </label>
            <input
              type="url"
              placeholder="https://github.com/username/repo"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full border-2 border-gray-100 focus:border-indigo-400 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-300"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 border-2 border-gray-100 hover:border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading || !name.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Create Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;