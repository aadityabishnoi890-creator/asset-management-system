const express = require('express')

const app = express()
const PORT = 3000

app.use(express.json())

const users = [
  { id: '1', name: 'Admin User', email: 'admin@assetflow.local', password: 'admin123', role: 'ADMIN' },
  { id: '2', name: 'Aman Sharma', email: 'aman@iitroorkee.ac.in', password: 'password123', role: 'USER' },
  { id: '3', name: 'Priya Singh', email: 'priya@iitroorkee.ac.in', password: 'password123', role: 'USER' },
]

const assets = [
  { id: '1', name: 'DSLR Canon EOS 5D Mark IV', category: 'Camera', description: 'Professional full-frame DSLR camera', quantity: 3, status: 'AVAILABLE', condition: 'Excellent' },
  { id: '2', name: 'Rode NTG4+ Shotgun Mic', category: 'Audio', description: 'Directional condenser mic', quantity: 5, status: 'AVAILABLE', condition: 'Good' },
  { id: '3', name: 'Aputure 300D Mark II', category: 'Lighting', description: 'Professional LED light', quantity: 4, status: 'IN_USE', condition: 'Good' },
  { id: '4', name: 'DJI Ronin-S Gimbal', category: 'Camera', description: 'Camera stabilizer', quantity: 2, status: 'AVAILABLE', condition: 'Excellent' },
  { id: '5', name: 'Yamaha MG10 Mixer', category: 'Audio', description: '10-channel mixing console', quantity: 2, status: 'AVAILABLE', condition: 'Fair' },
]

const bookings = [
  { id: '1', userId: '2', assetId: '1', quantity: 1, startDate: '2025-06-12', endDate: '2025-06-14', dueDate: '2025-06-14', purpose: 'Photography workshop', status: 'ISSUED' },
  { id: '2', userId: '3', assetId: '2', quantity: 2, startDate: '2025-06-15', endDate: '2025-06-17', dueDate: '2025-06-17', purpose: 'Music fest recording', status: 'PENDING' },
  { id: '3', userId: '2', assetId: '5', quantity: 1, startDate: '2025-06-01', endDate: '2025-06-03', dueDate: '2025-06-03', purpose: 'DJ night', status: 'RETURNED', returnedAt: '2025-06-03' },
]

const sessions = new Map()

function randomId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function publicUser(user) {
  if (!user) return null
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

function findUserByToken(token) {
  const userId = sessions.get(token)
  return users.find((user) => user.id === userId) || null
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const user = findUserByToken(token)

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  req.user = user
  next()
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' })
  }

  next()
}

function activeBookingStatuses() {
  return new Set(['PENDING', 'APPROVED', 'ISSUED'])
}

function bookedQuantityForAsset(assetId) {
  return bookings
    .filter((booking) => booking.assetId === assetId && activeBookingStatuses().has(booking.status))
    .reduce((total, booking) => total + Number(booking.quantity || 0), 0)
}

function serializeAsset(asset) {
  return {
    ...asset,
    bookedQuantity: bookedQuantityForAsset(asset.id),
  }
}

function serializeBooking(booking) {
  return {
    ...booking,
    user: publicUser(users.find((user) => user.id === booking.userId)),
    asset: assets.find((asset) => asset.id === booking.assetId)
      ? {
          id: booking.assetId,
          name: assets.find((asset) => asset.id === booking.assetId).name,
          category: assets.find((asset) => asset.id === booking.assetId).category,
        }
      : null,
  }
}

app.get('/', (req, res) => {
  res.send('Asset Management Server Running!')
})

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role = 'USER' } = req.body || {}

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' })
  }

  if (users.some((user) => user.email.toLowerCase() === String(email).toLowerCase())) {
    return res.status(409).json({ message: 'Email already registered' })
  }

  const user = {
    id: randomId(),
    name,
    email,
    password,
    role: role === 'ADMIN' ? 'ADMIN' : 'USER',
  }

  users.push(user)
  const token = randomId()
  sessions.set(token, user.id)

  return res.json({ token, user: publicUser(user) })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {}
  const user = users.find((candidate) => candidate.email.toLowerCase() === String(email || '').toLowerCase() && candidate.password === password)

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  const token = randomId()
  sessions.set(token, user.id)

  return res.json({ token, user: publicUser(user) })
})

