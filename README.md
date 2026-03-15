<div align="center">

<br/>

<img src="https://img.shields.io/badge/⌨️-DevTrace_AI-4f46e5?style=for-the-badge&labelColor=1e1b4b&color=4f46e5" height="36"/>

<h2>AI powered team debugging assistant</h2>

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

DevTrace AI is your team's **permanent debugging memory** - log bugs, get instant AI analysis, save what works, and debug with teammates in real time at both session and project level. Works offline. Remembers everything.

<div align="center">

| | |
|:--|:--|
| 🔍 | Every bug gets a permanent structured record |
| 🤖 | Full AI breakdown - root cause, fixes, timeline |
| 🧬 | Debug DNA - your personal error fingerprint |
| 🧠 | **Hybrid Local-First RAG** - Vector search meets Structured SQL |
| 🔁 | Similar Sessions - fuzzily finds bugs you've seen before |
| 👥 | Session Collaboration - shared checklist, presence, team chat |
| 📋 | Project Collaboration - activity feed, project chat, project presence |
| 📶 | Fully offline via PowerSync local SQLite (11 tables) |
| 🔗 | Share projects and sessions with teammates |

</div>

**The core problem it solves:** Debugging is slow and scattered. You repeat the same mistakes, forget what fixed what, and lose context every time you close a tab. DevTrace AI is your team's permanent debugging memory.

---

## How It Works

```
1. You paste an error          ->  Log a debug session (error, stack trace, code, severity)
2. Hybrid Search triggers       ->  `transformers.js` generates on-device embeddings
3. Query Local SQLite           ->  Fuzzy vector similarity + metadata filtering (Project, Env)
4. Click "Analyze Bug"         ->  Groq + Llama 3.3 70B returns a full structured analysis
5. Actionable Assets           ->  Download `.test.ts` (Vitest) or export to GitHub Issue
6. Invite a teammate           ->  They join the session - presence, checklist, and chat sync live
7. Watch the activity feed     ->  Every session event logged to project feed, visible to all collaborators
8. Generate your Debug DNA     ->  Supabase Edge Function analyzes your patterns + Groq writes your fingerprint
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
- 🧪 **Tests** - AI-generated reproduction steps and test cases. Includes **"Download Reproduction Test"** — generates a `.test.ts` file (Vitest) instantly to turn suggestions into actionable assets.
- 🐙 **GitHub Export** - One-click export of any session to a perfectly formatted GitHub Issue (root cause, fix, steps).
- 📋 **Logs** - Paste raw console or server logs - AI strips noise and surfaces what matters
- 🏗️ **Structure** - Paste your file tree - AI reviews architecture and flags problems

---

## Live Collaboration - Session Level

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

Three tables power session collaboration — all synced via PowerSync WAL:

```
session_presence   — one row per user per session, last_seen_at updated every 30s
session_checklist  — one row per checklist item, checked/unchecked state + who did it
session_chat       — flat message log tied to the session
```

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

---

## Live Collaboration - Project Level

Collaboration extends beyond individual sessions to the **entire project**. When a project is shared, all collaborators see each other's presence at the project level, can chat about the project as a whole, and watch a live activity feed showing every action taken by any team member.

```
Owner opens project
         |
Teammate opens the shared project
         |
project_presence row written via powerSync.execute()
         |
Owner sees avatar stack + live dot in project header
         |
Joel creates a new session -> project_activity row logged automatically
         |
Sarah sees "Joel created Bug: Auth token expired" in activity feed instantly
         |
Sarah resolves a session -> "Sarah resolved Bug: Auth token expired" logged
         |
Both can chat at project level — Project Chat syncs via PowerSync
```

### What syncs at project level

- **Project Presence** - Avatar stack in the project header showing who is browsing the project right now
- **Activity Feed** - Every session created, resolved, analyzed, updated, or deleted is logged as an event and synced to all collaborators instantly. Clickable — jump straight to that session
- **Project Chat** - Team discussion tied to the project as a whole, separate from session-level chat

### How it works technically

Three additional tables power project collaboration:

```
project_presence   — one row per user per project, heartbeat every 30s
project_activity   — event log: session_created | session_resolved | session_analyzed | session_updated | session_deleted
project_chat       — flat team messages at project level
```

Activity logging is wired directly into `useSessions.ts` — every `createSession`, `updateSession`, and `deleteSession` call automatically logs the appropriate event to `project_activity` via `powerSync.execute()`:

```typescript
// Automatically logged on session create
await logProjectActivity(user, projectId, 'session_created', id, title);

