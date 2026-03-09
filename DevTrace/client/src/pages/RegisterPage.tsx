// RegisterPage — clean split panel, perfectly centered

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Terminal, Github, Loader2, CheckCircle, Zap, GitBranch, ShieldCheck, Bug } from 'lucide-react';
import toast from 'react-hot-toast';

const features = [
  { icon: <Zap size={15} />, text: 'Unlimited debug sessions' },
  { icon: <GitBranch size={15} />, text: 'GitHub repo integration' },
  { icon: <ShieldCheck size={15} />, text: 'Offline support + auto sync' },
  { icon: <Bug size={15} />, text: 'Fix library & session history' },
];

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleRegister = async () => {
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) toast.error(error.message);
    else { setDone(true); toast.success('Account created!'); }
    setLoading(false);
  };

  const handleGitHub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm mb-6">
            Verification link sent to{' '}
            <span className="text-gray-800 font-semibold">{email}</span>
          </p>
          <Link to="/login"
            className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel ── */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col min-h-screen relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #312e81 0%, #4338ca 55%, #6366f1 100%)' }}
      >
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
          }}
        />
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-400 opacity-10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-900 opacity-20 rounded-full blur-3xl" />

        {/* Logo */}
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
                Join developers, debug smarter.
              </h2>
            </div>

            {/* Features */}
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
                { v: '99%', l: 'Uptime' },
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

          <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Terminal size={15} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">DevTrace AI</span>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <div className="text-center mb-7">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
              <p className="text-gray-400 text-sm">Free forever · No credit card needed</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleGitHub}
                  className="flex items-center justify-center gap-2 border-2 border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 text-gray-700 rounded-xl py-2.5 transition text-sm font-medium">
                  <Github size={16} /> GitHub
                </button>
                <button onClick={handleGoogle}
                  className="flex items-center justify-center gap-2 border-2 border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 text-gray-700 rounded-xl py-2.5 transition text-sm font-medium">
                  <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" /> Google
                </button>
              </div>

              <div className="flex items-center gap-3">
                <hr className="flex-1 border-gray-100" />
                <span className="text-gray-300 text-xs font-medium">OR</span>
                <hr className="flex-1 border-gray-100" />
              </div>

              <input type="email" placeholder="Email address" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-gray-100 focus:border-indigo-400 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-300"
              />
              <input type="password" placeholder="Password (min 6 characters)" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                className="w-full border-2 border-gray-100 focus:border-indigo-400 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-300"
              />

              <button onClick={handleRegister}
                disabled={loading || !email || !password}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl py-3 font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed">
                {loading && <Loader2 size={16} className="animate-spin" />}
                Create free account
              </button>

              <p className="text-center text-gray-300 text-xs">
                By signing up you agree to our{' '}
                <span className="text-indigo-500 cursor-pointer hover:underline">Terms</span>
                {' & '}
                <span className="text-indigo-500 cursor-pointer hover:underline">Privacy Policy</span>
              </p>
            </div>
          </div>

          <p className="text-center text-gray-400 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;