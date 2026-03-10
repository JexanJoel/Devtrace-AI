import { useQuery } from '@powersync/react';
import { powerSync } from '../lib/powersync';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { useOnlineStatus } from './useOnlineStatus';
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
  const isOnline = useOnlineStatus();

  const { data: projects = [] } = useQuery<Project>(
    'SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC', [uid]
  );

  const getProject = async (id: string): Promise<Project | null> => {
    const results = await powerSync.getAll<Project>(
      'SELECT * FROM projects WHERE id = ? LIMIT 1', [id]
    );
    return results[0] ?? null;
  };

  const createProject = async (data: CreateProjectInput) => {
    if (!user) return null;
    const id = uuidv4();
    const now = new Date().toISOString();
    const row = { id, user_id: user.id, error_count: 0, session_count: 0, created_at: now, updated_at: now, ...data };

    // Always write to local SQLite first — instant, works offline
    await powerSync.execute(
      `INSERT INTO projects (id, user_id, name, description, language, github_url, error_count, session_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [row.id, row.user_id, row.name, row.description ?? null, row.language ?? null, row.github_url ?? null, 0, 0, now, now]
    );

    // If online, also write to Supabase so it syncs immediately
    if (isOnline) {
      const { error } = await supabase.from('projects').insert(row);
      if (error) console.error('Supabase sync error (will retry):', error);
    }

    return row as Project;
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    const now = new Date().toISOString();
    const fields = { ...data, updated_at: now };

    // Write locally first
    const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
    await powerSync.execute(
      `UPDATE projects SET ${setClauses} WHERE id = ?`,
      [...Object.values(fields), id]
    );

    if (isOnline) {
      const { error } = await supabase.from('projects').update(fields).eq('id', id);
      if (error) console.error('Supabase sync error (will retry):', error);
    }
    return true;
  };

  const deleteProject = async (id: string) => {
    await powerSync.execute('DELETE FROM projects WHERE id = ?', [id]);
    if (isOnline) {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) console.error('Supabase sync error (will retry):', error);
    }
    return true;
  };

  return { projects, loading: false, getProject, createProject, updateProject, deleteProject };
};

export default useProjects;