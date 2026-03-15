import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabaseClient';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/shared/ProtectedRoute';
import { PowerSyncProvider } from './components/providers/PowerSyncProvider';
import OfflineBanner from './components/shared/OfflineBanner';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import GitHubCallbackPage from './pages/GitHubCallbackPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import SessionsPage from './pages/SessionsPage';
import SessionDetailPage from './pages/SessionDetailPage';
import FixLibraryPage from './pages/FixLibraryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AIInsightsPage from './pages/AIInsightsPage';
import SyncStatusPage from './pages/SyncStatusPage';
import SharedWithMePage from './pages/SharedWithMePage';
import SharedProjectView from './pages/SharedProjectView';
import SharedSessionView from './pages/SharedSessionView';
import DebugDNAPage from './pages/DebugDNAPage';

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
        <div className="flex flex-col min-h-screen">
          <OfflineBanner />
          <div className="flex-1">
            <Toaster position="top-right" toastOptions={{
              duration: 3000,
              style: { background: '#fff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '14px' },
            }} />
            <Routes>
              {/* Public */}
              <Route path="/"                element={<LandingPage />} />
              <Route path="/login"           element={<LoginPage />} />
              <Route path="/register"        element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password"  element={<ResetPasswordPage />} />
              <Route path="/auth/callback"   element={<GitHubCallbackPage />} />

              {/* Protected */}
              <Route path="/dashboard"           element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/profile"             element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/settings"            element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/projects"            element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
              <Route path="/projects/:id"        element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
              <Route path="/sessions"            element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
              <Route path="/sessions/:id"        element={<ProtectedRoute><SessionDetailPage /></ProtectedRoute>} />
              <Route path="/fixes"               element={<ProtectedRoute><FixLibraryPage /></ProtectedRoute>} />
              <Route path="/analytics"           element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/ai-insights"         element={<ProtectedRoute><AIInsightsPage /></ProtectedRoute>} />
              <Route path="/debug-dna"           element={<ProtectedRoute><DebugDNAPage /></ProtectedRoute>} />
              <Route path="/sync-status"         element={<ProtectedRoute><SyncStatusPage /></ProtectedRoute>} />
              <Route path="/shared"              element={<ProtectedRoute><SharedWithMePage /></ProtectedRoute>} />
              <Route path="/shared/project/:id"  element={<ProtectedRoute><SharedProjectView /></ProtectedRoute>} />
              <Route path="/shared/session/:id"  element={<ProtectedRoute><SharedSessionView /></ProtectedRoute>} />
              <Route path="*"                    element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </PowerSyncProvider>
  );
};

export default App;