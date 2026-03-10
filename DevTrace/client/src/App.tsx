import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabaseClient';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/shared/ProtectedRoute';
import { PowerSyncProvider } from './components/providers/PowerSyncProvider';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import SessionsPage from './pages/SessionsPage';
import SessionDetailPage from './pages/SessionDetailPage';
import FixLibraryPage from './pages/FixLibraryPage';
import AnalyticsPage from './pages/AnalyticsPage';

const App = () => {
  const { setUser, setSession, setLoading } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user as any ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user as any ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <PowerSyncProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          duration: 3000,
          style: { background: '#fff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '14px' },
        }} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
          <Route path="/sessions" element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
          <Route path="/sessions/:id" element={<ProtectedRoute><SessionDetailPage /></ProtectedRoute>} />
          <Route path="/fixes" element={<ProtectedRoute><FixLibraryPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </PowerSyncProvider>
  );
};

export default App;