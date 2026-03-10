import { useState } from 'react';
import { Terminal, Bug, Sparkles, BookOpen, ArrowRight, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/authStore';

const STEPS = [
  {
    icon: <Terminal size={28} className="text-indigo-400" />,
    title: 'Welcome to DevTrace AI',
    desc: 'Your AI-powered debugging assistant. Track every error, get instant fixes, and ship better code.',
  },
  {
    icon: <Bug size={28} className="text-blue-400" />,
    title: 'Log Debug Sessions',
    desc: 'Create a project, then log debug sessions with your error message and stack trace.',
  },
  {
    icon: <Sparkles size={28} className="text-purple-400" />,
    title: 'Get AI Fixes',
    desc: 'Hit "Get AI Fix" — Groq + Llama 3.3 70B analyzes your error and returns a fix with a confidence score.',
  },
  {
    icon: <BookOpen size={28} className="text-green-400" />,
    title: 'Build Your Fix Library',
    desc: 'Save fixes you love and reuse them across projects. Your personal debugging knowledge base.',
  },
];

interface Props { onClose: () => void; }

const OnboardingModal = ({ onClose }: Props) => {
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);

  const markOnboarded = async () => {
    if (!user) return;
    await supabase.from('profiles').update({ onboarded: true }).eq('id', user.id);
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      await markOnboarded();
      onClose();
    }
  };

  const handleSkip = async () => {
    await markOnboarded();
    onClose();
  };

  const current = STEPS[step];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl w-full max-w-md p-8 relative">
        <button onClick={handleSkip}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 transition">
          <X size={16} />
        </button>

        <div className="flex gap-1.5 mb-8">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
          ))}
        </div>

        <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-5">
          {current.icon}
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{current.title}</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">{current.desc}</p>

        <div className="flex items-center justify-between">
          <button onClick={handleSkip} className="text-sm text-gray-400 hover:text-gray-600 transition">
            Skip
          </button>
          <button onClick={handleNext}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition">
            {step < STEPS.length - 1 ? <>Next <ArrowRight size={15} /></> : 'Get Started'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;