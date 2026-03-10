// src/hooks/useProjects.ts — PowerSync version
import { useState } from 'react';
import { useQuery } from '@powersync/react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
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

const useProjects = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Read from local SQLite via PowerSync
  const { data: projects = [] } = useQuery<Project>(
    'SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC',
    [user?.id ?? '']
  );

  const createProject = async (data: Partial<Project>) => {
    if (!user) return null;
    const id = uuidv4();
    const now = new Date().toISOString();
    // Write to Supabase — PowerSync will sync down to local SQLite
    const { data: result, error } = await supabase
      .from('projects')
      .insert({ id, user_id: user.id, error_count: 0, session_count: 0, created_at: now, updated_at: now, ...data })
      .select().single();
    if (error) { console.error(error); return null; }
    return result;
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    const { error } = await supabase.from('projects').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
    return !error;
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    return !error;
  };

  return { projects, loading, createProject, updateProject, deleteProject };
};

export default useProjects;