// Automatically logged when status changes to resolved
await logProjectActivity(user, projectId, 'session_resolved', id, title);

// Automatically logged when AI analysis runs
await logProjectActivity(user, projectId, 'session_analyzed', id, title);
```

### Shared view

When a teammate opens a project via **Shared with Me**, they have full access to the project collaboration layer:
- Their presence is broadcast to the owner immediately
- They can read and send project chat messages
- They can browse the full activity feed and click any event to navigate to that session
- A dedicated **Activity** tab sits alongside the Sessions tab

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

**Why this matters:** The tool gets smarter the more you use it. After logging 10-20 sessions, recurring error patterns start surfacing automatically.

---

## Hybrid Local-First RAG - Structured + Fuzzy Search

DevTrace AI implements a sophisticated **Retrieval-Augmented Generation** layer that runs entirely on the edge. It combines traditional SQL filtering with modern vector similarity search.

- **On-Device Embeddings**: Uses `transformers.js` (Hugging Face) to generate high-dimensional vectors for error messages directly in the browser.
- **SQLite Vector Store**: PowerSync keeps the embeddings synced and available in local SQLite.
- **Scoring Engine**: A custom similarity function calculates Cosine Similarity scores between your current error and 100% of your local history.
- **Semantic Badges**: Matches are marked with confidence percentages (e.g., "94% Semantic Match") to distinguish between keyword overlap and conceptual similarity.

```typescript
// Local Hybrid Query logic
const embeddings = await generateEmbeddings(errorMessage);
const results = await powerSync.getAll(
  `SELECT *, cosine_similarity(embedding, ?) as score 
   FROM debug_sessions 
   WHERE project_id = ? AND score > 0.7 
   ORDER BY score DESC`,
  [embeddings, projectId]
);
```

## Debug DNA - Your Personal Error Fingerprint

DevTrace AI builds a **personalized analysis of your debugging patterns** using a Supabase Edge Function + Groq.

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

---

## Offline AI Memory - Debugging without Internet

DevTrace AI features a unique **retrieval-augmented offline assistance layer**. When you are disconnected, the app doesn't just go "dumb." It utilizes your local PowerSync SQLite database as a knowledge base to synthesize guidance for new bugs.

```
Offline? Log a new bug
         |
useOfflineMemory hook extracts tokens from the error
         |
Retrieval: Query local debug_sessions for similar past errors
         |
Knowledge Extraction: Parse ai_analysis JSON from top matches
         |
Synthesis: Aggregate root causes, fixes, checklists, and tests
         |
"Offline AI Memory Assist" card renders — marked as "Innovation"
         |
