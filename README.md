# Mini Document Tracker

A full-stack **PERN** (PostgreSQL · Express · React · Node.js) application for tracking documents through a simple status workflow. Users can create, view, edit, and delete documents, each with a title, author, description, and lifecycle status.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Database | PostgreSQL (UUID keys, native `ENUM`, `updated_at` trigger) |
| Backend | Node.js + Express (CommonJS) |
| DB driver | `pg` (connection pool, parameterized queries) |
| Validation | Zod |
| Frontend | React (Vite, JavaScript) |
| HTTP client | axios |
| Styling | Plain CSS |
| Linting | ESLint (Vite React config) |

---

## Architecture

```
┌──────────────────────────┐        HTTP/JSON        ┌──────────────────────────┐        SQL         ┌──────────────┐
│  React (Vite) @ :5173     │  ───────────────────▶   │  Express API @ :3000     │  ──────────────▶   │  PostgreSQL  │
│                          │                          │                          │                    │ mini_        │
│  DocumentDashboard        │  ◀───────────────────   │  /api/documents CRUD     │  ◀──────────────   │ doctracker   │
│   ├─ DocumentForm         │                          │  Zod validation          │                    │  documents   │
│   ├─ DocumentList         │                          │  global error handler    │                    │  table       │
│   │   └─ DocumentItem     │                          │  pg connection pool      │                    │              │
│   ├─ useDocuments (hook)  │                          │                          │                    │              │
│   └─ api.js (axios)       │                          │                          │                    │              │
└──────────────────────────┘                          └──────────────────────────┘                    └──────────────┘
```

CORS on the backend is restricted to the frontend origin (`http://localhost:5173`) via an environment variable.

---

## Project structure

```
mini-doctracker/
├── .env                      # real DB credentials (git-ignored)
├── .env.example              # committed template
├── .gitignore                # ignores node_modules/ and .env
├── package.json              # backend dependencies + scripts
├── schema.sql                # idempotent DB schema (extension, enum, table, trigger)
├── pern_tracker_plan_v2.md   # design plan / decisions record
├── README.md
│
├── src/                      # ── BACKEND ──
│   ├── index.js              # app entry: middleware wiring + server start
│   ├── db.js                 # pg connection pool (from env vars)
│   ├── documents.schema.js   # Zod schemas: create / update / id param
│   ├── documents.routes.js   # the 5 CRUD routes
│   └── errorHandler.js       # global error middleware (ZodError → 400, else 500)
│
└── client/                   # ── FRONTEND (Vite + React) ──
    ├── index.html
    ├── vite.config.js
    ├── eslint.config.js
    └── src/
        ├── main.jsx          # React entry (renders <App />, imports index.css)
        ├── App.jsx           # renders <DocumentDashboard />
        ├── index.css         # application styles
        ├── api.js            # axios instance + document API calls
        ├── hooks/
        │   └── useDocuments.js   # data hook: list, loading, error + CRUD (refetch on mutate)
        └── components/
            ├── DocumentDashboard.jsx  # wires hook → form + list
            ├── DocumentForm.jsx       # reusable create/edit form
            ├── DocumentList.jsx       # table of documents
            └── DocumentItem.jsx       # single row + Edit/Delete
```

---

## Database schema

Defined in [`schema.sql`](schema.sql). The whole file is **idempotent** (safe to re-run).

**`documents` table**

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `UUID` | Primary key, `DEFAULT gen_random_uuid()` (needs `pgcrypto`) |
| `title` | `TEXT` | `NOT NULL` |
| `description` | `TEXT` | nullable |
| `status` | `document_status` | `ENUM('Draft','In Review','Approved','Archived')`, default `'Draft'` |
| `author` | `TEXT` | `NOT NULL` |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT now()`, auto-bumped by trigger |

**Trigger** — `set_updated_at()` runs `BEFORE UPDATE` on every row and sets `updated_at = now()`, so the timestamp is always accurate without the application having to manage it.

---

## API reference

Base URL: `http://localhost:3000/api`

