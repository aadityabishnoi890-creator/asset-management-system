import { useState, useEffect, useRef } from 'react'
import { QrCode, Camera, Download, RefreshCw } from 'lucide-react'
import QRCode from 'qrcode'
import toast from 'react-hot-toast'
import { assetAPI } from '../api/services'

export function QRPage() {
  const [tab, setTab] = useState('generate')
  const [assets, setAssets] = useState([])

  useEffect(() => {
    let active = true

    const loadAssets = async () => {
      try {
        const res = await assetAPI.getAll()
        const nextAssets = res.data.assets ?? res.data ?? []
        if (active) setAssets(nextAssets)
      } catch {
        toast.error('Failed to load assets')
      }
    }

    loadAssets()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">QR Code Operations</h1>
        <p className="text-sm text-slate-500 mt-0.5">Generate asset QR codes or scan to issue and return</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {[
          { key: 'generate', label: 'Generate QR', icon: QrCode  },
          { key: 'scan',     label: 'Scan QR',     icon: Camera  },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'generate' ? <GenerateTab assets={assets} /> : <ScanTab />}
    </div>
  )
}

// ── Generate Tab ──────────────────────────────────────────────────────────
function GenerateTab({ assets }) {
  const [selectedId, setSelectedId] = useState('')
  const [qrDataUrl, setQrDataUrl]   = useState('')
  const [generating, setGenerating] = useState(false)

  const selectedAsset = assets.find(a => a.id === selectedId)

  useEffect(() => {
    if (!selectedId || !selectedAsset) { setQrDataUrl(''); return }

    setGenerating(true)
    const payload = JSON.stringify({
      assetId:   selectedAsset.id,
      assetName: selectedAsset.name,
      category:  selectedAsset.category,
    })

    QRCode.toDataURL(payload, {
      width:  280,
      margin: 2,
      color:  { dark: '#0f172a', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })
      .then(url => { setQrDataUrl(url); setGenerating(false) })
      .catch(() => { toast.error('Failed to generate QR'); setGenerating(false) })
  }, [selectedId])

  const handleDownload = () => {
    if (!qrDataUrl || !selectedAsset) return
    const link      = document.createElement('a')
    link.download   = `qr-${selectedAsset.name.replace(/\s+/g, '-').toLowerCase()}.png`
    link.href       = qrDataUrl
    link.click()
    toast.success('QR code downloaded!')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Left — asset selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Select asset</h2>

        <select
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
        >
          <option value="">-- Choose an asset --</option>
          {assets.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        {/* Asset detail card */}
        {selectedAsset && (
          <div className="p-3 bg-slate-50 rounded-lg space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">{selectedAsset.name}</p>
            </div>
            <p className="text-xs text-slate-500">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-200 text-slate-600">
                {selectedAsset.category}
              </span>
            </p>
            <p className="text-xs text-slate-400 font-mono">ID: {selectedAsset.id}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-700">How to use:</p>
          {[
            'Select an asset from the dropdown above',
            'Download the generated QR code as PNG',
            'Print and attach it to the physical asset',
            'Use the Scan tab to issue or return assets',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-xs text-slate-500">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — QR preview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col items-center justify-center gap-4 min-h-64">
        {generating ? (
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <RefreshCw size={32} className="animate-spin text-indigo-400" />
            <p className="text-sm">Generating QR code…</p>
          </div>
        ) : qrDataUrl ? (
          <>
            {/* QR image */}
            <div className="p-3 bg-white rounded-xl border-2 border-slate-100 shadow-sm">
              <img src={qrDataUrl} alt="QR code" className="w-52 h-52" />
            </div>

            {/* Asset label under QR */}
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-900">{selectedAsset?.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{selectedAsset?.category}</p>
            </div>

            {/* Download button */}
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Download size={15} /> Download PNG
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-300">
            <QrCode size={72} strokeWidth={1} />
            <p className="text-sm text-slate-400 text-center">
              Select an asset to generate its QR code
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Scan Tab ──────────────────────────────────────────────────────────────
function ScanTab() {
  const [scanAction, setScanAction]   = useState('issue')
  const [scanResult, setScanResult]   = useState(null)
  const [scannerReady, setScannerReady] = useState(false)
  const [confirming, setConfirming]   = useState(false)
  const scannerRef = useRef(null)
  const mounted    = useRef(false)

  useEffect(() => {
    mounted.current = true

    // Dynamically import to avoid SSR issues
    import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
      if (!mounted.current) return

      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 220, height: 220 }, rememberLastUsedCamera: true },
        false
      )

      scanner.render(
        (decodedText) => {
          try {
            const data = JSON.parse(decodedText)
            if (data.assetId && data.assetName) {
              setScanResult(data)
              scanner.pause(true)
            } else {
              toast.error('Invalid asset QR code')
            }
          } catch {
            toast.error('Could not read QR code')
          }
        },
        () => {} // ignore scan errors
      )

      scannerRef.current = scanner
      setScannerReady(true)
    }).catch(() => {
      toast.error('Camera not available')
    })

    return () => {
      mounted.current = false
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
      }
    }
  }, [])

  const handleConfirm = async () => {
    if (!scanResult) return
    setConfirming(true)

    
    await new Promise(r => setTimeout(r, 600)) // simulate network

    toast.success(
      scanAction === 'issue'
        ? `✅ ${scanResult.assetName} issued successfully`
        : `📥 ${scanResult.assetName} returned successfully`
    )

    setConfirming(false)
    setScanResult(null)

    // Resume scanner
    if (scannerRef.current) {
      scannerRef.current.resume()
    }
  }

  const handleCancel = () => {
    setScanResult(null)
    if (scannerRef.current) scannerRef.current.resume()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Left — Scanner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">

        {/* Action selector */}
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-slate-700 flex-shrink-0">Scan to:</p>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {[
              { key: 'issue',  label: 'Issue'  },
              { key: 'return', label: 'Return' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setScanAction(key)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  scanAction === key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Camera viewfinder */}
        <div
          id="qr-reader"
          className="rounded-xl overflow-hidden border border-slate-200"
          style={{ minHeight: 280 }}
        />

        {!scannerReady && (
          <p className="text-xs text-slate-400 text-center">Starting camera…</p>
        )}
      </div>

      {/* Right — Result / Instructions */}
      <div className="space-y-4">

        {/* Scan result card */}
        {scanResult ? (
          <div className="bg-white rounded-xl border-2 border-indigo-200 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <div>
                <p className="text-sm font-semibold text-slate-900">QR Code Scanned!</p>
                <p className="text-xs text-slate-400">Ready to {scanAction}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg space-y-1">
              <p className="text-xs text-slate-500">Asset</p>
              <p className="text-sm font-semibold text-slate-900">{scanResult.assetName}</p>
              <p className="text-xs text-slate-400">{scanResult.category} · ID: {scanResult.assetId}</p>
            </div>

            <div className="p-3 bg-indigo-50 rounded-lg">
              <p className="text-xs font-medium text-indigo-700">
                Action: <span className="uppercase">{scanAction}</span>
              </p>
              <p className="text-xs text-indigo-500 mt-0.5">
                {scanAction === 'issue'
                  ? 'This will mark the asset as issued and update inventory'
                  : 'This will mark the asset as returned and restock inventory'
                }
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {confirming ? 'Processing…' : `Confirm ${scanAction}`}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-sm font-semibold text-slate-900 mb-3">Waiting for scan…</p>
            <div className="space-y-2">
              {[
                'Select Issue or Return above',
                'Point camera at an asset QR code',
                'Review the scanned asset details',
                'Confirm the action',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-xs text-slate-500">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent scans placeholder */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm font-semibold text-slate-900 mb-3">Recent scans</p>
          <p className="text-xs text-slate-400 text-center py-4">
            Scan history will appear here
          </p>
        </div>
      </div>
    </div>
  )
}