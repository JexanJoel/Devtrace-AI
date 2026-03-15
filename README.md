<div align="center">

<br/>

<img src="https://img.shields.io/badge/⌨️-DevTrace_AI-4f46e5?style=for-the-badge&labelColor=1e1b4b&color=4f46e5" height="36"/>

<h2>AI powered debugging assistant for developers</h2>

<br/>

<table><tr>
<td align="center"><a href="https://dev-trace-ai.vercel.app"><img src="https://img.shields.io/badge/🚀%20Live%20Demo-4f46e5?style=for-the-badge&logoColor=white"/></a></td>
<td align="center"><a href="https://github.com/JexanJoel/DevTrace-AI"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white"/></a></td>
<td align="center"><a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge"/></a></td>
<td align="center"><a href="https://www.powersync.com/"><img src="https://img.shields.io/badge/PowerSync_AI_Hackathon_2026-6366f1?style=for-the-badge"/></a></td>
<td align="center"><a href="https://github.com/sponsors/JexanJoel"><img src="https://img.shields.io/badge/💖%20Sponsor%20Me-e11d48?style=for-the-badge"/></a></td>
</tr></table>

<br/><br/>

</div>

---

## What is DevTrace AI?

DevTrace AI is your **permanent debugging memory** - log bugs, get instant AI analysis, save what works, and share with teammates. Works offline. Remembers everything.

<div align="center">

| | |
|:--|:--|
| 🔍 | Every bug gets a permanent structured record |
| 🤖 | Full AI breakdown - root cause, fixes, timeline |
| 🧬 | Debug DNA - your personal error fingerprint |
| 🔁 | Similar Sessions - instantly finds bugs you've seen before |
| 💾 | Saved as JSONB - persists across reloads |
| 📶 | Fully offline via PowerSync local SQLite |
| 🔗 | Share projects and sessions with teammates |

</div>

**The core problem it solves:** Debugging is slow and scattered. You repeat the same mistakes, forget what fixed what, and lose context every time you close a tab. DevTrace AI is your permanent debugging memory.

---

## How It Works

```
1. You paste an error          ->  Log a debug session (error, stack trace, code, severity)
2. Click "Analyze Bug"         ->  Groq + Llama 3.3 70B returns a full structured analysis
3. Read the 8 tab breakdown    ->  Overview, Fixes, Timeline, Checklist, Chat, Tests, Logs, Structure
4. See similar past bugs       ->  "You've seen this before" card queries local SQLite instantly
5. Save what worked            ->  Fix goes to your Fix Library, tagged and searchable forever
6. Share with a teammate       ->  They get read-only access via Shared with Me page
7. Generate your Debug DNA     ->  Supabase Edge Function analyzes your patterns + Groq writes your fingerprint
```

### Read vs Write - the data flow

All **reads** come from a local SQLite database (PowerSync). Zero network latency - instant.

All **writes** go through PowerSync's mutation queue - written to local SQLite first, then uploaded to Supabase automatically. Large blobs like `ai_analysis` bypass the mutation queue and go direct to Supabase, then sync back down via WAL.

```
WRITE (small fields)  ->  powerSync.execute()  ->  Local SQLite  ->  PowerSync uploads  ->  Supabase Postgres
                                                                                                 |
WRITE (ai_analysis)   ->  supabase.update()    ->  Supabase Postgres                            |
                                                        |                                        |
                                                PowerSync WAL listener <-----------------------  |
                                                        |
READ  <-  useQuery() from @powersync/react  <-  Local SQLite  (0ms, no spinner)
```

Offline? `powerSync.execute()` writes to local SQLite and queues the upload automatically. The moment you reconnect, PowerSync flushes the queue to Supabase with no extra code needed.

---

## The AI Debug Panel - 8 Tabs Per Bug

Every session gets a full structured breakdown powered by **Groq + Llama 3.3 70B** - called server-side via a Supabase Edge Function. The Groq API key is never exposed to the browser. The complete analysis is saved as JSONB in Supabase - persists across reloads, no re-analyzing needed.

