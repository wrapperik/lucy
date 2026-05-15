import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import BottomNav from './components/BottomNav';
import DiaryPage from './pages/DiaryPage';
import SelfiePage from './pages/SelfiePage';
import ScanPage from './pages/ScanPage';
import PromptsPage from './pages/PromptsPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="relative min-h-screen corner-glow">
          <main className="relative z-10 max-w-lg mx-auto w-full">
            <Routes>
              <Route path="/" element={<DiaryPage />} />
              <Route path="/selfie" element={<SelfiePage />} />
              <Route path="/scan" element={<ScanPage />} />
              <Route path="/prompts" element={<PromptsPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
