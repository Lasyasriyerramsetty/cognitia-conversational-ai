# CognitIA Round 2 — Full-stack conversational AI (single Q&A)

This repository contains a minimal full-stack web app that accepts **one user question at a time**, returns **one AI answer**, and **does not implement continuous chat history** in the product flow.

Each successful request is persisted in **MongoDB Atlas** as a single document containing:

- `question`
- `answer`
- `createdAt` (automatically set by Mongoose)

## Repository layout

- `frontend/` — Vite + React client
- `backend/` — Express API (Node.js compatible; works with Bun too)

## Tech stack

### Backend

- **Express** on **Node.js** (or **Bun** — both can install/run the same `package.json`)
- **Groq** Chat Completions API
- Default model: **`llama-3.1-8b-instant`** (configurable via `GROQ_MODEL`)
- **MongoDB Atlas** via **Mongoose**
- Security-oriented middleware:
  - `helmet` for safer HTTP headers
  - `express-rate-limit` to reduce abuse
  - strict JSON body size limits
  - CORS allowlist via `FRONTEND_URL`

### Frontend

- **Vite** + **React**
- One textarea + submit flow
- The UI replaces the displayed answer on each new submission (no chat transcript UI)

## Local setup

### Prerequisites

- Node.js **18+** (recommended), or Bun
- MongoDB Atlas cluster + database user
- Groq API key

### 1) MongoDB Atlas

1. Create a cluster and database user.
2. Get a connection string (`mongodb+srv://...`) and choose a database name in the URI path.
3. For serverless deployments (Vercel), Network Access typically needs to allow **`0.0.0.0/0`** (or Vercel-specific egress controls if you use them).

### 2) Groq

1. Create an API key in the Groq console.
2. Confirm the model id you intend to use (default is `llama-3.1-8b-instant`).

### 3) Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

- `MONGODB_URI`
- `GROQ_API_KEY`
- `FRONTEND_URL` (for local dev, `http://localhost:5173` is the default in `.env.example`)

Install and run:

```bash
npm install
npm run dev
```

With **Bun** (optional):

```bash
bun install
bun run dev
```

The API listens on `http://localhost:4000` by default.

### 4) Frontend

```bash
cd frontend
npm install
npm run dev
```

With **Bun** (optional):

```bash
bun install
bun run dev
```

For local development, the Vite dev server proxies `/ask` and `/health` to `http://localhost:4000` (override with `VITE_DEV_PROXY_TARGET` if needed).

### Production build (frontend)

```bash
cd frontend
npm run build
```

The static output is written to `frontend/dist/`.

## API usage

### `GET /health`

Returns `{ "ok": true }`.

### `POST /ask`

Request JSON body:

```json
{ "question": "string" }
```

Successful response:

```json
{ "answer": "string" }
```

Error response shape:

```json
{ "error": "string" }
```

Notes:

- `question` must be a non-empty string after trimming.
- Max length enforced server-side (4000 characters).

## Deployment (two separate Vercel projects, one Git repo)

Deploy **two Vercel projects** from the **same GitHub/GitLab repository**, each with a different **Root Directory**.

### Git hosting checklist

1. Create a new empty repository on GitHub or GitLab.
2. From this folder on your machine:

```bash
git remote add origin <YOUR_REPO_SSH_OR_HTTPS_URL>
git branch -M main
git push -u origin main
```

3. Import the repository into Vercel twice (two projects), using the root directory settings below.

### Backend Vercel project

- **Root Directory**: `backend`
- **Build Command**: leave default (this repo includes a no-op `vercel-build` script if needed)
- **Output Directory**: not applicable for a serverless API project

Set Vercel Environment Variables:

- `MONGODB_URI`
- `GROQ_API_KEY`
- `GROQ_MODEL` (optional; defaults to `llama-3.1-8b-instant`)
- `FRONTEND_URL` (your deployed frontend origin, e.g. `https://your-frontend.vercel.app`)
  - You can set multiple allowed origins as a comma-separated list.

After deployment, your backend public base URL will look like:

- `https://your-backend.vercel.app`

The included `backend/vercel.json` rewrites all routes to the serverless entry at `backend/api/index.js`, so `POST /ask` works at the root path of that deployment.

### Frontend Vercel project

- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

Set Vercel Environment Variables:

- `VITE_API_URL` = `https://your-backend.vercel.app` (no trailing slash)

Important: Vite inlines `VITE_*` variables at build time, so you must **redeploy** the frontend if this value changes.

## What this project intentionally does not do

- No continuous chat UI
- No conversational memory between turns in the UI
- No authentication (not required by the brief)

## License

This project scaffold is provided for submission purposes; add a license if you plan to distribute it.
