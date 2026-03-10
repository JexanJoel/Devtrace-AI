// FixCard.tsx — clean fix library card

import { Trash2, Copy, Tag, RotateCcw, Sparkles } from 'lucide-react';
import type { Fix } from '../../hooks/useFixes';
import toast from 'react-hot-toast';

interface Props {
  fix: Fix;
  onDelete: (id: string) => void;
  onUse: (fix: Fix) => void;
}

const LANGUAGE_COLORS: Record<string, string> = {
  javascript: 'bg-yellow-100 text-yellow-700',
  typescript: 'bg-blue-100 text-blue-700',
  react: 'bg-cyan-100 text-cyan-700',
  nextjs: 'bg-gray-100 text-gray-700',
  nodejs: 'bg-green-100 text-green-700',
  python: 'bg-blue-100 text-blue-700',
};

// Strip markdown bold markers like **text** for clean display
const stripMarkdown = (text: string) =>
  text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\n/g, ' ').trim();

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
};

const FixCard = ({ fix, onDelete, onUse }: Props) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(fix.fix_content);
    toast.success('Copied to clipboard!');
  };

  // Extract just the fix line — first non-empty line after stripping markdown
  const previewText = stripMarkdown(fix.fix_content)
    .split('  ')
    .find((line) => line.trim().length > 10) ?? stripMarkdown(fix.fix_content).slice(0, 120);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-sm transition group flex flex-col gap-4">

      {/* Top row — title + actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm leading-snug truncate">{fix.title}</h3>
          {fix.error_pattern && (
            <p className="text-xs text-gray-400 font-mono truncate mt-0.5">{fix.error_pattern}</p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={handleCopy}
            title="Copy"
            className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={() => onDelete(fix.id)}
            title="Delete"
            className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Fix preview — clean single sentence */}
      <div className="flex gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
        <Sparkles size={13} className="text-indigo-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{previewText}</p>
      </div>

      {/* Language + tags */}
      {(fix.language || (fix.tags && fix.tags.length > 0)) && (
        <div className="flex items-center gap-2 flex-wrap">
          {fix.language && (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${LANGUAGE_COLORS[fix.language] ?? 'bg-gray-100 text-gray-600'}`}>
              {fix.language}
            </span>
          )}
          {fix.tags?.map((tag) => (
            <span key={tag} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-gray-100 text-gray-500">
              <Tag size={10} /> {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{timeAgo(fix.created_at)}</span>
          {fix.use_count > 0 && (
            <span className="flex items-center gap-1">
              <RotateCcw size={10} /> {fix.use_count}x used
            </span>
          )}
        </div>
        <button
          onClick={() => onUse(fix)}
          className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-xl transition"
        >
          <Copy size={11} /> Use Fix
        </button>
      </div>

    </div>
  );
};

export default FixCard;