| Method | Endpoint | Success | Description |
| --- | --- | --- | --- |
| `POST` | `/documents` | `201` | Create a document |
| `GET` | `/documents` | `200` | List all documents (newest first, `LIMIT 200`) |
| `GET` | `/documents/:id` | `200` | Get one document |
| `PUT` | `/documents/:id` | `200` | Update a document (partial) |
| `DELETE` | `/documents/:id` | `204` | Delete a document |
| `GET` | `/health` | `200` | Health check (`{"status":"ok"}`) |

**Error semantics**

| Status | When |
| --- | --- |
| `400` | Validation failure — empty `title`/`author`, invalid `status`, or malformed UUID |
| `404` | Valid UUID but no matching row |
| `500` | Unexpected server/database error |

Validation errors return a structured body, e.g.:
```json
{ "error": "Validation failed", "details": [ { "field": "title", "message": "title is required" } ] }
```

A malformed id (`400`) is deliberately distinguished from a valid-but-missing id (`404`).

---

## Setup & running locally

**Prerequisites:** Node.js, PostgreSQL.

**1. Database**
```bash
createdb -U postgres mini_doctracker
psql -U postgres -d mini_doctracker -f schema.sql
```

**2. Backend**
```bash
npm install
copy .env.example .env      # then edit .env and set PGPASSWORD
npm run dev                 # http://localhost:3000
```

**3. Frontend**
```bash
cd client
npm install
npm run dev                 # http://localhost:5173
```

Open **http://localhost:5173** with both servers running.

**Environment variables** (`.env`)

| Var | Example | Purpose |
| --- | --- | --- |
| `PGHOST` | `localhost` | Postgres host |
| `PGPORT` | `5432` | Postgres port |
| `PGUSER` | `postgres` | Postgres user |
| `PGPASSWORD` | *(your password)* | Postgres password |
| `PGDATABASE` | `mini_doctracker` | Database name |
| `PORT` | `3000` | API server port |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed frontend origin |

---

## Key design decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Primary key | UUID (`gen_random_uuid()`) | Non-guessable IDs; no sequential enumeration |
| Status field | Postgres `ENUM` | Invalid values impossible at the DB level |
| `updated_at` | `BEFORE UPDATE` trigger | Timestamp always correct without app logic |
| Validation | Zod | Single source of truth for request shape + messages |
| Backend modules | CommonJS | Lowest friction with Node/Express tutorials |
| Frontend data | `useState` / `useEffect` hook | Simple manual fetch + refetch-on-mutation (no React Query) |
| Styling | Plain CSS | Avoids build-tool/config overhead for a small app |
| Security | Parameterized queries; dynamic UPDATE uses whitelisted (Zod-known) columns only | Prevents SQL injection |

---

## Testing performed

Manual verification of the full CRUD lifecycle via `curl` and the browser UI:

- ✅ Create → `201` with generated UUID and `status: "Draft"`
- ✅ Read all / read one
- ✅ Update → `updated_at` advances past `created_at` (trigger confirmed)
- ✅ Delete → `204`, then list returns `[]`
- ✅ `400` on empty title, `400` on malformed UUID, `404` on missing row
- ✅ End-to-end CRUD confirmed in the React UI

---

## Known gaps & possible next steps

- **Automated tests** — not yet implemented. Planned: Supertest + Jest/Vitest integration tests against a dedicated test database, covering the CRUD happy path and the `400`/`404`/`updated_at` edge cases.
- **SOLID / layering** — route handlers currently combine HTTP, validation, and SQL. A `routes → service → repository` split with the DB pool injected (rather than imported) would satisfy SRP and DIP and make routes testable without a live database.
- **Auth** — no authentication/authorization (out of scope).
- **Pagination** — list is capped at 200 rows; no real pagination yet.
- **Cleanup** — leftover Vite demo assets (`client/src/assets/hero.png`, unused `client/src/App.css`, `public/*.svg`) can be removed.

---

## Status

Phases 1–3 of the implementation plan are complete and the application is fully functional end to end. Phase 4 (automated tests) remains optional/outstanding.
