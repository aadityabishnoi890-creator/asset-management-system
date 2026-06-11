import { useEffect, useState } from 'react'
import { Search, Filter, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { assetAPI, bookingAPI } from '../api/services'

const CATEGORIES = ['All', 'Camera', 'Audio', 'Lighting', 'Costume', 'Props', 'Recording', 'Infrastructure']

const CATEGORY_ICONS = {
  Camera: '📷', Audio: '🎙️', Lighting: '💡',
  Costume: '👗', Props: '🎭', Recording: '🎬', Infrastructure: '🏗️',
}

const CATEGORY_COLORS = {
  Camera: 'bg-blue-400', Audio: 'bg-purple-400', Lighting: 'bg-amber-400',
  Costume: 'bg-pink-400', Props: 'bg-green-400', Recording: 'bg-red-400',
  Infrastructure: 'bg-slate-400',
}

const STATUS_STYLES = {
  AVAILABLE:   'bg-emerald-50 text-emerald-700',
  IN_USE:      'bg-purple-50  text-purple-700',
  MAINTENANCE: 'bg-amber-50   text-amber-700',
  DAMAGED:     'bg-red-50     text-red-700',
}

export function AssetsPage() {
  const [assets, setAssets]       = useState([])
  const [search, setSearch]       = useState('')
  const [category, setCategory]   = useState('All')
  const [selected, setSelected]   = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    let active = true

    const loadAssets = async () => {
      try {
        const res = await assetAPI.getAll()
        const nextAssets = res.data.assets ?? res.data ?? []
        if (active) setAssets(nextAssets)
      } catch {
        toast.error('Failed to load assets')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadAssets()

    return () => {
      active = false
    }
  }, [])

  const filtered = assets.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
                        a.description.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || a.category === category
    return matchSearch && matchCat
  })

  if (loading) {
    return <div className="py-10 text-sm text-slate-500">Loading assets…</div>
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Browse Assets</h1>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} assets available</p>
        </div>
      </div>

      {/* Search + filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search assets…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select
            className="pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer bg-white"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              category === c
                ? 'bg-indigo-500 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'
            }`}
          >
            {CATEGORY_ICONS[c] && <span className="mr-1">{CATEGORY_ICONS[c]}</span>}
            {c}
          </button>
        ))}
      </div>

      {/* Asset grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-sm font-semibold text-slate-700">No assets found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(asset => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onBook={() => { setSelected(asset); setShowModal(true) }}
            />
          ))}
        </div>
      )}

      {/* Booking modal */}
      {selected && (
        <BookingModal
          asset={selected}
          open={showModal}
          onClose={() => { setShowModal(false); setSelected(null) }}
        />
      )}
    </div>
  )
}

function AssetCard({ asset, onBook }) {
  const available = asset.quantity - (asset.bookedQuantity || 0)
  const canBook   = asset.status === 'AVAILABLE' && available > 0

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      {/* Color top bar */}
      <div className={`h-1.5 ${CATEGORY_COLORS[asset.category] || 'bg-slate-300'}`} />

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="text-2xl">{CATEGORY_ICONS[asset.category] || '📦'}</div>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_STYLES[asset.status] || 'bg-slate-100 text-slate-600'}`}>
            {asset.status.replace('_', ' ')}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {asset.name}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 min-h-[2rem]">
          {asset.description}
        </p>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-400">Available</p>
            <p className="text-sm font-bold text-slate-900">{available} / {asset.quantity}</p>
          </div>
          <button
            onClick={onBook}
            disabled={!canBook}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={13} /> Request
          </button>
        </div>
      </div>
    </div>
  )
}

function BookingModal({ asset, open, onClose }) {
  const [form, setForm]       = useState({ startDate: '', endDate: '', quantity: 1, purpose: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})
  const available = asset.quantity - (asset.bookedQuantity || 0)

  if (!open) return null

  const validate = () => {
    const e = {}
    if (!form.startDate) e.startDate = 'Start date required'
    if (!form.endDate)   e.endDate   = 'End date required'
    if (form.startDate && form.endDate && form.startDate > form.endDate)
      e.endDate = 'End date must be after start date'
    if (!form.purpose)   e.purpose   = 'Purpose is required'
    if (form.quantity < 1 || form.quantity > available)
      e.quantity = `Must be between 1 and ${available}`
    return e
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await bookingAPI.create({ assetId: asset.id, ...form })
      toast.success('Booking request submitted! Awaiting admin approval.')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const set = (k) => (e) => {
    const val = k === 'quantity' ? parseInt(e.target.value) || 1 : e.target.value
    setForm(f => ({ ...f, [k]: val }))
    setErrors(er => ({ ...er, [k]: '' }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">Request asset</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Asset info */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <span className="text-2xl">{CATEGORY_ICONS[asset.category]}</span>
            <div>
              <p className="text-sm font-medium text-slate-900">{asset.name}</p>
              <p className="text-xs text-slate-400">{asset.category} · {available} available</p>
            </div>
          </div>

          {/* Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start date <span className="text-red-500">*</span></label>
              <input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="date" value={form.startDate} onChange={set('startDate')}
                min={new Date().toISOString().split('T')[0]} />
              {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End date <span className="text-red-500">*</span></label>
              <input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="date" value={form.endDate} onChange={set('endDate')}
                min={form.startDate || new Date().toISOString().split('T')[0]} />
              {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity <span className="text-red-500">*</span></label>
            <input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type="number" min={1} max={available} value={form.quantity} onChange={set('quantity')} />
            {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>}
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Purpose <span className="text-red-500">*</span></label>
            <textarea className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={2} placeholder="e.g. Photography workshop, Annual fest stage setup…"
              value={form.purpose} onChange={set('purpose')} />
            {errors.purpose && <p className="mt-1 text-xs text-red-500">{errors.purpose}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-1">
            <button onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors disabled:opacity-50">
              {loading ? 'Submitting…' : 'Submit request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