Evidence linked: "Based on 3 similar sessions in your history"
```

### Synthesis Logic

The offline engine performs a multi-layer aggregation entirely on-device:
1. **Scoring**: Ranks past sessions by token overlap in error messages.
2. **Voting**: If 3 sessions suggest the same root cause (e.g., "undefined data access"), it is surfaced as the primary likely cause.
3. **Merging**: Best previous fixes and checklist items are combined and deduplicated.
4. **Transparency**: The result is clearly labeled as an offline suggestion to maintain trust.

---

## How DevTrace AI Uses Supabase

Supabase is the **source of truth and auth backbone** for the entire app.

### 🔐 Authentication

- **Email + Password** - `supabase.auth.signInWithPassword()`
- **GitHub OAuth** - `signInWithOAuth({ provider: 'github' })`
- **Google OAuth** - `signInWithOAuth({ provider: 'google' })`
- **Password Reset** - `resetPasswordForEmail()` -> branded magic link -> `/reset-password`
- **GitHub Linking** - `linkIdentity({ provider: 'github' })` -> username saved to `profiles`
- **Session sync** - `onAuthStateChange()` keeps Zustand `authStore` live across all tabs

---

### 🗄️ Database - Postgres + RLS (11 tables)

Every table has Row Level Security enabled.

<table width="100%">
<tr><th align="left">Table</th><th align="left">Purpose</th></tr>
<tr><td><code>profiles</code></td><td>User name, avatar, GitHub connection, dark mode preference</td></tr>
<tr><td><code>projects</code></td><td>Project groupings with GitHub URL and health metrics</td></tr>
<tr><td><code>debug_sessions</code></td><td>Full session data including ai_analysis JSONB</td></tr>
<tr><td><code>fixes</code></td><td>Fix library entries with tags and use count</td></tr>
<tr><td><code>shares</code></td><td>Access grants between users for projects and sessions</td></tr>
<tr><td><code>session_presence</code></td><td>Live presence per user per session, heartbeat every 30s</td></tr>
<tr><td><code>session_checklist</code></td><td>Shared checklist state — one row per item, who checked what</td></tr>
<tr><td><code>session_chat</code></td><td>Team chat messages tied to a session</td></tr>
<tr><td><code>project_presence</code></td><td>Live presence per user per project, heartbeat every 30s</td></tr>
<tr><td><code>project_activity</code></td><td>Event log — session created/resolved/analyzed/updated/deleted</td></tr>
<tr><td><code>project_chat</code></td><td>Team chat messages tied to a project</td></tr>
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
-- All 11 tables replicated via WAL
alter publication powersync add table
  profiles, projects, debug_sessions, fixes, shares,
  session_presence, session_checklist, session_chat,
  project_presence, project_activity, project_chat;
```

---

## How DevTrace AI Uses PowerSync

PowerSync is the **offline engine and real-time collaboration layer** — powering both session-level and project-level collaboration with zero custom backend code.

### 📖 Read path - always instant

```typescript
// All zero-network reads — local SQLite
const { data: sessions }          = useQuery('SELECT * FROM debug_sessions WHERE user_id = ?', [uid]);
const { data: collaborators }     = useQuery('SELECT * FROM session_presence WHERE session_id = ?', [id]);
const { data: checklist }         = useQuery('SELECT * FROM session_checklist WHERE session_id = ?', [id]);
const { data: sessionMessages }   = useQuery('SELECT * FROM session_chat WHERE session_id = ?', [id]);
const { data: projectPresence }   = useQuery('SELECT * FROM project_presence WHERE project_id = ?', [pid]);
const { data: activityFeed }      = useQuery('SELECT * FROM project_activity WHERE project_id = ? ORDER BY created_at DESC LIMIT 50', [pid]);
const { data: projectMessages }   = useQuery('SELECT * FROM project_chat WHERE project_id = ?', [pid]);
```

---

### ✍️ Write path - PowerSync mutation queue

```typescript
// Session collaboration
await powerSync.execute(`INSERT INTO session_presence ...`, [...]);
await powerSync.execute(`UPDATE session_checklist SET checked = ? ...`, [...]);
await powerSync.execute(`INSERT INTO session_chat ...`, [...]);

// Project collaboration
await powerSync.execute(`INSERT INTO project_presence ...`, [...]);
await powerSync.execute(`INSERT INTO project_activity ...`, [...]);  // auto-logged by useSessions
await powerSync.execute(`INSERT INTO project_chat ...`, [...]);
```

**Large blob exception:** `ai_analysis` goes direct to Supabase to avoid overloading the WASM crud queue, then syncs back via WAL.

---

### 🟢 Online vs 🟠 Offline

<table width="100%">
<tr><th align="left">State</th><th align="left">What happens</th></tr>
<tr><td>🟢 App opens online</td><td>PowerSync connects and streams latest changes from Supabase</td></tr>
<tr><td>🟢 User reads data</td><td><code>useQuery()</code> returns from local SQLite - instant, 0ms</td></tr>
<tr><td>🟢 User opens a session</td><td>Similar Sessions queries SQLite, presence heartbeat fires, all collab state loads</td></tr>
<tr><td>🟢 Teammate joins session</td><td>Presence row syncs via WAL - owner sees banner within 1-2 seconds</td></tr>
<tr><td>🟢 Session resolved</td><td>project_activity row logged automatically - all project collaborators see it</td></tr>
<tr><td>🟢 Activity feed viewed</td><td>Reads from local SQLite - zero network, instant render</td></tr>
<tr><td>🟠 Internet drops</td><td>Orange banner appears - all reads still work, writes queue locally</td></tr>
<tr><td>🟠 User creates offline</td><td><code>powerSync.execute()</code> writes to SQLite, upload queued automatically</td></tr>
<tr><td>🟢 Internet returns</td><td>PowerSync flushes queue to Supabase, WAL syncs delta back down</td></tr>
</table>

