import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, CalendarCheck, AlertTriangle, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/auth_context.jsx'
import { bookingAPI } from '../api/services'

const STATUS_STYLES = {
  PENDING:  'bg-amber-50  text-amber-700',
  APPROVED: 'bg-blue-50   text-blue-700',
  ISSUED:   'bg-purple-50 text-purple-700',
  RETURNED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50    text-red-700',
}

export function UserDashboardPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadBookings = async () => {
      try {
        const res = await bookingAPI.getMine()
        const nextBookings = res.data.bookings ?? res.data ?? []
        if (active) setBookings(nextBookings)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadBookings()

    return () => {
      active = false
    }
  }, [])

  const active   = bookings.filter(b => b.status === 'ISSUED')
  const pending  = bookings.filter(b => b.status === 'PENDING')
  const returned = bookings.filter(b => b.status === 'RETURNED')
  const overdue  = active.filter(b => new Date(b.dueDate) < new Date())

  if (loading) {
    return <div className="py-10 text-sm text-slate-500">Loading dashboard…</div>
  }

  return (
    <div className="space-y-6">

      {/* Greeting */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Good {getTimeOfDay()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Here's a summary of your asset activity.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Loans"     value={active.length}   icon={Package}       color="purple" />
        <StatCard title="Pending Requests" value={pending.length}  icon={Clock}         color="amber"  />
        <StatCard title="Overdue"          value={overdue.length}  icon={AlertTriangle} color="red"    />
        <StatCard title="Total Returned"   value={returned.length} icon={CheckCircle}   color="green"  />
      </div>

      {/* Overdue alert */}
      {overdue.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-sm font-semibold text-red-700">
              {overdue.length} overdue {overdue.length === 1 ? 'item' : 'items'}
            </p>
            <p className="text-xs text-red-500 mt-0.5">
              Please return the following assets as soon as possible.
            </p>
          </div>
        </div>
      )}

      {/* Active loans table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Active Loans</h2>
          <Link to="/bookings" className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600 font-medium">
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {active.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-slate-400">No active loans</p>
            <Link to="/assets"
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white text-xs font-medium rounded-lg">
              Browse assets
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {active.map((b, i) => {
                  const overdue = new Date(b.dueDate) < new Date()
                  return (
                    <tr key={b.id} className={`border-b border-slate-100 hover:bg-slate-50 ${i === active.length - 1 ? 'border-0' : ''}`}>
                      <td className="px-4 py-3 font-medium text-slate-900">{b.asset.name}</td>
                      <td className="px-4 py-3 text-slate-600">{b.quantity}</td>
                      <td className={`px-4 py-3 text-xs ${overdue ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>
                        {b.dueDate}
                        {overdue && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600">
                            Overdue
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_STYLES[b.status]}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending requests */}
      {pending.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Pending Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">From</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">To</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((b, i) => (
                  <tr key={b.id} className={`border-b border-slate-100 hover:bg-slate-50 ${i === pending.length - 1 ? 'border-0' : ''}`}>
                    <td className="px-4 py-3 font-medium text-slate-900">{b.asset.name}</td>
                    <td className="px-4 py-3 text-slate-600">{b.quantity}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{b.startDate}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{b.dueDate}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_STYLES[b.status]}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/assets"
          className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow group">
          <Package className="text-indigo-500 mb-3" size={22} />
          <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600">Browse Assets</p>
          <p className="text-xs text-slate-400 mt-0.5">View available equipment</p>
        </Link>
        <Link to="/history"
          className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow group">
          <CalendarCheck className="text-emerald-500 mb-3" size={22} />
          <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600">Borrowing History</p>
          <p className="text-xs text-slate-400 mt-0.5">View past requests</p>
        </Link>
      </div>

    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    brand:  'bg-indigo-50  text-indigo-500',
    green:  'bg-emerald-50 text-emerald-500',
    amber:  'bg-amber-50   text-amber-500',
    red:    'bg-red-50     text-red-500',
    purple: 'bg-purple-50  text-purple-500',
    blue:   'bg-blue-50    text-blue-500',
  }
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}