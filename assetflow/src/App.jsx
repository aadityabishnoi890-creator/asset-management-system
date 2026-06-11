import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/auth_context.jsx'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage, RegisterPage } from './pages/authpages.jsx'
import { AssetsPage } from './pages/AssetsPage'
import { AdminAssetsPage } from './pages/AdminAssets'
import { AdminBookingsPage } from './pages/AdminBookings'
import { UserDashboardPage } from './pages/UserDashboard'
import { HistoryPage } from './pages/HistoryPage.jsx'
import { AdminDashboardPage } from './pages/AdminDashboard'
import { AuditLogsPage } from './pages/AuditLogsPage'
import { QRPage } from './pages/QRPage'

function RequireAuth() {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

function RequireAdmin() {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return null
  if (!user)    return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

function RedirectIfAuthed() {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return null
  if (!user) return <Outlet />
  return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />
}


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ style: { borderRadius: '10px', background: '#1e293b', color: '#f8fafc', fontSize: '13px' } }} />
        <Routes>

          {/* Public */}
          <Route element={<RedirectIfAuthed />}>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* User routes */}
          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route path="/assets" element={<AssetsPage />} />
              <Route path="/dashboard" element={<UserDashboardPage />} />
              <Route path="/history"   element={<HistoryPage />} />
              <Route path="/bookings" element={<Navigate to="/history" replace />} />
            </Route>
          </Route>

          {/* Admin routes */}
          <Route element={<RequireAdmin />}>
            <Route element={<AppLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/assets" element={<AdminAssetsPage />} />
              <Route path="/admin/bookings"  element={<AdminBookingsPage />} />
              <Route path="/admin/audit" element={<AuditLogsPage />} />
              <Route path="/admin/qr" element={<QRPage />} />
              <Route path="/admin/history" element={<Navigate to="/admin/audit" replace />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}