---

### ⚙️ Sync rules (5 bucket definitions)

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
    },
    "owned_project_collab": {
      "parameters": "SELECT id as project_id FROM projects WHERE user_id = request.user_id()",
      "data": [
        "SELECT * FROM project_presence WHERE project_id = bucket.project_id",
        "SELECT * FROM project_activity WHERE project_id = bucket.project_id",
        "SELECT * FROM project_chat WHERE project_id = bucket.project_id"
      ]
    },
    "shared_projects": {
      "parameters": "SELECT resource_id as project_id FROM shares WHERE invitee_id = request.user_id() AND resource_type = 'project'",
      "data": [
        "SELECT * FROM projects WHERE id = bucket.project_id",
        "SELECT * FROM debug_sessions WHERE project_id = bucket.project_id",
        "SELECT * FROM project_presence WHERE project_id = bucket.project_id",
        "SELECT * FROM project_activity WHERE project_id = bucket.project_id",
        "SELECT * FROM project_chat WHERE project_id = bucket.project_id"
      ]
    }
  }
}
```

---

## Full Feature List

### 🐛 Debugging

- **Session Tracking** - Log errors with stack trace, code snippet, expected behavior, environment, and severity
- **AI Debug Panel** - 8-tab full breakdown via Groq + Llama 3.3 70B server-side, saved permanently as JSONB
- **Hybrid Local-First RAG** - Combines `transformers.js` vector similarity with structured SQL metadata filtering.
- **AI Regression Suite** - Download `.test.ts` reproduction files directly from the AI analysis (Vitest compatible).
- **GitHub Issue Export** - One-click export of debug sessions to GitHub issues with full context, root cause, and fixes.
- **Similar Sessions** - Finds past bugs with matching patterns from local SQLite - zero network, works offline.
- **Follow-up Chat** - Context-aware AI chat inside every session
- **Fix Library** - Save working fixes, filter by language, copy in one click, track use count
- **Export as Markdown** - Export any debug session as a `.md` file

### 👥 Session Collaboration

- **Presence Indicators** - Live avatar stack showing who is currently in the session
- **Shared Checklist** - AI checklist syncs live across all collaborators - shows who checked each item
- **Session Chat** - Real-time flat message thread tied to the session
- **Shared View Presence** - Collaborators viewing via "Shared with Me" are present and visible to the owner
- **Auto Chat Open** - Chat panel opens automatically when a collaborator joins
- **Zero Backend Code** - All powered by PowerSync WAL sync, no websocket or polling

### 📋 Project Collaboration

- **Project Presence** - Avatar stack in project header showing who is browsing right now
- **Activity Feed** - Every session created, resolved, analyzed, updated, or deleted logged as a live event - clickable to navigate to that session
- **Project Chat** - Team discussion at project level, separate from session chat
- **Auto Activity Logging** - `useSessions` automatically logs events to `project_activity` on every mutation
- **Shared Project View** - Collaborators see project presence, activity feed tab, and full project chat

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
- **Collaborative Shared Views** - Both SharedSessionView and SharedProjectView are fully collaboration-enabled
- **Revoke anytime** - From the Share modal

### 📊 Insights & Analytics

- **Analytics Page** - Resolution rates, error trends, severity breakdowns, time-to-fix
- **AI Insights Page** - Category breakdown, confidence distribution, most flagged files
- **Sync Status Page** - Live architecture, 11-table SQLite row counts, sync health, upload queue

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
<tr><td>⚡</td><td><b>PowerSync</b></td><td>Local SQLite sync · offline mutations · session + project collaboration · pattern matching</td></tr>
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

**2b.** Go to **SQL Editor** and run the schemas in order:

<details>
<summary>📋 Click to expand - base schema (profiles, projects, sessions, fixes, shares)</summary>

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
<summary>👥 Click to expand - session collaboration schema</summary>

```sql
-- Session presence
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

