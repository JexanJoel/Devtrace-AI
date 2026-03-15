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

DevTrace AI is your **permanent debugging memory** - log bugs, get instant AI analysis, save what works, and debug with teammates in real time. Works offline. Remembers everything.

<div align="center">

| | |
|:--|:--|
| 🔍 | Every bug gets a permanent structured record |
| 🤖 | Full AI breakdown - root cause, fixes, timeline |
| 🧬 | Debug DNA - your personal error fingerprint |
| 🔁 | Similar Sessions - instantly finds bugs you've seen before |
| 👥 | Live Collaboration - debug together with shared checklist + chat |
| 💾 | Saved as JSONB - persists across reloads |
| 📶 | Fully offline via PowerSync local SQLite |
| 🔗 | Share projects and sessions with teammates |

</div>

**The core problem it solves:** Debugging is slow and scattered. You repeat the same mistakes, forget what fixed what, and lose context every time you close a tab. DevTrace AI is your permanent debugging memory — and now your team's too.

---

## How It Works

```
1. You paste an error          ->  Log a debug session (error, stack trace, code, severity)
2. Click "Analyze Bug"         ->  Groq + Llama 3.3 70B returns a full structured analysis
3. Read the 8 tab breakdown    ->  Overview, Fixes, Timeline, Checklist, Chat, Tests, Logs, Structure
4. See similar past bugs       ->  "You've seen this before" card queries local SQLite instantly
5. Invite a teammate           ->  They join the session - presence, checklist, and chat sync live
6. Save what worked            ->  Fix goes to your Fix Library, tagged and searchable forever
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
- ✅ **Checklist** - Shared interactive checklist - syncs live across all collaborators via PowerSync
- 💬 **Followup** - Context-aware AI chat - click suggested questions or type your own
- 🧪 **Tests** - AI-generated reproduction steps and test cases to verify the fix works
- 📋 **Logs** - Paste raw console or server logs - AI strips noise and surfaces what matters
- 🏗️ **Structure** - Paste your file tree - AI reviews architecture and flags problems

---

## Live Collaboration - Debug Together

DevTrace AI turns a debug session into a **shared live workspace**. When a teammate opens a session you've shared, you both see each other's presence, share a synced checklist, and can chat in real time - all powered by PowerSync with zero backend code.

```
Owner opens session
         |
Teammate opens the shared session
         |
Presence row written to session_presence via powerSync.execute()
         |
PowerSync WAL syncs instantly to owner's local SQLite
         |
Owner sees "Teammate is debugging with you" banner — live dot pulsing
         |
Both can check off checklist items — syncs to all participants instantly
         |
Both can send chat messages — delivered via PowerSync, zero polling
```

### What syncs live

- **Presence** - Avatar stack showing who is currently in the session, updated every 30 seconds
- **Checklist** - Checking an item off syncs to all collaborators within 1-2 seconds. Shows who checked each item ("Joel checked this off")
- **Chat** - Flat message thread tied to the session. Full read/write for all participants including shared view

### How it works technically

Three new tables power collaboration — all synced via PowerSync WAL:

```
session_presence   — one row per user per session, last_seen_at updated every 30s
session_checklist  — one row per checklist item, checked/unchecked state + who did it
session_chat       — flat message log tied to the session
```

All three tables are included in PowerSync sync rules with per-session bucket definitions, so each user only receives data for sessions they have access to.

```typescript
// Presence heartbeat - fires on mount, every 30s, cleans up on unmount
await powerSync.execute(
  `INSERT INTO session_presence (id, session_id, user_id, display_name, last_seen_at, joined_at)
   VALUES (?, ?, ?, ?, ?, ?)`,
  [id, sessionId, userId, displayName, now, now]
);

// Checklist toggle - syncs to all collaborators instantly
await powerSync.execute(
  `UPDATE session_checklist SET checked = ?, checked_by_name = ? WHERE session_id = ? AND item_index = ?`,
  [1, displayName, sessionId, itemIndex]
);

