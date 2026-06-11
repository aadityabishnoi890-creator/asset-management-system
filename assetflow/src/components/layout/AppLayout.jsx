import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useState } from 'react'

import {
  LayoutDashboard, Package, CalendarCheck, History,
  Bell, LogOut, ChevronRight, Menu, ShieldCheck, 
  ClipboardList, Activity, QrCode
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const userNav = [
  { to: '/dashboard', label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/assets',    label: 'Browse Assets', icon: Package },
  { to: '/bookings',  label: 'My Bookings',   icon: CalendarCheck },
  { to: '/history',   label: 'History',       icon: History },
]

const adminNav = [
  { to: '/admin/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/admin/assets',    label: 'Assets',       icon: Package },
  { to: '/admin/bookings',  label: 'Approvals',    icon: ClipboardList },
  { to: '/admin/history',   label: 'All Activity', icon: History },
  { to: '/admin/audit',     label: 'Audit Logs',   icon: Activity },
  { to: '/admin/qr',        label: 'QR Scanner',   icon: QrCode },
]
const MOCK_NOTIFS = [
  { id: '1', message: 'Your booking for DSLR Canon EOS 5D has been approved ✅', read: false, createdAt: '2025-06-11T10:35:00Z' },
  { id: '2', message: 'Rode NTG4+ Mic is due for return tomorrow ⚠️',           read: false, createdAt: '2025-06-11T09:00:00Z' },
  { id: '3', message: 'Your booking for Aputure 300D was rejected ❌',           read: false, createdAt: '2025-06-10T15:05:00Z' },
  { id: '4', message: 'DJI Ronin-S has been issued to you 📦',                  read: true,  createdAt: '2025-06-09T10:45:00Z' },
  { id: '5', message: 'Your booking request for Yamaha MG10 is pending 🕐',     read: true,  createdAt: '2025-06-08T09:22:00Z' },
]

function timeAgo(iso) {
  try {
    const diff  = Date.now() - new Date(iso).getTime()
    const mins  = Math.floor(diff / 60000)
    const hours = Math.floor(mins / 60)
    const days  = Math.floor(hours / 24)
    if (days  > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return `${mins}m ago`
  } catch { return '' }
}
export function AppLayout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate    = useNavigate()
  const [collapsed, setCollapsed]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navItems = isAdmin ? adminNav : userNav

  const handleLogout = () => { logout(); navigate('/login') }

  const Sidebar = () => (
    <aside className={`flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'}`}>
      
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-100 ${collapsed ? 'justify-center px-2' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
          <Package size={16} className="text-white" />
        </div>
        {!collapsed && <span className="font-bold text-slate-900">AssetFlow</span>}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${isAdmin ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
            {isAdmin ? <><ShieldCheck size={11} className="mr-1" />Admin</> : 'User'}
          </span>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${isActive ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}
              ${collapsed ? 'justify-center px-2' : ''}`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: user + collapse */}
      <div className="border-t border-slate-100 p-3 space-y-1">
        {!collapsed && (
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-slate-700 truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        )}
        <button onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 w-full transition-colors ${collapsed ? 'justify-center' : ''}`}>
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && 'Sign out'}
        </button>
        <button onClick={() => setCollapsed(c => !c)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-slate-600 hover:bg-slate-100 w-full transition-colors ${collapsed ? 'justify-center' : ''}`}>
          <ChevronRight size={18} className={`transition-transform ${!collapsed ? 'rotate-180' : ''}`} />
          {!collapsed && 'Collapse'}
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col h-full">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative w-60 h-full"><Sidebar /></div>
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="flex items-center justify-between px-4 lg:px-6 h-14 bg-white border-b border-slate-200 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
function NotificationBell() {
  const [notifs, setNotifs]       = useState(MOCK_NOTIFS)
  const [showPanel, setShowPanel] = useState(false)
  const unread = notifs.filter(n => !n.read).length

  const markRead = (id) => {
    // TODO: swap → notificationAPI.markRead(id)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = () => {
    // TODO: swap → notificationAPI.markAllRead()
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setShowPanel(v => !v)}
        className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Panel */}
      {showPanel && (
        <>
          {/* Click outside to close */}
          <div className="fixed inset-0 z-40" onClick={() => setShowPanel(false)} />

          <div className="absolute right-0 top-11 w-80 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">

            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">Notifications</span>
                {unread > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
                    {unread} new
                  </span>
                )}
              </div>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-indigo-500 hover:text-indigo-600 font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification list */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
              {notifs.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No notifications</p>
              ) : (
                notifs.map(n => (
                  <button
                    key={n.id}
                    onClick={() => { markRead(n.id); setShowPanel(false) }}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-indigo-50/40' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />
                      )}
                      <div className={!n.read ? '' : 'pl-3.5'}>
                        <p className={`text-xs leading-relaxed ${!n.read ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                          {n.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
              <p className="text-xs text-slate-400 text-center">
                {notifs.length} total notifications
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
}
