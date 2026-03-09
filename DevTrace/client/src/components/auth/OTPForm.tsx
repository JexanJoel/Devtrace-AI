// OTPForm — verifies 6-digit OTP for email or phone flows

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface Props {
  email?: string;
  phone?: string;
  onVerified: () => void;
}

const OTPForm = ({ email, phone, onVerified }: Props) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    let error;

    if (email) {
      // Verify email OTP
      ({ error } = await supabase.auth.verifyOtp({
        email, token: otp, type: 'email',
      }));
    } else if (phone) {
      // Verify SMS OTP
      ({ error } = await supabase.auth.verifyOtp({
        phone, token: otp, type: 'sms',
      }));
    }

    if (error) toast.error(error.message);
    else {
      toast.success('Verified!');
      onVerified();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm text-center">
        Enter the 6-digit code sent to{' '}
        <span className="text-white font-medium">{email || phone}</span>
      </p>

      <input
        type="text"
        maxLength={6}
        placeholder="000000"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-4 text-center text-2xl tracking-widest focus:outline-none focus:border-indigo-500 transition"
      />

      <button
        onClick={handleVerify}
        disabled={loading || otp.length < 6}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-medium transition disabled:opacity-50"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        Verify OTP
      </button>
    </div>
  );
};

export default OTPForm;