// Chat message - delivered via PowerSync WAL
await powerSync.execute(
  `INSERT INTO session_chat (id, session_id, user_id, display_name, message, created_at)
   VALUES (?, ?, ?, ?, ?, ?)`,
  [id, sessionId, userId, displayName, message, now]
);
```

### Shared view collaboration

When a teammate opens a session via **Shared with Me**, they are fully present in the collaboration layer:
- Their presence is broadcast to the owner immediately
- They can read and send chat messages
- They can see the live checklist state (read-only - cannot toggle)
- The owner sees a live collaboration banner the moment they open the shared session

### Demo moment

Open the same session in two browser tabs (or two different accounts). Check off a checklist item in one tab. Watch it appear in the other tab — **instantly, with zero network requests visible in the DevTools Network tab**. That's PowerSync's local-first sync doing what it was built for.

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

**Why this matters:** The tool gets smarter the more you use it. After logging 10-20 sessions, recurring error patterns start surfacing automatically - before you even click Analyze.

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

Supabase is the **source of truth and auth backbone** for the entire app.

### 🔐 Authentication

- **Email + Password** - `supabase.auth.signInWithPassword()`
- **GitHub OAuth** - `signInWithOAuth({ provider: 'github' })`
- **Google OAuth** - `signInWithOAuth({ provider: 'google' })`
- **Password Reset** - `resetPasswordForEmail()` -> branded magic link email -> `/reset-password` -> `updateUser({ password })`
- **GitHub Linking** - `linkIdentity({ provider: 'github' })` -> `/auth/callback` -> username saved to `profiles`
- **Session sync** - `onAuthStateChange()` keeps Zustand `authStore` live across all tabs

---

### 🗄️ Database - Postgres + RLS

Every table has Row Level Security enabled.

<table width="100%">
<tr><th align="left">Table</th><th align="left">Purpose</th></tr>
<tr><td><code>profiles</code></td><td>User name, avatar, GitHub connection, dark mode preference</td></tr>
<tr><td><code>projects</code></td><td>Project groupings with GitHub URL and health metrics</td></tr>
<tr><td><code>debug_sessions</code></td><td>Full session data including ai_analysis JSONB</td></tr>
<tr><td><code>fixes</code></td><td>Fix library entries with tags and use count</td></tr>
<tr><td><code>shares</code></td><td>Access grants between users for projects and sessions</td></tr>
<tr><td><code>session_presence</code></td><td>Live presence — one row per user per session, heartbeat every 30s</td></tr>
<tr><td><code>session_checklist</code></td><td>Shared checklist state — one row per item, syncs who checked what</td></tr>
<tr><td><code>session_chat</code></td><td>Flat team chat messages tied to a session</td></tr>
</table>

---

### ⚡ Edge Functions

**`analyze-bug`** - handles all Groq AI calls server-side:
- Verified JWT on every request - unauthorized calls rejected
- Routes to `analyzeSession`, `sendFollowUp`, `analyzeLogs`, or `analyzeStructure`
- Groq API key stored in Supabase Secrets, never in the browser

**`debug-dna`** - generates your personal debugging fingerprint:
- Service role key queries Postgres directly server-side
- SQL aggregations + Groq narrative returned in one response

---

### 🔗 WAL Replication -> PowerSync

```sql
-- All 8 tables replicated via WAL
alter publication powersync add table
  profiles, projects, debug_sessions, fixes, shares,
  session_presence, session_checklist, session_chat;