- 🔍 **Overview** - Plain English explanation, root cause, symptom vs cause, category badge, confidence score, files to check
- ⚡ **Fixes** - 3 options (quick patch, proper fix, workaround) each with full code & pros/cons
- 🕐 **Timeline** - Visual step-by-step of how the crash happened from component mount to error throw
- ✅ **Checklist** - Interactive priority-ranked action list - check items off as you debug
- 💬 **Followup** - Context-aware AI chat - click suggested questions or type your own
- 🧪 **Tests** - AI-generated reproduction steps and test cases to verify the fix works
- 📋 **Logs** - Paste raw console or server logs - AI strips noise and surfaces what matters
- 🏗️ **Structure** - Paste your file tree - AI reviews architecture and flags problems

---

## Similar Sessions - You've Seen This Before

When you open a debug session, DevTrace AI automatically searches your entire debug history for similar bugs - **without any network request**. It queries local SQLite directly via PowerSync, so results appear instantly even offline.

```
Open a session with an error message
         |
SimilarSessionsCard extracts meaningful tokens
(strips noise: "cannot", "undefined", "error", etc.)
         |
powerSync.getAll() queries local SQLite - zero network
         |
Each past session scored by keyword overlap
         |
Sessions with 2+ matching keywords surfaced
         |
"You've seen this before" card appears with top 3 matches
         |
Click any match -> navigate to that session to see how you fixed it
```

**Why this matters:** The tool gets smarter the more you use it. After logging 10-20 sessions, recurring error patterns start surfacing automatically - before you even click Analyze. If you resolved a similar bug before, you can reference that session immediately instead of starting from scratch.

**What it shows per match:**
- Session title and error message preview
- Severity badge and resolution status (green checkmark if resolved)
- How long ago the bug occurred
- Keyword match count badge (e.g. "4 keywords match")

The card is invisible when there are no matches - it never shows empty state noise.

---

## Debug DNA - Your Personal Error Fingerprint

DevTrace AI builds a **personalized analysis of your debugging patterns** using a Supabase Edge Function + Groq.

Click **"Generate My DNA"** on the Debug DNA page and the Edge Function:

1. Queries your `debug_sessions` server-side using the Supabase service role
2. Computes category resolution rates, severity distribution, fix preferences, weekly activity, avg AI confidence, and busiest debugging day
3. Sends the structured stats to Groq + Llama 3.3 70B
4. Groq generates a **personalized narrative** - not just charts, but actual sentences about your specific patterns
5. Returns everything back to the client for display + Markdown export

```
User clicks "Generate My DNA"
         |
Supabase Edge Function (debug-dna)
         |
Server-side SQL aggregations on debug_sessions
         |
Groq + Llama 3.3 70B generates personalized narrative
         |
{ stats, narrative } returned to client
         |
Debug DNA page renders + export as Markdown
```

**What it shows:**
- AI-generated narrative about your debugging profile
- Category breakdown with resolution rates per error type
- "You Excel At" vs "Needs Attention" split
- Severity distribution across all sessions
- Weekly activity chart (last 4 weeks)
- Your habits - busiest day, preferred fix type, open vs resolved counts

---

## How DevTrace AI Uses Supabase

Supabase is the **source of truth and auth backbone** for the entire app. All data lives here, all auth flows through here, and PowerSync replicates from here via WAL.

### 🔐 Authentication

- **Email + Password** - `supabase.auth.signInWithPassword()`
- **GitHub OAuth** - `signInWithOAuth({ provider: 'github' })`
- **Google OAuth** - `signInWithOAuth({ provider: 'google' })`
- **Password Reset** - `resetPasswordForEmail()` -> branded magic link email -> `/reset-password` -> `updateUser({ password })`
- **GitHub Linking** - `linkIdentity({ provider: 'github' })` -> `/auth/callback` -> username saved to `profiles`
- **Session sync** - `onAuthStateChange()` keeps Zustand `authStore` live across all tabs

> Zero custom auth code - Supabase handles all tokens, refresh, and session persistence.

---

### 🗄️ Database - Postgres + RLS

Every table has Row Level Security enabled. Users can only ever read and write **their own rows** - enforced at the database level, not in application code.

