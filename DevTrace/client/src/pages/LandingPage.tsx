import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Terminal, Github, Loader2, Bug, Sparkles, GitBranch, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const features = [
  { icon: <Bug size={15} />, text: 'AI-powered debug sessions' },
  { icon: <Sparkles size={15} />, text: 'Groq + Llama 3 fix suggestions' },
  { icon: <GitBranch size={15} />, text: 'GitHub repo integration' },
  { icon: <Shield size={15} />, text: 'Secure by Supabase Auth' },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return toast.error('Enter your email and password');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
    else { toast.success('Welcome back!'); navigate('/dashboard'); }
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

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col min-h-screen relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #3730a3 0%, #4f46e5 60%, #6366f1 100%)' }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-400 opacity-10 rounded-full blur-3xl" />

        <div className="relative z-10 p-10 pb-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Terminal size={17} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg">DevTrace AI</span>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center px-10">
          <div className="w-full max-w-xs space-y-6 text-center">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Debug smarter,<br />ship faster.
            </h2>
            <div className="flex flex-col gap-2">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm">
                  <span className="text-indigo-200 flex-shrink-0">{f.icon}</span>
                  {f.text}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{ v: '10k+', l: 'Devs' }, { v: '50k+', l: 'Sessions' }, { v: '98%', l: 'Accuracy' }].map((s, i) => (
                <div key={i} className="bg-white/10 border border-white/10 rounded-xl py-3 text-center">
                  <p className="text-white font-bold text-xl">{s.v}</p>
                  <p className="text-indigo-200 text-xs mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
            <div className="bg-black/20 border border-white/15 rounded-xl p-4 animate-float">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-xs font-mono">TypeError · login.js:45</span>
                <span className="bg-green-500/20 text-green-300 text-xs px-2 py-0.5 rounded-full border border-green-500/20">Fixed</span>
              </div>
              <p className="text-green-300 text-xs font-mono">data?.map(item =&gt; ...) ✓</p>
              <p className="text-indigo-300 text-xs mt-1">AI confidence: 92%</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-10 pt-0">
          <p className="text-white/25 text-xs">2026 DevTrace AI · Open Source</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-[55%] flex items-center justify-center px-6 sm:px-16 bg-gray-50 min-h-screen">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Terminal size={15} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">DevTrace AI</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <div className="text-center mb-7">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
              <p className="text-gray-400 text-sm">Sign in to your account</p>
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
              <input type="password" placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full border-2 border-gray-100 focus:border-indigo-400 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-300"
              />

              <button onClick={handleLogin} disabled={loading || !email || !password}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl py-3 font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed">
                {loading && <Loader2 size={16} className="animate-spin" />}
                Sign in
              </button>
            </div>
          </div>

          <p className="text-center text-gray-400 text-sm mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;