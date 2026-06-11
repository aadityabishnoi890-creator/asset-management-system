# AssetFlow — Asset Management System

A full-stack asset management system built with **React + Vite** (frontend) and **Express** (backend).

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (comes with Node.js)

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/asset-management-system.git
cd asset-management-system
```

### 2. Install dependencies

You need to install dependencies for **both** the frontend and backend:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../assetflow
npm install
```

### 3. Run the app

From the `assetflow/` directory, a single command starts both the backend and frontend:

```bash
cd assetflow
npm run dev
```

This uses `concurrently` to launch:
- **Backend** → `http://localhost:3000`
- **Frontend** → `http://localhost:5173`

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Demo Accounts

| Role  | Email                      | Password      |
|-------|----------------------------|---------------|
| Admin | admin@assetflow.local      | admin123      |
| User  | aman@iitroorkee.ac.in      | password123   |
| User  | priya@iitroorkee.ac.in     | password123   |

## Project Structure

```
asset-management-system/
├── assetflow/            # React + Vite frontend
│   ├── src/
│   │   ├── api/          # Axios client & API services
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # Auth context provider
│   │   ├── pages/        # Page components
│   │   ├── App.jsx       # Root component & routes
│   │   └── main.jsx      # Entry point
│   ├── package.json
│   └── vite.config.js
├── backend/              # Express API server
│   ├── src/
│   │   └── server.js     # API routes & in-memory data
│   └── package.json
└── README.md
```

## Troubleshooting

### Import resolution errors after cloning

If you see errors like `Failed to resolve import "./context/AuthContext"`, it is likely a **filename casing issue**. Git on macOS is case-insensitive by default, which can cause mismatched filenames.

Fix: Make sure all import paths match the **exact** filename on disk (including letter casing).

### Port already in use

If port 3000 or 5173 is already in use, stop any existing processes on those ports:

```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```
