import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/auth_context.jsx'

export function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)
  const [errors, setErrors]   = useState({})

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(er => ({ ...er, [k]: '' })) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.email)    errs.email    = 'Email is required'
    if (!form.password) errs.password = 'Password is required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your AssetFlow account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} autoFocus />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <div className="relative">
            <input className="w-full px-3 py-2 pr-10 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={set('password')} />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="text-center text-sm text-slate-500">
          No account?{' '}
          <Link to="/register" className="text-indigo-500 font-medium hover:text-indigo-600">Sign up</Link>
        </p>
      </form>
    </AuthShell>
  )
}

export function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'USER' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)
  const [errors, setErrors]   = useState({})

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(er => ({ ...er, [k]: '' })) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name || form.name.length < 2) errs.name = 'Name must be at least 2 characters'
    if (!form.email)                         errs.email = 'Email is required'
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const user = await register(form)
      toast.success(`Welcome, ${user.name}!`)
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Create account" subtitle="Join AssetFlow to manage and request assets">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
          <input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="text" placeholder="Naman Sharma" value={form.name} onChange={set('name')} autoFocus />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <div className="relative">
            <input className="w-full px-3 py-2 pr-10 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type={showPw ? 'text' : 'password'} placeholder="At least 6 characters" value={form.password} onChange={set('password')} />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Account type</label>
          <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={form.role} onChange={set('role')}>
            <option value="USER">User — Browse and request assets</option>
            <option value="ADMIN">Admin — Manage all assets</option>
          </select>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-500 font-medium hover:text-indigo-600">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  )
}

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
            <Package size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">AssetFlow</span>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h1 className="text-lg font-semibold text-slate-900 mb-0.5">{title}</h1>
          <p className="text-sm text-slate-500 mb-6">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}