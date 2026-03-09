// useProjects — fetch, create, update, delete projects

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  language: string | null;
  github_url: string | null;
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user!.id)
      .order('updated_at', { ascending: false });

    if (error) toast.error('Failed to load projects');
    else setProjects(data ?? []);
    setLoading(false);
  };

  const createProject = async (input: CreateProjectInput) => {
    const { data, error } = await supabase
      .from('projects')
      .insert({ ...input, user_id: user!.id })
      .select()
      .single();

    if (error) { toast.error('Failed to create project'); return null; }
    setProjects((prev) => [data, ...prev]);
    toast.success('Project created!');
    return data;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const { error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id);

    if (error) { toast.error('Failed to update project'); return false; }
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, ...updates } : p));
    toast.success('Project updated!');
    return true;
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) { toast.error('Failed to delete project'); return false; }
    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast.success('Project deleted');
    return true;
  };

  const getProject = async (id: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) { toast.error('Project not found'); return null; }
    return data as Project;
  };

  return { projects, loading, fetchProjects, createProject, updateProject, deleteProject, getProject };
};

export default useProjects;