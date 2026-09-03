# Decision: InsForge setup workaround

**Date:** 2026-09-03
**Status:** LOCKED — workaround applied

## What worked

- User is signed in to InsForge as `8bitid.dev@gmail.com` (org: Personal Org, id: b3dc0d01-e499-4dcc-8b16-dcfef92c39d6).
- Project `ajar-backend` is active, appKey `6z35ubb2`, region `ap-southeast`.
- Host URL: `https://6z35ubb2.ap-southeast.insforge.app`.
- ANON_KEY provided: `ik_5171ce9de6f1e14daf1c8bff7429618e`.

## What did NOT work

- `npx @insforge/cli link --project-id 6z35ubb2` crashes on Windows 11, Node 24.19.0:
  ```
  Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c, line 94
  ```
  Bug reported to InsForge: id `5ba5f35c-c9bb-4bac-9638-d782956e623c` (blocker severity).
- `npx @insforge/cli link` (no args) installs agent skills but does not link a project.
- `npx @insforge/cli db query` / `metadata` / `secrets get` all fail with "Invalid token" because the CLI requires an admin API key (not the same as ANON_KEY) and we did not get one.
- `create` is blocked because the free plan already has 2 active projects (ajar-backend + smart-tka-staging).

## Workaround applied

- Wrote `.insforge/project.json` manually with the project metadata so the CLI knows the current project.
- Wrote `.env` with `VITE_INSFORGE_URL` and `VITE_INSFORGE_ANON_KEY` so the frontend can talk to InsForge.
- The frontend `@insforge/sdk` (which uses ANON_KEY, not admin key) will work normally.
- Migrations will be applied via direct SQL over PostgREST, **not** via the broken CLI link workflow.

## How to apply migrations (in plan)

Write each migration as a `BEGIN; ... COMMIT;` block in a file, then send it to the PostgREST `/rest/v1/rpc/<fn>` endpoint — or, since we are admin-via-anon, use the InsForge REST endpoint for table creation. ANON_KEY cannot create tables (RLS / privilege), so migrations require an admin key.

**Without an admin key, table creation via REST is not possible.** Options:
1. Ask user to provide admin key from dashboard.
2. Use the InsForge web dashboard SQL editor (if available) to run migrations manually.
3. Defer migrations; run the app against a stub data layer for now.

**Plan: ask the user for the admin API key from the InsForge dashboard.** If unavailable, fall back to option 2 (manual SQL via web UI) or option 3 (defer migrations; build UI against a stub that returns mock data).
