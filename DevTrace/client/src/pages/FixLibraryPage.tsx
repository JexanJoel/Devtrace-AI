// FixLibraryPage.tsx — searchable fix library

import { useState } from 'react';
import { BookOpen, Search, Plus, Sparkles } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import FixCard from '../components/fixes/FixCard';
import useFixes from '../hooks/useFixes';
import type { Fix } from '../hooks/useFixes';
import toast from 'react-hot-toast';

const LANGUAGE_FILTERS = ['all', 'javascript', 'typescript', 'react', 'nextjs', 'nodejs', 'python', 'other'];

const FixLibraryPage = () => {
  const { fixes, loading, createFix, deleteFix, incrementUseCount } = useFixes();
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState('all');

  const filtered = fixes.filter((f) => {
    const matchSearch =
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.fix_content.toLowerCase().includes(search.toLowerCase()) ||
      f.error_pattern?.toLowerCase().includes(search.toLowerCase());
    const matchLang = langFilter === 'all' || f.language === langFilter;
    return matchSearch && matchLang;
  });

  const handleUse = (fix: Fix) => {
    navigator.clipboard.writeText(fix.fix_content);
    incrementUseCount(fix.id);
    toast.success('Fix copied & usage tracked!');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this fix from your library?')) return;
    await deleteFix(id);
  };

  return (
    <DashboardLayout title="Fix Library">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search fixes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Sparkles size={14} className="text-indigo-400" />
            <span>{fixes.length} fix{fixes.length !== 1 ? 'es' : ''} saved</span>
          </div>
        </div>

        {/* Language filter pills */}
        <div className="flex gap-2 flex-wrap">
          {LANGUAGE_FILTERS.map((lang) => (
            <button
              key={lang}
              onClick={() => setLangFilter(lang)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition border ${
                langFilter === lang
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse space-y-3">
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-16 bg-gray-100 rounded" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen size={28} className="text-indigo-400" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">
              {search || langFilter !== 'all' ? 'No fixes found' : 'Fix library is empty'}
            </h3>
            <p className="text-gray-400 text-sm mb-4 max-w-xs">
              {search || langFilter !== 'all'
                ? 'Try a different search or filter'
                : 'Save AI fixes from your debug sessions to build your personal library'
              }
            </p>
            {!search && langFilter === 'all' && (
              <div className="flex items-center gap-2 text-xs text-indigo-500 bg-indigo-50 border border-indigo-100 px-4 py-2.5 rounded-xl">
                <Sparkles size={13} />
                Go to a session → Get AI Fix → Save to Library
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((fix) => (
              <FixCard
                key={fix.id}
                fix={fix}
                onDelete={handleDelete}
                onUse={handleUse}
              />
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default FixLibraryPage;