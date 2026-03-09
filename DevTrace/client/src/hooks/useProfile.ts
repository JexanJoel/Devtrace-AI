// useProfile — fetches and updates the current user's profile
// Used across dashboard, profile page, and topbar

import { useState, useEffect } from 'react';
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile from Supabase on mount
  useEffect(() => {
    if (!user) return;
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)
      .single();

    if (error) console.error('Error fetching profile:', error);
    else setProfile(data);
    setLoading(false);
  };

  // Update profile fields
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to update profile');
      return false;
    }

    // Update local state immediately
    setProfile((prev) => prev ? { ...prev, ...updates } : null);
    toast.success('Profile updated!');
    return true;
  };

  // Upload avatar to Supabase Storage
  const uploadAvatar = async (file: File) => {
    if (!user) return null;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return null;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    // Upload to avatars bucket
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error('Failed to upload avatar');
      return null;
    }

    // Get public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;

    // Save URL to profile
    await updateProfile({ avatar_url: avatarUrl });
    return avatarUrl;
  };

  return { profile, loading, updateProfile, uploadAvatar, fetchProfile };
};

export default useProfile;