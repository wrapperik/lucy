import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import BottomNav from './components/BottomNav';
import DiaryPage from './pages/DiaryPage';
import SelfiePage from './pages/SelfiePage';
import ScanPage from './pages/ScanPage';
import PromptsPage from './pages/PromptsPage';
import AdminPage from './pages/AdminPage';
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

  return (
    <div className="relative min-h-screen corner-glow w-full max-w-lg">
      <main className="relative z-10 max-w-lg mx-auto w-full">
        <Routes>
          <Route path="/" element={<DiaryPage />} />
          <Route path="/entry/:id" element={<EntryDetailPage />} />
          <Route path="/selfie" element={<SelfiePage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/prompts" element={<PromptsPage />} />
          <Route path="/admin" element={<AdminPage />} />
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

  // Track state of auth dismissal (for guest skip option)
  const [authDismissed, setAuthDismissed] = useState(() => {
    return localStorage.getItem('lucy-auth-dismissed') === 'true';
  });

  // Track state of temporary permission skip (if user cancels / says maybe later)
  const [permissionPromptDismissed, setPermissionPromptDismissed] = useState(() => {
    return localStorage.getItem('lucy-permission-dismissed') === 'true';
  });

  const handleAuthComplete = () => {
    setAuthDismissed(true);
    localStorage.setItem('lucy-auth-dismissed', 'true');
  };

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

  // 3. Create Profile / Sign In
  if (!currentUser && !authDismissed) {
    return <AuthScreen onComplete={handleAuthComplete} />;
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
