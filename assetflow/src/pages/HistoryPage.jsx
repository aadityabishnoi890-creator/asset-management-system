import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { bookingAPI } from '../api/services'

export function HistoryPage() {
  const [search, setSearch] = useState('')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadHistory = async () => {
      try {
        const res = await bookingAPI.getMine()
        const nextBookings = res.data.bookings ?? res.data ?? []
        if (active) setBookings(nextBookings.filter((booking) => booking.status === 'RETURNED'))
      } finally {
        if (active) setLoading(false)
      }
    }

    loadHistory()

    return () => {
      active = false
    }
  }, [])

  const filtered = bookings.filter(b =>
    b.asset.name.toLowerCase().includes(search.toLowerCase()) ||
    b.purpose.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <div className="py-10 text-sm text-slate-500">Loading history…</div>
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Borrowing History</h1>
        <p className="text-sm text-slate-500 mt-0.5">{bookings.length} past transactions</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Search history…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-3">📂</div>
          <p className="text-sm font-semibold text-slate-700">No history found</p>
          <p className="text-sm text-slate-400 mt-1">Returned assets will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Borrowed</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Returned</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Purpose</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={b.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-4 py-3 font-medium text-slate-900">{b.asset.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                      {b.asset.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{b.quantity}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{b.startDate}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{b.returnedAt}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-[140px] truncate">{b.purpose}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
                      RETURNED
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