```

---

## How DevTrace AI Uses PowerSync

PowerSync is the **offline engine and real-time collaboration layer**.

### 📖 Read path - always instant

Every list, detail page, dashboard, analytics view, Similar Sessions card, and collaboration state reads from local SQLite:

```typescript
// All zero-network reads
const { data: sessions }      = useQuery('SELECT * FROM debug_sessions WHERE user_id = ?', [uid]);
const { data: collaborators } = useQuery('SELECT * FROM session_presence WHERE session_id = ?', [id]);
const { data: checklist }     = useQuery('SELECT * FROM session_checklist WHERE session_id = ?', [id]);
const { data: messages }      = useQuery('SELECT * FROM session_chat WHERE session_id = ?', [id]);
```

---

### ✍️ Write path - PowerSync mutation queue

All writes go through `powerSync.execute()` - local SQLite first, uploaded automatically:

```typescript
await powerSync.execute(`INSERT INTO debug_sessions ...`, [...]);
await powerSync.execute(`INSERT INTO session_presence ...`, [...]);
await powerSync.execute(`UPDATE session_checklist SET checked = ? ...`, [...]);
await powerSync.execute(`INSERT INTO session_chat ...`, [...]);
```

**Large blob exception:** `ai_analysis` goes direct to Supabase to avoid overloading the WASM crud queue, then syncs back via WAL.

---

### 🟢 Online vs 🟠 Offline

<table width="100%">
<tr><th align="left">State</th><th align="left">What happens</th></tr>
<tr><td>🟢 App opens online</td><td>PowerSync connects and streams latest changes from Supabase</td></tr>
<tr><td>🟢 User reads data</td><td><code>useQuery()</code> returns from local SQLite - instant, 0ms</td></tr>
<tr><td>🟢 User opens a session</td><td>Similar Sessions queries SQLite, presence heartbeat fires, collaboration state loads</td></tr>
<tr><td>🟢 Teammate joins session</td><td>Presence row syncs via WAL - owner sees banner within 1-2 seconds</td></tr>
<tr><td>🟢 Checklist item checked</td><td>SQLite updated instantly, WAL syncs to all collaborators</td></tr>
<tr><td>🟠 Internet drops</td><td>Orange banner appears - all reads still work, writes queue locally</td></tr>
<tr><td>🟠 User creates offline</td><td><code>powerSync.execute()</code> writes to SQLite, upload queued automatically</td></tr>
<tr><td>🟢 Internet returns</td><td>PowerSync flushes queue to Supabase, WAL syncs delta back down</td></tr>
</table>

---

### ⚙️ Sync rules

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
    "shared_sessions": {
      "parameters": "SELECT resource_id as session_id FROM shares WHERE invitee_id = request.user_id() AND resource_type = 'session'",
      "data": [
        "SELECT * FROM debug_sessions WHERE id = bucket.session_id",
        "SELECT * FROM session_presence WHERE session_id = bucket.session_id",
        "SELECT * FROM session_checklist WHERE session_id = bucket.session_id",
        "SELECT * FROM session_chat WHERE session_id = bucket.session_id"
      ]
    },
    "owned_session_collab": {
      "parameters": "SELECT id as session_id FROM debug_sessions WHERE user_id = request.user_id()",
      "data": [
        "SELECT * FROM session_presence WHERE session_id = bucket.session_id",
        "SELECT * FROM session_checklist WHERE session_id = bucket.session_id",
        "SELECT * FROM session_chat WHERE session_id = bucket.session_id"
      ]
    }
  }
}
```

Three bucket definitions ensure owners receive collaboration data for their sessions, and invitees receive it for sessions shared with them.

---

## How DevTrace AI Uses Groq

All Groq API calls are made **server-side** via the `analyze-bug` Supabase Edge Function.

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

---

## Full Feature List

### 🐛 Debugging

- **Session Tracking** - Log errors with stack trace, code snippet, expected behavior, environment, and severity
- **AI Debug Panel** - 8-tab full breakdown via Groq + Llama 3.3 70B server-side, saved permanently as JSONB
- **Similar Sessions** - Finds past bugs with matching error patterns from local SQLite - zero network, works offline
- **Follow-up Chat** - Context-aware AI chat inside every session
- **Fix Library** - Save working fixes, filter by language, copy in one click, track use count
- **Export as Markdown** - Export any debug session as a `.md` file

### 👥 Live Collaboration

- **Presence Indicators** - See who is currently in the session with live avatar stack and pulsing dot
- **Shared Checklist** - AI checklist syncs live across all collaborators via PowerSync - shows who checked each item
- **Team Chat** - Real-time flat message thread tied to the session, available to owner and all collaborators
- **Shared View Presence** - Collaborators viewing via "Shared with Me" are present and visible to the owner
- **Auto Chat Open** - Chat panel opens automatically when a collaborator joins
- **Zero Backend Code** - All collaboration powered by PowerSync WAL sync, no custom websocket or polling

### 🧬 Debug DNA

- **Personal Error Fingerprint** - Supabase Edge Function queries session history server-side
- **AI Narrative** - Groq generates personalized profile of your debugging strengths and weaknesses
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
- **Collaborative Shared View** - Invitees can send chat messages and are visible as present to the owner
- **Revoke anytime** - From the Share modal
- **Shared with Me page** - Dedicated sidebar page

