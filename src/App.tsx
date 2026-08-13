import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Interview from '@/pages/Interview';
import Dashboard from '@/pages/Dashboard';
import CVEditorPage from '@/pages/CVEditorPage';
import ShareCv from '@/pages/ShareCv';

function AppShell() {
  const location = useLocation();
  const isShare = location.pathname.startsWith('/cv/share');

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {!isShare && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <Interview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cv/:id"
          element={
            <ProtectedRoute>
              <CVEditorPage />
            </ProtectedRoute>
          }
        />
        <Route path="/cv/share/:token" element={<ShareCv />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}
