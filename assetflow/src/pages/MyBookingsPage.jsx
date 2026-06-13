import { useEffect, useState } from 'react'
import { Search, CalendarCheck, Filter } from 'lucide-react'
import { bookingAPI } from '../api/services'

const STATUS_STYLES = {
  PENDING:  'bg-amber-50  text-amber-700',
  APPROVED: 'bg-blue-50   text-blue-700',
  ISSUED:   'bg-purple-50 text-purple-700',
  RETURNED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50    text-red-700',
}

const STATUSES = ['ALL', 'PENDING', 'APPROVED', 'ISSUED', 'RETURNED', 'REJECTED']

export function MyBookingsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
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

  const filtered = bookings.filter(b => {
    const matchesSearch =
      b.asset?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.purpose?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return <div className="py-10 text-sm text-slate-500">Loading bookings…</div>
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">My Bookings</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {bookings.length} total booking{bookings.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search bookings…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Statuses' : s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CalendarCheck className="text-slate-300 mb-3" size={40} />
          <p className="text-sm font-semibold text-slate-700">No bookings found</p>
          <p className="text-sm text-slate-400 mt-1">
            {statusFilter !== 'ALL'
              ? `No ${statusFilter.toLowerCase()} bookings`
              : 'Your bookings will appear here'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">From</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">To</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Purpose</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={b.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-4 py-3 font-medium text-slate-900">{b.asset?.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                      {b.asset?.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{b.quantity}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{b.startDate}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{b.dueDate}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-[140px] truncate">{b.purpose}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_STYLES[b.status] || 'bg-slate-100 text-slate-600'}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
