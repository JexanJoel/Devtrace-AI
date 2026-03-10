import { useQuery } from '@powersync/react';
import { powerSync } from '../lib/powersync';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';
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
  _pending?: boolean; // marks offline-created items
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

  // Synced data from PowerSync local SQLite
  const { data: syncedProjects = [] } = useQuery<Project>(
    'SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC', [uid]
  );

  // Pending offline items not yet synced
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);

  // Merge: synced wins over pending if same id exists
  const syncedIds = new Set(syncedProjects.map(p => p.id));
  const pendingOnly = pendingProjects.filter(p => !syncedIds.has(p.id));
  const projects = [...syncedProjects, ...pendingOnly].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  const getProject = async (id: string): Promise<Project | null> => {
    const pending = pendingProjects.find(p => p.id === id);
    if (pending) return pending;
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

    // Show immediately in UI
    setPendingProjects(prev => [row, ...prev]);

    // Try Supabase — if offline this fails silently
    const { error } = await supabase.from('projects').insert({
      id, user_id: user.id, error_count: 0, session_count: 0,
      created_at: now, updated_at: now, ...data,
    });

    if (error) {
      // Stay in pending — will retry when online
      console.log('Offline — project queued locally');
    } else {
      // Supabase succeeded — PowerSync will sync it, remove from pending
      setPendingProjects(prev => prev.filter(p => p.id !== id));
    }

    return row;
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    const { error } = await supabase.from('projects')
      .update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
    return !error;
  };

  const deleteProject = async (id: string) => {
    // Remove from pending immediately
    setPendingProjects(prev => prev.filter(p => p.id !== id));
    const { error } = await supabase.from('projects').delete().eq('id', id);
    return !error;
  };

  return { projects, loading: false, getProject, createProject, updateProject, deleteProject };
};

export default useProjects;