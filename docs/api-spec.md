# Authentication

POST /api/auth/register
POST /api/auth/login
GET /api/auth/me

# Assets

GET /api/assets
GET /api/assets/:id
POST /api/assets
PUT /api/assets/:id
DELETE /api/assets/:id

# Bookings

POST /api/bookings
GET /api/bookings/my
GET /api/bookings

# Approval

PATCH /api/bookings/:id/approve
PATCH /api/bookings/:id/reject

# Issue & Return

PATCH /api/bookings/:id/issue
PATCH /api/bookings/:id/return

# Dashboard

GET /api/dashboard/stats