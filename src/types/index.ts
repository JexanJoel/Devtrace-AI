// Global TypeScript types used across DevTrace AI frontend

export interface User {
  id: string;
  email: string;
  name?: string;
  github_username?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export type AuthMode =
  | 'login'
  | 'register'
  | 'magic-link'
  | 'email-otp'
  | 'phone-otp';