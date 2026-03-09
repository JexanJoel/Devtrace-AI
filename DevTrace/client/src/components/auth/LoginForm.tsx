// LoginForm — password login + OTP fallback for forgot password
// OTP sends a 6-digit code, not a magic link

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import { Github, Loader2, ArrowLeft, Lock, Mail, Hash } from 'lucide-react';

type Step = 'main' | 'otp-verify';

const LoginForm = () => {
  const [step, setStep] = useState<Step>('main');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // Standard email + password sign in
  const handleEmailLogin = async () => {
    if (!email || !password) return toast.error('Please fill in all fields');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
    setLoading(false);
  };

  // Send 6-digit OTP — no redirectTo = sends code not magic link
  const handleSendOTP = async () => {
    if (!email) return toast.error('Enter your email address first');
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        // NOT setting emailRedirectTo forces Supabase to send OTP code
      },
    });
    if (error) toast.error(error.message);
    else {
      toast.success('6-digit OTP sent to your email!');
      setStep('otp-verify');
    }
    setLoading(false);
  };

  // Verify the 6-digit OTP code
  const handleVerifyOTP = async () => {
    if (otp.length < 6) return toast.error('Enter the 6-digit code');
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });
    if (error) toast.error(error.message);
    else toast.success('Logged in successfully!');
    setLoading(false);
  };

  // GitHub OAuth
  const handleGitHub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

  // Google OAuth
  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

  // ── OTP Verification Screen ──
  if (step === 'otp-verify') {
    return (
      <div className="space-y-5">
        <button
          onClick={() => { setStep('main'); setOtp(''); }}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition"
        >
          <ArrowLeft size={14} /> Back to sign in
        </button>

        <div className="bg-indigo-50 rounded-2xl p-4 text-center">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Hash size={18} className="text-indigo-600" />
          </div>
          <p className="text-sm font-semibold text-gray-800">Check your email</p>
          <p className="text-xs text-gray-500 mt-1">
            6-digit code sent to{' '}
            <span className="font-semibold text-indigo-600">{email}</span>
          </p>
        </div>

        <input
          type="text"
          maxLength={6}
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP()}
          className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-4 py-3 text-center text-2xl font-mono-code tracking-[0.5em] text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition"
        />

        <button
          onClick={handleVerifyOTP}
          disabled={loading || otp.length < 6}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          Verify & Sign In
        </button>

        <p className="text-center text-xs text-gray-400">
          Didn't receive it?{' '}
          <button onClick={handleSendOTP} className="text-indigo-600 hover:underline font-medium">
            Resend code
          </button>
        </p>
      </div>
    );
  }

  // ── Main Login Screen ──
  return (
    <div className="space-y-4">

      {/* OAuth buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleGitHub}
          className="flex items-center justify-center gap-2 border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl py-2.5 transition text-sm font-medium"
        >
          <Github size={16} /> GitHub
        </button>
        <button
          onClick={handleGoogle}
          className="flex items-center justify-center gap-2 border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl py-2.5 transition text-sm font-medium"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" /> Google
        </button>
      </div>

      <div className="flex items-center gap-3">
        <hr className="flex-1 border-gray-100" />
        <span className="text-gray-300 text-xs font-medium">OR</span>
        <hr className="flex-1 border-gray-100" />
      </div>

      {/* Email */}
      <div className="relative">
        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border-2 border-gray-100 focus:border-indigo-400 text-gray-900 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-300"
        />
      </div>

      {/* Password */}
      <div className="relative">
        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
          className="w-full border-2 border-gray-100 focus:border-indigo-400 text-gray-900 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-300"
        />
      </div>

      {/* Forgot password — triggers OTP */}
      <div className="text-center">
        <button
          onClick={handleSendOTP}
          className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition"
        >
          Forgot password? Sign in with OTP →
        </button>
      </div>

      {/* Sign in */}
      <button
        onClick={handleEmailLogin}
        disabled={loading || !email || !password}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl py-3 font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        Sign in
      </button>
    </div>
  );
};

export default LoginForm;