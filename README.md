# AssetFlow — Asset Management System

	⁠A full-stack asset management system for colleges and organisations to track, book, issue, and return equipment.

Built with *React + Vite* (frontend) and *Express* (backend, in-memory data store).

---

## Features

•⁠  ⁠🔐 *Authentication* — Register & login with role-based access (Admin / User)

•⁠  ⁠📦 *Asset Catalogue* — Browse, search, and filter assets by category

•⁠  ⁠📋 *Booking Requests* — Users request assets with dates, quantity, and purpose

•⁠  ⁠✅ *Admin Approvals* — Admins approve, reject, issue, and mark returns

•⁠  ⁠📊 *Dashboards* — Role-specific dashboards with stats and charts

•⁠  ⁠🔍 *Audit Logs* — Full activity history for all system actions

•⁠  ⁠📷 *QR Codes* — Generate & scan QR codes to issue / return assets

•⁠  ⁠🔔 *Notifications* — In-app notification bell with unread badge

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, TailwindCSS 4 |
| Routing | React Router v7 |
| HTTP Client | Axios |
| Charts | Recharts |
| Icons | Lucide React |
| Toasts | React Hot Toast |
| QR Codes | qrcode, html5-qrcode |
| Backend | Node.js, Express |
| Data Store | In-memory (arrays) — resets on server restart |

---

## Prerequisites

•⁠  ⁠[Node.js](https://nodejs.org/) *v18 or later*
•⁠  ⁠*npm* (bundled with Node.js)

Verify your versions:

⁠ bash
node --version   # should be v18+
npm --version
 ⁠

---

## Quick Start

### 1. Clone the repository

⁠ bash
git clone https://github.com/aadityabishnoi890-creator/asset-management-system.git
cd asset-management-system
 ⁠

### 2. Install dependencies

Install dependencies for *both* the backend and the frontend:

⁠ bash
# Backend
cd backend
npm install

# Frontend
cd ../assetflow
npm install
 ⁠

### 3. Start the development server

From inside the ⁠ assetflow/ ⁠ directory, one command starts *both* servers:

⁠ bash
cd assetflow   # make sure you are in this folder
npm run dev
 ⁠

This uses ⁠ concurrently ⁠ to launch:
| Service | URL |
|---------|-----|
| *Frontend* (Vite / React) | http://localhost:5173 |
| *Backend* (Express API) | http://localhost:3000 |

Open *[http://localhost:5173](http://localhost:5173)* in your browser.

---

## Demo Accounts

These accounts are seeded automatically at server start:

| Role  | Email | Password |
|-------|-------|----------|
| *Admin* | ⁠ admin@assetflow.local ⁠ | ⁠ admin123 ⁠ |
| User  | ⁠ aman@iitroorkee.ac.in ⁠ | ⁠ password123 ⁠ |
| User  | ⁠ priya@iitroorkee.ac.in ⁠ | ⁠ password123 ⁠ |

	⁠*Note:* The backend uses in-memory storage. All data (including newly registered accounts, added assets, and bookings) is *reset every time the server restarts*. Only the seeded accounts above survive a restart.

---

## Project Structure


asset-management-system/
├── assetflow/                  # React + Vite frontend
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js       # Axios instance (baseURL, interceptors)
│   │   │   └── services.js     # authAPI, assetAPI, bookingAPI
│   │   ├── components/
│   │   │   └── layout/
│   │   │       └── AppLayout.jsx   # Sidebar, topbar, notification bell
│   │   ├── context/
│   │   │   └── auth_context.jsx    # AuthProvider + useAuth hook
│   │   ├── pages/
│   │   │   ├── authpages.jsx       # Login & Register
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── AssetsPage.jsx
│   │   │   ├── HistoryPage.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminAssets.jsx
│   │   │   ├── AdminBookings.jsx
│   │   │   ├── AuditLogsPage.jsx
│   │   │   └── QRPage.jsx
│   │   ├── App.jsx             # Root component & route definitions
│   │   └── main.jsx            # Entry point
│   ├── vite.config.js          # Vite proxy: /api → localhost:3000
│   └── package.json
├── backend/
│   ├── src/
│   │   └── server.js           # Express server, all API routes, in-memory data
│   └── package.json
└── README.md


---

## API Reference

All endpoints are prefixed with ⁠ /api ⁠.

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | ⁠ /api/auth/register ⁠ | — | Register a new account |
| POST | ⁠ /api/auth/login ⁠ | — | Login and receive a token |
| GET | ⁠ /api/auth/me ⁠ | ✅ | Get current user |

### Assets
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | ⁠ /api/assets ⁠ | — | List all assets |
| GET | ⁠ /api/assets/:id ⁠ | — | Get single asset |
| POST | ⁠ /api/assets ⁠ | Admin | Create asset |
| PUT | ⁠ /api/assets/:id ⁠ | Admin | Update asset |
| DELETE | ⁠ /api/assets/:id ⁠ | Admin | Delete asset |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | ⁠ /api/bookings ⁠ | ✅ | All bookings (admin sees all, user sees own) |
| GET | ⁠ /api/bookings/mine ⁠ | ✅ | Current user's bookings |
| POST | ⁠ /api/bookings ⁠ | ✅ | Create booking request |
| PATCH | ⁠ /api/bookings/:id/approve ⁠ | Admin | Approve |
| PATCH | ⁠ /api/bookings/:id/reject ⁠ | Admin | Reject (with optional reason) |
| PATCH | ⁠ /api/bookings/:id/issue ⁠ | Admin | Mark as issued |
| PATCH | ⁠ /api/bookings/:id/return ⁠ | Admin | Mark as returned |

---

## Troubleshooting

### ⁠ npm run dev ⁠ fails with "Cannot find package.json"

You ran the command from the wrong directory. Always run from *inside ⁠ assetflow/ ⁠*:

⁠ bash
cd assetflow
npm run dev
 ⁠

### Backend fails with "Cannot find module 'express'"

The backend dependencies haven't been installed. Run:

⁠ bash
cd backend
npm install
 ⁠

### Assets or bookings not loading

Make sure you're running ⁠ npm run dev ⁠ from the ⁠ assetflow/ ⁠ folder (not the project root). The Vite dev server must be running to proxy ⁠ /api ⁠ requests to the backend.

### Port already in use

⁠ bash
lsof -ti:3000 | xargs kill -9   # free backend port
lsof -ti:5173 | xargs kill -9   # free frontend port
 ⁠

### Import resolution errors after cloning

If you see ⁠ Failed to resolve import ⁠, it is usually a *filename casing mismatch. Git on macOS is case-insensitive by default. Verify that all import paths match the **exact* casing of the file on disk.

---

## License

MIT
