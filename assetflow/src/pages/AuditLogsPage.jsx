import { useState } from 'react'
import { Search } from 'lucide-react'

// ── Mock data (swap → auditAPI.getAll()) ──────────────────────────────────
const MOCK_LOGS = [
  { id: '1',  action: 'BOOKING_APPROVED', user: { name: 'Admin',        email: 'admin@iitroorkee.ac.in'  }, details: 'Approved booking for DSLR Canon EOS 5D by Rahul Verma',       createdAt: '2025-06-11T10:32:00Z' },
  { id: '2',  action: 'ASSET_ISSUED',     user: { name: 'Admin',        email: 'admin@iitroorkee.ac.in'  }, details: 'Issued 1x DSLR Canon EOS 5D to Rahul Verma',                  createdAt: '2025-06-11T10:35:00Z' },
  { id: '3',  action: 'BOOKING_CREATED',  user: { name: 'Priya Singh',  email: 'priya@iitroorkee.ac.in'  }, details: 'New booking request for 2x Rode NTG4+ Mic',                    createdAt: '2025-06-11T09:14:00Z' },
  { id: '4',  action: 'ASSET_RETURNED',   user: { name: 'Admin',        email: 'admin@iitroorkee.ac.in'  }, details: 'Returned 5x Stage Costumes from Ananya Rao',                  createdAt: '2025-06-10T17:20:00Z' },
  { id: '5',  action: 'BOOKING_REJECTED', user: { name: 'Admin',        email: 'admin@iitroorkee.ac.in'  }, details: 'Rejected booking for Aputure 300D — already committed',       createdAt: '2025-06-10T15:05:00Z' },
  { id: '6',  action: 'ASSET_CREATED',    user: { name: 'Admin',        email: 'admin@iitroorkee.ac.in'  }, details: 'Added new asset: Portable PA System (qty: 2)',                createdAt: '2025-06-10T11:00:00Z' },
  { id: '7',  action: 'ASSET_UPDATED',    user: { name: 'Admin',        email: 'admin@iitroorkee.ac.in'  }, details: 'Updated quantity of Backdrop Stand from 2 to 3',              createdAt: '2025-06-09T14:30:00Z' },
  { id: '8',  action: 'BOOKING_CREATED',  user: { name: 'Arjun Mehta',  email: 'arjun@iitroorkee.ac.in'  }, details: 'New booking request for 2x Aputure 300D',                     createdAt: '2025-06-09T12:10:00Z' },
  { id: '9',  action: 'ASSET_ISSUED',     user: { name: 'Admin',        email: 'admin@iitroorkee.ac.in'  }, details: 'Issued 1x DJI Ronin-S to Sneha Gupta',                        createdAt: '2025-06-09T10:45:00Z' },
  { id: '10', action: 'BOOKING_APPROVED', user: { name: 'Admin',        email: 'admin@iitroorkee.ac.in'  }, details: 'Approved booking for DJI Ronin-S by Sneha Gupta',             createdAt: '2025-06-09T10:40:00Z' },
  { id: '11', action: 'ASSET_DELETED',    user: { name: 'Admin',        email: 'admin@iitroorkee.ac.in'  }, details: 'Deleted asset: Old Tripod Stand',                             createdAt: '2025-06-08T16:00:00Z' },
  { id: '12', action: 'BOOKING_CREATED',  user: { name: 'Karan Sharma', email: 'karan@iitroorkee.ac.in'  }, details: 'New booking request for 1x Yamaha MG10 Mixer',               createdAt: '2025-06-08T09:22:00Z' },
]

const ACTION_STYLES = {
  ASSET_CREATED:    'bg-blue-50   text-blue-700',
  ASSET_UPDATED:    'bg-amber-50  text-amber-700',
  ASSET_DELETED:    'bg-red-50    text-red-700',
  BOOKING_CREATED:  'bg-purple-50 text-purple-700',
  BOOKING_APPROVED: 'bg-emerald-50 text-emerald-700',
  BOOKING_REJECTED: 'bg-red-50    text-red-700',
  ASSET_ISSUED:     'bg-blue-50   text-blue-700',
  ASSET_RETURNED:   'bg-emerald-50 text-emerald-700',
}

const ACTION_ICONS = {
  ASSET_CREATED:    '➕',
  ASSET_UPDATED:    '✏️',
  ASSET_DELETED:    '🗑️',
  BOOKING_CREATED:  '📋',
  BOOKING_APPROVED: '✅',
  BOOKING_REJECTED: '❌',
  ASSET_ISSUED:     '📤',
  ASSET_RETURNED:   '📥',
}

function formatDateTime(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    })
  } catch { return iso }
}

function timeAgo(iso) {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const mins  = Math.floor(diff / 60000)
    const hours = Math.floor(mins / 60)
    const days  = Math.floor(hours / 24)
    if (days  > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return `${mins}m ago`
  } catch { return '' }
}

export function AuditLogsPage() {
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('All')

  const ACTION_TYPES = ['All', 'ASSET_CREATED', 'ASSET_UPDATED', 'ASSET_DELETED',
                        'BOOKING_CREATED', 'BOOKING_APPROVED', 'BOOKING_REJECTED',
                        'ASSET_ISSUED', 'ASSET_RETURNED']

  const filtered = MOCK_LOGS.filter(l => {
    const matchSearch = l.user.name.toLowerCase().includes(search.toLowerCase()) ||
                        l.details.toLowerCase().includes(search.toLowerCase()) ||
                        l.action.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || l.action === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Audit Logs</h1>
        <p className="text-sm text-slate-500 mt-0.5">Track all system actions and changes</p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search logs…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          {ACTION_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Log count */}
      <p className="text-xs text-slate-400">{filtered.length} entries</p>

      {/* Logs */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm font-semibold text-slate-700">No logs found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => (
                  <tr key={log.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-xs font-medium text-slate-700">{formatDateTime(log.createdAt)}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{timeAgo(log.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium font-mono ${ACTION_STYLES[log.action] || 'bg-slate-100 text-slate-600'}`}>
                        {ACTION_ICONS[log.action]} {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-900">{log.user.name}</p>
                      <p className="text-xs text-slate-400">{log.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-xs">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map(log => (
              <div key={log.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium font-mono ${ACTION_STYLES[log.action] || 'bg-slate-100 text-slate-600'}`}>
                    {ACTION_ICONS[log.action]} {log.action}
                  </span>
                  <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(log.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-600 mb-1">{log.details}</p>
                <p className="text-xs text-slate-400">by {log.user.name}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}