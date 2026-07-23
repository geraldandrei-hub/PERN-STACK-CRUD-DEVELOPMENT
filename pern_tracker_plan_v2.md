# PERN Stack Mini Document Tracker — Implementation Plan (v2)

> Revision of the original plan. Four cross-cutting decisions are now locked in
> (see below), and the gaps found during review are folded into each phase.

## Decisions locked in
| Decision | Choice | Why |
| --- | --- | --- |
| Primary key | **UUID** (`gen_random_uuid()`) | Non-guessable URLs and the option to generate IDs client-side; no sequential enumeration of records. |
| `status` values | Postgres **`ENUM`** type (`document_status`) | Strong typing at the DB and driver level; invalid values are impossible, not just constrained. |
| `updated_at` | `BEFORE UPDATE` trigger | Guarantees the column is fresh on every UPDATE; avoids the classic "forgot to set it" bug. |
| Validation | **Zod** | Schemas can be shared between a TS backend and frontend; single source of truth for shape + messages. |
| Testing | **Automated (in scope)** | Supertest integration tests over the API give regression safety beyond manual Postman checks. |

Out of scope for this build (named explicitly so they aren't silently missed):
authentication/authorization, pagination beyond a simple cap, and multi-user
concurrency handling.

---

## Phase 1: Database Architecture (PostgreSQL)
- **Schema source of truth:** a checked-in `schema.sql` (or node-pg-migrate if you
  prefer versioned migrations). No hand-run ad-hoc scripts.
- **Prereqs:** ensure `pgcrypto` (or Postgres 13+ built-in `gen_random_uuid()`) is
  available: `CREATE EXTENSION IF NOT EXISTS pgcrypto;`
- **Status type:**
  `CREATE TYPE document_status AS ENUM ('Draft','In Review','Approved','Archived');`
- **`documents` table:**
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `title`: `TEXT NOT NULL`
  - `description`: `TEXT`
  - `status`: `document_status NOT NULL DEFAULT 'Draft'`
  - `author`: `TEXT NOT NULL`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
  - `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
- **Auto-update trigger:** a `set_updated_at()` function + `BEFORE UPDATE` trigger
  that stamps `updated_at = now()` on every row update.
- **Note on ENUM:** adding a new status later requires `ALTER TYPE document_status
  ADD VALUE ...` (can't run inside a transaction block in older versions) — plan a
  migration for it rather than editing in place.
- **Action items:** install PostgreSQL, create the local DB, write `schema.sql`
  (extension + enum + table + trigger), commit a `.env.example` (never the real `.env`).

## Phase 2: Backend Logistics (Node.js & Express)
- **Project setup:** initialize Node, install `express`, `pg`, `cors`, `dotenv`,
  and `zod`.
- **Database connection:** a single `pg` connection pool configured from env vars.
  All queries are **parameterized** (`$1, $2, …`) — never string-interpolated.
- **API routes:**
  - **Create** — `POST /api/documents` → 201 with the new record
  - **Read all** — `GET /api/documents` → 200 (apply a sane `LIMIT`, e.g. 200)
  - **Read one** — `GET /api/documents/:id` → 200, or **404** if not found
  - **Update** — `PUT /api/documents/:id` → 200, or **404** if not found
  - **Delete** — `DELETE /api/documents/:id` → 204, or **404** if not found
- **Validation:** Zod schemas validate the body before any DB call; reject empty
  `title`/`author` and invalid `status` with **400** + field-level messages.
  Also validate that `:id` is a well-formed UUID → **400** for a malformed id
  (distinct from **404** for a valid-but-missing id).
- **404 handling:** every `/:id` route checks rowCount and returns 404 explicitly
  rather than a 500 or an empty 200.
- **Error handling:** global error-handling middleware maps DB/unknown failures to
  clean 400/500 responses instead of crashing the process.
- **CORS:** restrict `origin` to the frontend URL (not `*`) via an env var.

## Phase 3: Frontend UI Structure (React)
- **Project setup:** Vite (not CRA — CRA is effectively deprecated). Add Tailwind
  or a component library for quick styling.
- **Data layer:** plain **`useState` + `useEffect`** with a custom `useDocuments`
  hook that owns the list, `loading`, and `error` state and exposes
  `refetch()`/`create`/`update`/`remove`. Centralizing this in one hook keeps the
  manual wiring in a single place and out of the components.
- **Components:**
  - **`App`** — layout + holds the `useDocuments` hook; passes data/handlers down.
  - **`DocumentDashboard`** — main view; renders loading/error/list states.
  - **`DocumentForm`** — reusable create/edit form (local `useState` for inputs).
  - **`DocumentList`** — table/grid of documents.
  - **`DocumentItem`** — row/card with Edit + Delete actions.
- **Refetch discipline:** after any successful mutation, call the hook's `refetch()`
  (or optimistically update local state) so the list stays in sync — the manual
  equivalent of cache invalidation.

## Phase 4: Integration & Testing
- **API service layer:** a dedicated `api.js`/`api.ts` (Axios or Fetch) centralizing
  all HTTP calls; components never call HTTP directly. The `useDocuments` hook calls
  into this layer, never `fetch` inline.
- **State:** `useState`/`useEffect` via `useDocuments` for the list + loading/error;
  local `useState` for form inputs.
- **Automated tests (in scope):**
  - **API integration tests with Supertest + Jest/Vitest**, run against a dedicated
    **test database** (migrated from `schema.sql`, truncated between tests).
  - Cover the full CRUD happy path plus the edge cases: **400** on empty
    `title`/`author`, **400** on invalid `status`, **400** on malformed UUID,
    **404** on valid-but-missing id, and that `updated_at` advances after an update.
  - Wire these into an `npm test` script (and CI later if desired).
- **Manual testing workflow:**
  1. **Backend first** — smoke-test endpoints in Postman/Insomnia alongside the
     automated suite.
  2. **Frontend second** — verify the UI renders with mock data.
  3. **End-to-end** — connect frontend to backend and run the full CRUD lifecycle in
     the browser.
