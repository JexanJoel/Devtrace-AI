import { useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import FixCard from '../components/fixes/FixCard';
import useFixes from '../hooks/useFixes';
import toast from 'react-hot-toast';

const LANGUAGES = ['all', 'javascript', 'typescript', 'react', 'nextjs', 'nodejs', 'python', 'other'];

const FixLibraryPage = () => {
  const { fixes, loading, deleteFix, incrementUseCount } = useFixes();
  const [search, setSearch] = useState('');
  const [lang, setLang] = useState('all');

  const filtered = fixes.filter((f) => {
    const matchSearch = f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.error_pattern?.toLowerCase().includes(search.toLowerCase());
    const matchLang = lang === 'all' || f.language === lang;
    return matchSearch && matchLang;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this fix?')) return;
    await deleteFix(id);
    toast.success('Fix deleted');
  };

  const handleUse = async (id: string) => {
    await incrementUseCount(id);
    toast.success('Marked as used!');
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
              {search || lang !== 'all' ? 'Try adjusting your search or filter' : 'Save AI fixes from your debug sessions to build your library'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((fix) => (
              <FixCard
                key={fix.id}
                fix={fix}
                onDelete={() => handleDelete(fix.id)}
                onUse={() => handleUse(fix.id)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FixLibraryPage;