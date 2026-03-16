<div align="center">

<img src="https://img.shields.io/badge/🛠️-Technical_Documentation-4f46e5?style=for-the-badge&labelColor=1e1b4b&color=4f46e5" height="36"/>

## DevTrace AI - Contributing & Technical Manual
**Architecture, Setup, and Zero-Backend Deep Dive.**

</div>

---

## Introduction

Thank you for considering contributing to DevTrace AI! This project is built for the **PowerSync AI Hackathon 2026** and pushes the boundaries of local-first AI applications.

This document covers the full architecture, local setup, and contribution workflow.

---

## Zero-Backend Architecture

DevTrace AI maintains **no traditional Node.js/Express server**. Instead it uses the PowerSync + Supabase + Mastra stack.

### The Four Layers

1. **Storage & Auth (Supabase)** - Postgres is the source of truth. Row Level Security handles all authorization at the database level. Three Edge Functions handle server-side AI calls.
2. **Sync & Persistence (PowerSync)** - Replicates data via WAL and manages a local SQLite database in the browser. All reads are instant and offline-capable.
3. **AI Analysis (Supabase Edge Functions + Groq)** - All Groq calls happen in a JWT-verified Deno Edge Function. The API key never reaches the browser.
4. **AI Agents (Mastra Cloud)** - Two specialized agents (Session Debugger, Project Analyzer) deployed to Mastra Cloud, called via a second JWT-verified Edge Function proxy.

### Data Flow Lifecycle

> **Write Path:** `Client UI` → `powerSync.execute()` → `Local SQLite` → `Sync Queue` → `Supabase Postgres`
>
> **Read Path:** `Local SQLite` → `useQuery()` → `Client UI` (0ms latency, 100% offline)
>
> **AI Path:** `Client UI` → `Supabase Edge Function` (JWT verified) → `Groq API` → `Direct Postgres Update` → `WAL Sync` → `Local SQLite`
>
> **Mastra Path:** `Client UI` → `mastra-agent Edge Function` (JWT verified) → `Mastra Cloud` → `Agent response` → `Client UI`
>
> **Embedding Path:** `Error message` → `transformers.js in browser` → `384-dim vector` → `powerSync.execute()` → `Local SQLite` → `WAL sync`

---

## Prerequisites

