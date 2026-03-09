// SettingsPage — app preferences and account settings

import { Moon, Sun, Bell, Shield, Trash2 } from 'lucide-react';
import { useState } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-2xl space-y-6">

        {/* Appearance */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-5">Appearance</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                {darkMode ? <Moon size={16} className="text-gray-600" /> : <Sun size={16} className="text-orange-500" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Dark Mode</p>
                <p className="text-xs text-gray-400">Coming in a future update</p>
              </div>
            </div>
            {/* Toggle */}
            <button
              onClick={() => { setDarkMode(!darkMode); toast('Dark mode coming soon!'); }}
              className={`relative w-11 h-6 rounded-full transition ${darkMode ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-5">Notifications</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Bell size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                <p className="text-xs text-gray-400">Receive updates about your sessions</p>
              </div>
            </div>
            <button
              onClick={() => setEmailNotifs(!emailNotifs)}
              className={`relative w-11 h-6 rounded-full transition ${emailNotifs ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${emailNotifs ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-5">Security</h2>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
            <Shield size={18} className="text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Account Secured</p>
              <p className="text-xs text-gray-500">Your account is protected by Supabase Auth</p>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-red-100 p-6">
          <h2 className="font-bold text-red-600 mb-5">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Delete Account</p>
              <p className="text-xs text-gray-400">Permanently delete your account and all data</p>
            </div>
            <button
              onClick={() => toast.error('Please contact support to delete your account')}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium px-4 py-2 rounded-xl text-sm transition border border-red-200"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;