<table width="100%">
<tr><th align="left">Table</th><th align="left">Columns</th></tr>
<tr><td><code>profiles</code></td><td><code>name</code> · <code>avatar_url</code> · <code>github_username</code> · <code>github_connected</code> · <code>dark_mode</code></td></tr>
<tr><td><code>projects</code></td><td><code>name</code> · <code>description</code> · <code>language</code> · <code>github_url</code> · <code>session_count</code> · <code>error_count</code></td></tr>
<tr><td><code>debug_sessions</code></td><td><code>error_message</code> · <code>stack_trace</code> · <code>code_snippet</code> · <code>severity</code> · <code>status</code> · <code>ai_analysis</code> (JSONB) · <code>notes</code></td></tr>
<tr><td><code>fixes</code></td><td><code>title</code> · <code>fix_content</code> · <code>language</code> · <code>tags[]</code> · <code>use_count</code> · <code>session_id</code> · <code>project_id</code></td></tr>
<tr><td><code>shares</code></td><td><code>owner_id</code> · <code>invitee_id</code> · <code>resource_type</code> · <code>resource_id</code> · unique constraint prevents duplicate shares</td></tr>
</table>

Each table has RLS policies covering `SELECT` · `INSERT` · `UPDATE` · `DELETE` - all checking `auth.uid() = user_id`.

> 💡 The full 8-tab AI breakdown is stored as a single `ai_analysis` JSONB column - no extra tables, loads instantly on revisit, and syncs back down via PowerSync WAL.

---

### ⚡ Edge Functions

DevTrace AI uses **two Supabase Edge Functions**:

**`analyze-bug`** - handles all Groq AI calls server-side:
- Receives requests from the client with a verified JWT - unauthorized calls are rejected
- Routes to `analyzeSession`, `sendFollowUp`, `analyzeLogs`, or `analyzeStructure` based on `action`
- Calls Groq API server-side - the API key is never exposed to the browser
- Returns structured JSON analysis back to the client

**`debug-dna`** - generates your personal debugging fingerprint:
- Uses the service role key to query Postgres directly
- Performs SQL aggregations not practical client-side
- Calls Groq API server-side for the narrative
- Returns structured stats + AI narrative in a single response

---

### 🗃️ Storage

Profile avatars are stored in a public Supabase Storage bucket called `avatars`, organized per user:

```
avatars/
└── {user_id}/
    └── avatar.ext   <- URL cache-busted with ?t={timestamp} on every upload
```

---

### 🔗 WAL Replication -> PowerSync

A single Postgres publication called `powersync` connects Supabase to PowerSync:

```sql
create publication powersync
  for table profiles, projects, debug_sessions, fixes, shares;
```

PowerSync listens to this WAL stream and streams every change down to connected browser clients in real time.

---

## How DevTrace AI Uses PowerSync

PowerSync is the **offline engine**. It maintains a local SQLite database in the browser that the React app reads from directly - no network request, no loading spinner, no internet required.

### 📖 Read path - always instant

Every list, detail page, dashboard, analytics view, and the Similar Sessions card reads from local SQLite:

```typescript
// Zero network - hits local SQLite directly
const { data: sessions } = useQuery(
  'SELECT ds.*, p.name as project_name FROM debug_sessions ds LEFT JOIN projects p ON ds.project_id = p.id WHERE ds.user_id = ? ORDER BY ds.created_at DESC',
  [userId]
);

// Similar Sessions also uses local SQLite - zero network
const results = await powerSync.getAll(
  'SELECT id, title, error_message, status, severity FROM debug_sessions WHERE user_id = ? AND id != ? AND error_message IS NOT NULL',
  [userId, currentSessionId]
);
```

This pattern is used across all data hooks: `useSessions.ts`, `useProjects.ts`, `useFixes.ts`, `useProfile.ts`, and `SimilarSessionsCard.tsx`.

---

### ✍️ Write path - PowerSync mutation queue

All writes go through `powerSync.execute()` - written to local SQLite first, queued, and uploaded to Supabase automatically:

```typescript
// Written to local SQLite immediately - PowerSync uploads to Supabase
await powerSync.execute(
  `INSERT INTO debug_sessions (id, user_id, title, ...) VALUES (?, ?, ?, ...)`,
  [id, userId, title, ...]
);
```

**Large blob exception:** `ai_analysis` (the full 8-tab JSON breakdown) bypasses the PowerSync mutation queue and goes direct to Supabase, then syncs back down via WAL. This avoids overloading the WASM-based crud queue with large payloads.

```
powerSync.execute()  ->  Local SQLite  ->  PowerSync crud queue  ->  Supabase Postgres
                                                                           |
supabase.update() [ai_analysis only]  ->  Supabase Postgres               |
                                                 |                         |
                                         PowerSync WAL listener <----------+
                                                 |
                                        Local SQLite updated
                                                 |
                                      useQuery() reflects change
```

