<div align="center">

<br/>

<img src="https://img.shields.io/badge/⌨️-DevTrace_AI-4f46e5?style=for-the-badge&labelColor=1e1b4b&color=4f46e5" height="40"/>

<h1>DevTrace AI</h1>
<h3>AI-Powered Team Debugging Assistant</h3>

<br/>

<table>
  <tr>
    <td align="center"><a href="https://dev-trace-ai.vercel.app"><img src="https://img.shields.io/badge/🚀%20Live%20Demo-4f46e5?style=for-the-badge&logoColor=white"/></a></td>
    <td align="center"><a href="https://github.com/JexanJoel/DevTrace-AI"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white"/></a></td>
    <td align="center"><a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge"/></a></td>
    <td align="center"><a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/🤝-Contributing-4f46e5?style=for-the-badge&labelColor=1e1b4b&color=4f46e5"/></a></td>
    <td align="center"><a href="https://www.powersync.com/"><img src="https://img.shields.io/badge/PowerSync_AI_Hackathon_2026-6366f1?style=for-the-badge"/></a></td>
    <td align="center"><a href="https://github.com/sponsors/JexanJoel"><img src="https://img.shields.io/badge/💖%20Sponsor%20Me-e11d48?style=for-the-badge"/></a></td>
  </tr>
</table>

<br/>

</div>

---

## What is DevTrace AI?

DevTrace AI is your team's **permanent debugging memory** - log bugs, get instant AI analysis, save what works, and debug with teammates in real time at both session and project level. Works offline. Remembers everything.

<div align="center">

| | |
|:--|:--|
| 🔍 | Every bug gets a permanent structured record |
| 🤖 | Full AI breakdown - root cause, fixes, timeline, 8-tab panel |
| 🧬 | Debug DNA - your personal error fingerprint |
| 🧠 | Hybrid Local-First RAG - semantic vector search + structured SQL, entirely on-device |
| 🔁 | Similar Sessions - instantly finds bugs you've seen before |
| 👥 | Session Collaboration - shared checklist, presence, team chat |
| 📋 | Project Collaboration - activity feed, project chat, project presence |
| 🤖 | Mastra AI Agents - Session Debugger + Project Analyzer via Mastra Cloud |
| 📶 | Fully offline via PowerSync local SQLite (11 tables, 5 sync buckets) |
| 🔗 | Share projects and sessions with teammates |

</div>

**The core problem it solves:** Debugging is slow and scattered. You repeat the same mistakes, forget what fixed what, and lose context every time you close a tab. DevTrace AI is your team's permanent debugging memory - and it works even when the internet doesn't.

---

## How It Works

```
1. You paste an error          ->  Log a debug session (error, stack trace, code, severity)
2. Embeddings generated        ->  transformers.js generates on-device semantic vectors instantly
3. Hybrid search triggers      ->  Cosine similarity + keyword scoring against local SQLite history
4. Click "Analyze Bug"         ->  Groq + Llama 3.3 70B returns full structured analysis server-side
5. Read the 8-tab breakdown    ->  Overview, Fixes, Timeline, Checklist, Chat, Tests, Logs, Structure
6. Run Mastra Deep Analysis    ->  Session Debugger agent reasons through stack trace, returns diff fix
7. Invite a teammate           ->  They join the session - presence, checklist, and chat sync live
8. Watch the activity feed     ->  Every session event logged to project feed, visible to all collaborators
9. Save what worked            ->  Fix goes to Fix Library, tagged and searchable forever
10. Generate Debug DNA         ->  Supabase Edge Function analyzes your patterns + Groq writes fingerprint
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

The entire analysis is rate-limited at **20 AI requests per user per hour** via a `rate_limits` table in Supabase - enforced server-side in the Edge Function before any Groq call is made.

---

## Mastra AI Agent Layer

DevTrace AI adds a second AI layer on top of standard analysis - two specialized **Mastra Cloud agents** that go deeper than the standard 8-tab panel.

```
Client clicks "Run Deep Analysis"
         |
