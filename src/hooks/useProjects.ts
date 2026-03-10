import { useQuery } from '@powersync/react';
import { powerSync } from '../lib/powersync';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { usePendingQueue } from './usePendingQueue';
import { v4 as uuidv4 } from 'uuid';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  language?: string;
  github_url?: string;
  error_count: number;
  session_count: number;
  created_at: string;
  updated_at: string;
  _pending?: boolean;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  language?: string;
  github_url?: string;
}

const useProjects = () => {
  const { user } = useAuthStore();
  const uid = user?.id ?? '';
  const { pending, addPending, removePending } = usePendingQueue<Project>('projects');

  const { data: syncedProjects = [] } = useQuery<Project>(
    'SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC', [uid]
  );

  // Remove pending items that have been synced
  const syncedIds = new Set(syncedProjects.map(p => p.id));
  const pendingOnly = pending.filter(p => !syncedIds.has(p.id));

  const projects = [
    ...pendingOnly,
    ...syncedProjects,
  ].filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i)
   .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  const getProject = async (id: string): Promise<Project | null> => {
    const p = pending.find(p => p.id === id);
    if (p) return p;
    const results = await powerSync.getAll<Project>(
      'SELECT * FROM projects WHERE id = ? LIMIT 1', [id]
    );
    return results[0] ?? null;
  };

  const createProject = async (data: CreateProjectInput) => {
    if (!user) return null;
    const id = uuidv4();
    const now = new Date().toISOString();
    const row: Project = {
      id, user_id: user.id, error_count: 0, session_count: 0,
      created_at: now, updated_at: now, _pending: true, ...data,
    };

    // Save to localStorage immediately — survives navigation
    addPending(row);

    // Try Supabase
    const { error } = await supabase.from('projects').insert({
      id, user_id: user.id, error_count: 0, session_count: 0,
      created_at: now, updated_at: now, ...data,
    });

    if (!error) {
      // Synced — remove from pending (PowerSync will bring it back via useQuery)
      removePending(id);
    }

    return row;
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    const { error } = await supabase.from('projects')
      .update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
    return !error;
  };

  const deleteProject = async (id: string) => {
    removePending(id);
    const { error } = await supabase.from('projects').delete().eq('id', id);
    return !error;
  };

  return { projects, loading: false, getProject, createProject, updateProject, deleteProject };
};

export default useProjects;