app.get('/api/auth/me', requireAuth, (req, res) => {
  return res.json({ user: publicUser(req.user) })
})

app.get('/api/assets', (req, res) => {
  return res.json(assets.map(serializeAsset))
})

app.get('/api/assets/:id', (req, res) => {
  const asset = assets.find((candidate) => candidate.id === req.params.id)

  if (!asset) {
    return res.status(404).json({ message: 'Asset not found' })
  }

  return res.json(serializeAsset(asset))
})

app.post('/api/assets', requireAuth, requireAdmin, (req, res) => {
  const { name, category, description = '', quantity = 1, status = 'AVAILABLE', condition = 'Good' } = req.body || {}

  if (!name || !category) {
    return res.status(400).json({ message: 'Name and category are required' })
  }

  const asset = {
    id: randomId(),
    name,
    category,
    description,
    quantity: Number(quantity) || 1,
    status,
    condition,
  }

  assets.push(asset)
  return res.status(201).json(serializeAsset(asset))
})

app.put('/api/assets/:id', requireAuth, requireAdmin, (req, res) => {
  const asset = assets.find((candidate) => candidate.id === req.params.id)

  if (!asset) {
    return res.status(404).json({ message: 'Asset not found' })
  }

  Object.assign(asset, {
    ...req.body,
    quantity: req.body?.quantity !== undefined ? Number(req.body.quantity) || asset.quantity : asset.quantity,
  })

  return res.json(serializeAsset(asset))
})

app.delete('/api/assets/:id', requireAuth, requireAdmin, (req, res) => {
  const index = assets.findIndex((candidate) => candidate.id === req.params.id)

  if (index === -1) {
    return res.status(404).json({ message: 'Asset not found' })
  }

  assets.splice(index, 1)
  return res.status(204).send()
})

app.get('/api/bookings', requireAuth, (req, res) => {
  const visibleBookings = req.user.role === 'ADMIN'
    ? bookings
    : bookings.filter((booking) => booking.userId === req.user.id)

  return res.json(visibleBookings.map(serializeBooking))
})

app.get('/api/bookings/mine', requireAuth, (req, res) => {
  return res.json(bookings.filter((booking) => booking.userId === req.user.id).map(serializeBooking))
})

app.post('/api/bookings', requireAuth, (req, res) => {
  const { assetId, quantity, startDate, endDate, purpose } = req.body || {}
  const asset = assets.find((candidate) => candidate.id === assetId)

  if (!asset) {
    return res.status(404).json({ message: 'Asset not found' })
  }

  const requestedQuantity = Number(quantity) || 1
  const availableQuantity = asset.quantity - bookedQuantityForAsset(asset.id)

  if (requestedQuantity < 1 || requestedQuantity > availableQuantity) {
    return res.status(400).json({ message: `Quantity must be between 1 and ${availableQuantity}` })
  }

  const booking = {
    id: randomId(),
    userId: req.user.id,
    assetId: asset.id,
    quantity: requestedQuantity,
    startDate,
    endDate,
    dueDate: endDate,
    purpose,
    status: 'PENDING',
  }

  bookings.push(booking)
  return res.status(201).json(serializeBooking(booking))
})

function updateBookingStatus(req, res, status, extraFields = {}) {
  const booking = bookings.find((candidate) => candidate.id === req.params.id)

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' })
  }

  Object.assign(booking, { status, ...extraFields })
  return res.json(serializeBooking(booking))
}

app.patch('/api/bookings/:id/approve', requireAuth, requireAdmin, (req, res) => {
  return updateBookingStatus(req, res, 'APPROVED')
})

app.patch('/api/bookings/:id/reject', requireAuth, requireAdmin, (req, res) => {
  return updateBookingStatus(req, res, 'REJECTED', { rejectionReason: req.body?.reason || '' })
})

app.patch('/api/bookings/:id/issue', requireAuth, requireAdmin, (req, res) => {
  return updateBookingStatus(req, res, 'ISSUED')
})

app.patch('/api/bookings/:id/return', requireAuth, requireAdmin, (req, res) => {
  return updateBookingStatus(req, res, 'RETURNED', { returnedAt: new Date().toISOString().slice(0, 10) })
})

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})