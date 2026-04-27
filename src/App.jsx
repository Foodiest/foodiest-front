import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import WriteReviewPage from './pages/WriteReviewPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import MyPage from './pages/MyPage';
import LoginPage from './pages/LoginPage';
import SignUpStep1Page from './pages/SignUpStep1Page';
import SignUpStep2Page from './pages/SignUpStep2Page';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import MyPageSettingsPage from './pages/MyPageSettingsPage';
import SavedPage from './pages/SavedPage';
import EditProfilePage from './pages/EditProfilePage';
import BannedPage from './pages/BannedPage';

function BannedGuard({ children }) {
  const { profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (profile?.role === 'banned' && location.pathname !== '/banned') {
      navigate('/banned', { replace: true });
    }
  }, [profile, isLoading, location.pathname, navigate]);

  return children;
}

function AdminGuard({ children }) {
  const { profile, isLoading, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!session || profile?.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [profile, isLoading, session, navigate]);

  if (isLoading || !profile) return null;
  if (profile.role !== 'admin') return null;

  return children;
}

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <AuthProvider>
          <BannedGuard>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
              <Route path="/write-review" element={<WriteReviewPage />} />
              <Route path="/admin" element={<AdminGuard><AdminDashboardPage /></AdminGuard>} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/mypage/:userId" element={<MyPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpStep1Page />} />
              <Route path="/signup/step2" element={<SignUpStep2Page />} />
              <Route path="/profile-settings" element={<ProfileSettingsPage />} />
              <Route path="/mypage-settings" element={<MyPageSettingsPage />} />
              <Route path="/saved" element={<SavedPage />} />
              <Route path="/edit-profile" element={<EditProfilePage />} />
              <Route path="/banned" element={<BannedPage />} />
            </Routes>
          </BannedGuard>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
