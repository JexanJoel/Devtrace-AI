// themeStore.ts — global dark mode state with Zustand

import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

interface ThemeStore {
  isDark: boolean;
  setDark: (val: boolean) => void;
  loadTheme: (userId: string) => Promise<void>;
  toggleDark: (userId: string) => Promise<void>;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  isDark: localStorage.getItem('devtrace_dark') === 'true',

  setDark: (val) => {
    set({ isDark: val });
    localStorage.setItem('devtrace_dark', String(val));
    if (val) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  loadTheme: async (userId) => {
    // First apply from localStorage immediately (no flash)
    const local = localStorage.getItem('devtrace_dark') === 'true';
    get().setDark(local);

    // Then sync from DB
    const { data } = await supabase
      .from('profiles')
      .select('dark_mode')
      .eq('id', userId)
      .single();

    if (data) get().setDark(data.dark_mode ?? false);
  },

  toggleDark: async (userId) => {
    const next = !get().isDark;
    get().setDark(next);
    await supabase
      .from('profiles')
      .update({ dark_mode: next })
      .eq('id', userId);
  },
}));