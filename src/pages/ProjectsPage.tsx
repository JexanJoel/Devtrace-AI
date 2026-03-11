// ProjectsPage — grid of all user projects with create modal

import { useState } from 'react';
import { Plus, FolderOpen, Search } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ProjectCard from '../components/projects/ProjectCard';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import useProjects from '../hooks/useProjects';

const ProjectsPage = () => {
  const { projects, loading, createProject } = useProjects();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  // Filter projects by search
  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Projects">
      <div className="space-y-6">

        {/* Header row */}
        <div className="flex items-center justify-between gap-4">

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-400"
            />
          </div>

          {/* Create button */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition"
          >
            <Plus size={16} />
            New Project
          </button>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="h-4 bg-gray-100 rounded-lg w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded-lg w-1/2 mb-4" />
                <div className="h-6 bg-gray-100 rounded-lg w-1/4 mb-4" />
                <div className="h-3 bg-gray-100 rounded-lg w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (

          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
              <FolderOpen size={28} className="text-indigo-400" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">
              {search ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              {search
                ? `No projects match "${search}"`
                : 'Create your first project to start tracking debug sessions'
              }
            </p>
            {!search && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition"
              >
                <Plus size={15} />
                Create First Project
              </button>
            )}
          </div>
        ) : (

          /* Project grid */
          <div>
            <p className="text-xs text-gray-400 mb-3 font-medium">
              {filtered.length} project{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}

              {/* Add more card */}
              <button
                onClick={() => setShowModal(true)}
                className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-5 hover:border-indigo-300 hover:bg-indigo-50/30 transition flex flex-col items-center justify-center gap-2 min-h-[160px] group"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center transition">
                  <Plus size={18} className="text-gray-400 group-hover:text-indigo-600 transition" />
                </div>
                <span className="text-sm font-medium text-gray-400 group-hover:text-indigo-600 transition">
                  New Project
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreate={createProject}
        />
      )}
    </DashboardLayout>
  );
};

export default ProjectsPage;