# Deployment Guide

This repository is configured to deploy the backend to Render and the frontend to Vercel.

## Backend: Render

Render can deploy the backend using the existing `render.yaml` at the repo root.

### Steps
1. Open the Render dashboard.
2. Create a new service and connect your GitHub repo.
3. Choose `Blueprint` or let Render detect `render.yaml` automatically.
4. Confirm the service uses the `backend` directory.

### Render-specific settings
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Runtime: Node
- Port: `8787` (configured by `backend/src/index.ts` and `render.yaml`)

### Required environment variables
- `GEMINI_API_KEY`
- `TAVILY_API_KEY`
- `FINNHUB_API_KEY` (optional; if blank, the app skips live market data)
- `CORS_ORIGIN`

Example `CORS_ORIGIN` values:
- `https://<your-vercel-app>.vercel.app`
- `https://<your-vercel-app>.vercel.app,http://localhost:5173`

If you use the frontend on Vercel, set `CORS_ORIGIN` to the deployed frontend URL.

## Frontend: Vercel

Deploy the frontend from the `frontend/` directory.

### Steps
1. Open the Vercel dashboard.
2. Import the same GitHub repo.
3. Set the root directory to `frontend`.
4. Verify that Vercel detects a Vite project.
5. Confirm the build command is `npm run build` and the output directory is `dist`.

### Required environment variable
- `VITE_API_URL=https://<your-backend>.onrender.com`

This ensures the frontend requests the deployed Render backend.

## Local test commands

### Backend
```bash
cd backend
npm install
cp .env.example .env
# set the required keys in backend/.env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# update VITE_API_URL if needed
npm run dev
```

## Verification

- Backend health: `https://<your-backend>.onrender.com/health`
- Frontend should load and call the backend via `VITE_API_URL`
- Use the app to run a research query and confirm results stream in

## Notes

- `frontend/.env.example` already shows `VITE_API_URL=http://localhost:8787` for local development.
- `backend/.env.example` includes `CORS_ORIGIN` and other required service keys.
- `frontend/tsconfig.json` now includes `types: ["vite/client"]` so Vercel build supports `import.meta.env`.
