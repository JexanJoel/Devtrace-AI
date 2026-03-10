<div align="center">

<img src="https://img.shields.io/badge/DevTrace_AI-Open_Source-6366f1?style=for-the-badge&logo=terminal&logoColor=white" alt="DevTrace AI" />

# 🐛 DevTrace AI

### AI-powered debugging assistant for developers

**Track sessions · Get AI fixes · Ship faster**

[![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Groq](https://img.shields.io/badge/Groq_AI-F55036?style=flat-square&logo=lightning&logoColor=white)](https://groq.com/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![PowerSync Hackathon](https://img.shields.io/badge/PowerSync_Hackathon-2026-6366f1?style=flat-square)](https://www.powersync.com/)

[Live Demo](https://devtrace-ai.vercel.app) · [Report Bug](https://github.com/yourusername/DevTrace-AI/issues) · [Request Feature](https://github.com/yourusername/DevTrace-AI/issues)

</div>

---

## 📖 What is DevTrace AI?

DevTrace AI is an **open source AI-powered debugging assistant** built for developers who are tired of copy-pasting errors into ChatGPT. It gives you a structured place to log, analyze, and resolve bugs — with AI doing the heavy lifting.

Built for the **[PowerSync AI Hackathon 2026](https://www.powersync.com/)** using Supabase as the backend — qualifying for the **Best Submission Using Supabase** bonus prize category.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🐛 **Debug Session Tracking** | Log errors with full stack traces, severity levels, and status |
| ⚡ **AI Fix Suggestions** | Groq + Llama 3.3 70B analyzes your error and returns a fix with confidence score |
| 📚 **Fix Library** | Save AI fixes and reuse them across projects — build your personal knowledge base |
| 📁 **Project Management** | Organize sessions by project, link GitHub repos, track error counts |
| 📊 **Error Analytics** | Visualize resolution rates, error trends, and severity breakdowns with charts |
| 🐙 **GitHub Integration** | View repo stats (stars, forks, open issues, last push) linked per project |
| 🎨 **Dark Mode** | Full dark theme, saved per user in the database |
| 📱 **Mobile Responsive** | Works on all screen sizes with a slide-in sidebar |
| 🔐 **Auth** | GitHub OAuth, Google OAuth, Email + Password via Supabase Auth |
| 🧭 **Onboarding Flow** | 3-step walkthrough for new users |

---

## 🖼️ Screenshots

> **Dashboard**
> <!-- Add screenshot: public/screenshots/dashboard.png -->
> ![Dashboard](https://placehold.co/1200x675/4f46e5/ffffff?text=Dashboard)

> **Debug Session + AI Fix**
> <!-- Add screenshot: public/screenshots/session-detail.png -->
> ![Session Detail](https://placehold.co/1200x675/1e1b4b/ffffff?text=AI+Fix+in+Action)

> **Analytics**
> <!-- Add screenshot: public/screenshots/analytics.png -->
> ![Analytics](https://placehold.co/1200x675/065f46/ffffff?text=Error+Analytics)

> **Fix Library**
> <!-- Add screenshot: public/screenshots/fix-library.png -->
> ![Fix Library](https://placehold.co/1200x675/7c3aed/ffffff?text=Fix+Library)

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
2. Run the following SQL in your Supabase SQL editor:

<details>
<summary>Click to expand SQL setup</summary>

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

-- Helper functions
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
   - Disable **"Confirm email"** (so users can sign in immediately)
   - Add `http://localhost:5173` as your Site URL
   - Enable GitHub and Google OAuth providers

4. Create a storage bucket called `avatars` and set it to **public**

### 3. Install & configure the frontend

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

### 4. Install & configure the backend

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

### 5. Run the app

```bash
# Terminal 1 — Frontend
cd client && npm run dev
# → http://localhost:5173

# Terminal 2 — Backend
cd server && npm run dev
# → http://localhost:4000
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS 3 |
| **State** | Zustand, React Router v6 |
| **Backend** | Express 5, TypeScript, Node.js |
| **Database** | Supabase (PostgreSQL + RLS) |
| **Auth** | Supabase Auth (GitHub OAuth, Google OAuth, Email+Password) |
| **AI** | Groq API — Llama 3.3 70B Versatile |
| **Charts** | Recharts |
| **UI Icons** | Lucide React |
| **Storage** | Supabase Storage (avatar uploads) |
| **Deployment** | Vercel (frontend), Railway (backend) |

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