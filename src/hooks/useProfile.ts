// useProfile.ts — reads from local PowerSync SQLite, writes to Supabase
import { useQuery } from '@powersync/react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  github_username: string | null;
  avatar_url: string | null;
  created_at: string | null;
}

const useProfile = () => {
  const { user } = useAuthStore();
  const uid = user?.id ?? '';

  // Read from local SQLite — works offline
  const { data: rows = [] } = useQuery<Profile>(
    'SELECT * FROM profiles WHERE id = ? LIMIT 1', [uid]
  );

  const profile: Profile | null = rows[0] ?? null;
  const loading = false;

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return false;
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (error) { toast.error('Failed to update profile'); return false; }
    toast.success('Profile updated!');
    return true;
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return null;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return null; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return null; }

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars').upload(filePath, file, { upsert: true });
    if (uploadError) { toast.error('Failed to upload avatar'); return null; }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;
    await updateProfile({ avatar_url: avatarUrl });
    return avatarUrl;
  };

  // fetchProfile kept for compatibility but is a no-op (PowerSync auto-syncs)
  const fetchProfile = () => {};

  return { profile, loading, updateProfile, uploadAvatar, fetchProfile };
};

export default useProfile;