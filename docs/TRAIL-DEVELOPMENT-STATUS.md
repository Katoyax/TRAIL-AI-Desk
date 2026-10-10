# TRAIL DEVELOPMENT STATUS

Audit date: October 4, 2026, Asia/Manila. Scope: the existing TRAIL features, their configuration, and their path to a working end-to-end system. This is a current-state audit, not a new-feature plan.

The repository contains substantial functioning implementation, but **it is not currently connected to real MongoDB, Gemini, or email services**. No real USTP memo has been imported or evaluated during this audit. Passing synthetic integration tests establishes local behavior, not live service operation.

## Inspection and evidence

Before application edits, the audit covered every first-party frontend/backend source file, every existing test/helper, README, the full previous implementation report, both environment examples and package manifests, app/tooling configuration, asset references, source ingestion/refresh, and deployment-file inventory. Generated dependencies and bundles were treated as dependencies/artifacts, not first-party source. The exact [Expo v57 documentation](https://docs.expo.dev/versions/v57.0.0/) was read before code changes.

Neither local environment file existed at inspection time. Presence checks, without printing values, found no configured database, Gemini, Resend, reset URL, or frontend API environment variables. The audit prepared an ignored `server/.env` from the existing example; all secret fields remain blank. Root `.env` is still absent. Existing dependencies are installed.

The existing API was started successfully. Its actual `/health` response was:

```json
{"status":"ok","database":"demo-fallback","auth":"demo-only","ai":"extractive","email":"unconfigured"}
```

Runtime checks confirmed demo login and scope refusal work; real login and reset endpoints return 503 without MongoDB; an unauthenticated admin request returns 401. A health label such as `gemini-configured` would indicate configuration, not prove a successful provider call.

The initial suite passed 75/75 tests; strict TypeScript, Expo lint, and the fresh 11-route web export passed. Browser automation exercised the existing Forgot Password and reset forms and navigation. Final validation results and checkpoint counts are recorded below after the targeted repairs.

### Existing bugs repaired

1. Opening an exported web reset URL with a token produced a React hydration error. The reset screen now waits for matching initial hydration before choosing the token form. Browser checks cover the direct link, invalid link, password-length validation, Forgot Password navigation, and return navigation.
2. Accepted ISO timestamp effective ranges could reject an event on the correct Manila date. Effective bounds now use the same calendar-date convention as the question.
3. A question about an unknown office could retrieve the Registrar solely because both contained the generic word `office`. Lexical relevance now requires meaningful topic evidence in that case; existing valid questions, follow-ups, and semantic retrieval are preserved.

The existing implementation was reused. No additional feature, authentication system, reset flow, or default administrator was introduced. README button names were corrected to match the UI.

## A. COMPLETE AND WORKING

These findings are scoped to local execution and the explicitly described verification:

- The Expo frontend builds, type-checks and passes lint. The demo login, sample information/chat, and existing password-form navigation operate locally.
- The Node API starts, serves its existing routes, returns bounded errors, and rejects unauthorized admin requests.
- Password hashing, opaque hashed sessions, expiry, logout, roles, single-use reset tokens and session revocation pass automated service/HTTP tests with test-only stores.
- PDF/text extraction, metadata validation, review-bound visibility, chunking, version activation, attachment restrictions, and refresh failure retention pass existing automated integration tests. A real synthetic PDF is parsed by the installed parser.
- Verified lexical retrieval, cited extractive answers, follow-ups, personal-record refusal, freshness checks, Gemini response validation and hybrid retrieval logic pass local tests.

**No live MongoDB/Gemini/Resend/real-USTP workflow is included in this complete-and-working category.**

## B. IMPLEMENTED BUT REQUIRES CONFIGURATION

| Existing implementation | Missing configuration or live evidence |
| --- | --- |
| MongoDB driver, collections and indexes | An accessible database URI; successful live connection and persisted writes |
| Real authentication | MongoDB plus a provisioned real account; frontend API URL |
| Admin source management | Real admin account, reachable API, and actual reviewed source material |
| Gemini answers and document/query embeddings | Server key, available models and project quota; live provider requests |
| Resend reset email | Server sending key, permitted sender, reachable reset-screen URL; actual receipt |
| RAG over uploaded documents | MongoDB, an authentic public memo, ingestion and explicit source review |
| Official URL ingestion/refresh | Approved reachable HTTPS URLs, authorized review, and a running backend |
| Atlas managed Vector Search | Optional index and index name; not needed for the first memo |

## C. MOCKED / DEMO ONLY

- `student@ustp.edu.ph` / `student123` is a demo identity. It never receives a real backend bearer token or admin privileges.
- Bundled Certificate of Enrollment and Registrar information are clearly labeled demonstration placeholders, not verified university guidance.
- With no frontend API URL, the app uses local demo retrieval. A demo session continues to use demo data even after an API URL is configured.
- Support tickets generate a local reference only. They are neither sent nor stored.
- Test-only in-memory database, email and AI adapters simulate external services. They are not production fallbacks.
- Missing Gemini credentials use a real **extractive** fallback when verified documents exist; this is not a real generative AI response.

Email delivery in production code is **real but unconfigured**, not mocked. There is no fake successful production send.

## D. INCOMPLETE OR UNVERIFIED

- Actual database persistence/restart behavior, real account provisioning/sign-in, real Gemini calls, real reset email/inbox delivery, and first real memo Q&A have not been demonstrated.
- Physical-device sign-in, PDF picker, attachment opening and reset-link behavior have not been tested.
- No deployment manifest, CI workflow or deployed HTTPS application was found. Hosting, deployment settings and monitoring are unfinished.
- Source refresh is a process-local periodic worker for explicitly added URLs. It does not crawl the whole university website, social media, or links on monitored pages. No live USTP refresh was validated.
- Scanned-image PDF OCR and DOCX ingestion are absent. Start with a text-selectable PDF or UTF-8 text; these additional formats are outside the immediate existing-feature priority.
- Embeddings are created at ingestion. There is no automatic backfill/reindex tool for documents imported before a key is configured. Re-ingestion is the existing remedy.
- Production email jobs, refresh coordination, rate limits and query cache are process-local. Durable jobs, coordination and interrupted-stage reconciliation are unfinished.
- Large-corpus pagination/indexing, parser isolation, operational monitoring and backup/restore validation require further work before public deployment.
- Saved audits report 22 frontend advisories (19 high, 3 moderate) and zero backend advisories. These are saved results, not a new online audit. Compatible remediation and supported lint tooling remain maintenance work.

Ticket delivery, SSO, persistent client login, OCR, and a whole-site crawler are not being added by this audit.

## Forgot Password: exact verification

| Requested check | Current finding |
| --- | --- |
| Rendered on Login? | Yes: `Forgot password?` is always rendered; confirmed in Chrome. |
| Navigation works? | Yes: click opens `/forgot-password`; return and new-link navigation were exercised. |
| Forgot screen exists? | Yes: `src/app/forgot-password.tsx`; email form, loading/error/success states and offline explanation. |
| Reset screen exists? | Yes: `src/app/reset-password.tsx`; token-link form, password confirmation and missing-link state. Direct static-link hydration was repaired and browser-tested. |
| Backend endpoint exists? | Yes: POST `/api/auth/forgot-password` and POST `/api/auth/reset-password`. |
| Reset token works? | Secure random token, hashed storage, 15-minute default expiry, atomic single use, concurrent-use rejection and prior-session revocation pass automated tests. A live database token has not been exercised. |
| Email provider connected? | No. `RESEND_API_KEY`, `RESET_EMAIL_FROM` and `RESET_PASSWORD_URL` remain empty. |
| Real or mocked email? | The adapter makes real Resend REST requests. Test adapters are mocked. No real email has been delivered or claimed. |

Without MongoDB the endpoint first rejects account operations with 503. With MongoDB but missing email configuration it also reports reset unavailability. A generic request acknowledgement does not prove that an account exists or a message arrived.

## Admin: how it is created and accessed today

There is **no default admin** and no public registration endpoint that grants an admin role. The only current bootstrap path is the trusted provisioning CLI, backed by MongoDB.

**[CODEX CAN DO]** Once MongoDB is connected, run this existing command from `server/`, substituting the approved real email/name:

```powershell
npm.cmd run provision -- --email "YOUR_REAL_EMAIL" --name "Efren" --role admin
```

**[USER MUST DO]** Choose the real identity and privately enter a unique 12–128-character password at the command's hidden terminal prompt. Never place a password in command arguments, source code, or chat. This is password entry, not a request to edit implementation code.

**[CODEX CAN DO]** Configure the frontend/API connection and restart them. Sign in through the registered-account path. `Demo Profile` selects demo access; `Use my registered account` switches back if demo was selected. The actual admin dashboard button is **Manage knowledge sources**; its page is titled **Knowledge management**. The route is `/admin`. Real server role checks protect every admin read and mutation.

No usable real admin is configured in this workspace. An external database cannot be inspected until a connection is supplied. Student accounts can be provisioned using the same CLI with `--role student`.

## MongoDB: what needs manual setup

MongoDB is already implemented. **[USER MUST DO]** obtain owned database access and its credential; **[CODEX CAN DO]** configure/connect/test it. Atlas is one suitable route; an existing authorized MongoDB instance also works.

On successful application connection, the code creates ordinary indexes and uses `knowledge`, `knowledge_sources`, `knowledge_versions`, `knowledge_chunks`, `users` and `authSessions`. You do not need to manually create these collections, write schemas, or create ordinary indexes. Empty legacy knowledge gets only the labeled demo entries.

`MONGODB_URI` is the secret connection string. `MONGODB_DATABASE=trail_ai_desk` is a nonsecret database name. Atlas account login and the database user's password are different credentials.

Atlas Vector Search is optional for the first memo: local cosine plus keyword retrieval already exist. If desired later, **[CODEX CAN DO]** create the managed index with sufficient authorized privileges, using `docs/atlas-vector-index.json` on `knowledge_chunks`; set `MONGODB_VECTOR_INDEX` to its name. Its 768 dimensions must match `GEMINI_EMBEDDING_DIMENSIONS`, and its filters include `embeddingModel` and `versionId`.

## Gemini: what remains before real AI answers

**[USER MUST DO]** obtain an API key for an owned Google project and store it privately as `GEMINI_API_KEY` in `server/.env`.

**[CODEX CAN DO]** check model access/quota, run live generation and embedding smoke tests, handle provider failures, and verify that real stored chunks are retrieved. Keep the initial nonsecret defaults unless the live account requires an available alternative:

```dotenv
GEMINI_MODEL=gemini-3.5-flash-lite
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
GEMINI_EMBEDDING_DIMENSIONS=768
```

A key alone is insufficient: the API needs relevant verified MongoDB content. Unknown questions correctly skip generation rather than solicit unsupported answers. Configure Gemini **before the first ingestion** if you want vectors immediately. Existing documents imported without vectors must be re-ingested for semantic search; unchanged refresh does not backfill them.

After a real memo is reviewed, acceptance is a relevant, source-supported answer with `generation: "ai"`, the actual memo citation and a successful real embedding operation. A `/health` configuration label is insufficient evidence.

## First real USTP memo: exact path

1. **[USER MUST DO]** obtain owned MongoDB access; provide/approve the real admin identity and privately choose its password.
2. **[CODEX CAN DO]** connect the database, configure the frontend API URL, provision the account and verify real admin access.
3. **[USER MUST DO]** obtain Gemini access if this first run must produce generative answers. It is optional for a first real cited extractive answer.
4. **[CODEX CAN DO]** validate Gemini and embedding access before uploading, so stored chunks get vectors.
5. **[USER MUST DO]** identify the campus/relevant official memo and confirm that it is authentic, current and suitable for a general-public knowledge base. Supply an inaccessible/private file only if it is authorized for this use. Codex can fetch a public official URL itself.
6. **[CODEX CAN DO]** open **Manage knowledge sources**, choose **PDF/text upload**, select the text-selectable PDF or UTF-8 text file (maximum 5 MiB), enter its actual title/office/document number/dates/category, and save. The source is pending at this point.
7. **[USER MUST DO]** approve the extracted content and provenance as an authorized reviewer. Do not approve student records/private material or invent dates absent from the memo.
8. **[CODEX CAN DO]** apply that approval to the reviewed current version/revision with the existing verification action. Pending documents must remain absent from student retrieval until then.
9. **[CODEX CAN DO]** ask a question explicitly answered in the memo, compare the answer to the document, inspect its source metadata, and open its verified attachment. Also test an unanswered question and a personal-record refusal. Use the registered account rather than demo access.

Uploaded files have no invented public URL and are not automatically re-fetched. For live refresh, **[CODEX CAN DO]** instead add a supplied official HTTPS webpage/PDF URL, review it, then test manual and scheduled checks. Only configured `ustp.edu.ph` pages/subdomains are fetched by default; linked documents must be added individually. **[USER MUST DO]** authorize the exact source scope and relevant content, not manually implement ingestion.

## Prioritized remaining development checklist

| Priority | Owner | Remaining task / acceptance condition |
| --- | --- | --- |
| P0 | **[USER MUST DO]** | Obtain accessible MongoDB credentials and privately populate `MONGODB_URI`. See manual steps below. |
| P0 | **[CODEX CAN DO]** | Validate the URI without printing it; connect, create indexes automatically, prove persisted user/source/session writes and read them after restart. |
| P0 | **[CODEX CAN DO]** | Prepare root `.env`, set reachable `EXPO_PUBLIC_TRAIL_API_URL` and actual `CORS_ORIGINS`, run/restart API and Expo, verify real frontend-to-backend requests. |
| P0 | **[USER MUST DO]** | Approve real admin email/name and privately enter its password. |
| P0 | **[CODEX CAN DO]** | Run existing provisioning, test real login/logout/role enforcement and open admin UI. |
| P1 | **[USER MUST DO]** | Obtain Gemini project/key access; privately populate `GEMINI_API_KEY`. |
| P1 | **[CODEX CAN DO]** | Prove real generation/embeddings with account-supported models; fix any reproducible provider integration issue; optionally configure Atlas managed index. |
| P1 | **[USER MUST DO]** | Identify and authorize an authentic public USTP memo and official source scope; approve extracted content/provenance. |
| P1 | **[CODEX CAN DO]** | Fetch/download accessible official material, upload/index it, apply authorized verification, prove first real cited Q&A and attachment access. |
| P1 | **[CODEX CAN DO]** | Run source-specific known/unknown/follow-up/refusal/date checks and an official URL refresh; prove latest active version and genuine timestamps. |
| P2 | **[USER MUST DO]** | Obtain Resend access; privately populate its key and authorize a permitted sender. |
| P2 | **[CODEX CAN DO]** | Configure local reset URL/sender, run the real reset flow for the nominated account, validate invalid/expired/single-use tokens and old-session rejection. |
| P2 | **[USER MUST DO]** | Open the reset email in the owned inbox, use the private new-password form, and confirm receipt/link usability. |
| P2 | **[CODEX CAN DO]** | Configure device-reachable API/network settings, start Expo, investigate/fix reproduced mobile issues. |
| P2 | **[USER MUST DO]** | Interact with the physical phone: install/open the app, sign in, select a file, open sources and report observed results. |
| P3 | **[USER MUST DO]** | Choose/authorize hosting account, domain ownership and any billable resources for eventual publication. |
| P3 | **[CODEX CAN DO]** | Prepare hosting configuration/builds, secure environment wiring, HTTPS/CORS/routing, always-on source refresh and deployment smoke checks once the destination is available. |
| P3 | **[CODEX CAN DO]** | Validate backups/restores; add durable email/refresh work and coordination where required; reconcile interrupted indexing; isolate upload parsing; configure operational/usage monitoring. |
| P3 | **[CODEX CAN DO]** | Re-run dependency audit and remediate compatible frontend/tooling vulnerabilities; add CI and the missing live/browser/device regression coverage. Avoid forced incompatible framework downgrades. |

P0/P1 produce the first working real-data system. Production hardening follows that milestone. Support-ticket delivery, OCR, SSO, and new product features are outside this immediate checklist.

## What each percentage means

There is no objective total-project-completion percentage obtainable from source inspection alone. The percentages here are exact **audited checkpoint pass rates**, calculated as passed checkpoints / listed checkpoints. All checkpoints have equal weight. They are not estimates of remaining effort, code coverage, or evidence of production fitness. A checkpoint may be proven by a local build/test or implementation inspection as explicitly stated; a required live checkpoint remains unpassed until exercised with real services.

| Area | Rate | Passed checkpoints | Unpassed checkpoints |
| --- | --- | --- | --- |
| Frontend | **80% (4/5)** | Strict TypeScript; lint; 11-route web export; interactive browser password-form/navigation checks | Physical-device workflow |
| Backend | **75% (3/4)** | API startup/health; current HTTP demo/error/authorization smoke; automated HTTP route integrations | Configured database/provider end-to-end run |
| Authentication | **75% (3/4)** | Salted password/login logic; hashed session expiry/logout; server roles/reset revocation, all tested | Live provisioned account sign-in |
| Forgot Password | **80% (4/5)** | Login link/navigation; reset/request screens including direct-link hydration; endpoint/token lifecycle tests; Resend adapter tests | Real inbox-to-password-reset completion |
| MongoDB | **50% (2/4)** | Driver/index/failure handling implementation and tests; knowledge/auth persistence contracts/version tests | Real user/session/reset persistence; real knowledge/version persistence across restart |
| RAG | **75% (3/4)** | Relevance/follow-up/scope behavior; reviewed latest-version citations; fresh-date/absence safeguards, tested | Real USTP memo answer evaluation |
| Gemini | **50% (2/4)** | Generation request/response/citation/error tests; embedding batching/cache/dimension tests | Live Gemini generation; live document/query embeddings |
| Admin System | **75% (3/4)** | Trusted provisioning and server role tests; existing UI/API management wiring inspected/exported; revision-bound review/archive/version tests | Real admin UI workflow backed by MongoDB |
| Document Ingestion | **75% (3/4)** | Actual synthetic PDF/text extraction; bounded chunk/embedding preparation tests; pending/review/download lifecycle tests | First authentic USTP memo imported and queried |
| Live Source Refresh | **75% (3/4)** | Safe fetch/hash/unchanged/changed lifecycle tests; scheduler wiring/configuration inspected; retained content/failure/freshness tests | Real official URL manual/scheduled refresh |
| Testing | **54.5% (6/11)** | Automated suite; TypeScript; lint; web export; Android export; browser password navigation | Live Atlas; live Gemini; real reset/inbox; real USTP Q&A; physical device |
| Production Readiness | **20% (2/10)** | Basic API/auth/upload security controls; secret separation/ignored local configuration | Live services/official KB; deployed HTTPS/CORS; backup/restore; continuous refresh hosting; durable jobs/coordination; parser isolation; monitoring/quotas; dependency remediation |

These denominators define this audit's scope. For example, 80% Forgot Password means four local implementation/verification checkpoints passed and the real email checkpoint has not; it does not mean email delivery works.

## WHAT CODEX WILL HANDLE

The technical rows in the checklist: configuration files and nonsecret values; service startup; database connections/indexes/persistence checks; admin provisioning and permissions; real model/embedding calls; optional vector index; public-source retrieval and document uploads; verification after authorized approval; real-data Q&A; refresh checks; reset integration; device-network setup; reproducible fixes; deployment preparation and production maintenance.

The audit already handled inspection, local validation, the three bounded bug repairs, corrected README navigation names, and preparation of an ignored server configuration file. Manual implementation-code edits are not required from Efren.

## WHAT EFREN MUST DO

Only ownership, private secret/password entry, authoritative review and personal/device interactions belong here. No secret should be pasted into source code or chat. Server secrets go privately into the ignored `server/.env` (or the eventual host's secret/environment controls). Never give them an `EXPO_PUBLIC_` name.

### 1. [USER MUST DO] Obtain MongoDB access

1. Sign in to [MongoDB Atlas](https://cloud.mongodb.com/) and create/select a project, for example `TRAIL`.
2. Create a **Free/M0** cluster in an available nearby region, or select an existing authorized cluster.
3. Create a **database user**, separate from the Atlas website login. Use a generated password saved privately. Grant appropriate database access; Codex can help restrict application permissions after initial setup.
4. In **Security / Network Access**, add the computer's current public IP using **Add My Current IP Address**. The later backend host will need its own authorized outbound IP/range.
5. Select the cluster's **Connect → Drivers → Node.js** and copy the connection URI. Privately substitute the database user's password; percent-encode reserved characters when necessary.
6. Open the prepared `server/.env` in your IDE and privately put the URI after **`MONGODB_URI=`**. Keep **`MONGODB_DATABASE=trail_ai_desk`**. Save; do not post the URI in chat.

Codex can then run the connection/persistence checks. No manual collection or index creation is required. Official instructions: [free cluster](https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/), [database user](https://www.mongodb.com/docs/atlas/tutorial/create-mongodb-user-for-cluster/), [network access](https://www.mongodb.com/docs/atlas/security/ip-access-list/), [driver URI](https://www.mongodb.com/docs/atlas/driver-connection/).

### 2. [USER MUST DO] Obtain Gemini access

1. Sign in to [Google AI Studio API Keys](https://aistudio.google.com/app/apikey) using the intended Google account and accept its terms.
2. Select the intended project. New accounts may receive a default project/key; existing Cloud projects may require **Dashboard → Projects → Import projects**.
3. Choose **Create API key**. If access is denied, the project owner must grant the required permissions.
4. Copy the key privately into **`GEMINI_API_KEY`** in `server/.env` and save it. Codex handles model settings and live checks.
5. Check the project's actual AI Studio rate limits/billing access if calls are blocked. Do not enable paid usage without accepting its costs.

Use current AI Studio key creation: new keys are auth keys by default; unrestricted standard keys are rejected. The Philippines is supported; age/account verification may apply. Quota and model access must be checked for the actual project. [Official key instructions](https://ai.google.dev/gemini-api/docs/api-key), [models](https://ai.google.dev/gemini-api/docs/models), [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits), [available regions](https://ai.google.dev/gemini-api/docs/available-regions).

### 3. [USER MUST DO] Approve identity and official material

1. Choose the administrator's real email/name. For the simplest first email test, use the same owned email used to register Resend.
2. When provisioning is ready, privately enter the chosen password at the existing hidden prompt (12–128 characters). Codex handles the provisioning operation; no password is passed in command arguments.
3. Identify the relevant USTP campus and a current public memo or official HTTPS URL. Codex can locate/download accessible official pages; you must approve their relevance/authority. Provide inaccessible material as an authorized workspace file.
4. Check the source's actual issuing office, document number, title and dates, then review the extracted text. Confirm the material is public and appropriate for TRAIL. Approve that specific content/version; Codex can perform the existing upload/verification actions.
5. Provide the expected answer to one question explicitly answered by the memo so the real-data result can be checked against university intent.

### 4. [USER MUST DO] Obtain email access and confirm the inbox flow

1. Create/sign in to [Resend](https://resend.com/).
2. Open **API Keys → Create API Key**; give it a name and **Sending access**. Save the resulting key privately as **`RESEND_API_KEY`** in `server/.env`.
3. For a first personal test, authorize **`RESET_EMAIL_FROM=onboarding@resend.dev`**. Its recipient must be the email associated with your Resend account. A domain purchase is not needed for this restricted test.
4. For other recipients, add a domain/subdomain you actually control under **Domains → Add Domain**. Apply the exact SPF/DKIM records supplied by Resend through that domain's DNS controls (or authorize access to the responsible owner). Wait for verification; use an address on that domain as **`RESET_EMAIL_FROM`**. Do not assume ownership of `ustp.edu.ph`.
5. Codex can set **`RESET_PASSWORD_URL=http://localhost:8081/reset-password`** for a first laptop-only test. Open that email link on the laptop. Phone/remote links need an actual HTTPS frontend `/reset-password` URL; LAN HTTP reset URLs are rejected.
6. Use the configured registered account's reset request, open its email in your own inbox, choose the new password privately in the existing reset form, and confirm receipt/link usability. Codex checks successful login, old-session rejection and token reuse behavior.

Provider acceptance is not inbox proof. [API key creation](https://resend.com/docs/create-an-api-key), [test-sender restriction](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain), [domain verification](https://resend.com/docs/add-a-domain).

### 5. [USER MUST DO] Perform physical-device acceptance

1. Use a supported device: Expo v57 supports Android 7+ and iOS 16.4+.
2. Install the matching [Expo Go](https://expo.dev/go?device=true&platform=android&sdkVersion=57), or the development build Codex prepares if Expo Go cannot run the intended native configuration.
3. Join the computer's Wi-Fi and open Expo's QR link. Codex configures the LAN API address and starts the services; phone `localhost` means the phone itself.
4. Try real sign-in, a memo question, source/attachment opening and the PDF picker; record any displayed error. Open remote reset links only through the configured reachable HTTPS frontend.
5. Report results so Codex can reproduce and repair failures.

### 6. [USER MUST DO] Authorize eventual hosting ownership

1. Choose the account/organization that owns the deployment and its allowed cost. Local validation does not require deployment first.
2. Provide authorized access to that hosting project and any owned domain/DNS settings through secure account controls.
3. Approve publication/billable resources when the deployment is concretely prepared. Codex handles technical configuration, builds, secrets wiring, routing, HTTPS/CORS, refresh hosting and validation.

## NEXT ACTION

**Obtain a working MongoDB connection URI and privately populate `MONGODB_URI` in the prepared `server/.env`.** Follow manual item 1. This is the first personal action because real authentication, admin access, persistent documents and reset tokens depend on MongoDB. Gemini and email can follow; creating accounts, uploading a first real memo and testing persistence become executable once the database is connected.
