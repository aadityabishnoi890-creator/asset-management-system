import { useState } from 'react'
import { CheckCircle, XCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import toast from 'react-hot-toast'

// ── Mock data ──────────────────────────────────────────────────────────────
const INITIAL_BOOKINGS = [
  { id: '1', user: { name: 'Rahul Verma',  email: 'rahul@iitroorkee.ac.in' }, asset: { name: 'DSLR Canon EOS 5D', category: 'Camera'   }, quantity: 1, startDate: '2025-06-12', endDate: '2025-06-14', dueDate: '2025-06-14', purpose: 'Photography workshop',    status: 'PENDING'  },
  { id: '2', user: { name: 'Priya Singh',  email: 'priya@iitroorkee.ac.in' }, asset: { name: 'Rode NTG4+ Mic',   category: 'Audio'    }, quantity: 2, startDate: '2025-06-10', endDate: '2025-06-11', dueDate: '2025-06-11', purpose: 'Music fest recording',    status: 'PENDING'  },
  { id: '3', user: { name: 'Arjun Mehta',  email: 'arjun@iitroorkee.ac.in' }, asset: { name: 'Aputure 300D',     category: 'Lighting' }, quantity: 2, startDate: '2025-06-08', endDate: '2025-06-09', dueDate: '2025-06-09', purpose: 'Stage lighting setup',    status: 'APPROVED' },
  { id: '4', user: { name: 'Sneha Gupta',  email: 'sneha@iitroorkee.ac.in' }, asset: { name: 'DJI Ronin-S',      category: 'Camera'   }, quantity: 1, startDate: '2025-06-05', endDate: '2025-06-06', dueDate: '2025-06-06', purpose: 'Short film project',      status: 'ISSUED'   },
  { id: '5', user: { name: 'Karan Sharma', email: 'karan@iitroorkee.ac.in' }, asset: { name: 'Yamaha MG10',      category: 'Audio'    }, quantity: 1, startDate: '2025-06-01', endDate: '2025-06-02', dueDate: '2025-06-02', purpose: 'DJ night sound setup',    status: 'ISSUED'   },
  { id: '6', user: { name: 'Ananya Rao',   email: 'ananya@iitroorkee.ac.in'}, asset: { name: 'Stage Costumes',   category: 'Costume'  }, quantity: 5, startDate: '2025-05-28', endDate: '2025-05-30', dueDate: '2025-05-30', purpose: 'Cultural dance performance', status: 'RETURNED' },
]

const STATUS_STYLES = {
  PENDING:  'bg-amber-50  text-amber-700',
  APPROVED: 'bg-blue-50   text-blue-700',
  ISSUED:   'bg-purple-50 text-purple-700',
  RETURNED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50    text-red-700',
}

const TABS = ['pending', 'approved', 'issued', 'all']

export function AdminBookingsPage() {
  const [bookings, setBookings]     = useState(INITIAL_BOOKINGS)
  const [tab, setTab]               = useState('pending')
  const [actionItem, setActionItem] = useState(null)
  const [rejectNote, setRejectNote] = useState('')
  const [showReject, setShowReject] = useState(false)

  const tabData = {
    pending:  bookings.filter(b => b.status === 'PENDING'),
    approved: bookings.filter(b => b.status === 'APPROVED'),
    issued:   bookings.filter(b => b.status === 'ISSUED'),
    all:      bookings,
  }

  const updateStatus = (id, newStatus) => {
    // TODO: swap with real API calls:
    // approve  → await bookingAPI.approve(id)
    // reject   → await bookingAPI.reject(id, { reason: rejectNote })
    // issue    → await bookingAPI.issue(id)
    // return   → await bookingAPI.return(id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b))
  }

  const handleApprove = (booking) => {
    updateStatus(booking.id, 'APPROVED')
    toast.success(`Booking approved for ${booking.user.name}`)
  }

  const handleIssue = (booking) => {
    updateStatus(booking.id, 'ISSUED')
    toast.success(`Assets issued to ${booking.user.name}`)
  }

  const handleReturn = (booking) => {
    updateStatus(booking.id, 'RETURNED')
    toast.success('Assets marked as returned ✓')
  }

  const openReject = (booking) => { setActionItem(booking); setShowReject(true) }

  const handleReject = () => {
    updateStatus(actionItem.id, 'REJECTED')
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
      {tabData[tab].length === 0 ? (
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
                            onClick={() => handleApprove(b)}
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
                          onClick={() => handleIssue(b)}
                          title="Issue asset"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <ArrowDownCircle size={17} />
                        </button>
                      )}

                      {b.status === 'ISSUED' && (
                        <button
                          onClick={() => handleReturn(b)}
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
                onClick={() => { setShowReject(false); setActionItem(null) }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
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