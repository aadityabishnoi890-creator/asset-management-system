import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { bookingAPI } from '../api/services'

const STATUS_STYLES = {
  PENDING:  'bg-amber-50  text-amber-700',
  APPROVED: 'bg-blue-50   text-blue-700',
  ISSUED:   'bg-purple-50 text-purple-700',
  RETURNED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50    text-red-700',
}

const TABS = ['pending', 'approved', 'issued', 'all']

export function AdminBookingsPage() {
  const [bookings, setBookings]     = useState([])
  const [tab, setTab]               = useState('pending')
  const [actionItem, setActionItem] = useState(null)
  const [rejectNote, setRejectNote] = useState('')
  const [showReject, setShowReject] = useState(false)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    let active = true

    const loadBookings = async () => {
      try {
        const res = await bookingAPI.getAll()
        const nextBookings = res.data.bookings ?? res.data ?? []
        if (active) setBookings(nextBookings)
      } catch {
        toast.error('Failed to load bookings')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadBookings()

    return () => {
      active = false
    }
  }, [])

  const tabData = {
    pending:  bookings.filter(b => b.status === 'PENDING'),
    approved: bookings.filter(b => b.status === 'APPROVED'),
    issued:   bookings.filter(b => b.status === 'ISSUED'),
    all:      bookings,
  }

  const handleApprove = async (booking) => {
    const res = await bookingAPI.approve(booking.id)
    const updated = res.data.booking ?? res.data
    setBookings(prev => prev.map(b => b.id === booking.id ? updated : b))
    toast.success(`Booking approved for ${booking.user.name}`)
  }

  const handleIssue = async (booking) => {
    const res = await bookingAPI.issue(booking.id)
    const updated = res.data.booking ?? res.data
    setBookings(prev => prev.map(b => b.id === booking.id ? updated : b))
    toast.success(`Assets issued to ${booking.user.name}`)
  }

  const handleReturn = async (booking) => {
    const res = await bookingAPI.return(booking.id)
    const updated = res.data.booking ?? res.data
    setBookings(prev => prev.map(b => b.id === booking.id ? updated : b))
    toast.success('Assets marked as returned ✓')
  }

  const openReject = (booking) => { setActionItem(booking); setShowReject(true) }

  const handleReject = async () => {
    if (!actionItem) return
    const res = await bookingAPI.reject(actionItem.id, { reason: rejectNote })
    const updated = res.data.booking ?? res.data
    setBookings(prev => prev.map(b => b.id === actionItem.id ? updated : b))
    toast.success('Booking rejected')
    setShowReject(false)
    setActionItem(null)
    setRejectNote('')
  }

  const isOverdue = (booking) => {
    if (booking.status !== 'ISSUED') return false
    return new Date(booking.dueDate) < new Date()
  }

  return (
    <div className="space-y-5">
      {loading && <div className="py-10 text-sm text-slate-500">Loading bookings…</div>}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Booking Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Review requests, issue and track assets</p>
        </div>
        {tabData.pending.length > 0 && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200">
            {tabData.pending.length} pending review
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {TABS.map(key => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
              tab === key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {key}
            {tabData[key].length > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                tab === key ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'
              }`}>
                {tabData[key].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {!loading && tabData[tab].length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm font-semibold text-slate-700">No {tab} bookings</p>
          <p className="text-sm text-slate-400 mt-1">Nothing to action here</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">From</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Due</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Purpose</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tabData[tab].map((b, i) => (
                <tr key={b.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${i === tabData[tab].length - 1 ? 'border-0' : ''}`}>

                  {/* User */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{b.user.name}</p>
                    <p className="text-xs text-slate-400">{b.user.email}</p>
                  </td>

                  {/* Asset */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{b.asset.name}</p>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500">
                      {b.asset.category}
                    </span>
                  </td>

                  {/* Qty */}
                  <td className="px-4 py-3 text-slate-700">{b.quantity}</td>

                  {/* From */}
                  <td className="px-4 py-3 text-slate-600 text-xs">{b.startDate}</td>

                  {/* Due */}
                  <td className="px-4 py-3 text-xs">
                    <span className={isOverdue(b) ? 'text-red-600 font-semibold' : 'text-slate-600'}>
                      {b.dueDate}
                    </span>
                    {isOverdue(b) && (
                      <span className="block mt-0.5 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600">
                        Overdue
                      </span>
                    )}
                  </td>

                  {/* Purpose */}
                  <td className="px-4 py-3 text-slate-500 text-xs max-w-[130px] truncate">{b.purpose}</td>

                  {/* Status badge */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_STYLES[b.status] || 'bg-slate-100 text-slate-600'}`}>
                      {b.status}
                    </span>
                  </td>

                  {/* Action buttons */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">

                      {b.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(b).catch(() => toast.error('Could not approve booking'))}
                            title="Approve"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <CheckCircle size={17} />
                          </button>
                          <button
                            onClick={() => openReject(b)}
                            title="Reject"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <XCircle size={17} />
                          </button>
                        </>
                      )}

                      {b.status === 'APPROVED' && (
                        <button
                          onClick={() => handleIssue(b).catch(() => toast.error('Could not issue asset'))}
                          title="Issue asset"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <ArrowDownCircle size={17} />
                        </button>
                      )}

                      {b.status === 'ISSUED' && (
                        <button
                          onClick={() => handleReturn(b).catch(() => toast.error('Could not mark returned'))}
                          title="Mark returned"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <ArrowUpCircle size={17} />
                        </button>
                      )}

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject modal */}
      {showReject && actionItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowReject(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-1">Reject booking</h3>
            <p className="text-sm text-slate-500 mb-4">
              Rejecting <strong>{actionItem.asset.name}</strong> request by <strong>{actionItem.user.name}</strong>.
            </p>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason (optional)</label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={2}
              placeholder="e.g. Asset already committed to another event…"
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
            />
            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => { setShowReject(false); setActionItem(null); setRejectNote('') }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject().catch(() => toast.error('Could not reject booking'))}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Reject booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}