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
            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
              <Bell size={18} />
            </button>
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
}