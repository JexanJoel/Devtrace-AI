// Zustand global store for authentication state
// Persists user + session so all components can access them

import { create } from 'zustand';
import type { AuthState } from '../types';
import { supabase } from '../lib/supabaseClient';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  // Update the current user object
  setUser: (user) => set({ user }),

  // Update the current session object
  setSession: (session) => set({ session }),

  // Toggle global loading (used while checking session on app load)
  setLoading: (loading) => set({ loading }),

  // Sign out from Supabase and clear local state
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));