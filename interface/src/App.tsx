import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, ProtectedRoute } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/toaster'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import DashboardLayout from '@/pages/dashboard/DashboardLayout'
import BerandaPage from '@/pages/dashboard/BerandaPage'
import AbsensiPage from '@/pages/dashboard/AbsensiPage'
import TugasPage from '@/pages/dashboard/TugasPage'
import LaporanPage from '@/pages/dashboard/LaporanPage'
import PengaturanPage from '@/pages/dashboard/PengaturanPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard/beranda" replace />} />
          <Route path="beranda" element={<BerandaPage />} />
          <Route path="absensi" element={<AbsensiPage />} />
          <Route path="tugas" element={<TugasPage />} />
          <Route path="laporan" element={<LaporanPage />} />
          <Route path="pengaturan" element={<PengaturanPage />} />
        </Route>

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      
      <Toaster />
    </AuthProvider>
  )
}

export default App
