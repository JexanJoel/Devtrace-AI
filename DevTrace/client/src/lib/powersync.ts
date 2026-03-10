// src/lib/powersync.ts
import { PowerSyncDatabase } from '@powersync/web';
import { column, Schema, Table } from '@powersync/web';

// ─── Schema ───────────────────────────────────────────────────────────────────

const profiles = new Table({
  name: column.text,
  email: column.text,
  github_username: column.text,
  avatar_url: column.text,
  onboarded: column.integer,
  dark_mode: column.integer,
  created_at: column.text,
});

const projects = new Table({
  user_id: column.text,
  name: column.text,
  description: column.text,
  language: column.text,
  github_url: column.text,
  error_count: column.integer,
  session_count: column.integer,
  created_at: column.text,
  updated_at: column.text,
});

const debug_sessions = new Table({
  user_id: column.text,
  project_id: column.text,
  title: column.text,
  error_message: column.text,
  stack_trace: column.text,
  severity: column.text,
  status: column.text,
  ai_fix: column.text,
  notes: column.text,
  created_at: column.text,
  updated_at: column.text,
});

const fixes = new Table({
  user_id: column.text,
  session_id: column.text,
  project_id: column.text,
  title: column.text,
  error_pattern: column.text,
  fix_content: column.text,
  language: column.text,
  tags: column.text,
  use_count: column.integer,
  created_at: column.text,
});

export const AppSchema = new Schema({
  profiles,
  projects,
  debug_sessions,
  fixes,
});

export type Database = (typeof AppSchema)['types'];

// ─── PowerSync instance ───────────────────────────────────────────────────────

export const powerSync = new PowerSyncDatabase({
  schema: AppSchema,
  database: { dbFilename: 'devtrace.db' },
});