---

### 🟢 Online vs 🟠 Offline

<table width="100%">
<tr><th align="left">State</th><th align="left">What happens</th></tr>
<tr><td>🟢 App opens online</td><td>PowerSync connects and streams latest changes from Supabase</td></tr>
<tr><td>🟢 User reads data</td><td><code>useQuery()</code> returns from local SQLite - instant, 0ms</td></tr>
<tr><td>🟢 User opens a session</td><td>Similar Sessions card queries local SQLite - zero network, instant</td></tr>
<tr><td>🟢 User creates a session</td><td><code>powerSync.execute()</code> -> local SQLite -> PowerSync uploads -> Supabase</td></tr>
<tr><td>🟠 Internet drops</td><td>Orange banner appears - all existing data still fully readable</td></tr>
<tr><td>🟠 User creates offline</td><td><code>powerSync.execute()</code> writes to SQLite, upload queued automatically</td></tr>
<tr><td>🟠 Similar Sessions offline</td><td>Still works - queries local SQLite with no network dependency</td></tr>
<tr><td>🟢 Internet returns</td><td>PowerSync flushes queue to Supabase, WAL syncs delta back down</td></tr>
</table>

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
      - SELECT * FROM shares         WHERE owner_id = bucket.user_id
```

Each user only receives their own rows - data isolation enforced at the sync layer on top of RLS.

---

### 📊 Live Sync Status page

DevTrace AI ships a dedicated `/sync-status` page showing the full architecture, live SQLite row counts across all 5 tables, sync health indicator, recent sync events, and upload progress - all updating in real time.

---

## How DevTrace AI Uses Groq

All Groq API calls are made **server-side** via the `analyze-bug` Supabase Edge Function. The Groq API key is stored in Supabase Edge Function Secrets and never sent to the browser.

```
Client clicks "Analyze Bug"
         |
POST /functions/v1/analyze-bug  (with Supabase JWT)
         |
Edge Function verifies JWT -> rejects unauthorized requests
         |
Groq + Llama 3.3 70B called server-side
         |
Structured JSON analysis returned to client
         |
ai_analysis saved to Supabase -> syncs to local SQLite via WAL
```

The `analyze-bug` function handles four actions: `analyzeSession`, `sendFollowUp`, `analyzeLogs`, and `analyzeStructure` - all from a single authenticated endpoint.

---

## Sharing & Collaboration

DevTrace AI supports read-only sharing of projects and sessions between registered users.

### How it works

- **Share a project** -> the invitee sees all debug sessions inside it (read-only)
- **Share a session** -> the invitee sees just that one session (read-only)
- **No email required** - sharing is instant via account-to-account
- **Revokable** - the owner can remove access at any time from the Share modal

### Share flow

```
Owner opens project/session
       |
Clicks "Share" button
       |
Types invitee's email (must have a DevTrace account)
       |
Share row inserted into Supabase -> RLS grants read access
       |
Invitee logs in -> sees it under "Shared with Me"
       |
