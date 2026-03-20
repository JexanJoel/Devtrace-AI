import { useQuery } from '@powersync/react';
import { powerSync } from '../lib/powersync';
import { useAuthStore } from '../store/authStore';
import { syncQueueAddItem, syncQueueUpdateItem } from '../store/useSyncQueue';
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
    const qid = `create_project_${id}`;
    const now = new Date().toISOString();

    syncQueueAddItem({
      id: qid,
      action: 'create_project',
      label: `Create project "${data.name}"`,
      status: 'syncing',
    });

    try {
      // Write via PowerSync so it appears instantly in local SQLite
      // PowerSync will upload to Supabase via SupabaseConnector.uploadData
      await powerSync.execute(
        `INSERT INTO projects (id, user_id, name, description, language, github_url, error_count, session_count, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`,
        [
          id, user.id,
          data.name,
          data.description ?? null,
          data.language ?? null,
          data.github_url ?? null,
          now, now,
        ]
      );
      syncQueueUpdateItem(qid, { status: 'done' });
      return await getProject(id);
    } catch (err) {
      console.error('createProject error:', err);
      syncQueueUpdateItem(qid, { status: 'error' });
      return null;
    }
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    const qid = `update_project_${id}_${Date.now()}`;
    const label = data.name ? `Rename project to "${data.name}"` : 'Update project';
    syncQueueAddItem({ id: qid, action: 'rename_project', label, status: 'syncing' });

    try {
      const now = new Date().toISOString();
      const keys = [...Object.keys(data), 'updated_at'];
      const values = [...Object.values(data), now];
      const setClauses = keys.map(k => `${k} = ?`).join(', ');
      await powerSync.execute(
        `UPDATE projects SET ${setClauses} WHERE id = ?`,
        [...values, id]
      );
      syncQueueUpdateItem(qid, { status: 'done' });
      return true;
    } catch (err) {
      console.error('updateProject error:', err);
      syncQueueUpdateItem(qid, { status: 'error' });
      return false;
    }
  };

  const deleteProject = async (id: string) => {
    const qid = `delete_project_${id}`;
    const project = projects.find(p => p.id === id);
    syncQueueAddItem({
      id: qid,
      action: 'delete_project',
      label: `Delete project "${project?.name ?? id}"`,
      status: 'syncing',
    });

    try {
      await powerSync.execute(`DELETE FROM projects WHERE id = ?`, [id]);
      syncQueueUpdateItem(qid, { status: 'done' });
      return true;
    } catch (err) {
      console.error('deleteProject error:', err);
      syncQueueUpdateItem(qid, { status: 'error' });
      return false;
    }
  };

  return { projects, loading: false, getProject, createProject, updateProject, deleteProject };
};

export default useProjects;