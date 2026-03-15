# Contributing to DevTrace AI

First off, thank you for considering contributing to DevTrace AI! It's people like you that make DevTrace AI such a great tool.

This document contains a full technical setup guide, project architecture overview, and contribution guidelines.

---

## 🛠️ Technical Setup

### Prerequisites
- **Node.js**: version 18 or higher.
- **Supabase**: A free project at [supabase.com](https://supabase.com).
- **PowerSync**: An account at [powersync.com](https://www.powersync.com).
- **Groq API Key**: Get one for free at [console.groq.com](https://console.groq.com).

### Step 1: Clone and Install
```bash
git clone https://github.com/JexanJoel/DevTrace-AI.git
cd DevTrace-AI
npm install
```

### Step 2: Supabase Setup
1. Create a new project in your Supabase dashboard.
2. Go to the **SQL Editor** and execute the following schemas in order:

<details>
<summary>📋 Click to expand - 1. Base Schema</summary>

```sql
-- Profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  github_username text,
  github_connected boolean default false,
  avatar_url text,
  onboarded boolean default false,
  dark_mode boolean default false,
  created_at timestamp with time zone default timezone('utc', now())
);

create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, new.raw_user_meta_data->>'email'))
  on conflict (id) do update set email = coalesce(excluded.email, new.raw_user_meta_data->>'email');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can look up other profiles" on profiles for select using (true);

-- Projects
create table projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  name text not null,
  description text,
  language text,
  github_url text,
  error_count int default 0,
  session_count int default 0,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

alter table projects enable row level security;
create policy "Users can view own projects"   on projects for select using (auth.uid() = user_id);
create policy "Users can create projects"     on projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on projects for update using (auth.uid() = user_id);
create policy "Users can delete own projects" on projects for delete using (auth.uid() = user_id);
create policy "Shared project viewers can read" on projects for select using (
  exists (select 1 from shares where shares.resource_id = projects.id and shares.resource_type = 'project' and shares.invitee_id = auth.uid())
);

-- Debug Sessions
create table debug_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  project_id uuid references projects on delete cascade,
  title text not null,
  error_message text,
  stack_trace text,
  code_snippet text,
  expected_behavior text,
  environment text default 'development',
  severity text default 'medium',
  status text default 'open',
  ai_fix text,
  ai_analysis jsonb,
  notes text,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

alter table debug_sessions enable row level security;
create policy "Users can view own sessions"   on debug_sessions for select using (auth.uid() = user_id);
create policy "Users can create sessions"     on debug_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own sessions" on debug_sessions for update using (auth.uid() = user_id);
create policy "Users can delete own sessions" on debug_sessions for delete using (auth.uid() = user_id);
create policy "Shared session viewers can read" on debug_sessions for select using (
  exists (select 1 from shares where shares.resource_id = debug_sessions.id and shares.resource_type = 'session' and shares.invitee_id = auth.uid())
);
create policy "Sessions in shared projects can read" on debug_sessions for select using (
  exists (select 1 from shares where shares.resource_id = debug_sessions.project_id and shares.resource_type = 'project' and shares.invitee_id = auth.uid())
);

-- Fixes
create table fixes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  session_id uuid references debug_sessions on delete set null,
  project_id uuid references projects on delete set null,
  title text not null,
  error_pattern text,
  fix_content text not null,
  language text,
  tags text[],
  use_count int default 0,
  created_at timestamp with time zone default timezone('utc', now())
);

alter table fixes enable row level security;
create policy "Users can view own fixes"   on fixes for select using (auth.uid() = user_id);
create policy "Users can create fixes"     on fixes for insert with check (auth.uid() = user_id);
create policy "Users can update own fixes" on fixes for update using (auth.uid() = user_id);
create policy "Users can delete own fixes" on fixes for delete using (auth.uid() = user_id);

-- Shares
create table shares (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users on delete cascade,
  invitee_id uuid references auth.users on delete cascade,
  resource_type text not null check (resource_type in ('project', 'session')),
  resource_id uuid not null,
  created_at timestamptz default now(),
  unique(invitee_id, resource_type, resource_id)
);

alter table shares enable row level security;
create policy "Owners can manage shares"       on shares for all    using (owner_id = auth.uid());
create policy "Invitees can view their shares" on shares for select using (invitee_id = auth.uid());

-- updated_at triggers
create or replace function update_updated_at() returns trigger as $$
begin new.updated_at = timezone('utc', now()); return new; end;
$$ language plpgsql;

create trigger projects_updated_at before update on projects for each row execute procedure update_updated_at();
create trigger sessions_updated_at before update on debug_sessions for each row execute procedure update_updated_at();

-- PowerSync WAL publication
create publication powersync for table profiles, projects, debug_sessions, fixes, shares;
```
</details>

<details>
<summary>👥 Click to expand - 2. Session Collaboration Schema</summary>

```sql
-- Session presence
create table if not exists session_presence (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references debug_sessions on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  display_name text,
  avatar_url text,
  last_seen_at timestamp with time zone default now(),
  joined_at timestamp with time zone default now(),
  unique(session_id, user_id)
);

alter table session_presence enable row level security;
create policy "Session participants can view presence" on session_presence for select using (
  auth.uid() = user_id
  or exists (select 1 from shares where shares.resource_id = session_presence.session_id and shares.resource_type = 'session' and (shares.owner_id = auth.uid() or shares.invitee_id = auth.uid()))
  or exists (select 1 from debug_sessions where debug_sessions.id = session_presence.session_id and debug_sessions.user_id = auth.uid())
);
create policy "Users manage own presence" on session_presence for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Session checklist
create table if not exists session_checklist (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references debug_sessions on delete cascade not null,
  item_index integer not null,
  checked boolean default false,
  checked_by uuid references auth.users on delete set null,
  checked_by_name text,
  checked_at timestamp with time zone,
  unique(session_id, item_index)
);

alter table session_checklist enable row level security;
create policy "Session participants can view checklist" on session_checklist for select using (
  exists (select 1 from debug_sessions where debug_sessions.id = session_checklist.session_id and debug_sessions.user_id = auth.uid())
  or exists (select 1 from shares where shares.resource_id = session_checklist.session_id and shares.resource_type = 'session' and (shares.owner_id = auth.uid() or shares.invitee_id = auth.uid()))
);
create policy "Session participants can update checklist" on session_checklist for all
  using (
    exists (select 1 from debug_sessions where debug_sessions.id = session_checklist.session_id and debug_sessions.user_id = auth.uid())
    or exists (select 1 from shares where shares.resource_id = session_checklist.session_id and shares.resource_type = 'session' and (shares.owner_id = auth.uid() or shares.invitee_id = auth.uid()))
  )
  with check (
    exists (select 1 from debug_sessions where debug_sessions.id = session_checklist.session_id and debug_sessions.user_id = auth.uid())
    or exists (select 1 from shares where shares.resource_id = session_checklist.session_id and shares.resource_type = 'session' and (shares.owner_id = auth.uid() or shares.invitee_id = auth.uid()))
  );

-- Session chat
create table if not exists session_chat (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references debug_sessions on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  display_name text,
  avatar_url text,
  message text not null,
  created_at timestamp with time zone default now()
);

alter table session_chat enable row level security;
create policy "Session participants can view chat" on session_chat for select using (
  exists (select 1 from debug_sessions where debug_sessions.id = session_chat.session_id and debug_sessions.user_id = auth.uid())
  or exists (select 1 from shares where shares.resource_id = session_chat.session_id and shares.resource_type = 'session' and (shares.owner_id = auth.uid() or shares.invitee_id = auth.uid()))
);
create policy "Session participants can send messages" on session_chat for insert with check (
  auth.uid() = user_id and (
    exists (select 1 from debug_sessions where debug_sessions.id = session_chat.session_id and debug_sessions.user_id = auth.uid())
    or exists (select 1 from shares where shares.resource_id = session_chat.session_id and shares.resource_type = 'session' and (shares.owner_id = auth.uid() or shares.invitee_id = auth.uid()))
  )
);

alter publication powersync add table session_presence;
alter publication powersync add table session_checklist;
alter publication powersync add table session_chat;
```
</details>

<details>
<summary>📋 Click to expand - 3. Project Collaboration Schema</summary>

```sql
-- Project presence
create table if not exists project_presence (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  display_name text,
  avatar_url text,
  last_seen_at timestamp with time zone default now(),
  joined_at timestamp with time zone default now(),
  unique(project_id, user_id)
);

alter table project_presence enable row level security;
create policy "Project participants can view presence" on project_presence for select using (
  auth.uid() = user_id
  or exists (select 1 from projects where projects.id = project_presence.project_id and projects.user_id = auth.uid())
  or exists (select 1 from shares where shares.resource_id = project_presence.project_id and shares.resource_type = 'project' and (shares.owner_id = auth.uid() or shares.invitee_id = auth.uid()))
);
create policy "Users manage own project presence" on project_presence for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Project activity feed
create table if not exists project_activity (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  display_name text,
  avatar_url text,
  event_type text not null,
  session_id uuid references debug_sessions on delete cascade,
  session_title text,
  metadata jsonb,
  created_at timestamp with time zone default now()
);

alter table project_activity enable row level security;
create policy "Project participants can view activity" on project_activity for select using (
  exists (select 1 from projects where projects.id = project_activity.project_id and projects.user_id = auth.uid())
  or exists (select 1 from shares where shares.resource_id = project_activity.project_id and shares.resource_type = 'project' and (shares.owner_id = auth.uid() or shares.invitee_id = auth.uid()))
);
create policy "Project participants can log activity" on project_activity for insert with check (
  auth.uid() = user_id and (
    exists (select 1 from projects where projects.id = project_activity.project_id and projects.user_id = auth.uid())
    or exists (select 1 from shares where shares.resource_id = project_activity.project_id and shares.resource_type = 'project' and (shares.owner_id = auth.uid() or shares.invitee_id = auth.uid()))
  )
);

-- Project chat
create table if not exists project_chat (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  display_name text,
  avatar_url text,
  message text not null,
  created_at timestamp with time zone default now()
);

alter table project_chat enable row level security;
create policy "Project participants can view chat" on project_chat for select using (
  exists (select 1 from projects where projects.id = project_chat.project_id and projects.user_id = auth.uid())
  or exists (select 1 from shares where shares.resource_id = project_chat.project_id and shares.resource_type = 'project' and (shares.owner_id = auth.uid() or shares.invitee_id = auth.uid()))
);
create policy "Project participants can send messages" on project_chat for insert with check (
  auth.uid() = user_id and (
    exists (select 1 from projects where projects.id = project_chat.project_id and projects.user_id = auth.uid())
    or exists (select 1 from shares where shares.resource_id = project_chat.project_id and shares.resource_type = 'project' and (shares.owner_id = auth.uid() or shares.invitee_id = auth.uid()))
  )
);

alter publication powersync add table project_presence;
alter publication powersync add table project_activity;
alter publication powersync add table project_chat;
```
</details>

3. Enable **GitHub** and **Google** providers in **Authentication -> Providers**.
4. Create a **public** storage bucket called `avatars`.
5. Deploy Edge Functions from `supabase/functions/` and set `GROQ_API_KEY` and `SERVICE_ROLE_KEY` secrets.

### Step 3: PowerSync Setup
1. Connect PowerSync to your Supabase Postgres URI.
2. Paste the following **Sync Rules** in the PowerSync dashboard:

<details>
<summary>⚙️ Click to expand - PowerSync Sync Rules</summary>

```json
{
  "bucket_definitions": {
    "user_data": {
      "parameters": "SELECT request.user_id() as user_id",
      "data": [
        "SELECT * FROM profiles WHERE id = bucket.user_id",
        "SELECT * FROM projects WHERE user_id = bucket.user_id",
        "SELECT * FROM debug_sessions WHERE user_id = bucket.user_id",
        "SELECT * FROM fixes WHERE user_id = bucket.user_id",
        "SELECT * FROM shares WHERE owner_id = bucket.user_id"
      ]
    },
    ... (see POWERSYNC_SYNC_RULES.json for full file)
  }
}
```
</details>

---

## 🔬 Technical Deep Dive

DevTrace AI is built on a **Zero-Backend Architecture**. PowerSync handles the sync layer, while Supabase provides Auth, Database, and serverless Edge Functions.

### WAL Replication & Sync Logic
All 11 tables are replicated via PostgreSQL Write Ahead Log (WAL) to PowerSync, which then streams them to local SQLite in the browser.

```sql
alter publication powersync add table
  profiles, projects, debug_sessions, fixes, shares,
  session_presence, session_checklist, session_chat,
  project_presence, project_activity, project_chat;
```

### Read vs Write Paths
- **Reads**: 100% of reads come from local SQLite via `@powersync/react`. This ensures 0ms latency and full offline support.
- **Writes**: Most writes go through PowerSync's mutation queue (`powerSync.execute()`). 
- **Large Blobs**: AI analysis results (`JSONB`) are updated directly via `supabase.from().update()` to avoid overloading the local mutation queue, then sync back down via WAL.

---

## 🏗️ Project Architecture

```
src/
├── components/         # UI Components (Dashboard, Sessions, Projects, etc.)
├── hooks/             # PowerSync Mutations & Data Fetching
├── lib/               # Shared libraries (Supabase, PowerSync Schema, AI Clients)
├── pages/             # Main application views
└── providers/          # Context providers (PowerSync, Auth)
```

---

## 🤝 Contribution Guidelines

### Branching Strategy
- `master`: Production-ready code.
- `feature/*`: New features and enhancements.
- `fix/*`: Bug fixes.

### Pull Request Process
1. Fork the repo and create your branch from `master`.
2. Ensure your code follows the existing style and passes linting.
3. Update documentation (like this file) if you change any setup steps.
4. Submit your PR with a clear description of the changes.

---

## ❓ FAQ

**Q: How does the offline mode work?**
A: All reads come from local SQLite. Writes are queued via `powerSync.execute()` and automatically uploaded once a connection is re-established.

**Q: Is my Groq API key safe?**
A: Yes. It is stored in Supabase Edge Function Secrets and never exposed to the client.

**Q: Do I need a custom backend?**
A: No. PowerSync handles the sync layer, and Supabase handles Auth, DB, and Edge Functions.

---