- **Node.js** v18+
- **Supabase** account - [supabase.com](https://supabase.com), free tier works
- **PowerSync** account - [powersync.com](https://www.powersync.com), free tier works
- **Groq** API key - [console.groq.com](https://console.groq.com), free
- **Mastra Cloud** account - [cloud.mastra.ai](https://cloud.mastra.ai), free tier works

---

## Step 1 - Clone and Install

```bash
git clone https://github.com/JexanJoel/DevTrace-AI.git
cd DevTrace-AI
npm install
```

---

## Step 2 - Supabase Setup

**2a.** Create a new project at [supabase.com](https://supabase.com)

**2b.** Go to **SQL Editor** and run the schemas below in order:

<details>
<summary><b>📋 Schema 1 - Base (profiles, projects, sessions, fixes, shares)</b></summary>

```sql
-- Profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text, email text, github_username text,
  github_connected boolean default false, avatar_url text,
  onboarded boolean default false, dark_mode boolean default false,
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
create policy "Users can view own profile"      on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"    on profiles for update using (auth.uid() = id);
create policy "Users can look up other profiles" on profiles for select using (true);

-- Projects
create table projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  name text not null, description text, language text, github_url text,
  error_count int default 0, session_count int default 0,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);
alter table projects enable row level security;
create policy "Users can view own projects"     on projects for select using (auth.uid() = user_id);
create policy "Users can create projects"       on projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects"   on projects for update using (auth.uid() = user_id);
create policy "Users can delete own projects"   on projects for delete using (auth.uid() = user_id);
create policy "Shared project viewers can read" on projects for select using (
  exists (select 1 from shares where shares.resource_id = projects.id and shares.resource_type = 'project' and shares.invitee_id = auth.uid())
);

-- Debug Sessions
create table debug_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  project_id uuid references projects on delete cascade,
  title text not null, error_message text, stack_trace text,
  code_snippet text, expected_behavior text,
  environment text default 'development', severity text default 'medium',
  status text default 'open', ai_fix text, ai_analysis jsonb,
  notes text, error_embedding text,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);
alter table debug_sessions enable row level security;
create policy "Users can view own sessions"     on debug_sessions for select using (auth.uid() = user_id);
create policy "Users can create sessions"       on debug_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own sessions"   on debug_sessions for update using (auth.uid() = user_id);
create policy "Users can delete own sessions"   on debug_sessions for delete using (auth.uid() = user_id);
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
  title text not null, error_pattern text, fix_content text not null,
  language text, tags text[], use_count int default 0,
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
  resource_id uuid not null, created_at timestamptz default now(),
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
<summary><b>👥 Schema 2 - Session Collaboration</b></summary>

```sql
create table if not exists session_presence (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references debug_sessions on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  display_name text, avatar_url text,
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

create table if not exists session_checklist (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references debug_sessions on delete cascade not null,
  item_index integer not null,
  checked boolean default false,
  checked_by uuid references auth.users on delete set null,
  checked_by_name text, checked_at timestamp with time zone,
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

create table if not exists session_chat (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references debug_sessions on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  display_name text, avatar_url text, message text not null,
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
<summary><b>📋 Schema 3 - Project Collaboration</b></summary>

```sql
create table if not exists project_presence (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  display_name text, avatar_url text,
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

create table if not exists project_activity (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  display_name text, avatar_url text,
  event_type text not null,
  session_id uuid references debug_sessions on delete cascade,
  session_title text, metadata jsonb,
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

create table if not exists project_chat (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  display_name text, avatar_url text, message text not null,
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

<details>
<summary><b>🔒 Schema 4 - Rate Limiting</b></summary>

```sql
create table if not exists rate_limits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  action text not null default 'unknown',
  created_at timestamp with time zone default now()
);

create index if not exists rate_limits_user_created
  on rate_limits (user_id, created_at desc);

alter table rate_limits enable row level security;
create policy "Users can view own rate limits"
  on rate_limits for select using (auth.uid() = user_id);
```
</details>

**2c.** Go to **Authentication → URL Configuration** and set your site and redirect URLs.

**2d.** Go to **Authentication → Providers** → enable **GitHub** and **Google**.

**2e.** Go to **Storage** → create a bucket called `avatars` → set to **public**.

**2f.** Deploy Edge Functions:
```bash
supabase functions deploy analyze-bug
supabase functions deploy debug-dna
supabase functions deploy mastra-agent
```

**2g.** Add secrets - go to **Supabase → Settings → Edge Functions → Secrets**:
```
GROQ_API_KEY           = your Groq API key
SERVICE_ROLE_KEY       = your Supabase service role key
MASTRA_API_KEY         = your Mastra Cloud API key
MASTRA_BASE_URL        = https://full-thousands-yottabyte.mastra.cloud
```

---

## Step 3 - PowerSync Setup

**3a.** Create account at [powersync.com](https://www.powersync.com)

**3b.** Connect to your Supabase Postgres URI

**3c.** Paste the full sync rules - **5 bucket definitions** - from `POWERSYNC_SYNC_RULES.json` in the repo

**3d.** Deploy and copy your PowerSync instance URL

---

## Step 4 - Mastra Setup

**4a.** Create account at [cloud.mastra.ai](https://cloud.mastra.ai)

**4b.** The agents are already defined in `src/mastra/agents/project-agents.ts` and deployed via GitHub push

**4c.** In Mastra Cloud dashboard, add environment variables:
```
SUPABASE_URL              = your Supabase project URL
SUPABASE_SERVICE_ROLE_KEY = your Supabase service role key
```

**4d.** Get your Mastra API key: Mastra Cloud → your team → **Settings → API Keys** → create a new key

**4e.** Add `MASTRA_API_KEY` and `MASTRA_BASE_URL` to Supabase Secrets (Step 2g above)

---

## Step 5 - Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_POWERSYNC_URL=https://your-instance.powersync.journeyapps.com
```

> No `VITE_GROQ_API_KEY`, `VITE_MASTRA_API_KEY`, or any other server key needed in the `.env` - all sensitive keys live in Supabase Edge Function Secrets.

---

## Step 6 - Run

```bash
npm run dev
# → http://localhost:5173
```

---

## Project Structure

```
src/
├── components/
│   ├── dashboard/          # DashboardLayout, Sidebar, TopBar
│   ├── sessions/           # AIDebugPanel, SimilarSessionsCard, CollaborationBanner,
│   │                       # CollaborativeChecklist, SessionChat, MastraAgentPanel,
│   │                       # OfflineAssistCard, CreateSessionModal, StatusBadge
│   ├── projects/           # ProjectCard, CreateProjectModal, ProjectActivityFeed,
│   │                       # ProjectChat, MastraProjectPanel
│   ├── profile/            # AvatarUpload
│   ├── shared/             # ProtectedRoute, OfflineBanner, ShareModal
│   └── providers/          # PowerSyncProvider
│
├── hooks/
│   ├── useSessions.ts           # PowerSync mutations + reads + activity logging + embeddings
│   ├── useProjects.ts           # PowerSync reads + Supabase writes
│   ├── useFixes.ts              # PowerSync mutations + reads
│   ├── useCollaboration.ts      # Session presence, shared checklist, session chat
│   ├── useProjectCollaboration.ts  # Project presence, activity feed, project chat
│   ├── useMastraAgent.ts        # Calls mastra-agent Edge Function
│   ├── useEmbeddings.ts         # transformers.js - on-device semantic embeddings
│   ├── useOfflineMemory.ts      # Offline AI synthesis from local SQLite
│   ├── useProfile.ts            # PowerSync reads + Supabase writes
│   ├── useShares.ts             # Share creation, revocation, lookup
│   ├── useDebugDNA.ts           # Calls debug-dna Edge Function
│   ├── useDashboardStats.ts
│   └── useOnlineStatus.ts
│
├── lib/
│   ├── groqClient.ts        # Calls analyze-bug Edge Function (no client-side API key)
│   ├── SupabaseConnector.ts # PowerSync connector - uploadData handles crud queue
│   ├── projectHealth.ts     # Health score formula (pure client-side)
│   ├── supabaseClient.ts
│   └── powersync.ts         # Schema (11 tables) + PowerSyncDatabase singleton
│
├── mastra/
│   └── agents/
│       ├── project-agents.ts  # Session Debugger + Project Analyzer agent definitions
│       └── project-tools.ts   # searchLogsTool, readFileTool, listDirectoryTool
│
└── pages/
    ├── ProjectDetailPage.tsx     # Project collab - presence, activity tab, Mastra analysis
    ├── SharedProjectView.tsx     # Collaboration-enabled shared project view
    ├── SessionDetailPage.tsx     # Session collab - presence, checklist, Mastra deep analysis
    ├── SharedSessionView.tsx     # Collaboration-enabled shared session view
    └── ... (other pages)

supabase/
└── functions/
    ├── analyze-bug/index.ts    # analyzeSession, sendFollowUp, analyzeLogs, analyzeStructure + rate limiting
    ├── debug-dna/index.ts      # SQL aggregations + Groq narrative
    └── mastra-agent/index.ts   # JWT-verified proxy to Mastra Cloud agents
```

---

## Branching Strategy

- `master` - production-ready code
- `feature/*` - new features
- `fix/*` - bug fixes

## PR Process

1. Fork the repo and create your branch from `master`
2. Ensure `npm run lint` passes
3. Update this document if you change any setup steps
4. Submit PR with a clear description of what changed and why

---

## Troubleshooting

**App stuck on "Syncing"?**
Check your PowerSync connection URL and ensure your Supabase WAL publication includes all 11 tables. Run `SELECT tablename FROM pg_publication_tables WHERE pubname = 'powersync'` in Supabase SQL Editor to verify.

**Groq analysis not working?**
Check that `GROQ_API_KEY` and `SERVICE_ROLE_KEY` are set in Supabase Edge Function Secrets. Verify the `analyze-bug` function is deployed and shows green status in the Supabase dashboard.

**Mastra agents returning errors?**
Check that `MASTRA_API_KEY` and `MASTRA_BASE_URL` are set in Supabase Secrets. Verify the `mastra-agent` function is deployed. Check Mastra Cloud → Logs to see if requests are arriving.

**Rate limit hit?**
The `analyze-bug` function allows 20 AI requests per user per hour. Clear rows in the `rate_limits` table in Supabase SQL Editor to reset during development: `delete from rate_limits where user_id = 'your-user-id';`

**Embeddings not generating?**
The first run downloads the `Xenova/all-MiniLM-L6-v2` model from Hugging Face (~25MB). This is cached in the browser after the first download. Ensure the user has an internet connection for the initial model download.

**Can I add another AI provider?**
Yes. Update `supabase/functions/analyze-bug/index.ts` to call any OpenAI-compatible endpoint. The prompt structure and response parsing remain the same.

---

<div align="center">
  <br/>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge"/></a>
  <br/><br/>
  <i>DevTrace AI - Building the future of collaborative debugging.</i>
</div>