import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Terminal, Bug, Sparkles, GitBranch, BookOpen,
  BarChart2, Shield, Zap, ArrowRight, Github,
  CheckCircle, Star, Users, Activity, Menu, X
} from 'lucide-react';

const FEATURES = [
  { icon: <Bug size={22} />, title: 'Session Tracking', desc: 'Log every debug session with error messages, stack traces, and severity levels.', color: 'bg-red-50 text-red-500' },
  { icon: <Sparkles size={22} />, title: 'AI Fix Suggestions', desc: 'Get instant fixes powered by Groq + Llama 3. Analyze errors in seconds.', color: 'bg-indigo-50 text-indigo-500' },
  { icon: <BookOpen size={22} />, title: 'Fix Library', desc: 'Save and reuse AI fixes across projects. Build your personal fix knowledge base.', color: 'bg-green-50 text-green-500' },
  { icon: <GitBranch size={22} />, title: 'GitHub Integration', desc: 'Link your repos to projects. View repo stats, stars, and last commit directly.', color: 'bg-purple-50 text-purple-500' },
  { icon: <BarChart2 size={22} />, title: 'Error Analytics', desc: 'Visualize your debugging patterns. Track resolution rates and error trends over time.', color: 'bg-orange-50 text-orange-500' },
  { icon: <Shield size={22} />, title: 'Secure by Default', desc: 'Built on Supabase Auth with RLS. Your data is private and protected by default.', color: 'bg-blue-50 text-blue-500' },
];

const STEPS = [
  { step: '01', title: 'Create a Project', desc: 'Link your codebase, set the language, and optionally connect your GitHub repo.' },
  { step: '02', title: 'Log Debug Sessions', desc: 'Paste your error message and stack trace. Tag severity. Everything is saved instantly.' },
  { step: '03', title: 'Get AI Fixes', desc: 'Hit "Get AI Fix" — Groq analyzes the error and returns a fix with confidence score.' },
];

const STATS = [
  { value: '10k+', label: 'Developers', icon: <Users size={18} /> },
  { value: '50k+', label: 'Sessions Logged', icon: <Activity size={18} /> },
  { value: '98%', label: 'Fix Accuracy', icon: <CheckCircle size={18} /> },
  { value: '< 2s', label: 'AI Response', icon: <Zap size={18} /> },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Terminal size={15} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">DevTrace AI</span>
            <span className="hidden sm:inline text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full font-medium">Open Source</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            <a href="https://github.com/JexanJoel/DevTrace-AI" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition px-3 py-2">
              <Github size={16} /> GitHub
            </a>
            <button onClick={() => navigate('/login')}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition px-3 py-2">
              Sign in
            </button>
            <button onClick={() => navigate('/register')}
              className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl transition">
              Get started free
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2.5 rounded-xl hover:bg-gray-50">
              <Github size={16} /> GitHub
            </a>
            <button onClick={() => { navigate('/login'); setMenuOpen(false); }}
              className="w-full text-left text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-2.5 rounded-xl hover:bg-gray-50">
              Sign in
            </button>
            <button onClick={() => { navigate('/register'); setMenuOpen(false); }}
              className="w-full text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-3 rounded-xl transition">
              Get started free
            </button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/60 via-white to-white pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 sm:w-[600px] h-64 sm:h-[600px] bg-indigo-200 opacity-20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium px-4 py-2 rounded-full mb-6">
            <Sparkles size={13} /> Powered by Groq + Llama 3.3 70B
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-5 sm:mb-6">
            Debug smarter,<br />
            <span className="text-indigo-600">ship faster.</span>
          </h1>

          <p className="text-base sm:text-xl text-gray-500 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            DevTrace AI is an open source debugging assistant that tracks your sessions,
            suggests AI fixes, and helps you ship better code.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button onClick={() => navigate('/register')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl transition text-base shadow-lg shadow-indigo-200">
              Start debugging free <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/login')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-indigo-300 text-gray-700 font-semibold px-8 py-3.5 rounded-xl transition text-base">
              Sign in
            </button>
          </div>

          <p className="text-sm text-gray-400 mt-4">Free forever · No credit card · Open source</p>
        </div>

        {/* Hero code card */}
        <div className="relative max-w-2xl mx-auto mt-12 sm:mt-16 px-2 sm:px-0">
          <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3.5 border-b border-gray-800">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-gray-500 text-xs font-mono">devtrace · session #42</span>
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
                <span className="text-indigo-400 flex-shrink-0">⚡</span>
                <div>
                  <p className="text-indigo-300">AI Fix · 92% confidence</p>
                  <p className="text-gray-400 text-xs mt-1">Add null check: <span className="text-green-300">data?.map(item =&gt; ...)</span></p>
                </div>
              </div>
              <div className="border-t border-gray-800 pt-3 flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <p className="text-green-300">Resolved · saved to Fix Library</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-10 sm:py-12 px-4 sm:px-6 border-y border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div className="flex items-center justify-center gap-2 text-indigo-500 mb-1">{s.icon}</div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to debug faster
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
              Built for developers who are tired of copy-pasting errors into ChatGPT
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 hover:border-indigo-200 hover:shadow-md transition">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 ${f.color} rounded-2xl flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-gray-400 text-base sm:text-lg">From error to fix in under 30 seconds</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
            {STEPS.map((s, i) => (
              <div key={i} className="flex sm:flex-col items-start sm:items-center gap-4 sm:gap-0 sm:text-center">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 sm:mb-4 shadow-lg shadow-indigo-200">
                  <span className="text-white font-bold text-lg">{s.step}</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 sm:mb-2">{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6">
              <Terminal size={22} className="text-white" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
              Start debugging smarter today
            </h2>
            <p className="text-indigo-200 text-base sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">
              Free forever. Open source. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button onClick={() => navigate('/register')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-indigo-600 font-bold px-8 py-3.5 rounded-xl transition shadow-lg">
                Get started free <ArrowRight size={18} />
              </button>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-white/30 hover:border-white/60 text-white font-semibold px-8 py-3.5 rounded-xl transition">
                <Github size={18} /> View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Terminal size={11} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">DevTrace AI</span>
            <span className="text-gray-400 text-sm">· Open Source</span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm text-center">Built with React, Supabase, and Groq AI · 2026</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;