### 📊 Insights & Analytics

- **Analytics Page** - Resolution rates, error trends, severity breakdowns, time-to-fix
- **AI Insights Page** - Category breakdown, confidence distribution, most flagged files
- **Sync Status Page** - Live architecture, 8-table SQLite row counts, sync health, upload queue

### 🔐 Auth & Profile

- **Email + Password** - Sign up / log in with branded magic link password reset
- **GitHub & Google OAuth** - One-click social sign in via Supabase Auth
- **Avatar Upload** - Stored in Supabase Storage

### 📶 Offline & Sync

- **Offline-First Reads** - All reads from local SQLite via PowerSync - zero network dependency
- **Offline Writes** - `powerSync.execute()` queues mutations locally, auto-uploads on reconnect
- **Similar Sessions Offline** - Pattern matching runs entirely on local SQLite
- **Real-Time Sync** - PowerSync streams WAL changes to local SQLite instantly
- **Offline Banner** - Shown whenever disconnected

---

## Tech Stack

<div align="center">

<table width="100%">
<tr><th></th><th align="left">Technology</th><th align="left">Role</th></tr>
<tr><td>⚛️</td><td><b>React 18 + TypeScript + Vite</b></td><td>Frontend framework + type safety + build tool</td></tr>
<tr><td>🎨</td><td><b>Tailwind CSS</b></td><td>Utility-first styling + dark mode</td></tr>
<tr><td>🐻</td><td><b>Zustand</b></td><td>Lightweight global state (auth, sync queue)</td></tr>
<tr><td>🟢</td><td><b>Supabase</b></td><td>Postgres · Auth · Storage · RLS · WAL replication · Edge Functions</td></tr>
<tr><td>⚡</td><td><b>PowerSync</b></td><td>Local SQLite sync · offline mutations · real-time collaboration · pattern matching</td></tr>
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
<summary>📋 Click to expand - base schema</summary>

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
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
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
  title text not null, error_message text, stack_trace text,
  code_snippet text, expected_behavior text,
  environment text default 'development', severity text default 'medium',
  status text default 'open', ai_fix text, ai_analysis jsonb, notes text,
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
<summary>👥 Click to expand - collaboration schema (run after base schema)</summary>

```sql
-- Presence
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

-- Checklist
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

-- Chat
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

-- Add collaboration tables to WAL publication
alter publication powersync add table session_presence;
alter publication powersync add table session_checklist;
alter publication powersync add table session_chat;
```

</details>

**2c.** Go to **Authentication -> URL Configuration** and set your site and redirect URLs

**2d.** Go to **Authentication -> Providers** -> enable **GitHub** and **Google**

**2e.** Go to **Storage** -> create a bucket called `avatars` -> set to **public**

**2f.** Create Edge Function `debug-dna` from `supabase/functions/debug-dna/index.ts`

**2g.** Create Edge Function `analyze-bug` from `supabase/functions/analyze-bug/index.ts`

**2h.** Add secrets: `GROQ_API_KEY` and `SERVICE_ROLE_KEY`

---

### Step 3 - PowerSync setup

