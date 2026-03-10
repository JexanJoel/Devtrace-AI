<div align="center">

<img src="https://img.shields.io/badge/DevTrace_AI-Open_Source-6366f1?style=for-the-badge&logo=terminal&logoColor=white" alt="DevTrace AI" />

<br/><br/>

# 🐛 DevTrace AI

> AI-powered debugging assistant · Track sessions · Get AI fixes · Ship faster

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![PowerSync Hackathon](https://img.shields.io/badge/PowerSync_Hackathon-2026-6366f1?style=flat-square)](https://www.powersync.com/)

**[🚀 Live Demo](https://devtrace-ai.vercel.app)** &nbsp;·&nbsp; **[🐛 Report Bug](https://github.com/yourusername/DevTrace-AI/issues)** &nbsp;·&nbsp; **[✨ Request Feature](https://github.com/yourusername/DevTrace-AI/issues)**

</div>

---

## 🧰 Tech Stack

<div align="center">

<table>
  <tr>
    <td align="center" width="130">
      <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" /><br/>
      <sub>Frontend</sub>
    </td>
    <td align="center" width="130">
      <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" /><br/>
      <sub>Language</sub>
    </td>
    <td align="center" width="130">
      <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" /><br/>
      <sub>Build Tool</sub>
    </td>
    <td align="center" width="130">
      <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" /><br/>
      <sub>Styling</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="130">
      <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" /><br/>
      <sub>Database & Auth</sub>
    </td>
    <td align="center" width="130">
      <img src="https://img.shields.io/badge/Groq_AI-F55036?style=for-the-badge&logo=lightning&logoColor=white" /><br/>
      <sub>AI Engine</sub>
    </td>
    <td align="center" width="130">
      <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" /><br/>
      <sub>Backend</sub>
    </td>
    <td align="center" width="130">
      <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" /><br/>
      <sub>Deployment</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="130">
      <img src="https://img.shields.io/badge/Zustand-FF6B35?style=for-the-badge&logo=react&logoColor=white" /><br/>
      <sub>State</sub>
    </td>
    <td align="center" width="130">
      <img src="https://img.shields.io/badge/Recharts-22C55E?style=for-the-badge&logo=chartdotjs&logoColor=white" /><br/>
      <sub>Charts</sub>
    </td>
    <td align="center" width="130">
      <img src="https://img.shields.io/badge/Lucide-F97316?style=for-the-badge&logo=lucide&logoColor=white" /><br/>
      <sub>Icons</sub>
    </td>
    <td align="center" width="130">
      <img src="https://img.shields.io/badge/Llama_3.3_70B-FF0000?style=for-the-badge&logo=meta&logoColor=white" /><br/>
      <sub>AI Model</sub>
    </td>
  </tr>
</table>

</div>

---

## ✨ Features

<div align="center">

<table>
  <tr>
    <td width="33%" align="center">
      <h3>🐛 Session Tracking</h3>
      <sub>Log errors with stack traces, severity & status</sub>
    </td>
    <td width="33%" align="center">
      <h3>⚡ AI Fix Suggestions</h3>
      <sub>Groq + Llama 3.3 70B returns fixes with confidence scores</sub>
    </td>
    <td width="33%" align="center">
      <h3>📚 Fix Library</h3>
      <sub>Save & reuse AI fixes across all your projects</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center">
      <h3>📁 Project Management</h3>
      <sub>Organize sessions by project, track error counts</sub>
    </td>
    <td width="33%" align="center">
      <h3>📊 Error Analytics</h3>
      <sub>Charts for resolution rates, trends & severity</sub>
    </td>
    <td width="33%" align="center">
      <h3>🐙 GitHub Integration</h3>
      <sub>Stars, forks, open issues & last push per project</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center">
      <h3>🎨 Dark Mode</h3>
      <sub>Full dark theme, synced to your profile</sub>
    </td>
    <td width="33%" align="center">
      <h3>📱 Mobile Responsive</h3>
      <sub>Slide-in sidebar, works on all screen sizes</sub>
    </td>
    <td width="33%" align="center">
      <h3>🔐 Auth</h3>
      <sub>GitHub OAuth, Google OAuth, Email + Password</sub>
    </td>
  </tr>
</table>

</div>

---

## 🏆 Hackathon Context — PowerSync AI Hackathon 2026

DevTrace AI is submitted to the **PowerSync AI Hackathon 2026** targeting the following prize categories:

- 🥇 **Core Prize** — AI-powered developer tool built during the hackathon window
- 💚 **Best Submission Using Supabase** — Supabase powers auth, database (RLS), and storage throughout the entire stack

**Why DevTrace fits the hackathon theme:**

DevTrace AI is exactly the kind of developer tool the hackathon calls for — an AI-assisted workflow for debugging and incident response. PowerSync could extend this project into a truly local-first experience where debug sessions are available offline and sync when connectivity is restored — a natural next step for the product.

---

## 🗂️ Project Structure

```
DevTrace-AI/
└── DevTrace/
    ├── client/                  # React + Vite frontend
    │   ├── src/
    │   │   ├── components/      # Reusable UI components
    │   │   │   ├── auth/        # Login / Register forms
    │   │   │   ├── dashboard/   # Layout, Sidebar, Topbar
    │   │   │   ├── sessions/    # Debug session components
    │   │   │   ├── fixes/       # Fix library components
    │   │   │   ├── projects/    # Project cards + modals
    │   │   │   ├── github/      # GitHub stats card
    │   │   │   └── onboarding/  # Onboarding modal
    │   │   ├── hooks/           # Custom React hooks (data fetching)
    │   │   ├── pages/           # Route-level page components
    │   │   ├── store/           # Zustand stores (auth, theme)
    │   │   ├── lib/             # Supabase + Groq clients
    │   │   └── types/           # TypeScript types
    │   └── package.json
    └── server/                  # Express backend
        ├── src/
        │   ├── routes/          # Auth routes
        │   ├── middleware/      # JWT verification
        │   └── lib/             # Supabase admin client
        └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free)
- A [Groq](https://groq.com) API key (free)

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/DevTrace-AI.git
cd DevTrace-AI/DevTrace
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL setup in your Supabase SQL editor:

<details>
<summary>📋 Click to expand full SQL setup</summary>

```sql
-- Profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text, email text, github_username text,
  avatar_url text, onboarded boolean default false,
  dark_mode boolean default false,
  created_at timestamp with time zone default timezone('utc', now())
);

create or replace function public.handle_new_user() returns trigger as $$
begin insert into public.profiles (id, email) values (new.id, new.email); return new; end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users for each row execute procedure public.handle_new_user();

alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

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
create policy "Users can view own projects" on projects for select using (auth.uid() = user_id);
create policy "Users can create projects" on projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on projects for update using (auth.uid() = user_id);
create policy "Users can delete own projects" on projects for delete using (auth.uid() = user_id);

-- Debug Sessions
create table debug_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  project_id uuid references projects on delete cascade,
  title text not null, error_message text, stack_trace text,
  severity text default 'medium', status text default 'open',
  ai_fix text, notes text,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);
