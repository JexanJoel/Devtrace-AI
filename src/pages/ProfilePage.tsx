import { useState, useEffect } from 'react';
import { Github, Mail, User, Save, Loader2 } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import AvatarUpload from '../components/profile/AvatarUpload';
import useProfile from '../hooks/useProfile';
import { useAuthStore } from '../store/authStore';

const ProfilePage = () => {
  const { user } = useAuthStore();
  const { profile, loading, updateProfile, uploadAvatar } = useProfile();

  const [name, setName] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setGithubUsername(profile.github_username || '');
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ name: name.trim(), github_username: githubUsername.trim() });
    setSaving(false);
  };

  const getInitials = () => {
    if (name) return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    return user?.email?.[0].toUpperCase() ?? 'U';
  };

  // Safely read auth provider without relying on typed app_metadata
  const authProvider = (user as unknown as { app_metadata?: { provider?: string } })?.app_metadata?.provider ?? 'email';

  if (loading) {
    return (
      <DashboardLayout title="Profile">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-indigo-500" size={28} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-2xl space-y-6">

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-5">Profile Photo</h2>
          <AvatarUpload
            currentUrl={profile?.avatar_url ?? null}
            initials={getInitials()}
            onUpload={uploadAvatar}
          />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-5">Personal Info</h2>
          <div className="space-y-4">

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Your full name" value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-2 border-gray-100 dark:border-gray-700 focus:border-indigo-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-300" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={user?.email ?? ''} disabled
                  className="w-full border-2 border-gray-100 dark:border-gray-700 text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm cursor-not-allowed" />
              </div>
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">GitHub Username</label>
              <div className="relative">
                <Github size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="your-github-username" value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  className="w-full border-2 border-gray-100 dark:border-gray-700 focus:border-indigo-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition placeholder-gray-300" />
              </div>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl transition disabled:opacity-50 text-sm">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Account Info</h2>
          <div className="space-y-3">
            {[
              { label: 'Account ID', value: (user?.id?.slice(0, 8) ?? '') + '...' },
              { label: 'Member since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—' },
              { label: 'Auth provider', value: authProvider },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;