**3a.** Create account at [powersync.com](https://www.powersync.com)

**3b.** Connect to your Supabase Postgres URI

**3c.** Paste the full sync rules (3 bucket definitions — see `POWERSYNC_SYNC_RULES.json` in repo)

**3d.** Deploy and copy your PowerSync instance URL

---

### Step 4 - Environment variables

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_POWERSYNC_URL=https://your-instance.powersync.journeyapps.com
```

> No `VITE_GROQ_API_KEY` needed - all Groq calls are server-side via Edge Function.

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
│   ├── sessions/           # AIDebugPanel, SimilarSessionsCard, CollaborationBanner,
│   │                       # CollaborativeChecklist, SessionChat, CreateSessionModal, StatusBadge
│   ├── projects/           # ProjectCard (live health score), CreateProjectModal
│   ├── profile/            # AvatarUpload
│   ├── shared/             # ProtectedRoute, OfflineBanner, ShareModal
│   └── providers/          # PowerSyncProvider
│
├── hooks/
│   ├── useSessions.ts      # PowerSync mutations + reads, split write for ai_analysis
│   ├── useProjects.ts      # PowerSync reads + Supabase writes
│   ├── useFixes.ts         # PowerSync mutations + reads
│   ├── useCollaboration.ts # Presence heartbeat, shared checklist, team chat via PowerSync
│   ├── useProfile.ts       # PowerSync reads + Supabase writes
│   ├── useShares.ts        # Share creation, revocation, lookup
│   ├── useDebugDNA.ts      # Calls debug-dna Edge Function
│   ├── useDashboardStats.ts
│   └── useOnlineStatus.ts
│
├── lib/
│   ├── groqClient.ts        # Calls analyze-bug Edge Function (no client-side API key)
│   ├── SupabaseConnector.ts # PowerSync connector - uploadData handles crud queue
│   ├── projectHealth.ts     # Health score formula (pure client-side)
│   ├── supabaseClient.ts
│   └── powersync.ts         # Schema (8 tables) + PowerSyncDatabase singleton
│
└── pages/
    ├── SessionDetailPage.tsx     # Full collaboration - presence, checklist, chat
    ├── SharedSessionView.tsx     # Collaboration-enabled shared view - presence + chat
    └── ... (other pages)

supabase/
└── functions/
    ├── analyze-bug/index.ts   # analyzeSession, sendFollowUp, analyzeLogs, analyzeStructure
    └── debug-dna/index.ts     # SQL aggregations + Groq narrative
```

---

## FAQ

<details>
<summary><b>How does live collaboration work?</b></summary>
<br/>
When you open a debug session, DevTrace AI writes a presence row to session_presence via powerSync.execute(). PowerSync syncs this to all other users who have access to that session via WAL replication. The checklist and chat work the same way - writes go to local SQLite via powerSync.execute(), PowerSync uploads them, and WAL streams the changes to all participants. No websockets, no polling, no custom backend code.
</details>

<details>
<summary><b>Can collaborators edit the session?</b></summary>
<br/>
No. Collaborators can check off checklist items and send chat messages, but cannot edit the error message, stack trace, notes, or run AI analysis. The session data itself remains owner-only. Shared view (Shared with Me) can only send chat - checklist toggling is also disabled there.
</details>

<details>
<summary><b>Does offline mode really work?</b></summary>
<br/>
Yes. All reads come from local SQLite. Writes queue via powerSync.execute() and upload on reconnect. Similar Sessions pattern matching works with no internet. Collaboration data also reads from local SQLite - you can see the last known checklist state and chat history offline.
</details>

<details>
<summary><b>Is the Groq API key safe?</b></summary>
<br/>
Yes. Stored in Supabase Edge Function Secrets, never in the browser. All AI calls go through analyze-bug which verifies JWT before calling Groq.
</details>

<details>
<summary><b>How does Similar Sessions work?</b></summary>
<br/>
Extracts meaningful tokens from your error message, queries all past sessions from local SQLite via powerSync.getAll(), scores each by keyword overlap, surfaces matches with 2+ keywords. Zero network, works offline.
</details>

<details>
<summary><b>Do I need a backend server?</b></summary>
<br/>
No. Supabase handles auth, database, storage, and Edge Functions. PowerSync handles sync and real-time collaboration. No Express or Node.js backend required.
</details>

---

## Hackathon

DevTrace AI is submitted to the **PowerSync AI Hackathon 2026**.

<table width="100%">
<tr><th align="left">Prize</th><th align="left">Why this qualifies</th></tr>
<tr><td>🥇 <b>Core Prize</b></td><td>AI-powered developer tool using PowerSync as the core sync and real-time collaboration layer</td></tr>
<tr><td>🏅 <b>Best Submission Using Supabase</b></td><td>Supabase drives auth, Postgres with RLS on 8 tables, Storage, WAL replication, two Edge Functions for server-side AI and Debug DNA</td></tr>
<tr><td>🏅 <b>Best Local-First App</b></td><td>All reads from local SQLite, all writes via powerSync.execute(), offline write queue, Similar Sessions on local SQLite, live collaboration via PowerSync WAL — zero custom backend</td></tr>
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