POST /functions/v1/mastra-agent  (JWT verified)
         |
Supabase Edge Function proxies to Mastra Cloud
         |
Session Debugger or Project Analyzer agent reasons through the data
         |
Structured JSON response returned - diff-format fix, risk analysis, recommendations
         |
Rich UI renders sections: root cause, before/after diff, verification steps, risks
```

### Session Debugger Agent

- Identifies the **exact broken line** with a before/after diff-format fix
- Explains why this error pattern occurs specifically in your language/framework
- Provides alternative approaches with tradeoff analysis
- Lists verification steps to confirm the fix worked
- Flags related risks that might surface after applying the fix

### Project Analyzer Agent

- Detects **recurring error patterns** across all sessions with frequency counts
- Identifies **systemic architectural issues** causing multiple errors
- Provides a health verdict: Excellent / Good / Needs Attention / Critical
- Generates prioritized recommendations: Immediate / Short-term / Long-term
- Analyzes resolution trends - what gets fixed quickly, what lingers, and why

Both agents are called via a JWT-verified Supabase Edge Function. The Mastra API key never reaches the browser.

---

## Hybrid Local-First RAG

DevTrace AI implements a sophisticated **Retrieval-Augmented Generation** layer that runs entirely on the edge - no server, no network, no latency.

```
Error logged
         |
transformers.js (Xenova/all-MiniLM-L6-v2) generates 384-dimension embedding in browser
         |
Embedding stored in error_embedding column via powerSync.execute()
         |
PowerSync syncs embedding to all devices via WAL
         |
Open any session - hybrid search fires instantly
         |
Layer 1: Keyword scoring - token overlap against error_message in local SQLite
Layer 2: Semantic scoring - cosine similarity against stored embeddings
         |
Top matches surfaced with confidence score - zero network, works offline
```

- **On-Device Embeddings** - `transformers.js` (Xenova/all-MiniLM-L6-v2) generates vectors entirely in the browser. No API call, no server, no cost per query
- **SQLite Vector Store** - PowerSync keeps embeddings synced and available in local SQLite across all devices
- **Dual Scoring** - keyword overlap catches exact matches; cosine similarity catches semantically related bugs with different wording
- **Works Offline** - the entire retrieval layer runs on local SQLite - pattern matching is available even without internet

---

## Offline AI Memory Assist

When you're offline and open a session without prior AI analysis, DevTrace AI doesn't just show a spinner. It synthesizes guidance from your local debugging history using a multi-layer aggregation engine.

```
Offline - open a new session with an error message
         |
useOfflineMemory extracts meaningful tokens (strips noise words)
         |
powerSync.getAll() queries local SQLite for sessions with ai_analysis
         |
Sessions scored by token overlap - top 5 matches retrieved
         |
Knowledge extracted: root causes, fixes, checklist items, test cases, files
         |
Voted synthesis: most common root cause surfaced as primary likely cause
         |
OfflineAssistCard renders - clearly labeled as synthesized from local history
```

- **Confidence levels** - High / Medium / Low based on match quality and count
- **Evidence linked** - every suggestion shows which past sessions it came from
- **Expandable fixes** - best past fixes with full code, expandable inline
- **Never misleads** - result is clearly labeled as synthesized offline guidance, not fresh AI analysis

---

## Live Collaboration - Session Level

DevTrace AI turns a debug session into a **shared live workspace**. All powered by PowerSync WAL sync - no WebSocket server, no Supabase Realtime subscription, no polling.

```
Owner opens session
         |
Teammate opens the shared session
         |
Presence row written to session_presence via powerSync.execute()
         |
PowerSync WAL syncs instantly to owner's local SQLite
         |
Owner sees "Teammate is debugging with you" banner - live dot pulsing
         |
Both can check off checklist items - syncs to all participants instantly
         |