Read-only amber banner shown - no edit, delete, or AI controls
```

---

## Full Feature List

### 🐛 Debugging

- **Session Tracking** - Log errors with stack trace, code snippet, expected behavior, environment, and severity (critical / high / medium / low)
- **AI Debug Panel** - 8-tab full breakdown - every bug analyzed by Groq + Llama 3.3 70B server-side, saved permanently as JSONB
- **Similar Sessions** - Automatically finds past bugs with matching error patterns from local SQLite - zero network, works offline
- **Follow-up Chat** - Context-aware AI chat inside every session
- **Fix Library** - Save working fixes, filter by language, copy in one click, track use count
- **Export as Markdown** - Export any debug session as a `.md` file

### 🧬 Debug DNA

- **Personal Error Fingerprint** - Supabase Edge Function queries your session history server-side
- **AI Narrative** - Groq generates a personalized written profile of your strengths and weaknesses
- **Category Resolution Rates** - See which error types you crush and which ones beat you
- **Weekly Activity Chart** - Sessions logged per week over the last 4 weeks
- **Export DNA Report** - Download your full Debug DNA as Markdown

### 📁 Organization

- **Projects** - Group debug sessions by project, link GitHub repos
- **Project Health Score** - 0-100 score computed live from real session data
- **Session Streak** - Tracks consecutive debug days - badge upgrades at 7+ days 🔥
- **GitHub Connect** - Link your GitHub account from Profile

### 🔗 Sharing

- **Share Projects / Sessions** - Invite any registered DevTrace user by email
- **Read-only access** - Invitees can view but cannot edit, delete, or run AI analysis
- **Revoke anytime** - From the Share modal
- **Shared with Me page** - Dedicated sidebar page

### 📊 Insights & Analytics

- **Analytics Page** - Resolution rates, error trends, severity breakdowns, time-to-fix
- **AI Insights Page** - Category breakdown, confidence distribution, most flagged files
- **Sync Status Page** - Live architecture, 5-table SQLite row counts, sync health, upload queue

### 🔐 Auth & Profile

- **Email + Password** - Sign up / log in with branded magic link password reset
- **GitHub & Google OAuth** - One-click social sign in via Supabase Auth
- **Avatar Upload** - Stored in Supabase Storage

### 📶 Offline & Sync

- **Offline-First Reads** - All reads from local SQLite via PowerSync - zero network dependency
- **Offline Writes** - `powerSync.execute()` queues mutations locally, auto-uploads on reconnect
- **Similar Sessions Offline** - Pattern matching runs entirely on local SQLite - works with no internet
- **Real-Time Sync** - PowerSync streams WAL changes to local SQLite instantly
- **Offline Banner** - Shown whenever disconnected

### 🎨 UX

- **Dark Mode** - Full dark theme saved to profile
- **Mobile Responsive** - Collapsible sidebar, all pages usable on phones
- **Toast Notifications** - Non-intrusive feedback for every action

---

## Tech Stack

<div align="center">

<table width="100%">
<tr><th></th><th align="left">Technology</th><th align="left">Role</th></tr>
<tr><td>⚛️</td><td><b>React 18 + TypeScript + Vite</b></td><td>Frontend framework + type safety + build tool</td></tr>
<tr><td>🎨</td><td><b>Tailwind CSS</b></td><td>Utility-first styling + dark mode</td></tr>
<tr><td>🐻</td><td><b>Zustand</b></td><td>Lightweight global state (auth, sync queue)</td></tr>
<tr><td>🟢</td><td><b>Supabase</b></td><td>Postgres · Auth · Storage · RLS · WAL replication · Edge Functions</td></tr>
<tr><td>⚡</td><td><b>PowerSync</b></td><td>Local SQLite sync · offline mutations · real-time streaming · pattern matching</td></tr>
<tr><td>🤖</td><td><b>Groq + Llama 3.3 70B</b></td><td>Server-side AI inference via Edge Function - debug analysis + Debug DNA</td></tr>
<tr><td>📊</td><td><b>Recharts</b></td><td>Analytics charts and data visualization</td></tr>
<tr><td>🚀</td><td><b>Vercel</b></td><td>Zero-config deployment + preview URLs</td></tr>
</table>

</div>

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) account - free tier works
- [Groq](https://console.groq.com) API key - free
- [PowerSync](https://www.powersync.com) account - free tier works

---

### Step 1 - Clone and install

```bash
git clone https://github.com/JexanJoel/DevTrace-AI.git
cd DevTrace-AI
npm install
```

---

### Step 2 - Supabase setup

**2a.** Create a new project at [supabase.com](https://supabase.com)

**2b.** Go to **SQL Editor** and run the full schema:

<details>
<summary>📋 Click to expand - full SQL schema</summary>

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
  insert into public.profiles (id, email)
  values (
    new.id,
    coalesce(new.email, new.raw_user_meta_data->>'email')
  )
  on conflict (id) do update
    set email = coalesce(excluded.email, new.raw_user_meta_data->>'email');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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
  exists (
    select 1 from shares
    where shares.resource_id = projects.id
    and shares.resource_type = 'project'
    and shares.invitee_id = auth.uid()
  )
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
  exists (
    select 1 from shares
    where shares.resource_id = debug_sessions.id
    and shares.resource_type = 'session'
    and shares.invitee_id = auth.uid()
  )
);
create policy "Sessions in shared projects can read" on debug_sessions for select using (
  exists (
    select 1 from shares
    where shares.resource_id = debug_sessions.project_id
    and shares.resource_type = 'project'
    and shares.invitee_id = auth.uid()
  )
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
create trigger projects_updated_at before update on projects
  for each row execute procedure update_updated_at();
create trigger sessions_updated_at before update on debug_sessions
  for each row execute procedure update_updated_at();

-- PowerSync WAL publication (required)
create publication powersync for table profiles, projects, debug_sessions, fixes, shares;
```