-- Session checklist
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

-- Session chat
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
<summary>📋 Click to expand - project collaboration schema</summary>

```sql
-- Project presence
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

-- Project activity feed
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

-- Project chat
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

**3c.** Paste the full sync rules (5 bucket definitions — see `POWERSYNC_SYNC_RULES.json` in repo)

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
│   ├── projects/           # ProjectCard, CreateProjectModal, ProjectActivityFeed, ProjectChat
│   ├── profile/            # AvatarUpload
│   ├── shared/             # ProtectedRoute, OfflineBanner, ShareModal
│   └── providers/          # PowerSyncProvider
│
├── hooks/
│   ├── useSessions.ts           # PowerSync mutations + reads + activity logging
│   ├── useProjects.ts           # PowerSync reads + Supabase writes
│   ├── useFixes.ts              # PowerSync mutations + reads
│   ├── useCollaboration.ts      # Session presence, shared checklist, session chat
│   ├── useProjectCollaboration.ts  # Project presence, activity feed, project chat
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
└── pages/
    ├── ProjectDetailPage.tsx     # Project collab - presence, activity tab, project chat
    ├── SharedProjectView.tsx     # Collaboration-enabled shared project view
    ├── SessionDetailPage.tsx     # Session collab - presence, checklist, session chat
    ├── SharedSessionView.tsx     # Collaboration-enabled shared session view
    └── ... (other pages)

supabase/
└── functions/
    ├── analyze-bug/index.ts   # analyzeSession, sendFollowUp, analyzeLogs, analyzeStructure
    └── debug-dna/index.ts     # SQL aggregations + Groq narrative
```

---

## FAQ

<details>
<summary><b>How does session collaboration work?</b></summary>
<br/>
When you open a session, DevTrace AI writes a presence row to session_presence via powerSync.execute(). PowerSync syncs this to all users who have access via WAL. The checklist and chat work the same way. No websockets, no polling, no custom backend.
</details>

<details>
<summary><b>How does project collaboration work?</b></summary>
<br/>
When you open a project, a project_presence row is written. Every session mutation (create/resolve/analyze/update/delete) automatically logs an event to project_activity via useSessions. All project collaborators see these events in real time via their local SQLite. The activity feed is clickable — each event navigates to the relevant session.
</details>

<details>
<summary><b>Can collaborators edit sessions or projects?</b></summary>
<br/>
No. Collaborators can check off checklist items and send chat messages, but cannot edit session data, delete anything, or run AI analysis. Project data and session data remain owner-only.
</details>

<details>
<summary><b>Does offline mode really work?</b></summary>
<br/>
Yes. All reads come from local SQLite. Writes queue via powerSync.execute() and upload on reconnect. Similar Sessions, activity feed, and all collaboration data read from local SQLite — you see the last known state even without internet.
</details>

<details>
<summary><b>Is the Groq API key safe?</b></summary>
<br/>
Yes. Stored in Supabase Edge Function Secrets, never in the browser. All AI calls go through analyze-bug which verifies JWT before calling Groq.
</details>

<details>
<summary><b>Do I need a backend server?</b></summary>
<br/>
No. Supabase handles auth, database, storage, and Edge Functions. PowerSync handles sync and real-time collaboration at both session and project level. No Express or Node.js backend required.
</details>

---

## Hackathon

DevTrace AI is submitted to the **PowerSync AI Hackathon 2026**.

<table width="100%">
<tr><th align="left">Prize</th><th align="left">Why this qualifies</th></tr>
<tr><td>🥇 <b>Core Prize</b></td><td>AI-powered developer tool using PowerSync as the core sync and real-time collaboration layer at both session and project level</td></tr>
<tr><td>🏅 <b>Best Submission Using Supabase</b></td><td>Supabase drives auth, Postgres with RLS on 11 tables, Storage, WAL replication, two Edge Functions for server-side AI and Debug DNA</td></tr>
<tr><td>🏅 <b>Best Local-First App</b></td><td>All reads from local SQLite, all writes via powerSync.execute(), offline write queue, Similar Sessions on local SQLite, session + project collaboration via PowerSync WAL, 5 sync bucket definitions — zero custom backend</td></tr>
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