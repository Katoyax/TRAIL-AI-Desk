# TRAIL AI Desk

TRAIL AI Desk is a student-facing institutional information assistant for USTP Cagayan de Oro Campus. The historically inspected implementation uses an Expo v57, React Native, Expo Router, and TypeScript frontend with a native Node.js HTTP backend, MongoDB-oriented application and persistence services, and optional Gemini/RAG capabilities.

The approved target incrementally introduces Express while preserving useful Node.js services, establishes reliable database-backed operation, and restricts student-facing retrieval to approved institutional knowledge. Live MongoDB connectivity, production authentication, Gemini operation, and durable persistence have not yet been verified in the current development cycle.

TRAIL answers general university information; it does not connect to personal grades, schedules, student records, or account systems. Confidential student records must remain outside public retrieval and external AI prompts.

The existing login, dashboard, chat, information categories, and demo support-ticket screens are preserved as historical implementation context. The linked [development-status report](docs/TRAIL-DEVELOPMENT-STATUS.md) and [audit and implementation report](docs/TRAIL-IMPLEMENTATION-REPORT.md) are historical evidence and setup guidance, not verification of current production readiness.

## Current project status

- **Phase 00:** Closed — **READY WITH DOCUMENTED LIMITATIONS**.
- **Phase 01A:** Backend and MongoDB infrastructure investigation is ongoing. P01A-01 through P01A-04 are retained as completed read-only discovery checkpoints; Phase 01A is not complete.
- **MongoDB evidence:** The original Atlas connection attempt failed, and a sanitized diagnostic reported `ECONNREFUSED`. The root cause was not conclusively established. Application database connection, authentication, reads/writes, and durable persistence remain unverified.
- **Owner-reported intended configuration:** The controlled nonsecret host, database, username, and environment-key register is maintained in [DATABASE.md](DATABASE.md). Those identifiers are configuration direction, not evidence of a successful connection. Never document the password or a completed connection URI.

The detailed lifecycle and evidence register is maintained in [PROJECT_PLAN.md](PROJECT_PLAN.md) and [DATABASE.md](DATABASE.md). No phase advances automatically from documentation updates.

## Documentation responsibility and index

This README is the central project overview, onboarding/setup guide, documentation map, and concise verified-status entry point. Consult it before local setup or when locating the authoritative reference for a task. Update it when approved setup, top-level architecture, project status, or the documentation inventory changes. Runtime claims require inspected or executed evidence; recovered plans and historical reports remain labeled. Codex may prepare authorized updates, and the project owner approves scope and phase changes. This file is accurate when its setup caveats, project-status summary, and links agree with the domain documents below.

| Document | Authoritative responsibility |
|---|---|
| [AGENTS.md](AGENTS.md) | Codex development rules, authorization boundaries, and documentation routing |
| [README.md](README.md) | Project overview, setup guide, status summary, and documentation index |
| [PROJECT_PLAN.md](PROJECT_PLAN.md) | Phases, milestones, dependencies, priorities, and roadmap |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Implementation architecture, inspected evidence, and outstanding engineering work |
| [APP_FLOW.md](APP_FLOW.md) | User journeys, navigation, role workflows, and behavioral expectations |
| [DATABASE.md](DATABASE.md) | MongoDB configuration evidence, schemas, persistence, indexes, and operations |
| [API.md](API.md) | Backend contracts, validation, authentication, authorization, and errors |
| [RAG_KNOWLEDGE_BASE.md](RAG_KNOWLEDGE_BASE.md) | Knowledge ingestion, review, versioning, retrieval, citations, and RAG governance |
| [SECURITY_PRIVACY.md](SECURITY_PRIVACY.md) | Security controls, privacy, credentials, permissions, retention, and threats |
| [TESTING.md](TESTING.md) | Test strategy, executed evidence, regression status, and quality gates |
| [BUGS.md](BUGS.md) | Confirmed defects, investigations, causes, corrections, and verification |
| [DESIGN.md](DESIGN.md) | UI/UX principles, design system, screens, accessibility, and interactions |
| [REQUIREMENTS_TRACEABILITY.md](REQUIREMENTS_TRACEABILITY.md) | October 2026 SRS mapping to decisions, implementation evidence, and tests |
| [DECISIONS.md](DECISIONS.md) | Approved architectural, technical, governance, and project decisions |
| [CHANGE_REQUESTS.md](CHANGE_REQUESTS.md) | Proposed scope changes, impact analysis, approval, and implementation tracking |

## Run locally

The following setup procedures are preserved from the existing project documentation. They were not executed or verified during this documentation-recovery and modernization batch.