</details>

**2c.** Go to **Authentication -> URL Configuration** and set:

```
Site URL:      https://your-app.vercel.app
Redirect URLs: https://your-app.vercel.app/reset-password
               https://your-app.vercel.app/auth/callback
               https://your-app.vercel.app/dashboard
               http://localhost:5173/reset-password
               http://localhost:5173/auth/callback
               http://localhost:5173/dashboard
```

**2d.** Go to **Authentication -> Providers** -> enable **GitHub** and **Google**

**2e.** Go to **Storage** -> create a bucket called `avatars` -> set to **public**

**2f.** Go to **Edge Functions -> Create function** -> name it `debug-dna` -> paste the function code from `supabase/functions/debug-dna/index.ts`

**2g.** Go to **Edge Functions -> Create function** -> name it `analyze-bug` -> paste the function code from `supabase/functions/analyze-bug/index.ts`

**2h.** Go to **Settings -> Edge Functions -> Secrets** and add:

```
GROQ_API_KEY       = your_groq_api_key
SERVICE_ROLE_KEY   = your_supabase_service_role_key
```

---

### Step 3 - PowerSync setup

**3a.** Create a free account at [powersync.com](https://www.powersync.com)

**3b.** Create a new instance -> connect it to your Supabase project using the **direct Postgres connection URI** (found in Supabase -> Settings -> Database -> Connection string -> URI)

**3c.** In the **Sync Rules** editor, paste:

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
    }
  }
}
```

**3d.** Click **Deploy** -> copy your **PowerSync instance URL**

---

### Step 4 - Environment variables

Create `.env` in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_POWERSYNC_URL=https://your-instance.powersync.journeyapps.com
```

> Note: No `VITE_GROQ_API_KEY` needed - all Groq calls are handled server-side via the `analyze-bug` Edge Function.

---

### Step 5 - Run

```bash
npm run dev
# -> http://localhost:5173
```

---

## Project Structure

