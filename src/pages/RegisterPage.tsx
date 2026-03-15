import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Terminal, Github, Loader2, Zap, GitBranch, ShieldCheck, Bug, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const features = [
  { icon: <Zap size={15} />, text: 'Unlimited debug sessions' },
  { icon: <GitBranch size={15} />, text: 'GitHub repo integration' },
  { icon: <ShieldCheck size={15} />, text: 'Offline support + auto sync' },
  { icon: <Bug size={15} />, text: 'Fix library & session history' },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) return toast.error('Please fill in all fields');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      await supabase.from('profiles').update({ name }).eq('id', data.user!.id);
      toast.success('Account created! Welcome to DevTrace 🎉');
      navigate('/dashboard');
    } else {
      toast.error('Please disable "Confirm email" in Supabase Auth settings to skip verification.');
    }

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
        style={{ background: 'linear-gradient(160deg, #312e81 0%, #4338ca 55%, #6366f1 100%)' }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-400 opacity-10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-900 opacity-20 rounded-full blur-3xl" />

        <div className="relative z-10 p-10 pb-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Terminal size={17} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg">DevTrace AI</span>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center px-10">
          <div className="w-full max-w-xs space-y-8 text-center">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Join developers,<br />debug smarter.
            </h2>
            <div className="flex flex-col gap-2.5">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm text-left">
                  <span className="text-indigo-200 flex-shrink-0">{f.icon}</span>
                  {f.text}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{ v: '10k+', l: 'Developers' }, { v: '50k+', l: 'Sessions' }, { v: '99%', l: 'Uptime' }].map((s, i) => (
                <div key={i} className="bg-white/10 border border-white/10 rounded-xl py-3">
                  <p className="text-white font-bold text-xl">{s.v}</p>
                  <p className="text-indigo-200 text-xs mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 p-10 pt-0">
          <p className="text-white/25 text-xs">© 2026 DevTrace AI · Open Source</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="relative w-full lg:w-[55%] flex items-center justify-center px-8 sm:px-16 bg-gray-50 min-h-screen">

        {/* Back button — desktop */}
        <div className="hidden lg:flex absolute top-8 left-8">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition font-medium"
          >
            <ArrowLeft size={15} /> Back to home
          </Link>
        </div>

        <div className="w-full max-w-sm">
          {/* Back button — mobile */}
          <div className="lg:hidden flex justify-start mb-6">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition font-medium"
            >
              <ArrowLeft size={15} /> Back to home
            </Link>
          </div>

          <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Terminal size={15} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">DevTrace AI</span>
          </div>

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

              <input type="text" placeholder="Full name" value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-2 border-gray-100 focus:border-indigo-400 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-300"
              />
              <input type="email" placeholder="Email address" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-gray-100 focus:border-indigo-400 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-300"
              />
              <input type="password" placeholder="Password (min 6 characters)" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                className="w-full border-2 border-gray-100 focus:border-indigo-400 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-300"
              />

              <button onClick={handleRegister} disabled={loading || !name || !email || !password}
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
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;