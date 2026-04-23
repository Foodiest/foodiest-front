import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import WriteReviewPage from "./pages/WriteReviewPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import MyPage from "./pages/MyPage";
import LoginPage from "./pages/LoginPage";
import SignUpStep1Page from "./pages/SignUpStep1Page";
import SignUpStep2Page from "./pages/SignUpStep2Page";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import MyPageSettingsPage from "./pages/MyPageSettingsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
        <Route path="/write-review" element={<WriteReviewPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpStep1Page />} />
        <Route path="/signup/step2" element={<SignUpStep2Page />} />
        <Route path="/profile-settings" element={<ProfileSettingsPage />} />
        <Route path="/mypage-settings" element={<MyPageSettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
