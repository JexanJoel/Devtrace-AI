<div align="center">

<img src="https://img.shields.io/badge/🛠️-Technical_Documentation-4f46e5?style=for-the-badge&labelColor=1e1b4b&color=4f46e5" height="36"/>

## DevTrace AI Technical Manual
**Architecture, Contribution, and Zero-Backend Deep Dive.**

---

</div>

## 📌 Introduction

First off, thank you for considering contributing to DevTrace AI! This project is built for the **PowerSync AI Hackathon 2026** and pushes the boundaries of Local-First AI applications.

This document provides a comprehensive guide to our architecture, setup, and developer workflows.

---

## 🏗️ Zero-Backend Architecture

DevTrace AI is a **Zero-Backend** application. This means we do not maintain a traditional Node.js/Express server. Instead, we leverage the power of the **PowerSync + Supabase** stack.

### 🧩 The Three Layers

1.  **Storage & Auth (Supabase)**: Postgres is our source of truth. Row Level Security (RLS) handles all authorization logic directly at the database level.
2.  **Sync & Persistence (PowerSync)**: Acts as the "glue" between Postgres and the client. It replicates data via WAL and manages a local SQLite database in the browser for instant, offline-capable interactions.
3.  **Logic & AI (Supabase Edge Functions)**: All complex, high-privilege operations (like calling Groq AI or calculating Debug DNA) happen in serverless Deno Edge Functions.

### 🔄 Data Flow Lifecycle

> [!TIP]
> **Write Path**: `Client UI` -> `powerSync.execute()` -> `Local SQLite` -> `Sync Queue` -> `Supabase Postgres`.
> 
> **Read Path**: `Local SQLite` -> `useQuery()` -> `Client UI` (0ms latency, 100% offline).
> 
> **AI Path**: `Client UI` -> `Supabase Edge Function` (JWT Verified) -> `Groq API` -> `Direct Postgres Update` -> `WAL Sync` -> `Local SQLite`.

---

## 🛠️ Technical Setup

### Prerequisites
- **Node.js**: v18+
- **Supabase**: [Create a project](https://supabase.com)
- **PowerSync**: [Create an instance](https://powersync.com)
- **Groq**: [Get an API Key](https://console.groq.com)

### Step 1: Initialize
```bash
git clone https://github.com/JexanJoel/DevTrace-AI.git
cd DevTrace-AI
npm install
```

### Step 2: Database & Security
Run these schemas in your Supabase SQL Editor. They include the tables and the **RLS Policies** that enforce our security model.

<details>
<summary>📋 <b>1. Core Infrastructure (Profiles, Projects, Sessions)</b></summary>

```sql
-- Profiles: Managed via Auth Triggers
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

-- Projects: Protected by user_id RLS
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

-- RLS: Only the owner can manage, shared users can read
alter table projects enable row level security;
create policy "Owners manage projects" on projects for all using (auth.uid() = user_id);
create policy "Invitees view projects" on projects for select using (
  exists (select 1 from shares where shares.resource_id = projects.id and shares.resource_type = 'project' and shares.invitee_id = auth.uid())
);
```
</details>

<details>
<summary>👥 <b>2. Collaboration Layer (Presence, Chat, Checklist)</b></summary>

```sql
-- Session presence: Heartbeat sync
create table session_presence (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references debug_sessions on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  display_name text,
  avatar_url text,
  last_seen_at timestamp with time zone default now(),
  joined_at timestamp with time zone default now(),
  unique(session_id, user_id)
);

-- Sync Rules: Crucial for real-time collaboration without WebSockets
alter publication powersync add table session_presence, session_checklist, session_chat;
```
</details>

### Step 3: Edge Logic
Deploy the functions in `supabase/functions/`. These handle the "Brain" of DevTrace AI.
- `analyze-bug`: Communicates with Groq Llama 3.3.
- `debug-dna`: Performs complex SQL aggregations for user statistics.

> [!IMPORTANT]
> **Secrets Needed**:
> - `GROQ_API_KEY`: Your inference key.
> - `SERVICE_ROLE_KEY`: For `debug-dna` to query all profiles securely.

---

## ⚙️ PowerSync Deep Dive

### Sync Rules (Bucketing)
We use a **Dynamic Bucketing** strategy to ensure users only sync data they own or have been invited to.

```json
{
  "bucket_definitions": {
    "user_owned": {
      "parameters": "SELECT request.user_id() as user_id",
      "data": [
        "SELECT * FROM debug_sessions WHERE user_id = bucket.user_id",
        "SELECT * FROM projects WHERE user_id = bucket.user_id"
      ]
    },
    "shared_access": {
      "parameters": "SELECT resource_id FROM shares WHERE invitee_id = request.user_id()",
      "data": [
        "SELECT * FROM debug_sessions WHERE id = bucket.resource_id"
      ]
    }
  }
}
```

### Conflict Resolution
Since we use a Local-First approach, conflicts are handled via **Last Write Wins (LWW)** on the Supabase side, but PowerSync's `uploadData` function in `SupabaseConnector.ts` allows for custom retry logic and error handling.

---

## 🤝 Contribution Workflow

### Code Standards
- **Styling**: Tailwind CSS only. Use `premium` colors (`4f46e5`, `1e1b4b`).
- **State**: Use `Zustand` for UI state, `PowerSync` for data state.
- **Components**: Functional components with TypeScript interfaces.

### PR Process
1.  **Branch**: `feat/` or `fix/`.
2.  **Lint**: Ensure `npm run lint` passes.
3.  **Document**: Update this file if you change the schema.

---

## ❓ FAQ & Troubleshooting

> [!WARNING]
> **App stuck on "Syncing"?**
> Check your PowerSync connection URL and ensure your Supabase WAL publication includes all 11 tables.

**Q: Can I add another AI provider?**
A: Yes. Simply update the Supabase Edge Function `analyze-bug` to point to a different OpenAI-compatible endpoint.

---

<div align="center">
  <br/>
  <i>DevTrace AI: Building the future of collaborative debugging.</i>
</div>
