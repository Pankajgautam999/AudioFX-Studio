# Sonora — AI Music Generator

A full-stack, production-ready AI music generator: describe a scene, pick a genre and mood, and get back an
original, playable track — no sign-up, no accounts, no database. Audio is composed procedurally on the backend
(a from-scratch generative synth engine + WAV encoder), so generation works completely offline, with zero
external API keys required.

![Stack](https://img.shields.io/badge/frontend-React%20%2B%20TypeScript%20%2B%20Vite-8b5cf6)
![Stack](https://img.shields.io/badge/backend-Node.js%20%2B%20Express%20%2B%20TypeScript-ec4899)
![Stack](https://img.shields.io/badge/no%20auth-no%20database-0ea5e9)

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Installation](#installation)
- [Development](#development)
- [Environment variables](#environment-variables)
- [Build](#build)
- [Docker usage](#docker-usage)
- [GitHub setup](#github-setup)
- [Deployment](#deployment)
- [API reference](#api-reference)
- [Troubleshooting](#troubleshooting)

## Features

- **Landing page** — animated, dark, glassmorphic, fully responsive.
- **Generator** — prompt, negative prompt, genre selector (10 genres), mood selector (10 moods), duration
  selector, random-prompt button, generate/cancel, inline validation, and error handling.
- **Result player** — real waveform (decoded from the actual generated audio), play/pause, seek, volume,
  playback speed (0.5x–2x), download, regenerate, copy prompt, and share-link (encodes the prompt/params in
  the URL).
- **No accounts, no database** — every generation is stateless and ephemeral; audio files live on disk with a
  TTL and are swept on an interval.
- **Security** — Helmet, CORS allow-list, per-route rate limiting, Zod input validation, centralized error
  handling, path-traversal-safe file access.

## Tech stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
**Backend:** Node.js, Express, TypeScript
**Package manager:** npm
**Deployment:** Docker, Docker Compose, GitHub Actions

## Project structure

```
music-generator/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Error handling, rate limiting, validation
│   │   ├── routes/            # Express routers + Zod schemas
│   │   ├── services/          # Music synthesis engine, job store, audio file storage
│   │   ├── types/             # Shared TS types
│   │   ├── utils/             # WAV encoder, seeded RNG, random prompt generator
│   │   ├── app.ts             # Express app factory
│   │   └── server.ts          # Entrypoint
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── hooks/             # useMusicGeneration, useWaveformPeaks
│   │   ├── lib/                # API client, constants, utils
│   │   ├── types/              # Shared TS types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.ts
├── .github/workflows/ci.yml
├── docker-compose.yml
└── README.md
```

## Installation

Requires **Node.js 18+** and **npm**.

```bash
git clone <your-repo-url>
cd music-generator

# Backend
cd backend
cp .env.example .env
npm install

# Frontend
cd ../frontend
cp .env.example .env
npm install
```

## Development

Run both apps in separate terminals:

```bash
# Terminal 1 - backend (http://localhost:8080)
cd backend
npm run dev

# Terminal 2 - frontend (http://localhost:5173)
cd frontend
npm run dev
```

The Vite dev server proxies `/api/*` requests to `http://localhost:8080` automatically (see
`frontend/vite.config.ts`), so you don't need to configure `VITE_API_BASE_URL` for local development.

Open **http://localhost:5173** and generate your first track.

## Environment variables

### `backend/.env`

| Variable                  | Default                 | Description                                        |
| -------------------------- | ------------------------ | --------------------------------------------------- |
| `PORT`                     | `8080`                   | HTTP port the API listens on                        |
| `NODE_ENV`                 | `development`            | `development` or `production`                       |
| `CORS_ORIGIN`               | `http://localhost:5173`  | Comma-separated list of allowed origins              |
| `RATE_LIMIT_WINDOW_MS`      | `60000`                  | Rate limit window (ms) for generation requests       |
| `RATE_LIMIT_MAX_REQUESTS`   | `30`                     | Max generation requests per window per client        |
| `MAX_DURATION_SECONDS`      | `60`                     | Upper bound accepted for `duration`                  |
| `MIN_DURATION_SECONDS`      | `5`                      | Lower bound accepted for `duration`                  |
| `AUDIO_STORAGE_DIR`         | `./tmp/audio`            | Where generated WAV files are written                |
| `AUDIO_FILE_TTL_MS`         | `1800000` (30 min)       | How long generated files are kept before cleanup      |

### `frontend/.env`

| Variable              | Default | Description                                                                 |
| ---------------------- | ------- | ----------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`    | *(empty)* | Base URL of the backend API. Leave empty to use the same-origin `/api` path (dev proxy or nginx proxy in Docker). Set to something like `https://api.example.com` for a split deployment. |

## Build

```bash
# Backend
cd backend
npm run build      # outputs to backend/dist
npm start          # runs the compiled server

# Frontend
cd frontend
npm run build      # outputs to frontend/dist
npm run preview    # serves the production build locally
```

## Docker usage

The whole stack (backend API + nginx-served frontend) runs with one command:

```bash
docker compose up --build
```

- Frontend: **http://localhost:8081**
- Backend API: **http://localhost:8080**

The frontend container's nginx proxies `/api/*` to the backend container over the internal Docker network, so
no CORS configuration is needed in that setup. Generated audio is persisted in a named Docker volume
(`audio-tmp`) for the backend's lifetime and purged on the configured TTL.

To rebuild after code changes:

```bash
docker compose up --build --force-recreate
```

To tear down:

```bash
docker compose down -v
```

## GitHub setup

1. Create a new repository and push this project:

   ```bash
   git init
   git add .
   git commit -m "Initial commit: Sonora AI Music Generator"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. The included workflow at `.github/workflows/ci.yml` runs automatically on every push/PR to `main`:
   - Lints, typechecks, and builds the backend
   - Lints, typechecks, and builds the frontend (uploading `dist/` as a build artifact)
   - Builds both Docker images to catch Dockerfile regressions

No secrets or environment variables are required for CI since the app doesn't call any external services.

## Deployment

This app has no database and no auth, so deployment is just "run two stateless containers":

- **Backend**: deploy the `backend/Dockerfile` image anywhere that runs containers (Fly.io, Render, Railway,
  ECS, a VPS with Docker, etc.). Mount a volume at `AUDIO_STORAGE_DIR` if you want generated files to survive
  restarts (optional — they're ephemeral by design).
- **Frontend**: deploy the static `frontend/dist` build to any static host (Vercel, Netlify, Cloudflare Pages,
  S3 + CloudFront) or run the `frontend/Dockerfile` nginx image. Point `VITE_API_BASE_URL` at your backend's
  public URL at build time if the frontend and backend are on different domains, and add that domain to the
  backend's `CORS_ORIGIN`.
- **Single VM**: `docker compose up -d` works as-is behind a reverse proxy (Caddy/Traefik/nginx) for TLS.

## API reference

All endpoints are prefixed with `/api`.

| Method | Path                         | Description                                  |
| ------ | ----------------------------- | --------------------------------------------- |
| POST   | `/generate`                   | Generate a new track. Body: `{ prompt, negativePrompt?, genre, mood, duration, seed? }` |
| GET    | `/generate/:id/status`        | Get the status/result of a generation job     |
| POST   | `/generate/:id/cancel`        | Cancel a queued/processing job                 |
| DELETE | `/generate/:id`                | Delete a job and its audio file                |
| GET    | `/random-prompt`               | Get a randomly generated prompt + parameters   |
| GET    | `/audio/:fileName`             | Stream generated audio (used by the player)    |
| GET    | `/audio/:fileName/download`    | Download generated audio as an attachment      |
| GET    | `/health`                      | Health check                                   |

## Troubleshooting

**"Failed to fetch" / CORS errors in the browser console**
Make sure `backend/.env`'s `CORS_ORIGIN` includes the exact origin the frontend is served from (e.g.
`http://localhost:5173` in dev). Restart the backend after changing `.env`.

**`npm run dev` on the frontend can't reach the API**
Confirm the backend is actually running on port `8080` (`curl http://localhost:8080/api/health`), and that
`VITE_API_BASE_URL` in `frontend/.env` is empty (so the Vite proxy handles it) unless you're intentionally
pointing at a different host.

**Docker Compose: frontend can't reach backend**
The nginx config proxies to `http://backend:8080`, which relies on Docker Compose's internal DNS — this only
works when both services are started via `docker compose up` (not run as standalone containers).

**Generated audio sounds empty or clips**
This can happen with extremely long durations combined with certain genre/mood combinations. Try a shorter
`duration` or a different mood; the synthesis engine normalizes and soft-clips automatically, but very dense
percussive genres at 60s can still push levels hard.

**"Too many requests" errors**
The generation endpoint is rate-limited (default: 30 requests/minute per client). Adjust
`RATE_LIMIT_MAX_REQUESTS` / `RATE_LIMIT_WINDOW_MS` in `backend/.env` if you need a higher ceiling for local
testing.

## License

MIT — do whatever you'd like with this project.
