import { useState } from 'react';
import { Search, BookOpen, X, Copy, Check, Trash2, RotateCcw, Tag, Sparkles, Clock } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import FixCard from '../components/fixes/FixCard';
import useFixes from '../hooks/useFixes';
import type { Fix } from '../hooks/useFixes';
import toast from 'react-hot-toast';

const LANGUAGES = ['all', 'javascript', 'typescript', 'react', 'nextjs', 'nodejs', 'python', 'other'];

const LANGUAGE_COLORS: Record<string, string> = {
  javascript: 'bg-yellow-100 text-yellow-700',
  typescript: 'bg-blue-100 text-blue-700',
  react: 'bg-cyan-100 text-cyan-700',
  nextjs: 'bg-gray-100 text-gray-700',
  nodejs: 'bg-green-100 text-green-700',
  python: 'bg-blue-100 text-blue-700',
};

const parseTags = (tags: string | string[] | undefined | null): string[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  try { return JSON.parse(tags); } catch { return []; }
};

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
};

// ─── Expand Modal ─────────────────────────────────────────────────────────────

const FixModal = ({ fix, onClose, onDelete, onUse }: {
  fix: Fix;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUse: (fix: Fix) => void;
}) => {
  const [copied, setCopied] = useState(false);
  const tags = parseTags(fix.tags);

  const handleCopy = () => {
    navigator.clipboard.writeText(fix.fix_content);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Split fix_content into sections by **heading**
  const renderContent = (content: string) => {
    const sections = content.split(/\n(?=\*\*)/);
    return sections.map((section, i) => {
      const headingMatch = section.match(/^\*\*(.*?)\*\*/);
      if (headingMatch) {
        const heading = headingMatch[1];
        const body = section.replace(/^\*\*(.*?)\*\*\n?/, '').trim();
        const isCode = body.includes('\n') || body.startsWith('if') || body.startsWith('const') || body.startsWith('function') || body.startsWith('//') || body.includes('=>') || body.includes('{');
        return (
          <div key={i} className="space-y-2">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">{heading}</p>
            {isCode ? (
              <pre className="bg-gray-900 rounded-xl p-4 text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                {body}
              </pre>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{body}</p>
            )}
          </div>
        );
      }
      return (
        <p key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{section.trim()}</p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="font-bold text-gray-900 dark:text-white text-base leading-snug">{fix.title}</h2>
            {fix.error_pattern && (
              <p className="text-xs text-gray-400 font-mono mt-1 truncate">{fix.error_pattern}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {fix.language && (
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${LANGUAGE_COLORS[fix.language] ?? 'bg-gray-100 text-gray-600'}`}>
                  {fix.language}
                </span>
              )}
              {tags.map((tag: string) => (
                <span key={tag} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-gray-100 dark:bg-gray-800 text-gray-500">
                  <Tag size={10} /> {tag}
                </span>
              ))}
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock size={10} /> {timeAgo(fix.created_at)}
              </span>
              {fix.use_count > 0 && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <RotateCcw size={10} /> {fix.use_count}x used
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 flex-shrink-0 transition">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {renderContent(fix.fix_content)}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
          <button onClick={() => { onDelete(fix.id); onClose(); }}
            className="flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 px-3 py-2 rounded-xl text-sm font-medium transition">
            <Trash2 size={14} /> Delete
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => { onUse(fix); }}
              className="flex items-center gap-2 border border-indigo-200 hover:bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-sm font-medium transition">
              <RotateCcw size={14} /> Mark Used
            </button>
            <button onClick={handleCopy}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
              {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Fix</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const FixLibraryPage = () => {
  const { fixes, loading, deleteFix, incrementUseCount } = useFixes();
  const [search, setSearch] = useState('');
  const [lang, setLang] = useState('all');
  const [selectedFix, setSelectedFix] = useState<Fix | null>(null);

  const filtered = fixes.filter((f) => {
    const matchSearch =
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.error_pattern?.toLowerCase().includes(search.toLowerCase());
    const matchLang = lang === 'all' || f.language === lang;
    return matchSearch && matchLang;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this fix?')) return;
    await deleteFix(id);
    toast.success('Fix deleted');
  };

  const handleUse = async (fix: Fix) => {
    await incrementUseCount(fix.id);
    navigator.clipboard.writeText(fix.fix_content);
    toast.success('Fix copied and marked as used!');
  };

  return (
    <DashboardLayout title="Fix Library">
      <div className="space-y-6">

        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search fixes..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-300 transition placeholder-gray-400" />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {LANGUAGES.map((l) => (
            <button key={l} onClick={() => setLang(l)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                lang === l
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-indigo-300'
              }`}>
              {l === 'all' ? 'All Languages' : l}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 animate-pulse">
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2 mb-3" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-green-50 dark:bg-green-950 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen size={28} className="text-green-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">
              {search || lang !== 'all' ? 'No fixes found' : 'Fix library is empty'}
            </h3>
            <p className="text-gray-400 text-sm max-w-xs">
              {search || lang !== 'all'
                ? 'Try adjusting your search or filter'
                : 'Save AI fixes from your debug sessions to build your library'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((fix) => (
              <div key={fix.id} onClick={() => setSelectedFix(fix)} className="cursor-pointer">
                <FixCard
                  fix={fix}
                  onDelete={() => handleDelete(fix.id)}
                  onUse={() => handleUse(fix)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expand Modal */}
      {selectedFix && (
        <FixModal
          fix={selectedFix}
          onClose={() => setSelectedFix(null)}
          onDelete={handleDelete}
          onUse={handleUse}
        />
      )}
    </DashboardLayout>
  );
};

export default FixLibraryPage;