Use Node.js 24 LTS (Node >=22.13 is required). PowerShell users can use `npm.cmd` and `npx.cmd` if script execution policies block the `.ps1` launchers.

```powershell
npm.cmd install
Copy-Item .env.example .env
npm.cmd --prefix server install
Copy-Item server/.env.example server/.env
```

Set `MONGODB_URI` and `MONGODB_DATABASE` in `server/.env` using privately managed values. Use the current intended database identifier recorded in [DATABASE.md](DATABASE.md), which is the authoritative nonsecret configuration and evidence register. A configured URI does not prove a working connection or durable persistence. No accounts, university records, or credentials are fabricated. Historically documented behavior gives an empty database only the existing clearly labeled demo entries in the legacy collection and keeps newly ingested material pending until Admin review; that Admin-only description is a historical deviation and does not establish the approved independent-review workflow.

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

The approved application model has exactly three distinct roles:

1. **Student** — uses student-facing institutional information features.
2. **Admin** — performs authorized administration and may submit institutional sources.
3. **Knowledge-Base Manager** — independently reviews exact submitted source versions as a separate backend-enforced RBAC role, not merely an Admin permission.

The existing provisioning instructions below document Student and Admin accounts only. They do not prove that Knowledge-Base Manager provisioning or authorization is implemented, and no unverified provisioning argument is supplied here.

The demo account remains `student@ustp.edu.ph` / `student123`. Choose **Demo Profile** explicitly when the real API is configured. Demo sessions have no server token, no admin privileges and no password reset.

Provision a real account from a trusted terminal in `server/`:

```powershell
npm.cmd run provision -- --email <registered-email> --name <display-name> --role admin
```

Substitute your real values; use `student` for ordinary accounts. The command reads a 12–128 character password privately from the terminal. Do not put a password in command arguments. There is no public role-setting registration endpoint or default administrator.

For email reset, configure all of `RESEND_API_KEY`, `RESET_EMAIL_FROM` (a sender verified by your provider), and `RESET_PASSWORD_URL` (your hosted `/reset-password` screen). No email is sent without configuration. HTTPS reset URLs are supported; localhost HTTP is permitted for development. Account existence is never disclosed. Provider acceptance is not a guarantee of inbox delivery.

Sessions are kept in frontend memory and expire after 12 hours by default. Reloading the app requires a fresh sign-in. Password resets last 15 minutes, can be used once, and revoke earlier sessions.

## Source management and approved governance

The historically documented interface instructs an authorized Admin to open **Manage knowledge sources** from the dashboard. The resulting page is titled **Knowledge management**.

1. Add an approved official URL, PDF/text upload (up to 5 MiB), or general information supplied by an office.
2. Review the extracted text, source title, issuing office, document number and dates.
3. Explicitly verify the displayed version and metadata. Pending, outdated and archived material is excluded from student retrieval. Editing provenance requires review again.
4. Check source freshness, manually refresh official URLs, or archive a source. Uploaded documents have metadata citations and verified attachment downloads; no public URL is invented.

This is historical implementation documentation, not proof that the complete approved workflow is implemented. The required target workflow is:

1. The issuing university office officially approves and publishes the information.
2. An authorized Admin or Knowledge-Base Manager submits the source.
3. The system records the source metadata, issuing office, and official supporting provenance.
4. A Knowledge-Base Manager independently reviews the exact submitted version.
5. Only an approved and otherwise eligible version becomes available to student-facing retrieval.

The submitter must not approve their own submission. Manual entries require both the issuing office and an independent official supporting reference. Only general public campus information belongs in this knowledge base; do not upload student records or private office documents. Human approval is not implied by database presence, successful HTTP fetching, extraction, or embedding.

## Retrieval and Gemini

Historically documented configuration uses `GEMINI_API_KEY` on the server for generation and document/query embeddings, with configurable model names and dimensions. Provider availability and model-access statements were not revalidated in this local-only documentation batch. No key belongs in the client or in documentation.

Provider and model statements are retained as historical configuration information, not current provider verification.

Retrieval combines keyword ranking with vector similarity and reciprocal rank fusion, then sends at most four relevant chunks to Gemini. Only the latest reviewed active versions qualify. Without Gemini credentials, verified keyword retrieval and extractive cited answers still work. MongoDB failures preserve the existing visibly labeled read-only demo fallback; writes and real authentication fail explicitly.

The historical setup instructed operators to configure Gemini **before ingestion** to create vectors. Sources ingested without embeddings remain usable lexically; re-ingest them after enabling Gemini if semantic retrieval is needed. Changing embedding model/dimensions requires reindexing/re-ingestion and a matching Atlas index. Unchanged refreshes do not regenerate embeddings.

