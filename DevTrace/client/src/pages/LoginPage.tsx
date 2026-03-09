// LoginPage — clean split panel, perfectly centered both sides

import { Link } from 'react-router-dom';
import { Terminal, Zap, GitBranch, ShieldCheck, Bug } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';

const features = [
  { icon: <Zap size={15} />, text: 'AI error analysis & instant fixes' },
  { icon: <GitBranch size={15} />, text: 'GitHub repo integration' },
  { icon: <ShieldCheck size={15} />, text: 'Offline-first with auto sync' },
  { icon: <Bug size={15} />, text: 'Built-in fix playground' },
];

const LoginPage = () => {
  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel ── */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col min-h-screen relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #3730a3 0%, #4f46e5 60%, #6366f1 100%)' }}
      >
        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
          }}
        />
        {/* Soft glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-300 opacity-10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-900 opacity-20 rounded-full blur-3xl" />

        {/* Logo — top left */}
        <div className="relative z-10 p-10 pb-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Terminal size={17} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg">DevTrace AI</span>
          </div>
        </div>

        {/* Centered content */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-10">
          <div className="w-full max-w-xs space-y-8 text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white text-xs font-medium px-4 py-2 rounded-full">
              ✦ Free forever · No credit card
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h2 className="text-4xl font-bold text-white leading-tight">
                Debug smarter,<br />ship faster.
              </h2>
            </div>

            {/* Features — centered */}
            <div className="flex flex-col gap-2.5">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm text-left">
                  <span className="text-indigo-200 flex-shrink-0">{f.icon}</span>
                  {f.text}
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { v: '10k+', l: 'Developers' },
                { v: '50k+', l: 'Sessions' },
                { v: '94%', l: 'Fix Rate' },
              ].map((s, i) => (
                <div key={i} className="bg-white/10 border border-white/10 rounded-xl py-3">
                  <p className="text-white font-bold text-xl">{s.v}</p>
                  <p className="text-indigo-200 text-xs mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 p-10 pt-0">
          <p className="text-white/25 text-xs">© 2026 DevTrace AI · Open Source</p>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-full lg:w-[55%] flex items-center justify-center px-8 sm:px-16 bg-gray-50 min-h-screen">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Terminal size={15} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">DevTrace AI</span>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <div className="text-center mb-7">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
              <p className="text-gray-400 text-sm">Sign in to continue debugging</p>
            </div>
            <LoginForm />
          </div>

          <p className="text-center text-gray-400 text-sm mt-5">
            New to DevTrace?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Create free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;