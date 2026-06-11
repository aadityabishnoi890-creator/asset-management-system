import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { assetAPI } from '../api/services'

const CATEGORIES = ['Camera', 'Audio', 'Lighting', 'Costume', 'Props', 'Recording', 'Infrastructure']
const STATUSES   = ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'DAMAGED']
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor']

const STATUS_STYLES = {
  AVAILABLE:   'bg-emerald-50 text-emerald-700',
  IN_USE:      'bg-purple-50  text-purple-700',
  MAINTENANCE: 'bg-amber-50   text-amber-700',
  DAMAGED:     'bg-red-50     text-red-700',
}

const BLANK = { name: '', category: 'Camera', description: '', quantity: 1, status: 'AVAILABLE', condition: 'Good' }

export function AdminAssetsPage() {
  const [assets, setAssets]       = useState([])
  const [search, setSearch]       = useState('')
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState(null)   // asset being edited
  const [deleteTarget, setDeleteTarget] = useState(null) // asset to delete
  const [showConfirm, setShowConfirm]   = useState(false)
  const [loading, setLoading] = useState(true)

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

  const filtered = assets.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd  = ()      => { setEditing(null);  setShowForm(true) }
  const openEdit = (asset) => { setEditing(asset); setShowForm(true) }

  const handleSave = async (formData) => {
    const payload = { ...formData, quantity: Number(formData.quantity) || 1 }

    try {
      if (editing) {
        const res = await assetAPI.update(editing.id, payload)
        const updatedAsset = res.data.asset ?? res.data
        setAssets(prev => prev.map(a => a.id === editing.id ? updatedAsset : a))
        toast.success('Asset updated')
      } else {
        const res = await assetAPI.create(payload)
        const createdAsset = res.data.asset ?? res.data
        setAssets(prev => [...prev, createdAsset])
        toast.success('Asset added')
      }
      setShowForm(false)
      setEditing(null)
    } catch {
      toast.error('Could not save asset')
    }
  }

  const confirmDelete = (asset) => { setDeleteTarget(asset); setShowConfirm(true) }

  const handleDelete = async () => {
    if (!deleteTarget) return

    try {
      await assetAPI.delete(deleteTarget.id)
      setAssets(prev => prev.filter(a => a.id !== deleteTarget.id))
      toast.success('Asset deleted')
      setShowConfirm(false)
      setDeleteTarget(null)
    } catch {
      toast.error('Could not delete asset')
    }
  }

  if (loading) {
    return <div className="py-10 text-sm text-slate-500">Loading assets…</div>
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Assets</h1>
          <p className="text-sm text-slate-500 mt-0.5">{assets.length} total assets</p>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus size={16} /> Add asset
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Search assets…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-sm font-semibold text-slate-700">No assets found</p>
          <button onClick={openAdd}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg">
            <Plus size={15} /> Add first asset
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Condition</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={a.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-4 py-3 font-medium text-slate-900">{a.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                      {a.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{a.quantity}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_STYLES[a.status] || 'bg-slate-100 text-slate-600'}`}>
                      {a.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{a.condition}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(a)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => confirmDelete(a)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit modal */}
      <AssetFormModal
        key={editing?.id ?? 'new'}
        open={showForm}
        editing={editing}
        onClose={() => { setShowForm(false); setEditing(null) }}
        onSave={handleSave}
      />

      {/* Delete confirm */}
      {showConfirm && (
        <ConfirmModal
          title="Delete asset"
          message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => { setShowConfirm(false); setDeleteTarget(null) }}
        />
      )}
    </div>
  )
}

// ── Asset form modal ───────────────────────────────────────────────────────
function AssetFormModal({ open, editing, onClose, onSave }) {
  const [form, setForm]   = useState(editing || BLANK)
  const [errors, setErrors] = useState({})

  if (!open) return null

  const validate = () => {
    const e = {}
    if (!form.name || form.name.length < 2) e.name     = 'Name is required'
    if (!form.quantity || form.quantity < 1) e.quantity = 'Quantity must be at least 1'
    return e
  }

  const handleSubmit = () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave(form)
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

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">
            {editing ? 'Edit asset' : 'Add new asset'}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">✕</button>
        </div>

        <div className="px-6 py-4 space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Asset name <span className="text-red-500">*</span></label>
            <input
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. DSLR Canon EOS 5D Mark IV"
              value={form.name || ''}
              onChange={set('name')}
              autoFocus
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Category + Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
                value={form.category || 'Camera'}
                onChange={set('category')}
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity <span className="text-red-500">*</span></label>
              <input
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="number" min={1}
                value={form.quantity || 1}
                onChange={set('quantity')}
              />
              {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>}
            </div>
          </div>

          {/* Status + Condition */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
                value={form.status || 'AVAILABLE'}
                onChange={set('status')}
              >
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Condition</label>
              <select
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
                value={form.condition || 'Good'}
                onChange={set('condition')}
              >
                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={2}
              placeholder="Brief description…"
              value={form.description || ''}
              onChange={set('description')}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-1">
            <button onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
              Cancel
            </button>
            <button onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors">
              {editing ? 'Save changes' : 'Add asset'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Reusable confirm dialog ────────────────────────────────────────────────
function ConfirmModal({ title, message, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}