Pending or unapproved institutional source content must not be transmitted to external AI-generation or embedding providers. External processing is eligible only after the applicable approval gate; existing code enforcement of this restriction has not been verified. Institutional citations must substantively support the factual claims they accompany—a citation identifier, document title, or valid URL alone does not establish factual grounding.

For Atlas, create a **Vector Search** index on `knowledge_chunks` with [this definition](docs/atlas-vector-index.json), then put its name in `MONGODB_VECTOR_INDEX`. Match `numDimensions` to `GEMINI_EMBEDDING_DIMENSIONS`. The application does not create this managed index automatically. Without Atlas configuration, a bounded local cosine comparison works for the prototype; it is not a large-scale vector index.

The previous optional OpenAI adapter is retained for existing configurations. Gemini takes precedence when configured. No additional AI database or orchestration framework was introduced.

## Source refresh and announcements

The historically inspected backend was documented to poll due approved official URLs. `SOURCE_REFRESH_INTERVAL_HOURS=24` controls the per-source interval; `SOURCE_REFRESH_POLL_MS=60000` controls polling. `SOURCE_REFRESH_ENABLED=false` stops automatic refresh. Current runtime operation has not been verified by this documentation batch.

The historically documented flow is: Fetch → extract plain text → SHA-256 compare → update a genuine check timestamp if unchanged → prepare new chunks/vectors if changed → atomically activate a new version → archive the old version. Failed checks retain previous verified content and record the failure. There is no TTL deletion of knowledge.

Automatic activation under inherited approval is a historical implementation deviation, not the approved target. The required changed-source workflow is:

1. Detect the source change.
2. Create or stage the changed version.
3. Mark that exact version as pending review.
4. Preserve its provenance and metadata.
5. Block pending-content retrieval and transmission to external AI or embedding providers.
6. Require independent Knowledge-Base Manager approval of the exact changed version.
7. Permit eligible downstream processing and retrieval only after approval.

Previously approved content may remain available during review only while it remains valid and has not been withdrawn or superseded. This target workflow is not claimed as currently implemented.

The allowlist defaults to `ustp.edu.ph` and its subdomains. HTTPS, public DNS addresses pinned to the connection, validated redirects, response byte limits and deadlines protect URL ingestion against SSRF. There is no whole-site crawl: only explicitly added URLs are checked, and linked PDFs/pages must be added individually.

For time-sensitive questions, TRAIL requires fresh date-relevant evidence. Otherwise it explains that no confirming announcement was found in its monitored evidence, shows actual recorded checks where available, and states the coverage limit. With no successful check, it says so. This never establishes whether classes or an event will proceed. Dates and timestamps use `Asia/Manila`.

For memoranda, the approved requirement includes retrieval for a user-selected period, including the current week, using approved date-relevant evidence. The historically documented freshness behavior does not establish complete implementation of FR-018 or FR-019. A lack of approved information in the knowledge base means only that the available evidence did not confirm the matter; it is not a definitive claim that no university announcement exists.

## Student concerns

The existing support-ticket screen is a local demonstration preview, not a production concern service, and durable backend persistence has not been verified. The approved target requires validated submission, private durable storage, access control, duplicate-handling safeguards, defined retention, and truthful confirmation. Concern records must not enter public institutional retrieval, and the application must not claim that an office officially received or resolved a concern without an authorized institutional workflow.

## Validation

The commands below are preserved from the existing project documentation and were not run during this documentation-recovery and modernization batch. Executed results belong in [TESTING.md](TESTING.md).

```powershell
npm.cmd run test:backend
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run export:web
npx.cmd expo export --platform android --output-dir dist/trail-android
```

Historical reports state that tests included the original cases plus reviewed sources, follow-ups, refusals, document ingestion, URL safeguards, refresh/version handling, provider/DB failures, password reset, and Admin authorization. They also reported a 75/75 passing result; that is not a current test result. Test fixtures were described as synthetic and as never seeding the app database.

No application tests were executed during this documentation batch, so current pass/fail status remains unverified. The historical P00-E3D record also reported no newly executed tests. Live MongoDB Atlas queries, Gemini responses, email delivery, physical-device workflows, and deployment readiness require separately authorized verification using configured services and an appropriate smoke test.

## Security and production readiness

Future evidence and hardening remain necessary for backend role authorization, knowledge-base approval controls, external-provider privacy, private student concerns, durable background jobs, shared rate limiting, parser isolation, monitoring, backup and recovery, and production deployment. These are verification and production-readiness areas, not proof that every item is currently defective.