alter table debug_sessions enable row level security;
create policy "Users can view own sessions" on debug_sessions for select using (auth.uid() = user_id);
create policy "Users can create sessions" on debug_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own sessions" on debug_sessions for update using (auth.uid() = user_id);
create policy "Users can delete own sessions" on debug_sessions for delete using (auth.uid() = user_id);

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
create policy "Users can view own fixes" on fixes for select using (auth.uid() = user_id);
create policy "Users can create fixes" on fixes for insert with check (auth.uid() = user_id);
create policy "Users can update own fixes" on fixes for update using (auth.uid() = user_id);
create policy "Users can delete own fixes" on fixes for delete using (auth.uid() = user_id);

-- Triggers + helpers
create or replace function update_updated_at() returns trigger as $$
begin new.updated_at = timezone('utc', now()); return new; end;
$$ language plpgsql;
create trigger projects_updated_at before update on projects for each row execute procedure update_updated_at();
create trigger sessions_updated_at before update on debug_sessions for each row execute procedure update_updated_at();

create or replace function increment_session_count(project_id uuid)
returns void as $$ update projects set session_count = session_count + 1 where id = project_id; $$ language sql;

create or replace function decrement_session_count(project_id uuid)
returns void as $$ update projects set session_count = greatest(session_count - 1, 0) where id = project_id; $$ language sql;

create or replace function increment_fix_use_count(fix_id uuid)
returns void as $$ update fixes set use_count = use_count + 1 where id = fix_id; $$ language sql;
```

</details>

3. Go to **Authentication → Settings** and:
   - Disable **"Confirm email"**
   - Set Site URL to `http://localhost:5173`
   - Enable GitHub and Google OAuth providers
4. Create a storage bucket called `avatars` set to **public**

### 3. Frontend setup

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
```

### 4. Backend setup

```bash
cd ../server
npm install
```

Create `server/.env`:

```env
PORT=4000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 5. Run

```bash
# Terminal 1 — Frontend (http://localhost:5173)
cd client && npm run dev

# Terminal 2 — Backend (http://localhost:4000)
cd server && npm run dev
```

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ❤️ for the **PowerSync AI Hackathon 2026**

[⭐ Star this repo](https://github.com/JexanJoel/DevTrace-AI) if you found it useful!

</div>