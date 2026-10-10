# TRAIL AI Desk

Expo v57 / React Native / Expo Router frontend with a Node.js API, MongoDB knowledge management, and Gemini-backed retrieval. TRAIL answers general university information; it does not connect to personal grades, schedules, student records or account systems.

The existing login, dashboard, chat, information categories and demo support-ticket screens are preserved. See [the current end-to-end status and prioritized checklist](docs/TRAIL-DEVELOPMENT-STATUS.md) for verified readiness and exact setup responsibilities, and [the audit and implementation report](docs/TRAIL-IMPLEMENTATION-REPORT.md) for the previous implementation work.

## Run locally

Use Node.js 24 LTS (Node >=22.13 is required). PowerShell users can use `npm.cmd` and `npx.cmd` if script execution policies block the `.ps1` launchers.

```powershell
npm.cmd install
Copy-Item .env.example .env
npm.cmd --prefix server install
Copy-Item server/.env.example server/.env
```

Set `MONGODB_URI` in `server/.env` to your actual database connection. No accounts, university records or credentials are fabricated. An empty database receives only the existing clearly labeled demo entries in the legacy collection. Newly ingested material remains pending until an admin reviews it.

```powershell
cd server
npm.cmd start
```

In another terminal at the project root:

```powershell
npm.cmd start
```

Set `EXPO_PUBLIC_TRAIL_API_URL` to the API host reachable by your device. Physical devices usually need the computer's LAN address; `localhost` refers to the device itself. Add the actual web frontend origin to `CORS_ORIGINS`. Restart Expo after changing public environment variables. Use HTTPS for hosted authentication and API traffic.

## Accounts and password reset

The demo account remains `student@ustp.edu.ph` / `student123`. Choose **Demo Profile** explicitly when the real API is configured. Demo sessions have no server token, no admin privileges and no password reset.

Provision a real account from a trusted terminal in `server/`:

```powershell
npm.cmd run provision -- --email <registered-email> --name <display-name> --role admin
```

Substitute your real values; use `student` for ordinary accounts. The command reads a 12–128 character password privately from the terminal. Do not put a password in command arguments. There is no public role-setting registration endpoint or default administrator.

For email reset, configure all of `RESEND_API_KEY`, `RESET_EMAIL_FROM` (a sender verified by your provider), and `RESET_PASSWORD_URL` (your hosted `/reset-password` screen). No email is sent without configuration. HTTPS reset URLs are supported; localhost HTTP is permitted for development. Account existence is never disclosed. Provider acceptance is not a guarantee of inbox delivery.

Sessions are kept in frontend memory and expire after 12 hours by default. Reloading the app requires a fresh sign-in. Password resets last 15 minutes, can be used once, and revoke earlier sessions.

## Verified source management

Sign in as an authorized admin and open **Manage knowledge sources** from the dashboard. The resulting page is titled **Knowledge management**.

1. Add an approved official URL, PDF/text upload (up to 5 MiB), or general information supplied by an office.
2. Review the extracted text, source title, issuing office, document number and dates.
3. Explicitly verify the displayed version and metadata. Pending, outdated and archived material is excluded from student retrieval. Editing provenance requires review again.
4. Check source freshness, manually refresh official URLs, or archive a source. Uploaded documents have metadata citations and verified attachment downloads; no public URL is invented.

Only general public campus information belongs in this knowledge base. Do not upload student records or private office documents. Verification is an authorized human review, not proof inferred from database presence or successful HTTP fetching.

## Retrieval and Gemini

Configure `GEMINI_API_KEY` on the server to enable generation and document/query embeddings. Defaults: `gemini-3.5-flash-lite`, `gemini-embedding-001`, 768 dimensions. Model names are configurable and must be available to your account. The generation default follows Google's [current guidance for new projects](https://ai.google.dev/gemini-api/docs/models); Gemini 2.5 access is restricted to existing users. No key is included in the client.

Retrieval combines keyword ranking with vector similarity and reciprocal rank fusion, then sends at most four relevant chunks to Gemini. Only the latest reviewed active versions qualify. Without Gemini credentials, verified keyword retrieval and extractive cited answers still work. MongoDB failures preserve the existing visibly labeled read-only demo fallback; writes and real authentication fail explicitly.

Configure Gemini **before ingestion** to create vectors. Sources ingested without embeddings remain usable lexically; re-ingest them after enabling Gemini if you need semantic retrieval. Changing embedding model/dimensions requires reindexing/re-ingestion and a matching Atlas index. Unchanged refreshes do not regenerate embeddings.

For Atlas, create a **Vector Search** index on `knowledge_chunks` with [this definition](docs/atlas-vector-index.json), then put its name in `MONGODB_VECTOR_INDEX`. Match `numDimensions` to `GEMINI_EMBEDDING_DIMENSIONS`. The application does not create this managed index automatically. Without Atlas configuration, a bounded local cosine comparison works for the prototype; it is not a large-scale vector index.

The previous optional OpenAI adapter is retained for existing configurations. Gemini takes precedence when configured. No additional AI database or orchestration framework was introduced.

## Source refresh and announcements

The running backend polls due approved official URLs. `SOURCE_REFRESH_INTERVAL_HOURS=24` controls the per-source interval; `SOURCE_REFRESH_POLL_MS=60000` controls polling. `SOURCE_REFRESH_ENABLED=false` stops automatic refresh.

Fetch → extract plain text → SHA-256 compare → update a genuine check timestamp if unchanged → prepare new chunks/vectors if changed → atomically activate a new version → archive the old version. Failed checks retain previous verified content and record the failure. There is no TTL deletion of knowledge.

The allowlist defaults to `ustp.edu.ph` and its subdomains. HTTPS, public DNS addresses pinned to the connection, validated redirects, response byte limits and deadlines protect URL ingestion against SSRF. There is no whole-site crawl: only explicitly added URLs are checked, and linked PDFs/pages must be added individually.

For time-sensitive questions, TRAIL requires fresh date-relevant evidence. Otherwise it explains that no confirming announcement was found in its monitored evidence, shows actual recorded checks where available, and states the coverage limit. With no successful check, it says so. This never establishes whether classes or an event will proceed. Dates and timestamps use `Asia/Manila`.

## Validation

```powershell
npm.cmd run test:backend
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run export:web
npx.cmd expo export --platform android --output-dir dist/trail-android
```

Tests include the original cases plus reviewed sources, follow-ups, refusals, document ingestion, URL safeguards, refresh/version handling, provider/DB failures, password reset and admin authorization. Test fixtures are synthetic and never seed the app database. Live MongoDB Atlas queries, Gemini responses, email delivery and physical device workflows require your configured services and a deployment smoke test.
