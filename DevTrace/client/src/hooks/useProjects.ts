// src/hooks/useProjects.ts
import { useQuery } from '@powersync/react';
import { powerSync } from '../lib/powersync';
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

export interface CreateProjectInput {
  name: string;
  description?: string;
  language?: string;
  github_url?: string;
}

const useProjects = () => {
  const { user } = useAuthStore();
  const uid = user?.id ?? '';

  // Reads from local SQLite — reactive, works offline instantly
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
    // writeTransaction queues the op for upload — works online AND offline
    await powerSync.writeTransaction(async (tx) => {
      await tx.execute(
        `INSERT INTO projects (id, user_id, name, description, language, github_url, error_count, session_count, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, user.id, data.name, data.description ?? null, data.language ?? null,
         data.github_url ?? null, 0, 0, now, now]
      );
    });
    return { id, user_id: user.id, error_count: 0, session_count: 0, created_at: now, updated_at: now, ...data } as Project;
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    const now = new Date().toISOString();
    const fields = { ...data, updated_at: now };
    const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
    await powerSync.writeTransaction(async (tx) => {
      await tx.execute(
        `UPDATE projects SET ${setClauses} WHERE id = ?`,
        [...Object.values(fields), id]
      );
    });
    return true;
  };

  const deleteProject = async (id: string) => {
    await powerSync.writeTransaction(async (tx) => {
      await tx.execute('DELETE FROM projects WHERE id = ?', [id]);
    });
    return true;
  };

  return { projects, loading: false, getProject, createProject, updateProject, deleteProject };
};

export default useProjects;