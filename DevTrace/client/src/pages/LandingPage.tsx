// LandingPage — first page users see before signing in
// Clean hero with CTA to login or register

import { Link } from 'react-router-dom';
import { Terminal, Zap, GitBranch, Search } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Terminal size={16} className="text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-lg font-display">DevTrace AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2 transition"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-8 pt-24 pb-20 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <Zap size={12} />
          AI-powered debugging assistant
        </div>

        {/* Headline */}
        <h1 className="font-display text-6xl font-bold text-gray-900 leading-tight mb-6">
          Debug faster with
          <span className="text-indigo-600"> AI assistance</span>
        </h1>

        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          DevTrace AI helps you log errors, analyze root causes, and find fixes — 
          all in one place. Works offline, syncs everywhere.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/register"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-3.5 rounded-xl transition text-base"
          >
            Start debugging for free
          </Link>
          <Link
            to="/login"
            className="text-gray-700 hover:text-gray-900 font-medium px-8 py-3.5 rounded-xl border border-gray-200 hover:border-gray-300 transition text-base"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div className="max-w-5xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Terminal size={20} className="text-indigo-600" />,
              title: 'Debug Session Logs',
              desc: 'Log errors, stack traces, and notes in structured sessions.',
            },
            {
              icon: <Zap size={20} className="text-indigo-600" />,
              title: 'AI Error Analyzer',
              desc: 'Get instant explanations, causes, and code fixes from AI.',
            },
            {
              icon: <GitBranch size={20} className="text-indigo-600" />,
              title: 'GitHub Integration',
              desc: 'Import repos directly and track errors per project.',
            },
            {
              icon: <Search size={20} className="text-indigo-600" />,
              title: 'Similar Error Detection',
              desc: 'Automatically finds past sessions with matching errors.',
            },
            {
              icon: <Zap size={20} className="text-indigo-600" />,
              title: 'Offline First',
              desc: 'Create and view sessions without internet. Syncs automatically.',
            },
            {
              icon: <Terminal size={20} className="text-indigo-600" />,
              title: 'Fix Playground',
              desc: 'Edit and test AI suggestions in a built-in code editor.',
            },
          ].map((f, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 py-6 text-center">
        <p className="text-sm text-gray-400">
          © 2026 DevTrace AI · Open Source ·{' '}
          <a href="https://github.com" className="hover:text-indigo-600 transition">GitHub</a>
        </p>
      </div>
    </div>
  );
};

export default LandingPage;