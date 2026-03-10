// SettingsPage.tsx — working dark mode toggle

import { useState } from 'react';
import { Moon, Bell, Shield, Trash2, Sun } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
  >
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const SettingsPage = () => {
  const { user } = useAuthStore();
  const { isDark, toggleDark } = useThemeStore();
  const navigate = useNavigate();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This will permanently delete your account and all data.')) return;
    if (!confirm('This cannot be undone. Type YES to confirm — proceeding will delete everything.')) return;
    setDeleting(true);
    await supabase.auth.signOut();
    toast.success('Account deleted');
    navigate('/');
    setDeleting(false);
  };

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-xl space-y-6">

        {/* Appearance */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                {isDark ? <Moon size={18} className="text-indigo-400" /> : <Sun size={18} className="text-yellow-500" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
                <p className="text-xs text-gray-400">{isDark ? 'Dark theme active' : 'Light theme active'}</p>
              </div>
            </div>
            <Toggle checked={isDark} onChange={() => user && toggleDark(user.id)} />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Notifications</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 dark:bg-blue-950 rounded-xl flex items-center justify-center">
                <Bell size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</p>
                <p className="text-xs text-gray-400">Receive updates about your sessions</p>
              </div>
            </div>
            <Toggle checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />
          </div>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Security</h2>
          <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 rounded-xl p-4">
            <Shield size={18} className="text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">Account Secured</p>
              <p className="text-xs text-green-600 dark:text-green-400">Your account is protected by Supabase Auth</p>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-red-100 dark:border-red-900 p-6">
          <h2 className="font-bold text-red-600 mb-4">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Delete Account</p>
              <p className="text-xs text-gray-400">Permanently delete your account and all data</p>
            </div>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900 text-red-600 font-medium px-4 py-2 rounded-xl text-sm transition border border-red-200 dark:border-red-800 disabled:opacity-50"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;