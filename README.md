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

```text
1. You paste an error          ->  Log a debug session (error, stack trace, code, severity)
2. Hybrid Search triggers      ->  `transformers.js` generates on-device embeddings
3. Query Local SQLite          ->  Fuzzy vector similarity + metadata filtering (Project, Env)
4. Click "Analyze Bug"         ->  Groq + Llama 3.3 70B returns a full structured analysis
5. Actionable Assets           ->  Download `.test.ts` (Vitest) or export to GitHub Issue
6. Invite a teammate           ->  They join the session - presence, checklist, and chat sync live
7. Watch the activity feed     ->  Every session event logged to project feed, visible to all collaborators
8. Generate your Debug DNA     ->  Supabase Edge Function analyzes your patterns + Groq writes your fingerprint
```

### Read vs Write - the data flow

All **reads** come from a local SQLite database (PowerSync). Zero network latency - instant.

All **writes** go through PowerSync's mutation queue - written to local SQLite first, then uploaded to Supabase automatically. Large blobs like `ai_analysis` bypass the mutation queue and go direct to Supabase, then sync back down via WAL.

```text
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

```text
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

```text
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

```text
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

```text
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

```text
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

## 🚀 Quick Start

Want to run DevTrace AI locally? It's easy!

1. **Clone the repo**
   ```bash
   git clone https://github.com/JexanJoel/DevTrace-AI.git
   ```
2. **Follow the Setup Guide**
   Check out our [CONTRIBUTING.md](CONTRIBUTING.md) for step-by-step instructions on setting up Supabase, PowerSync, and your local environment.

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

## License & Conduct

<div align="center">

[MIT License](LICENSE) | [Code of Conduct](CODE_OF_CONDUCT.md)

</div>

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