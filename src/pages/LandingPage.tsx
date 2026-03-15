import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Terminal, Bug, Sparkles, BookOpen,
  BarChart2, ArrowRight, Github,
  Menu, X, Wifi, WifiOff,
  Database, Heart, FileText,
  CheckCircle, Library, Users, Dna, Zap, History,
  MessageSquare, Activity, FolderOpen
} from 'lucide-react';

/* ─── Marquee data ─────────────────────────────────────────────── */
const MARQUEE_ITEMS = [
  { name: 'React',        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
  { name: 'TypeScript',   logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
  { name: 'Supabase',     logo: 'https://www.vectorlogo.zone/logos/supabase/supabase-icon.svg' },
  { name: 'PowerSync',    logo: 'https://avatars.githubusercontent.com/u/105956274?s=48&v=4' },
  { name: 'Groq',         logo: 'https://avatars.githubusercontent.com/u/116147397?s=48&v=4' },
  { name: 'Vite',         logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg' },
  { name: 'Tailwind CSS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg' },
  { name: 'Vercel',       logo: 'https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_dark_background.png' },
  { name: 'Zustand',      logo: 'https://repository-images.githubusercontent.com/180328715/fca49300-e7f1-11ea-9f51-cfd949b31560' },
  { name: 'Recharts',     logo: 'https://recharts.org/favicon.ico' },
];

/* ─── Features ──────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <Sparkles size={22} />,
    title: 'AI Debug Panel — 8 Tabs',
    desc: 'Every bug gets a full breakdown: root cause, 3 fix options with code, crash timeline, shared checklist, follow-up chat, test cases, log analyzer, and architecture review.',
    color: 'indigo', tag: 'Core',
  },
  {
    icon: <Users size={22} />,
    title: 'Live Collaboration',
    desc: 'Debug together in real time at both session and project level. Presence indicators, shared checklist, team chat, and activity feed — all via PowerSync WAL with zero backend.',
    color: 'teal', tag: 'New',
  },
  {
    icon: <Database size={22} />,
    title: 'Offline AI Memory',
    desc: 'No internet? No problem. DevTrace synthesizes guidance from your local history, retrieving past AI analyses to help you fix bugs even when you are disconnected.',
    color: 'amber', tag: 'Innovation',
  },
  {
    icon: <Activity size={22} />,
    title: 'Project Activity Feed',
    desc: 'Every session created, resolved, or analyzed appears in a live activity feed visible to all project collaborators. Click any event to jump straight to that session.',
    color: 'cyan', tag: null,
  },
  {
    icon: <History size={22} />,
    title: 'Similar Sessions',
    desc: 'Automatically surfaces past bugs that match your current error — queried from local SQLite with zero network. The tool gets smarter the more you use it.',
    color: 'amber', tag: null,
  },
  {
    icon: <WifiOff size={22} />,
    title: 'Fully Offline-First',
    desc: 'All reads from local SQLite via PowerSync — zero spinners, zero network dependency. Create and browse sessions without internet. Auto-syncs when connection is restored.',
    color: 'orange', tag: null,
  },
  {
    icon: <Dna size={22} />,
    title: 'Debug DNA',
    desc: 'A Supabase Edge Function analyzes your session history server-side and Groq writes your personal error fingerprint — resolution rates, habits, strengths, and weaknesses.',
    color: 'violet', tag: 'Edge Fn',
  },
  {
    icon: <BookOpen size={22} />,
    title: 'Fix Library',
    desc: 'Save AI fixes that worked. Filter by language, copy in one click, track usage count. Build a personal knowledge base that grows smarter with every project.',
    color: 'green', tag: null,
  },
  {
    icon: <BarChart2 size={22} />,
    title: 'Analytics & AI Insights',
    desc: 'Project health scores, resolution rates, AI confidence trends, error pattern breakdowns — all computed locally from SQLite with zero server round-trips.',
    color: 'blue', tag: null,
  },
];

const COLOR_MAP: Record<string, { bg: string; icon: string; tag: string; border: string; glow: string }> = {
  indigo: { bg: 'bg-indigo-50',  icon: 'text-indigo-600',  tag: 'bg-indigo-600 text-white',  border: 'hover:border-indigo-300', glow: 'hover:shadow-indigo-100' },
  teal:   { bg: 'bg-teal-50',    icon: 'text-teal-600',    tag: 'bg-teal-500 text-white',    border: 'hover:border-teal-300',   glow: 'hover:shadow-teal-100'   },
  amber:  { bg: 'bg-amber-50',   icon: 'text-amber-600',   tag: 'bg-amber-500 text-white',   border: 'hover:border-amber-300',  glow: 'hover:shadow-amber-100'  },
  cyan:   { bg: 'bg-cyan-50',    icon: 'text-cyan-600',    tag: 'bg-cyan-500 text-white',    border: 'hover:border-cyan-300',   glow: 'hover:shadow-cyan-100'   },
  orange: { bg: 'bg-orange-50',  icon: 'text-orange-600',  tag: 'bg-orange-500 text-white',  border: 'hover:border-orange-300', glow: 'hover:shadow-orange-100' },
  violet: { bg: 'bg-violet-50',  icon: 'text-violet-600',  tag: 'bg-violet-600 text-white',  border: 'hover:border-violet-300', glow: 'hover:shadow-violet-100' },
  red:    { bg: 'bg-red-50',     icon: 'text-red-500',     tag: 'bg-red-500 text-white',     border: 'hover:border-red-300',    glow: 'hover:shadow-red-100'    },
  green:  { bg: 'bg-green-50',   icon: 'text-green-600',   tag: 'bg-green-600 text-white',   border: 'hover:border-green-300',  glow: 'hover:shadow-green-100'  },
  blue:   { bg: 'bg-blue-50',    icon: 'text-blue-600',    tag: 'bg-blue-600 text-white',    border: 'hover:border-blue-300',   glow: 'hover:shadow-blue-100'   },
};

/* ─── Steps ─────────────────────────────────────────────────────── */
const STEPS = [
  {
    icon: <FileText size={20} />, step: '01', title: 'Create a project',
    desc: 'Set up a project, pick your language, and optionally link your GitHub repo for stats and context.',
  },
  {
    icon: <Bug size={20} />, step: '02', title: 'Log the bug',
    desc: 'Paste your error message and stack trace. Add the relevant code snippet, tag severity, and choose the environment. Saved instantly — even offline.',
  },
  {
    icon: <History size={20} />, step: '03', title: 'See similar past bugs',
    desc: "DevTrace AI instantly queries your local SQLite for similar errors — zero network. If you've seen this bug before, it surfaces immediately.",
    badge: 'Zero network', color: 'amber',
  },
  {
    icon: <Sparkles size={20} />, step: '04', title: 'Get full AI analysis',
    desc: 'Click Analyze Bug — Groq + Llama 3.3 70B returns root cause, 3 fix options with code, a crash timeline, an interactive checklist, and more. All saved as JSONB.',
  },
  {
    icon: <Users size={20} />, step: '05', title: 'Debug with your team',
    desc: 'Invite a teammate — presence indicators appear, the checklist syncs live, team chat opens, and every action logs to the project activity feed. All via PowerSync.',
    badge: 'Live · PowerSync', color: 'teal',
  },
  {
    icon: <Activity size={20} />, step: '06', title: 'Track project activity',
    desc: 'The project activity feed shows every session created, resolved, or analyzed by any collaborator — synced in real time. Click any event to jump to that session.',
    badge: 'Real-time', color: 'cyan',
  },
  {
    icon: <Library size={20} />, step: '07', title: 'Save to Fix Library',
    desc: 'Save what worked. Your Fix Library grows over time — filter by language, copy fixes in one click, reuse across projects.',
  },
  {
    icon: <Dna size={20} />, step: '08', title: 'Generate your Debug DNA',
    desc: 'Hit "Generate My DNA" — a Supabase Edge Function queries your history server-side, Groq writes your personal debugging fingerprint. Export as Markdown.',
    badge: 'Edge Function', color: 'violet',
  },
];

/* ─── Marquee ───────────────────────────────────────────────────── */
const Marquee = () => {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="overflow-hidden w-full">
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .marquee-track { display: flex; width: max-content; animation: marquee 28s linear infinite; }
      `}</style>
      <div className="marquee-track">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 mx-4 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm flex-shrink-0">
            <img src={item.logo} alt={item.name} className="w-5 h-5 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Step style maps ───────────────────────────────────────────── */
const STEP_BADGE: Record<string, string> = {
  amber:  'bg-amber-100 text-amber-600',
  teal:   'bg-teal-100 text-teal-600',
  cyan:   'bg-cyan-100 text-cyan-600',
  violet: 'bg-violet-100 text-violet-600',
};
const STEP_BORDER: Record<string, string> = {
  amber:  'border-amber-200 hover:border-amber-300',
  teal:   'border-teal-200 hover:border-teal-300',
  cyan:   'border-cyan-200 hover:border-cyan-300',
  violet: 'border-violet-200 hover:border-violet-300',
};
const STEP_ICON_BG: Record<string, string> = {
  amber:  'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-200',
  teal:   'bg-gradient-to-br from-teal-500 to-indigo-600 shadow-teal-200',
  cyan:   'bg-gradient-to-br from-cyan-500 to-teal-600 shadow-cyan-200',
  violet: 'bg-gradient-to-br from-violet-600 to-indigo-600 shadow-violet-200',
};

/* ─── Page ──────────────────────────────────────────────────────── */
const LandingPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Terminal size={15} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">DevTrace AI</span>
            <span className="hidden sm:inline text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full font-medium">Open Source</span>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <a href="https://github.com/JexanJoel/DevTrace-AI" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition px-3 py-2">
              <Github size={16} /> GitHub
            </a>
            <button onClick={() => navigate('/login')} className="text-sm text-gray-600 hover:text-gray-900 font-medium transition px-3 py-2">Sign in</button>
            <button onClick={() => navigate('/register')} className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl transition">
              Get started free
            </button>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2">
            <a href="https://github.com/JexanJoel/DevTrace-AI" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-600 px-3 py-2.5 rounded-xl hover:bg-gray-50">
              <Github size={16} /> GitHub
            </a>
            <button onClick={() => { navigate('/login'); setMenuOpen(false); }}
              className="w-full text-left text-sm text-gray-600 font-medium px-3 py-2.5 rounded-xl hover:bg-gray-50">Sign in</button>
            <button onClick={() => { navigate('/register'); setMenuOpen(false); }}
              className="w-full text-sm bg-indigo-600 text-white font-semibold px-4 py-3 rounded-xl">Get started free</button>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/60 via-white to-white pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 sm:w-[600px] h-64 sm:h-[600px] bg-indigo-200 opacity-20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full">
              <Sparkles size={12} /> Groq + Llama 3.3 70B
            </span>
            <span className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-100 text-orange-700 text-xs font-medium px-3 py-1.5 rounded-full">
              <WifiOff size={12} /> Works offline
            </span>
            <span className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-100 text-teal-700 text-xs font-medium px-3 py-1.5 rounded-full">
              <Users size={12} /> Live Collaboration
            </span>
            <span className="inline-flex items-center gap-1.5 bg-cyan-50 border border-cyan-100 text-cyan-700 text-xs font-medium px-3 py-1.5 rounded-full">
              <Activity size={12} /> Activity Feed
            </span>
            <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full">
              <History size={12} /> Similar Sessions
            </span>
            <span className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-100 text-violet-700 text-xs font-medium px-3 py-1.5 rounded-full">
              <Dna size={12} /> Debug DNA
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-5 sm:mb-6">
            Your team's permanent<br />
            <span className="text-indigo-600">debugging memory.</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-500 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            Log bugs, get full AI analysis, debug with teammates in real time.
            <br className="hidden sm:block" />
            Everything persists. Everything syncs. Everything works — even offline.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button onClick={() => navigate('/register')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl transition text-base shadow-lg shadow-indigo-200">
              Start debugging free <ArrowRight size={18} />
            </button>
            <a href="https://github.com/JexanJoel/DevTrace-AI" target="_blank" rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-indigo-300 text-gray-700 font-semibold px-8 py-3.5 rounded-xl transition text-base">
              <Github size={18} /> View on GitHub
            </a>
          </div>
          <p className="text-sm text-gray-400 mt-4">Free forever · No credit card · Open source</p>
        </div>

        {/* Hero terminal card */}
        <div className="relative max-w-2xl mx-auto mt-12 sm:mt-16 px-2 sm:px-0">
          <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3.5 border-b border-gray-800">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-gray-500 text-xs font-mono">devtrace · project: api-service</span>
              <span className="ml-auto flex items-center gap-1 text-xs text-orange-400 font-mono">
                <WifiOff size={10} /> offline
              </span>
            </div>
            <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm space-y-3 text-left">
              <div className="flex items-start gap-3">
                <span className="text-red-400 flex-shrink-0">✗</span>
                <div>
                  <p className="text-red-300">TypeError: Cannot read properties of undefined</p>
                  <p className="text-gray-500 text-xs mt-0.5">at ProductList.jsx:45 · severity: high</p>
                </div>
              </div>
              <div className="border-t border-gray-800 pt-3 flex items-start gap-3">
                <span className="text-amber-400 flex-shrink-0">◈</span>
                <div>
                  <p className="text-amber-300">Similar sessions found — 2 matches from history</p>
                  <p className="text-gray-400 text-xs mt-1">Queried local SQLite · zero network · instant</p>
                </div>
              </div>
              <div className="border-t border-gray-800 pt-3 flex items-start gap-3">
                <span className="text-teal-400 flex-shrink-0">●</span>
                <div>
                  <p className="text-teal-300">Sarah is debugging with you · checklist syncing live</p>
                  <p className="text-gray-400 text-xs mt-1">Presence · shared checklist · team chat via PowerSync</p>
                </div>
              </div>
              <div className="border-t border-gray-800 pt-3 flex items-start gap-3">
                <span className="text-cyan-400 flex-shrink-0">▶</span>
                <div>
                  <p className="text-cyan-300">Project activity · Sarah resolved "Auth token expired"</p>
                  <p className="text-gray-400 text-xs mt-1">Activity feed · synced to all collaborators · click to view</p>
                </div>
              </div>
              <div className="border-t border-gray-800 pt-3 flex items-start gap-3">
                <span className="text-indigo-400 flex-shrink-0">⚡</span>
                <div>
                  <p className="text-indigo-300">AI Analysis · 92% confidence · 8 tabs</p>
                  <p className="text-gray-400 text-xs mt-1">Root cause · 3 fixes · Timeline · Checklist · Chat · Tests</p>
                </div>
              </div>
              <div className="border-t border-gray-800 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-green-400">✓</span>
                  <p className="text-green-300">Resolved · logged to activity feed · saved to Fix Library</p>
                </div>
                <span className="text-xs text-gray-500 font-mono">synced offline</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <section className="py-8 sm:py-10 border-y border-gray-100 bg-gray-50 overflow-hidden">
        <p className="text-center text-xs text-gray-400 font-medium uppercase tracking-widest mb-5 px-4">Built with</p>
        <Marquee />
      </section>

      {/* ── Offline callout ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <span className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <WifiOff size={12} /> Powered by PowerSync
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3">Works completely offline</h2>
            <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
              Most tools break the moment you lose internet. DevTrace AI doesn't.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <WifiOff size={14} className="text-red-500" />
                </div>
                <p className="font-bold text-red-700 text-sm">Without PowerSync</p>
              </div>
              <ul className="space-y-2.5">
                {['Every page load hits the network','Offline = white screen or error','Slow dashboards with loading spinners','Sessions lost if you lose connection','No internet? No debugging.'].map((t, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-red-700">
                    <span className="flex-shrink-0 mt-0.5 text-red-400">✗</span>{t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-green-100 bg-green-50 p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Wifi size={14} className="text-green-600" />
                </div>
                <p className="font-bold text-green-700 text-sm">With PowerSync</p>
              </div>
              <ul className="space-y-2.5">
                {['All reads from local SQLite — 0ms','Offline banner shown, app keeps working','Dashboards load instantly, always','Sessions created offline, synced later','Full debugging capability anywhere'].map((t, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-green-700">
                    <span className="flex-shrink-0 mt-0.5 text-green-500">✓</span>{t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="bg-gray-900 rounded-2xl p-5 sm:p-7">
            <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-5">Data flow</p>
            <div className="flex flex-col sm:hidden gap-2">
              {[
                { label: 'Supabase',     sub: 'Source of truth',      color: 'bg-green-900 border-green-700 text-green-300' },
                { label: 'WAL Stream',   sub: 'Postgres replication',  color: 'bg-gray-800 border-gray-600 text-gray-300' },
                { label: 'PowerSync',    sub: 'Sync engine',           color: 'bg-indigo-900 border-indigo-700 text-indigo-300' },
                { label: 'Local SQLite', sub: 'In your browser',       color: 'bg-orange-900 border-orange-700 text-orange-300' },
                { label: 'useQuery()',   sub: '0ms · always ready',    color: 'bg-purple-900 border-purple-700 text-purple-300' },
              ].map((node, i, arr) => (
                <div key={i} className="flex flex-col items-center">
                  <div className={`w-full border rounded-xl px-4 py-3 text-center ${node.color}`}>
                    <p className="font-bold text-sm">{node.label}</p>
                    <p className="text-xs opacity-70 mt-0.5">{node.sub}</p>
                  </div>
                  {i < arr.length - 1 && <div className="text-gray-600 text-sm font-mono my-1">↓</div>}
                </div>
              ))}
            </div>
            <div className="hidden sm:flex items-center gap-0">
              {[
                { label: 'Supabase',     sub: 'Source of truth',      color: 'bg-green-900 border-green-700 text-green-300' },
                { label: 'WAL Stream',   sub: 'Postgres replication',  color: 'bg-gray-800 border-gray-600 text-gray-300' },
                { label: 'PowerSync',    sub: 'Sync engine',           color: 'bg-indigo-900 border-indigo-700 text-indigo-300' },
                { label: 'Local SQLite', sub: 'In your browser',       color: 'bg-orange-900 border-orange-700 text-orange-300' },
                { label: 'useQuery()',   sub: '0ms · always ready',    color: 'bg-purple-900 border-purple-700 text-purple-300' },
              ].map((node, i, arr) => (
                <div key={i} className="flex items-center flex-1">
                  <div className={`flex-1 border rounded-xl px-3 py-2.5 text-center ${node.color}`}>
                    <p className="font-bold text-xs">{node.label}</p>
                    <p className="text-[10px] opacity-70 mt-0.5">{node.sub}</p>
                  </div>
                  {i < arr.length - 1 && <div className="text-gray-600 text-xs mx-1.5 font-mono">→</div>}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 font-mono mt-4 leading-relaxed">
              Writes go directly to Supabase · PowerSync detects via WAL · local SQLite updates · <span className="text-orange-400">useQuery()</span> reflects change instantly
            </p>
          </div>
        </div>
      </section>

      {/* ── Live Collaboration callout ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-5">

          {/* Session-level collab */}
          <div className="bg-gradient-to-br from-teal-600 to-indigo-600 rounded-2xl p-6 sm:p-10 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Users size={32} className="text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold">Session Collaboration</h2>
                  <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-1 rounded-lg">Powered by PowerSync</span>
                </div>
                <p className="text-teal-100 text-sm sm:text-base leading-relaxed mb-5">
                  Open a shared session and debug together in real time. Presence indicators show who's in the session, the AI checklist syncs live across all participants, and team chat delivers messages instantly — all via PowerSync WAL with zero backend code.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { icon: <Users size={14} />,         label: 'Live Presence',    sub: 'See who is in the session' },
                    { icon: <CheckCircle size={14} />,   label: 'Shared Checklist', sub: 'Syncs instantly via PowerSync' },
                    { icon: <MessageSquare size={14} />, label: 'Team Chat',        sub: 'Real-time, no polling' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-white/10 rounded-xl px-3 py-2.5">
                      <div className="text-teal-200 flex-shrink-0">{item.icon}</div>
                      <div>
                        <p className="text-xs font-semibold text-white">{item.label}</p>
                        <p className="text-xs text-teal-200">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Project-level collab */}
          <div className="bg-gradient-to-br from-cyan-600 to-teal-600 rounded-2xl p-6 sm:p-10 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <FolderOpen size={32} className="text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold">Project Collaboration</h2>
                  <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-1 rounded-lg">New</span>
                </div>
                <p className="text-cyan-100 text-sm sm:text-base leading-relaxed mb-5">
                  Collaboration extends to the entire project. See who's browsing the project right now, chat with your team about the project as a whole, and watch a live activity feed show every session created, resolved, or analyzed by any collaborator.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { icon: <Users size={14} />,         label: 'Project Presence', sub: 'Avatar stack on every project' },
                    { icon: <Activity size={14} />,      label: 'Activity Feed',    sub: 'Every event logged in real time' },
                    { icon: <MessageSquare size={14} />, label: 'Project Chat',     sub: 'Team discussion at project level' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-white/10 rounded-xl px-3 py-2.5">
                      <div className="text-cyan-200 flex-shrink-0">{item.icon}</div>
                      <div>
                        <p className="text-xs font-semibold text-white">{item.label}</p>
                        <p className="text-xs text-cyan-200">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Debug DNA callout ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-6 sm:p-10 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Dna size={32} className="text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold">Debug DNA</h2>
                  <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-1 rounded-lg">Supabase Edge Function</span>
                </div>
                <p className="text-violet-100 text-sm sm:text-base leading-relaxed mb-5">
                  After enough sessions, DevTrace AI builds your personal error fingerprint. A Supabase Edge Function queries your history server-side, computes your patterns, then Groq writes a personalized narrative about how you debug — your strengths, blind spots, and habits.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { icon: <Zap size={14} />,      label: 'Server-side SQL', sub: 'Edge Function + service role' },
                    { icon: <Sparkles size={14} />, label: 'AI Narrative',    sub: 'Groq writes your profile' },
                    { icon: <Database size={14} />, label: 'Export as .md',   sub: 'Your debugging fingerprint' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-white/10 rounded-xl px-3 py-2.5">
                      <div className="text-violet-200 flex-shrink-0">{item.icon}</div>
                      <div>
                        <p className="text-xs font-semibold text-white">{item.label}</p>
                        <p className="text-xs text-violet-200">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Zap size={12} /> Everything included
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">Everything you need to debug seriously</h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
              Not just a fix generator — a complete team debugging platform that gets smarter over time
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {FEATURES.map((f, i) => {
              const c = COLOR_MAP[f.color];
              return (
                <div key={i} className={`group relative bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 transition-all duration-300 hover:shadow-lg ${c.border} ${c.glow} cursor-default overflow-hidden`}>
                  <div className={`absolute inset-0 ${c.bg} opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-2xl`} />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-11 h-11 ${c.bg} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <span className={c.icon}>{f.icon}</span>
                      </div>
                      {f.tag && <span className={`text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0 ${c.tag}`}>{f.tag}</span>}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base leading-snug">{f.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats bar */}
          <div className="mt-10 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: '8',    label: 'AI analysis tabs',      color: 'text-indigo-600' },
              { value: '11',   label: 'synced tables',          color: 'text-green-600'  },
              { value: '0ms',  label: 'read latency (offline)', color: 'text-orange-500' },
              { value: '100%', label: 'server-side AI calls',   color: 'text-violet-600' },
            ].map((s, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-4 sm:p-5 text-center border border-gray-100">
                <p className={`text-2xl sm:text-3xl font-bold ${s.color} mb-1`}>{s.value}</p>
                <p className="text-xs text-gray-400 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-gray-400 text-base sm:text-lg">From error to fix — and beyond</p>
          </div>
          <div className="relative">
            <div className="absolute left-6 sm:left-7 top-0 bottom-0 w-px bg-gray-200 hidden sm:block" />
            <div className="space-y-4 sm:space-y-0">
              {STEPS.map((s, i) => {
                const iconBg = s.color ? STEP_ICON_BG[s.color] : 'bg-indigo-600 shadow-indigo-200';
                const border = s.color ? STEP_BORDER[s.color] : 'border-gray-100 hover:border-indigo-200';
                const badgeCls = s.color ? STEP_BADGE[s.color] : '';
                return (
                  <div key={i} className="relative flex items-start gap-4 sm:gap-6 sm:pb-8 last:pb-0">
                    <div className={`relative z-10 flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg ${iconBg}`}>
                      <div className="text-white">{s.icon}</div>
                      <span className="text-white/70 text-[9px] font-bold mt-0.5">{s.step}</span>
                    </div>
                    <div className={`flex-1 bg-white border rounded-2xl p-4 sm:p-5 hover:shadow-sm transition min-w-0 ${border}`}>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base">{s.title}</h3>
                        {s.badge && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeCls}`}>{s.badge}</span>}
                      </div>
                      <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Built on best infra ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Built on the best open infrastructure</h2>
            <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
              No custom backend. No ops burden. Three best-in-class open source platforms — each doing exactly what they're best at.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">

            {/* Supabase */}
            <div className="relative bg-white rounded-2xl border border-green-100 overflow-hidden flex flex-col group hover:shadow-lg hover:border-green-200 transition-all duration-300">
              <div className="h-1.5 w-full bg-gradient-to-r from-green-400 to-emerald-500" />
              <div className="p-5 sm:p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
                    <img src="https://www.vectorlogo.zone/logos/supabase/supabase-icon.svg" alt="Supabase" className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 leading-tight">Supabase</p>
                    <p className="text-xs text-gray-400 mt-0.5">Database · Auth · Storage · Edge</p>
                  </div>
                </div>
                <p className="text-xs font-semibold text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-lg w-fit mb-4">Source of truth</p>
                <ul className="space-y-2.5 text-sm text-gray-500 flex-1">
                  {['Postgres + RLS on 11 tables','Email, GitHub & Google OAuth','Magic link password reset','GitHub account linking','Storage for avatars','WAL replication to PowerSync','Edge Functions for AI + Debug DNA'].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-green-500 mt-0.5 flex-shrink-0 font-bold">✓</span><span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs bg-green-50 text-green-600 border border-green-100 px-2.5 py-1 rounded-full font-semibold">Apache 2.0</span>
                  <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-green-600 transition font-medium">supabase.com →</a>
                </div>
              </div>
            </div>

            {/* PowerSync */}
            <div className="relative bg-white rounded-2xl border border-indigo-200 overflow-hidden flex flex-col group hover:shadow-lg hover:border-indigo-300 transition-all duration-300 sm:scale-[1.02]">
              <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-violet-500" />
              <div className="p-5 sm:p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                      <img src="https://avatars.githubusercontent.com/u/105956274?s=48&v=4" alt="PowerSync" className="w-6 h-6 rounded-md" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 leading-tight">PowerSync</p>
                      <p className="text-xs text-gray-400 mt-0.5">Offline Sync · Collaboration</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-1 rounded-lg flex-shrink-0">CORE</span>
                </div>
                <p className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg w-fit mb-4">Offline + collab engine</p>
                <ul className="space-y-2.5 text-sm text-gray-500 flex-1">
                  {['11 tables synced to local SQLite','All reads instant — 0ms latency','Session + project collaboration','Activity feed · chat · presence','Offline write queue via mutations','Similar Sessions on local SQLite','5 PowerSync bucket definitions'].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-indigo-500 mt-0.5 flex-shrink-0 font-bold">✓</span><span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-full font-semibold">Apache 2.0</span>
                  <a href="https://www.powersync.com" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-indigo-600 transition font-medium">powersync.com →</a>
                </div>
              </div>
            </div>

            {/* React Ecosystem */}
            <div className="relative bg-white rounded-2xl border border-blue-100 overflow-hidden flex flex-col group hover:shadow-lg hover:border-blue-200 transition-all duration-300">
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 to-cyan-500" />
              <div className="p-5 sm:p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="React" className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 leading-tight">React Ecosystem</p>
                    <p className="text-xs text-gray-400 mt-0.5">UI · State · Build</p>
                  </div>
                </div>
                <p className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg w-fit mb-4">Frontend stack</p>
                <ul className="space-y-2.5 text-sm text-gray-500 flex-1">
                  {['React 18 + TypeScript','Vite for lightning-fast builds','Tailwind CSS for styling','Zustand for global state','Recharts for analytics','React Router for navigation','Deployed on Vercel'].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-blue-500 mt-0.5 flex-shrink-0 font-bold">✓</span><span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full font-semibold">MIT License</span>
                  <a href="https://react.dev" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-blue-600 transition font-medium">react.dev →</a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6">
              <Terminal size={22} className="text-white" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
              Stop Googling the same bug twice
            </h2>
            <p className="text-indigo-200 text-base sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">
              Free forever. Open source. Works offline.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button onClick={() => navigate('/register')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-indigo-600 font-bold px-8 py-3.5 rounded-xl transition shadow-lg">
                Get started free <ArrowRight size={18} />
              </button>
              <a href="https://github.com/JexanJoel/DevTrace-AI" target="_blank" rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-white/30 hover:border-white/60 text-white font-semibold px-8 py-3.5 rounded-xl transition">
                <Github size={18} /> View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Terminal size={11} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">DevTrace AI</span>
            <span className="text-gray-400 text-sm">· Open Source</span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm text-center flex items-center gap-1">
            Built with <Heart size={11} className="text-red-400" /> for the PowerSync AI Hackathon 2026
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <a href="https://github.com/JexanJoel/DevTrace-AI" target="_blank" rel="noopener noreferrer"
              className="hover:text-gray-700 transition flex items-center gap-1">
              <Github size={13} /> GitHub
            </a>
            <span>·</span>
            <span>MIT License</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;