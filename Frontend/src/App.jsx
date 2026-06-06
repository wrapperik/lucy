import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import BottomNav from './components/BottomNav';
import DiaryPage from './pages/DiaryPage';
import SelfiePage from './pages/SelfiePage';
import ScanPage from './pages/ScanPage';
import PromptsPage from './pages/PromptsPage';
import AdminPage from './pages/AdminPage';
import SettingsPage from './pages/SettingsPage';
import EntryDetailPage from './pages/EntryDetailPage';

// Import New UX Screens
import LoadingScreen from './components/LoadingScreen';
import OnboardingScreen from './components/OnboardingScreen';
import AuthScreen from './components/AuthScreen';
import PermissionsPrompt from './components/PermissionsPrompt';
import ScrollToTop from './components/ScrollToTop';

function MainApp() {
  const location = useLocation();
  const hideNav = location.pathname.startsWith('/entry/');
  const { isAdmin } = useApp();

  return (
    <div className="relative min-h-screen corner-glow w-full max-w-lg">
      <main className="relative z-10 max-w-lg mx-auto w-full">
        <Routes>
          <Route path="/" element={<DiaryPage />} />
          <Route path="/entry/:id" element={<EntryDetailPage />} />
          <Route path="/selfie" element={<SelfiePage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/prompts" element={<PromptsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={isAdmin ? <AdminPage /> : <SettingsPage />} />
        </Routes>
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}

function AppContent() {
  const {
    appLoading,
    onboardingCompleted,
    currentUser,
    cameraPermissionGranted,
  } = useApp();

  // Track state of temporary permission skip (if user cancels / says maybe later)
  const [permissionPromptDismissed, setPermissionPromptDismissed] = useState(() => {
    return localStorage.getItem('lucy-permission-dismissed') === 'true';
  });

  const handlePermissionComplete = () => {
    setPermissionPromptDismissed(true);
    localStorage.setItem('lucy-permission-dismissed', 'true');
  };

  // 1. Initial Animated Loading Screen
  if (appLoading) {
    return <LoadingScreen />;
  }

  // 2. Interactive Onboarding Walkthrough
  if (!onboardingCompleted) {
    return <OnboardingScreen />;
  }

  // 3. Create Profile / Sign In (mandatory — no guest bypass)
  if (!currentUser) {
    return <AuthScreen />;
  }

  // 4. Soft Camera Permissions Request
  if (!cameraPermissionGranted && !permissionPromptDismissed) {
    return <PermissionsPrompt onProceed={handlePermissionComplete} />;
  }

  // 5. Main Pocket Diary Application
  return (
    <BrowserRouter>
      <ScrollToTop />
      <MainApp />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
