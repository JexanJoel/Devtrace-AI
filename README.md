<div align="center">

<br/>

<img src="https://img.shields.io/badge/⌨️-DevTrace_AI-4f46e5?style=for-the-badge&labelColor=1e1b4b&color=4f46e5" height="36"/>

<h2>AI-powered debugging assistant for developers</h2>

<p>Log errors → get full AI analysis → save fixes → ship faster.<br/>Works completely offline. Powered by Groq + Supabase + PowerSync.</p>

<br/>

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-4f46e5?style=for-the-badge&logoColor=white)](https://dev-trace-ai.vercel.app)
&nbsp;
[![GitHub Repo](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/JexanJoel/DevTrace-AI)
&nbsp;
[![MIT License](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)](LICENSE)
&nbsp;
[![PowerSync Hackathon](https://img.shields.io/badge/PowerSync_AI_Hackathon_2026-6366f1?style=for-the-badge)](https://www.powersync.com/)

<br/><br/>

</div>

---

## What is DevTrace AI?

DevTrace AI is a **local-first debugging assistant** built for React, TypeScript, and Supabase developers.

Instead of Googling your error or copy-pasting it into ChatGPT and losing the context forever, DevTrace AI gives every bug a **permanent, structured record** with full AI analysis attached — root cause, 3 fix options with code, a crash timeline, an interactive checklist, follow-up chat, test cases, and more.

Everything is saved. Everything is searchable. Everything works **even when you're offline.**

**The core problem it solves:** Debugging is slow and scattered. You repeat the same mistakes, forget what fixed what, and lose context every time you close a tab. DevTrace AI is your permanent debugging memory.

<br/>

<div align="center">

| | |
|:--|:--|
| 🐛 | **Log bugs** with stack traces, code snippets, severity, and environment |
| 🤖 | **Full AI analysis** — root cause, 3 fixes, timeline, checklist, and more |
| 💬 | **Follow-up chat** — ask the AI questions about your exact bug |
| 📚 | **Fix Library** — save what works, reuse it across projects |
| 📶 | **Offline-first** — create, browse, and debug without internet |

</div>

---

## How It Works

The flow is simple:

```
1. You paste an error          →  Log a debug session (error, stack trace, code, severity)
2. Click "Analyze Bug"         →  Groq + Llama 3.3 70B returns a full structured analysis
3. Read the 8-tab breakdown    →  Overview, Fixes, Timeline, Checklist, Chat, Tests, Logs, Structure
4. Save what worked            →  Fix goes to your Fix Library, tagged and searchable forever
```

### Read vs Write — the data flow

All **reads** come from a local SQLite database (PowerSync). Zero network latency — instant.

All **writes** go directly to Supabase Postgres. PowerSync detects the change and syncs it back down.

```
WRITE  →  supabase.from('table').insert()  →  Supabase Postgres
                                                      │
                                              PowerSync WAL listener
                                                      │
READ   ←  useQuery() from @powersync/react  ←  Local SQLite  (0ms, no spinner)
```

Offline? Writes go into a queue in `localStorage`. The moment you reconnect, they flush to Supabase automatically.

---

## The AI Debug Panel — 8 Tabs Per Bug

Every session gets a full structured breakdown powered by **Groq + Llama 3.3 70B**. The complete analysis is saved as JSONB in Supabase — persists across reloads, no re-analyzing needed.

| Tab | What you get |
|:---|:---|
| 🔍 **Overview** | Plain English explanation, root cause, symptom vs cause, category badge, confidence score, files to check |
| ⚡ **Fixes** | 3 options — quick patch, proper fix, workaround — each with full code, pros/cons, and a recommended pick |
| 🕐 **Timeline** | Visual step-by-step of how the crash happened from component mount to error throw |
| ✅ **Checklist** | Interactive priority-ranked action list — check items off as you debug |
| 💬 **Follow-up** | Context-aware AI chat — click suggested questions or type your own |
| 🧪 **Tests** | AI-generated reproduction steps and test cases to verify the fix works |
| 📋 **Logs** | Paste raw console or server logs — AI strips noise and surfaces what matters |
| 🏗️ **Structure** | Paste your file tree — AI reviews architecture and flags problems |

---

## How DevTrace AI Uses Supabase

Supabase is the **source of truth and auth backbone** for the entire app. All data lives here, all auth flows through here, and PowerSync replicates from here via WAL.

### 🔐 Authentication

| Method | Implementation |
|:---|:---|
| Email + Password | `supabase.auth.signInWithPassword()` |
| GitHub OAuth | `signInWithOAuth({ provider: 'github' })` |
| Google OAuth | `signInWithOAuth({ provider: 'google' })` |
| Password Reset | `resetPasswordForEmail()` → branded magic link email → `/reset-password` → `updateUser({ password })` |
| GitHub Linking | `linkIdentity({ provider: 'github' })` → `/auth/callback` → username saved to `profiles` |
| Session sync | `onAuthStateChange()` keeps Zustand `authStore` live across all tabs |

> Zero custom auth code — Supabase handles all tokens, refresh, and session persistence.

---

### 🗄️ Database — Postgres + RLS

Every table has Row Level Security enabled. Users can only ever read and write **their own rows** — enforced at the database level, not in application code.

| Table | Columns |
|:---|:---|
| `profiles` | `name` · `avatar_url` · `github_username` · `github_connected` · `dark_mode` |
| `projects` | `name` · `description` · `language` · `github_url` · `session_count` · `error_count` |
| `debug_sessions` | `error_message` · `stack_trace` · `code_snippet` · `severity` · `status` · `ai_analysis` (JSONB) · `notes` |
| `fixes` | `title` · `fix_content` · `language` · `tags[]` · `use_count` · `session_id` · `project_id` |

Each table has 4 RLS policies: `SELECT` · `INSERT` · `UPDATE` · `DELETE` — all checking `auth.uid() = user_id`.

> 💡 The full 8-tab AI breakdown is stored as a single `ai_analysis` JSONB column — no extra tables, loads instantly on revisit, and syncs through PowerSync like any other column.

---

### 🗃️ Storage

Profile avatars are stored in a public Supabase Storage bucket called `avatars`, organized per user:

```
avatars/
└── {user_id}/
    └── avatar.ext   ← URL cache-busted with ?t={timestamp} on every upload
```

---

### 🔗 WAL Replication → PowerSync

A single Postgres publication called `powersync` is what connects Supabase to PowerSync:

```sql
create publication powersync
  for table profiles, projects, debug_sessions, fixes;
```

PowerSync listens to this WAL stream and streams every change down to connected browser clients in real time.

---

## How DevTrace AI Uses PowerSync

PowerSync is the **offline engine**. It maintains a local SQLite database in the browser that the React app reads from directly — no network request, no loading spinner, no internet required.

### 📖 Read path — always instant

Every list, detail page, dashboard, and analytics view reads from local SQLite:

```typescript
// Zero network — hits local SQLite directly
const { data: sessions } = useQuery(
  'SELECT * FROM debug_sessions WHERE user_id = ? ORDER BY created_at DESC',
  [userId]
);
```

This pattern is used in every data hook: `useSessions.ts`, `useProjects.ts`, `useFixes.ts`, `useProfile.ts`.

---

### ✍️ Write path — Supabase first, PowerSync syncs back

```typescript
// Write goes to Supabase — PowerSync detects via WAL and syncs down automatically
await supabase.from('debug_sessions').insert({ ...newSession });
```

```
supabase.insert()  →  Supabase Postgres  →  WAL publication
                                                   ↓
                                        PowerSync Instance
                                                   ↓
                                          Local SQLite updated
                                                   ↓
                                       useQuery() reflects change
```

---

### 🟢 Online vs 🟠 Offline

| State | What happens |
|:---|:---|
| 🟢 App opens online | PowerSync connects and streams latest changes from Supabase |
| 🟢 User reads data | `useQuery()` returns from local SQLite — instant, 0ms |
| 🟢 User creates a session | `supabase.insert()` → WAL → PowerSync → SQLite updated |
| 🟠 Internet drops | Orange banner appears — all existing data still fully readable |
| 🟠 User creates offline | Saved to SQLite + queued in `localStorage` |
| 🟢 Internet returns | Queue flushes to Supabase, PowerSync syncs delta back down |

---

### ⚙️ Sync rules

```yaml
bucket_definitions:
  user_data:
    parameters: SELECT request.user_id() as user_id
    data:
      - SELECT * FROM profiles       WHERE id = bucket.user_id
      - SELECT * FROM projects       WHERE user_id = bucket.user_id
      - SELECT * FROM debug_sessions WHERE user_id = bucket.user_id
      - SELECT * FROM fixes          WHERE user_id = bucket.user_id
```

Each user only receives their own rows — data isolation enforced at the sync layer on top of RLS.

---

### 📊 Live Sync Status page

DevTrace AI ships a dedicated `/sync-status` page showing the full architecture, live SQLite row counts per table, recent sync events, and the pending write queue — all updating in real time as you use the app.

---

## Full Feature List

### 🐛 Debugging

| Feature | What it does |
|:---|:---|
| **Session Tracking** | Log errors with stack trace, code snippet, expected behavior, environment, and severity (critical / high / medium / low) |
| **AI Debug Panel** | 8-tab full breakdown — every bug analyzed by Groq + Llama 3.3 70B, saved permanently as JSONB |
| **Follow-up Chat** | Context-aware AI chat inside every session — click suggested questions or type your own |
| **Fix Library** | Save working fixes, filter by language, copy in one click, track use count across projects |

### 📁 Organization

| Feature | What it does |
|:---|:---|
| **Projects** | Group debug sessions by project, link GitHub repos, track session and error counts |
| **Project Health Score** | 0–100 score — deducted for open critical/high issues, inactivity, and low resolution rate |
| **Session Streak** | Tracks consecutive debug days — badge upgrades white → yellow → fiery 🔥 at 7+ days |
| **GitHub Connect** | Link your GitHub account from Profile — avatar, username, and disconnect in one place |

### 📊 Insights & Analytics

| Feature | What it does |
|:---|:---|
| **Analytics Page** | Resolution rates, error trends, severity breakdowns, time-to-fix — visualized with Recharts |
| **AI Insights Page** | Category breakdown across all sessions, confidence distribution, most flagged files |
| **Sync Status Page** | Live architecture diagram, SQLite row counts, sync event log, write queue — all real-time |

### 🔐 Auth & Profile

| Feature | What it does |
|:---|:---|
| **Email + Password** | Sign up / log in with email — branded magic link password reset included |
| **GitHub & Google OAuth** | One-click social sign in via Supabase Auth |
| **GitHub Linking** | `linkIdentity()` from Profile page — username auto-read from OAuth identity metadata |
| **Avatar Upload** | Profile picture stored in Supabase Storage with per-user bucket paths |

### 📶 Offline & Sync

| Feature | What it does |
|:---|:---|
| **Offline-First Reads** | All data reads from local SQLite via PowerSync — zero spinners, zero network dependency |
| **Offline Write Queue** | Create sessions and projects offline — auto-synced to Supabase on reconnect |
| **Real-Time Sync** | PowerSync streams Supabase WAL changes to local SQLite instantly when online |
| **Offline Banner** | Orange banner with pending write count shown whenever you're disconnected |

### 🎨 UX

| Feature | What it does |
|:---|:---|
| **Dark Mode** | Full dark theme saved to your profile and applied globally |
| **Mobile Responsive** | Collapsible sidebar, all pages fully usable on phones and tablets |
| **Toast Notifications** | Non-intrusive feedback for every action — success, error, and info states |

---

## Tech Stack

<div align="center">

| | Technology | Role |
|:---:|:---|:---|
| ⚛️ | **React 18 + TypeScript + Vite** | Frontend framework + type safety + build tool |
| 🎨 | **Tailwind CSS** | Utility-first styling + dark mode |
| 🐻 | **Zustand** | Lightweight global state (auth, sync queue) |
| 🟢 | **Supabase** | Postgres database · Auth · Storage · RLS · WAL replication |
| ⚡ | **PowerSync** | Local SQLite sync · offline reads · real-time streaming |
| 🤖 | **Groq + Llama 3.3 70B** | Ultra-fast AI inference for debug analysis |
| 📊 | **Recharts** | Analytics charts and data visualization |
| 🚀 | **Vercel** | Zero-config deployment + preview URLs |

</div>

<br/>

<div align="center">

![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![PowerSync](https://img.shields.io/badge/PowerSync-6366F1?style=flat-square&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_AI-F55036?style=flat-square&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

</div>

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) account — free tier works
- [Groq](https://console.groq.com) API key — free
- [PowerSync](https://www.powersync.com) account — free tier works

---

### Step 1 — Clone and install

```bash
git clone https://github.com/JexanJoel/DevTrace-AI.git
cd DevTrace-AI
npm install
```

---

### Step 2 — Supabase setup

**2a.** Create a new project at [supabase.com](https://supabase.com)

**2b.** Go to **SQL Editor** and run the full schema:

<details>
<summary>📋 Click to expand — full SQL schema</summary>

```sql
-- Profiles (auto-created on signup via trigger)
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

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

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

-- updated_at triggers
create or replace function update_updated_at() returns trigger as $$
begin new.updated_at = timezone('utc', now()); return new; end;
$$ language plpgsql;
create trigger projects_updated_at before update on projects
  for each row execute procedure update_updated_at();
create trigger sessions_updated_at before update on debug_sessions
  for each row execute procedure update_updated_at();

-- PowerSync WAL publication (required)
create publication powersync for table profiles, projects, debug_sessions, fixes;
```

</details>

**2c.** Go to **Authentication → URL Configuration** and set:

```
Site URL:      https://your-app.vercel.app
Redirect URLs: https://your-app.vercel.app/reset-password
               https://your-app.vercel.app/auth/callback
               https://your-app.vercel.app/dashboard
               http://localhost:5173/reset-password
               http://localhost:5173/auth/callback
               http://localhost:5173/dashboard
```

**2d.** Go to **Authentication → Providers** → enable **GitHub** and **Google**

**2e.** Go to **Storage** → create a bucket called `avatars` → set to **public**

---

### Step 3 — PowerSync setup

**3a.** Create a free account at [powersync.com](https://www.powersync.com)

**3b.** Create a new instance → connect it to your Supabase project using the **direct Postgres connection URI** (found in Supabase → Settings → Database → Connection string → URI)

**3c.** In the **Sync Rules** editor, paste:

```yaml
bucket_definitions:
  user_data:
    parameters: SELECT request.user_id() as user_id
    data:
      - SELECT * FROM profiles WHERE id = bucket.user_id
      - SELECT * FROM projects WHERE user_id = bucket.user_id
      - SELECT * FROM debug_sessions WHERE user_id = bucket.user_id
      - SELECT * FROM fixes WHERE user_id = bucket.user_id
```

**3d.** Click **Deploy** → copy your **PowerSync instance URL**

---

### Step 4 — Environment variables

Create `.env` in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
VITE_POWERSYNC_URL=https://your-instance.powersync.journeyapps.com
```

---

### Step 5 — Run

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
│   ├── sessions/           # AIDebugPanel (8 tabs), CreateSessionModal, StatusBadge
│   ├── projects/           # ProjectCard (with health score), CreateProjectModal
│   ├── profile/            # AvatarUpload
│   ├── providers/          # PowerSyncProvider
│   └── shared/             # ProtectedRoute, OfflineBanner
│
├── hooks/
│   ├── useSessions.ts      # PowerSync reads + Supabase writes
│   ├── useProjects.ts      # PowerSync reads + Supabase writes
│   ├── useFixes.ts         # PowerSync reads + Supabase writes
│   ├── useProfile.ts       # PowerSync reads + Supabase writes
│   ├── useDashboardStats.ts
│   ├── usePendingQueue.ts  # Offline write queue (localStorage → Supabase)
│   └── useOnlineStatus.ts  # Network detection
│
├── lib/
│   ├── groqClient.ts       # analyzeSession, sendFollowUp, analyzeLogs, analyzeStructure
│   ├── projectHealth.ts    # Health score formula (pure client-side, no API calls)
│   ├── supabaseClient.ts
│   └── powersync.ts        # Schema + PowerSyncDatabase singleton
│
├── pages/
│   ├── DashboardPage.tsx       # Stats overview + session streak
│   ├── ProjectsPage.tsx
│   ├── ProjectDetailPage.tsx   # Per-project stats + health score
│   ├── SessionsPage.tsx
│   ├── SessionDetailPage.tsx   # AI Debug Panel — all 8 tabs live here
│   ├── FixLibraryPage.tsx
│   ├── AnalyticsPage.tsx
│   ├── AIInsightsPage.tsx      # AI usage stats + category breakdown
│   ├── SyncStatusPage.tsx      # Live PowerSync architecture view
│   ├── ProfilePage.tsx         # Avatar, GitHub connect/disconnect
│   ├── SettingsPage.tsx
│   ├── LoginPage.tsx           # Email + GitHub + Google + forgot password link
│   ├── RegisterPage.tsx
│   ├── ForgotPasswordPage.tsx  # Send magic link reset email
│   ├── ResetPasswordPage.tsx   # Set new password after clicking link
│   └── GitHubCallbackPage.tsx  # OAuth callback — reads identity, saves to profile
│
└── store/
    ├── authStore.ts
    └── useSyncQueue.ts     # Global sync queue (Zustand)
```

---

## FAQ

<details>
<summary><b>Is it free to run?</b></summary>
<br/>
Yes. Groq, Supabase, and PowerSync all have generous free tiers. You can self-host DevTrace AI at zero cost.
</details>

<details>
<summary><b>Is my data private?</b></summary>
<br/>
Yes. All data lives in your own Supabase project. Row Level Security is enforced on every table at the database level — no one else can read your sessions, projects, or fixes, including the repo owner.
</details>

<details>
<summary><b>Does offline mode really work?</b></summary>
<br/>
Yes. PowerSync syncs all your data to a local SQLite database in the browser on first load. After that, reads are instant with zero network dependency. New sessions and fixes created offline are saved locally and automatically uploaded when you reconnect.
</details>

<details>
<summary><b>What exactly does the AI return?</b></summary>
<br/>
A structured JSON analysis with: plain English summary, root cause, symptom vs cause, issue category, confidence score (0–100), 3 fix options with full code blocks, a crash timeline, an interactive checklist, suggested follow-up questions, reproduction steps, and test cases. Saved as JSONB so it persists across reloads.
</details>

<details>
<summary><b>Can I swap the AI model?</b></summary>
<br/>
Yes. Change the model string in <code>src/lib/groqClient.ts</code>. Any Groq-hosted model works — replace <code>llama-3.3-70b-versatile</code> with your preferred model ID.
</details>

<details>
<summary><b>Do I need a backend server?</b></summary>
<br/>
No. DevTrace AI is fully client-side. Supabase handles auth, database, and storage. PowerSync handles sync. Groq is called directly from the browser. No Express server or Node.js backend required.
</details>

---

## Contributing

Contributions, issues, and feature requests are welcome.

```bash
# 1. Fork the repo on GitHub

# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes and commit
git commit -m 'feat: add your feature'

# 4. Push to your fork
git push origin feature/your-feature-name

# 5. Open a Pull Request
```

Please open an issue first for large changes so we can align on approach before you invest time building it.

---

## Hackathon

DevTrace AI is submitted to the **PowerSync AI Hackathon 2026**.

| Prize | Why this qualifies |
|:---|:---|
| 🥇 **Core Prize** | AI-powered developer tool built within the hackathon window using PowerSync as the core sync layer |
| 🏅 **Best Submission Using Supabase** | Supabase drives auth (Email · GitHub · Google OAuth · magic link password reset · GitHub account linking), Postgres with RLS on all tables, Storage for avatars, and WAL replication feeding PowerSync |
| 🏅 **Best Local-First App** | All reads from local SQLite via PowerSync's `useQuery()`, offline write queue with auto-sync on reconnect, and a live Sync Status page showing the full architecture and queue state in real time |

---

## License

MIT — free to use, fork, and build on.

---

<div align="center">

<br/>

Built for the **PowerSync AI Hackathon 2026** by [JexanJoel](https://github.com/JexanJoel)

<br/>

[![Live Demo](https://img.shields.io/badge/🚀%20Try%20it%20live-4f46e5?style=for-the-badge)](https://dev-trace-ai.vercel.app)
&nbsp;
[![Report Bug](https://img.shields.io/badge/🐛%20Report%20Bug-dc2626?style=for-the-badge)](https://github.com/JexanJoel/DevTrace-AI/issues)
&nbsp;
[![Request Feature](https://img.shields.io/badge/✨%20Request%20Feature-16a34a?style=for-the-badge)](https://github.com/JexanJoel/DevTrace-AI/issues)

<br/>

</div>