Both can send chat messages - delivered via PowerSync, zero polling
```

Three tables power session collaboration - all synced via PowerSync WAL:

```
session_presence   - one row per user per session, last_seen_at updated every 30s
session_checklist  - one row per checklist item, checked/unchecked state + who did it
session_chat       - flat message log tied to the session
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

Collaboration extends beyond individual sessions to the **entire project**. Every session mutation - create, resolve, analyze, update, delete - is automatically logged to a project activity feed and synced to all collaborators instantly.

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
Both can chat at project level - Project Chat syncs via PowerSync
```

Activity logging is wired directly into `useSessions.ts` - no extra call-site code needed:

```typescript
// Auto-logged on session create
await logProjectActivity(user, projectId, 'session_created', id, title);

// Auto-logged when status changes to resolved
await logProjectActivity(user, projectId, 'session_resolved', id, title);

// Auto-logged when AI analysis runs
await logProjectActivity(user, projectId, 'session_analyzed', id, title);
```

---

## How DevTrace AI Uses Supabase

Supabase is the **source of truth and auth backbone** for the entire app.

### Authentication

- **Email + Password** - `supabase.auth.signInWithPassword()`
- **GitHub OAuth** - `signInWithOAuth({ provider: 'github' })`
- **Google OAuth** - `signInWithOAuth({ provider: 'google' })`
- **Password Reset** - `resetPasswordForEmail()` -> branded magic link -> `/reset-password`
- **GitHub Linking** - `linkIdentity({ provider: 'github' })` -> username saved to `profiles`
- **Session sync** - `onAuthStateChange()` keeps Zustand `authStore` live across all tabs

### Database - Postgres + RLS (11 tables)

Every table has Row Level Security enabled.

<table width="100%">
<tr><th align="left">Table</th><th align="left">Purpose</th></tr>
<tr><td><code>profiles</code></td><td>User name, avatar, GitHub connection, dark mode preference</td></tr>
<tr><td><code>projects</code></td><td>Project groupings with GitHub URL and health metrics</td></tr>
<tr><td><code>debug_sessions</code></td><td>Full session data including ai_analysis JSONB and error_embedding vector</td></tr>
<tr><td><code>fixes</code></td><td>Fix library entries with tags and use count</td></tr>
<tr><td><code>shares</code></td><td>Access grants between users for projects and sessions</td></tr>
<tr><td><code>session_presence</code></td><td>Live presence per user per session, heartbeat every 30s</td></tr>
<tr><td><code>session_checklist</code></td><td>Shared checklist state - one row per item, who checked what</td></tr>
<tr><td><code>session_chat</code></td><td>Team chat messages tied to a session</td></tr>
<tr><td><code>project_presence</code></td><td>Live presence per user per project, heartbeat every 30s</td></tr>
<tr><td><code>project_activity</code></td><td>Event log - session created/resolved/analyzed/updated/deleted</td></tr>
<tr><td><code>project_chat</code></td><td>Team chat messages tied to a project</td></tr>
</table>

### Edge Functions

**`analyze-bug`** - handles all Groq AI calls server-side:
- JWT verified on every request - unauthorized calls rejected before touching Groq
- Routes four actions: `analyzeSession`, `sendFollowUp`, `analyzeLogs`, `analyzeStructure`
- Rate limited: 20 requests per user per hour via `rate_limits` table
- Groq API key stored in Supabase Secrets - never in the browser

**`debug-dna`** - generates your personal debugging fingerprint:
- Service role key queries Postgres directly server-side
- SQL aggregations across your full session history + Groq narrative

**`mastra-agent`** - proxies calls to Mastra Cloud agents:
- JWT verified before touching Mastra API key
- Routes `debugSession` to the Session Debugger agent
- Routes `analyzeProject` to the Project Analyzer agent
- Forces structured JSON output - rich UI renders sections, diffs, badges

### WAL Replication -> PowerSync

```sql
-- All 11 tables replicated via WAL
alter publication powersync add table
  profiles, projects, debug_sessions, fixes, shares,
  session_presence, session_checklist, session_chat,
  project_presence, project_activity, project_chat;