```
src/
├── components/
│   ├── dashboard/          # DashboardLayout, Sidebar, TopBar
│   ├── sessions/           # AIDebugPanel (8 tabs), SimilarSessionsCard, CreateSessionModal, StatusBadge
│   ├── projects/           # ProjectCard (live health score), CreateProjectModal
│   ├── profile/            # AvatarUpload
│   ├── shared/             # ProtectedRoute, OfflineBanner, ShareModal
│   └── providers/          # PowerSyncProvider
│
├── hooks/
│   ├── useSessions.ts      # PowerSync mutations + reads, split write strategy for ai_analysis
│   ├── useProjects.ts      # PowerSync reads + Supabase writes
│   ├── useFixes.ts         # PowerSync mutations + reads
│   ├── useProfile.ts       # PowerSync reads + Supabase writes
│   ├── useShares.ts        # Share creation, revocation, lookup
│   ├── useDebugDNA.ts      # Calls debug-dna Edge Function, manages result state
│   ├── useDashboardStats.ts
│   └── useOnlineStatus.ts  # Network detection
│
├── lib/
│   ├── groqClient.ts       # Calls analyze-bug Edge Function (no client-side API key)
│   ├── SupabaseConnector.ts # PowerSync connector - uploadData handles crud queue
│   ├── projectHealth.ts    # Health score formula (pure client-side)
│   ├── supabaseClient.ts
│   └── powersync.ts        # Schema + PowerSyncDatabase singleton
│
├── pages/
│   ├── DashboardPage.tsx
│   ├── ProjectsPage.tsx          # Passes live sessions to each ProjectCard
│   ├── ProjectDetailPage.tsx
│   ├── SessionsPage.tsx
│   ├── SessionDetailPage.tsx     # AI Debug Panel + Similar Sessions card + share + export
│   ├── FixLibraryPage.tsx
│   ├── AnalyticsPage.tsx
│   ├── AIInsightsPage.tsx
│   ├── DebugDNAPage.tsx
│   ├── SyncStatusPage.tsx
│   ├── SharedWithMePage.tsx
│   ├── SharedProjectView.tsx
│   ├── SharedSessionView.tsx
│   ├── ProfilePage.tsx
│   ├── SettingsPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── ResetPasswordPage.tsx
│   └── GitHubCallbackPage.tsx
│
└── store/
    ├── authStore.ts
    └── useSyncQueue.ts

supabase/
└── functions/
    ├── analyze-bug/
    │   └── index.ts   # All Groq AI calls - analyzeSession, sendFollowUp, analyzeLogs, analyzeStructure
    └── debug-dna/
        └── index.ts   # SQL aggregations + Groq narrative for Debug DNA
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
Yes. All data lives in your own Supabase project. Row Level Security is enforced on every table at the database level.
</details>

<details>
<summary><b>Does offline mode really work?</b></summary>
<br/>
Yes. PowerSync syncs all your data to a local SQLite database in the browser on first load. All writes go through powerSync.execute() which queues them locally and uploads automatically on reconnect. The Similar Sessions card also works fully offline since it queries local SQLite directly.
</details>

<details>
<summary><b>Is the Groq API key safe?</b></summary>
<br/>
Yes. The Groq API key is stored in Supabase Edge Function Secrets and never sent to the browser. All AI calls go through the analyze-bug Edge Function which verifies the user's JWT before calling Groq.
</details>

<details>
<summary><b>How does Similar Sessions work?</b></summary>
<br/>
When you open a debug session, DevTrace AI extracts meaningful tokens from the error message (stripping noise words), then queries all your past sessions from local SQLite using powerSync.getAll(). Each session is scored by keyword overlap and matches with 2+ keywords are shown. No network request is made - it runs entirely on the local database.
</details>

<details>
<summary><b>How does sharing work?</b></summary>
<br/>
Open any project or session and click the Share button. Type the email of another registered DevTrace user. They'll immediately see it under "Shared with Me" in their sidebar. You can revoke access at any time from the Share modal.
</details>

<details>
<summary><b>What is Debug DNA?</b></summary>
<br/>
Debug DNA is a personalized analysis of your debugging patterns generated by a Supabase Edge Function. It queries your session history server-side, computes category resolution rates, severity distributions, and weekly activity, then sends the data to Groq which writes a personal narrative about your debugging strengths and weaknesses.
</details>

<details>
<summary><b>Do I need a backend server?</b></summary>
<br/>
No. Supabase handles auth, database, storage, and Edge Functions. PowerSync handles sync. All AI calls are server-side via Edge Functions. No Express or Node.js backend required.
</details>

---

## Hackathon

DevTrace AI is submitted to the **PowerSync AI Hackathon 2026**.

<table width="100%">
<tr><th align="left">Prize</th><th align="left">Why this qualifies</th></tr>
<tr><td>🥇 <b>Core Prize</b></td><td>AI-powered developer tool built within the hackathon window using PowerSync as the core sync layer</td></tr>
<tr><td>🏅 <b>Best Submission Using Supabase</b></td><td>Supabase drives auth (Email · GitHub · Google OAuth · magic link password reset · GitHub account linking), Postgres with RLS on all 5 tables, Storage for avatars, WAL replication feeding PowerSync, and two Edge Functions handling all server-side AI inference and Debug DNA computation</td></tr>
<tr><td>🏅 <b>Best Local-First App</b></td><td>All reads from local SQLite via PowerSync's useQuery(), all writes via powerSync.execute() with automatic offline queuing, Similar Sessions pattern matching runs on local SQLite with zero network, and a live Sync Status page showing architecture and queue state in real time</td></tr>
</table>

---

## License

MIT - free to use, fork, and build on.

---

<div align="center">

<br/>

Built for the **PowerSync AI Hackathon 2026** by [JexanJoel](https://github.com/JexanJoel)

<br/>

<table><tr>
<td align="center"><a href="https://dev-trace-ai.vercel.app"><img src="https://img.shields.io/badge/🚀%20Try%20it%20live-4f46e5?style=for-the-badge"/></a></td>
<td align="center"><a href="https://github.com/JexanJoel/DevTrace-AI/issues"><img src="https://img.shields.io/badge/🐛%20Report%20Bug-dc2626?style=for-the-badge"/></a></td>
<td align="center"><a href="https://github.com/JexanJoel/DevTrace-AI/issues"><img src="https://img.shields.io/badge/✨%20Request%20Feature-16a34a?style=for-the-badge"/></a></td>
</tr></table>

<br/>

</div>