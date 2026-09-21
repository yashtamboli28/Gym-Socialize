import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { FeedPage } from './pages/FeedPage';
import { LeaderboardsPage } from './pages/LeaderboardsPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { GymsPage } from './pages/GymsPage';
import { FriendsPage } from './pages/FriendsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SubmitPRPage } from './pages/SubmitPRPage';
import { AdminVerificationPage } from './pages/AdminVerificationPage';
import { AuthPage } from './pages/AuthPage';

// Scroll to top on navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Protected / Redirect wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/auth?mode=login" replace />;
  }
  return <>{children}</>;
};

// Root home redirector: if user is logged in, show Dashboard, else Landing page
const HomeRoute: React.FC = () => {
  const { currentUser } = useAuth();
  return currentUser ? <DashboardPage /> : <LandingPage />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-neutral-950 antialiased">
          <Navbar />
          
          <main className="flex-1 w-full">
            <Routes>
              <Route path="/" element={<HomeRoute />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/leaderboards" element={<LeaderboardsPage />} />
              <Route path="/challenges" element={<ChallengesPage />} />
              <Route path="/gyms" element={<GymsPage />} />
              <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
              <Route path="/profile/:userId?" element={<ProfilePage />} />
              <Route path="/submit-pr" element={<ProtectedRoute><SubmitPRPage /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminVerificationPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <BottomNav />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