```

---

## How DevTrace AI Uses PowerSync

PowerSync is the **offline engine and real-time collaboration layer** - powering both session-level and project-level collaboration with zero custom backend code.

### Read path - always instant

```typescript
// All zero-network reads - local SQLite
const { data: sessions }        = useQuery('SELECT * FROM debug_sessions WHERE user_id = ?', [uid]);
const { data: collaborators }   = useQuery('SELECT * FROM session_presence WHERE session_id = ?', [id]);
const { data: checklist }       = useQuery('SELECT * FROM session_checklist WHERE session_id = ?', [id]);
const { data: sessionMessages } = useQuery('SELECT * FROM session_chat WHERE session_id = ?', [id]);
const { data: projectPresence } = useQuery('SELECT * FROM project_presence WHERE project_id = ?', [pid]);
const { data: activityFeed }    = useQuery('SELECT * FROM project_activity WHERE project_id = ? ORDER BY created_at DESC LIMIT 50', [pid]);
const { data: projectMessages } = useQuery('SELECT * FROM project_chat WHERE project_id = ?', [pid]);
```

### Write path - PowerSync mutation queue

```typescript
// Session collaboration
await powerSync.execute(`INSERT INTO session_presence ...`, [...]);
await powerSync.execute(`UPDATE session_checklist SET checked = ? ...`, [...]);
await powerSync.execute(`INSERT INTO session_chat ...`, [...]);

// Project collaboration
await powerSync.execute(`INSERT INTO project_presence ...`, [...]);
await powerSync.execute(`INSERT INTO project_activity ...`, [...]);  // auto-logged by useSessions
await powerSync.execute(`INSERT INTO project_chat ...`, [...]);

