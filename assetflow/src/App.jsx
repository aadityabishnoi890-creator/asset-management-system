import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage, RegisterPage } from './pages/AuthPages'

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

// placeholder so routes don't crash yet
function Soon({ name }) {
  return <div className="text-slate-500 text-sm p-4">🚧 {name} — coming next commit</div>
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
              <Route path="/dashboard" element={<Soon name="User Dashboard" />} />
              <Route path="/assets"    element={<Soon name="Assets" />} />
              <Route path="/bookings"  element={<Soon name="My Bookings" />} />
              <Route path="/history"   element={<Soon name="History" />} />
            </Route>
          </Route>

          {/* Admin routes */}
          <Route element={<RequireAdmin />}>
            <Route element={<AppLayout />}>
              <Route path="/admin/dashboard" element={<Soon name="Admin Dashboard" />} />
              <Route path="/admin/assets"    element={<Soon name="Admin Assets" />} />
              <Route path="/admin/bookings"  element={<Soon name="Admin Bookings" />} />
              <Route path="/admin/history"   element={<Soon name="Admin History" />} />
              <Route path="/admin/audit"     element={<Soon name="Audit Logs" />} />
              <Route path="/admin/qr"        element={<Soon name="QR Scanner" />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}