// Embeddings stored alongside session data
await powerSync.execute(`UPDATE debug_sessions SET error_embedding = ? ...`, [JSON.stringify(embedding), id]);
```

**Large blob exception:** `ai_analysis` goes direct to Supabase to avoid overloading the WASM crud reader, then syncs back via WAL.

### Online vs Offline

<table width="100%">
<tr><th align="left">State</th><th align="left">What happens</th></tr>
<tr><td>🟢 App opens online</td><td>PowerSync connects and streams latest changes from Supabase</td></tr>
<tr><td>🟢 User reads data</td><td><code>useQuery()</code> returns from local SQLite - instant, 0ms</td></tr>
<tr><td>🟢 User opens a session</td><td>Hybrid RAG fires, presence heartbeat fires, all collab state loads</td></tr>
<tr><td>🟢 Teammate joins session</td><td>Presence row syncs via WAL - owner sees banner within 1-2 seconds</td></tr>
<tr><td>🟢 Session resolved</td><td>project_activity row logged automatically - all collaborators see it</td></tr>
<tr><td>🟠 Internet drops</td><td>Orange banner appears - all reads still work, writes queue locally</td></tr>
<tr><td>🟠 User opens offline session</td><td>Offline Memory Assist synthesizes guidance from local SQLite history</td></tr>
<tr><td>🟠 User creates offline</td><td><code>powerSync.execute()</code> writes to SQLite, upload queued automatically</td></tr>
<tr><td>🟢 Internet returns</td><td>PowerSync flushes queue to Supabase, WAL syncs delta back down</td></tr>
</table>

### Sync rules - 5 bucket definitions

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

### Debugging

- **Session Tracking** - Log errors with stack trace, code snippet, expected behavior, environment, and severity
- **AI Debug Panel** - 8-tab full breakdown via Groq + Llama 3.3 70B server-side, saved permanently as JSONB
- **Mastra Session Debugger** - Deep analysis agent: exact broken line, diff-format fix, risk flags, verification steps
- **Mastra Project Analyzer** - Pattern detection agent: recurring bugs, systemic issues, prioritized recommendations
- **Hybrid RAG** - On-device transformers.js embeddings + keyword scoring against local SQLite - zero network
- **Similar Sessions** - Finds past bugs with matching error patterns - works offline
- **Follow-up Chat** - Context-aware AI chat inside every session
- **Fix Library** - Save working fixes, filter by language, copy in one click, track use count
- **Export as Markdown** - Export any session as a `.md` file

### Session Collaboration

- **Presence Indicators** - Live avatar stack showing who is currently in the session
- **Shared Checklist** - AI checklist syncs live across all collaborators - shows who checked each item
- **Session Chat** - Real-time flat message thread tied to the session
- **Auto Chat Open** - Chat panel opens automatically when a collaborator joins
- **Zero Backend Code** - Entirely PowerSync WAL-driven, no WebSocket, no polling

### Project Collaboration

- **Project Presence** - Avatar stack in project header showing who is browsing right now
- **Activity Feed** - Every session mutation logged as a live event - clickable to navigate to that session
- **Project Chat** - Team discussion at project level, separate from session chat
- **Auto Activity Logging** - `useSessions` logs events to `project_activity` on every mutation

### Debug DNA

- **Personal Error Fingerprint** - Supabase Edge Function queries session history server-side
- **AI Narrative** - Groq generates personalized profile of your debugging strengths and weaknesses
- **Category Resolution Rates** - See which error types you crush and which ones beat you
- **Weekly Activity Chart** - Sessions logged per week over the last 4 weeks
- **Export DNA Report** - Download your full Debug DNA as Markdown

### Offline & Sync

- **Offline-First Reads** - All reads from local SQLite via PowerSync - zero network dependency
- **Offline Writes** - `powerSync.execute()` queues mutations locally, auto-uploads on reconnect
- **Offline Memory Assist** - Synthesizes AI guidance from local SQLite history when offline
- **On-Device Embeddings** - transformers.js generates semantic vectors in the browser - no API call
- **Real-Time Sync** - PowerSync streams WAL changes to local SQLite instantly
- **Sync Status Page** - Live row counts across all 11 tables, sync health, upload queue

### Security

- **Server-side AI** - Groq API key and Mastra API key never reach the browser
- **JWT Verification** - Every Edge Function verifies user JWT before any external API call
- **Rate Limiting** - 20 AI requests per user per hour, enforced in `analyze-bug` Edge Function
- **RLS on all tables** - Every Supabase table has Row Level Security enabled

---

## Tech Stack

<div align="center">

<table width="100%">
<tr><th></th><th align="left">Technology</th><th align="left">Role</th></tr>
<tr><td>⚛️</td><td><b>React 18 + TypeScript + Vite</b></td><td>Frontend framework + type safety + build tool</td></tr>
<tr><td>🎨</td><td><b>Tailwind CSS</b></td><td>Utility-first styling + dark mode</td></tr>
<tr><td>🐻</td><td><b>Zustand</b></td><td>Lightweight global state (auth, sync queue)</td></tr>
<tr><td>🟢</td><td><b>Supabase</b></td><td>Postgres · Auth · Storage · RLS · WAL replication · Edge Functions</td></tr>
<tr><td>⚡</td><td><b>PowerSync</b></td><td>Local SQLite sync · offline mutations · session + project collaboration · embeddings store</td></tr>
<tr><td>🤖</td><td><b>Groq + Llama 3.3 70B</b></td><td>Server-side AI inference - debug analysis + Debug DNA</td></tr>
<tr><td>🧠</td><td><b>Mastra Cloud</b></td><td>Session Debugger + Project Analyzer AI agents</td></tr>
<tr><td>🔍</td><td><b>Xenova/transformers.js</b></td><td>On-device semantic embeddings (all-MiniLM-L6-v2)</td></tr>
<tr><td>📊</td><td><b>Recharts</b></td><td>Analytics charts and data visualization</td></tr>
<tr><td>🚀</td><td><b>Vercel</b></td><td>Zero-config deployment + preview URLs</td></tr>
</table>

</div>

---

## Quick Start

```bash
git clone https://github.com/JexanJoel/DevTrace-AI.git
cd DevTrace-AI
npm install
```

For full setup instructions - Supabase, PowerSync, Mastra, environment variables - see **[CONTRIBUTING.md](CONTRIBUTING.md)**.

---

## Hackathon

DevTrace AI is submitted to the **PowerSync AI Hackathon 2026**.

<table width="100%">
<tr><th align="left">Prize</th><th align="left">Why this qualifies</th></tr>
<tr><td>🥇 <b>Core Prize</b></td><td>AI-powered team debugging platform using PowerSync as the state sync layer for humans and AI agents - session + project collaboration, Hybrid RAG, offline AI memory, Mastra agents</td></tr>
<tr><td>🏅 <b>Best Submission Using Supabase</b></td><td>Auth (3 providers), 11 RLS tables, Storage, WAL replication, 3 Edge Functions (analyze-bug with rate limiting, debug-dna, mastra-agent)</td></tr>
<tr><td>🏅 <b>Best Local-First App</b></td><td>All reads from local SQLite, all writes via powerSync.execute(), offline mutations, on-device embeddings stored in SQLite, offline AI memory, session + project collaboration - 11 tables, 5 sync buckets, zero custom backend</td></tr>
<tr><td>🏅 <b>Best Submission Using Mastra</b></td><td>Two specialized Mastra Cloud agents (Session Debugger + Project Analyzer) called via JWT-verified Edge Function proxy with structured JSON output and rich diff-format UI</td></tr>
</table>

---

## FAQ

<details>
<summary><b>How does session collaboration work?</b></summary>
<br/>
When you open a session, a presence row is written to session_presence via powerSync.execute(). PowerSync syncs this to all users who have access via WAL. The checklist and chat work the same way. No WebSocket, no polling, no custom backend.
</details>

<details>
<summary><b>How does project collaboration work?</b></summary>
<br/>
When you open a project, a project_presence row is written. Every session mutation automatically logs an event to project_activity via useSessions. All project collaborators see these events in real time via their local SQLite.
</details>

<details>
<summary><b>How does the Hybrid RAG work?</b></summary>
<br/>
When you log a session, transformers.js (Xenova/all-MiniLM-L6-v2) generates a 384-dimension embedding in the browser. This is stored in error_embedding via powerSync.execute(). When you open a session, both keyword scoring and cosine similarity run against your local SQLite history - zero network, works offline.
</details>

<details>
<summary><b>What are the Mastra agents?</b></summary>
<br/>
Two agents deployed to Mastra Cloud: Session Debugger (deep analysis of a single error with diff-format fix) and Project Analyzer (pattern detection across all sessions). Both are called via a JWT-verified Supabase Edge Function so the Mastra API key never reaches the browser.
</details>

<details>
<summary><b>Is the Groq API key safe?</b></summary>
<br/>
Yes. Stored in Supabase Edge Function Secrets. All AI calls go through analyze-bug which verifies JWT before calling Groq. Rate limited to 20 requests per user per hour.
</details>

<details>
<summary><b>Does offline mode really work?</b></summary>
<br/>
Yes. All reads come from local SQLite. Writes queue via powerSync.execute() and upload on reconnect. Similar Sessions, activity feed, embeddings, and all collaboration data read from local SQLite. Offline Memory Assist synthesizes guidance from your history when you have no internet.
</details>

<details>
<summary><b>Do I need a backend server?</b></summary>
<br/>
No. Supabase handles auth, database, storage, and Edge Functions. PowerSync handles sync and real-time collaboration. Mastra Cloud hosts the AI agents. No Express or Node.js backend required.
</details>

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