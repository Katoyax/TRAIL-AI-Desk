# TRAIL AI Desk — Implementation Reference

**Project:** TRAIL AI Desk  
**Institution:** University of Science and Technology of Southern Philippines (USTP), Cagayan de Oro Campus  
**Document status:** Active implementation reference; current modernization pending owner acceptance  
**Phase 00 status:** Closed — **READY WITH DOCUMENTED LIMITATIONS**  
**Current phase:** Phase 01A — backend and MongoDB work ongoing; completion not established  
**Originally prepared:** November 4, 2026  
**Last updated:** November 8, 2026  
**Requirements baseline:** Original October 2026 SRS — FR-001–FR-036 and NFR-001–NFR-012  
**Decision baseline:** Approved P00-D decisions recorded in `DECISIONS.md`  
**Development roadmap:** [PROJECT_PLAN.md](./PROJECT_PLAN.md)  
**Provenance:** Recovered from the P00-E4 clean backup and modernized under the current documentation checkpoint; recovery is not evidence of prior repository acceptance or operational success.

## 1. Purpose and scope

This document provides a controlled technical implementation reference for TRAIL AI Desk.

Use it to distinguish historical implementation evidence, approved targets, currently observed implementation facts, and unresolved technical gaps. Use [PROJECT_PLAN.md](./PROJECT_PLAN.md) for lifecycle and gates, [DATABASE.md](./DATABASE.md) for persistence/configuration evidence, [API.md](./API.md) for interface contracts, and [APP_FLOW.md](./APP_FLOW.md) for user-visible behavior.

It describes:

- The architecture identified through historical project evidence.
- Approved target architecture and institutional governance decisions.
- Major application components and their intended responsibilities.
- Known implementation gaps and operational uncertainties.
- Integration dependencies between frontend, backend, database, institutional knowledge, and external AI services.
- The evidence required before functionality is accepted as working.
- Rules for keeping implementation documentation synchronized with authorized development.

This is not an instruction to modify the repository.

The document does not claim that historically inspected code remains unchanged, that all described services work, or that the application is production-ready.

## 2. Evidence and implementation status

Technical claims must use the following classifications.

| Classification | Meaning |
|---|---|
| Historical evidence | Earlier authorized reports or inspections identified relevant code or behavior |
| Approved target | A project-owner-approved architectural or functional requirement |
| Proposed implementation | A possible future implementation step not yet separately authorized |
| Owner-reported configuration | A nonsecret configuration fact supplied by the owner but not established by runtime evidence |
| Observed diagnostic result | A bounded diagnostic observation that does not by itself establish root cause or operational readiness |
| Not verified | Current behavior has not been demonstrated through suitable evidence |
| Verified operational | Current inspection and execution evidence establish the specified behavior |
| Accepted | The project owner has accepted the relevant checkpoint or result |

A feature may have historical code evidence and still remain operationally unverified.

The following sources establish the planning baseline:

- Original October 2026 Software Requirements Specification.
- `REQUIREMENTS_TRACEABILITY.md`.
- `DECISIONS.md`.
- `PROJECT_PLAN.md`.
- `AGENTS.md`.
- Accepted `README.md` content.
- Phase 00 historical audit and inspection evidence.
- Separately approved and reviewed implementation checkpoints.

Exact source-code filenames, function names, endpoint paths, database collections, and environment variable names must not be invented.

Such references should be added only after authorized repository inspection establishes them.

## 3. Historical and target system architecture

### 3.1 Historically documented technology

| Component | Historical evidence | Current operational status |
|---|---|---|
| Mobile/web frontend | Expo v57, React Native, Expo Router, TypeScript | Complete integration not verified |
| Backend | Node.js using native HTTP handling | Current behavior requires verification |
| Database | MongoDB-oriented backend services | Live connectivity not verified |
| Authentication | Historical login, password, token, and session mechanisms | Real end-to-end authentication not verified |
| Institutional knowledge | Historical source registration, ingestion, retrieval, and administrative management | Approved governance lifecycle not verified |
| AI services | Historical optional Gemini generation and embedding integration | Live provider operation not verified |
| Citations | Historical source metadata, retrieval, and citation display | Factual claim-level support not verified |
| Student concerns | Local demonstration workflow | Durable production submission not verified |
| Demo support | Explicit demonstration behavior historically documented | Temporary development functionality |

The historical architecture is an inspection baseline, not a complete current repository inventory.

### 3.2 Approved target architecture

The approved application direction includes:

1. Expo/React Native student and administrative interfaces, subject to later verification.
2. A Node.js backend with incremental Express integration.
3. Real MongoDB-backed persistence.
4. Secure authentication and three distinct backend-enforced roles.
5. An institutional knowledge-base submission and approval lifecycle.
6. Version-specific eligibility for retrieval and external AI processing.
7. RAG retrieval with evidence-grounded responses and citations.
8. Private, durable student concerns.
9. Appropriate auditing, privacy, security, monitoring, and failure handling.

Express is an approved target under D-001. This document does not assert that Express has already been integrated.

### 3.3 Logical component boundaries

The proposed logical architecture separates:

- Presentation and navigation.
- Backend request handling.
- Authentication and authorization.
- Institutional source submission and review.
- Knowledge ingestion and version management.
- Retrieval and AI response generation.
- Student concern processing.
- Database persistence.
- Audit and operational services.

Logical separation does not necessarily require distinct deployed services or separate repositories.

Actual module boundaries should be based on later authorized inspection and approved implementation design.

## 4. Frontend implementation reference

### 4.1 Historical frontend

Earlier evidence identifies a React Native application using Expo Router and TypeScript.

Historical workflows included:

- Login and authenticated navigation.
- Student dashboard and chatbot presentation.
- Institutional information browsing.
- Administrative knowledge-management interfaces.
- Demonstration account or fallback workflows.
- Local student concern preview behavior.

Their current source locations, exact navigation structure, and runtime results are not certified by this document.

### 4.2 Approved frontend expectations

The frontend must eventually support:

- Appropriate authentication, loading, error, and logout states.
- Navigation consistent with the authenticated user's role.
- Student information browsing and contextual chat.
- Supporting citations and clear insufficient-evidence messages.
- Selected-period official memoranda.
- Private student concern submission and truthful confirmation.
- Admin and Knowledge-Base Manager workflows appropriate to their respective permissions.
- Accessible, readable, and usable interfaces on identified supported devices and browsers.

Protected features must not rely exclusively on hiding or displaying navigation elements.

### 4.3 Frontend verification needs

Future authorized testing should verify:

- Screen transitions and navigation.
- Authenticated and unauthenticated states.
- Loading indicators and error feedback.
- Session expiry and logout behavior.
- Role-specific visibility and backend denial of unauthorized actions.
- Real API responses rather than demo-only data.
- Device/browser compatibility.
- Accessibility and usability requirements.

Do not mark a screen as fully implemented merely because its component exists.

### 4.4 Staff Login UI implementation

**Status:** UI IMPLEMENTED — AUTHENTICATION NOT INTEGRATED

The frontend now contains:

- `src/app/staff-login.tsx` for the public shared Staff Login route.
- `src/components/login-layout.tsx` for the shared Student/Staff login presentation.
- Two-way source-defined navigation between `/` and `/staff-login`.
- A disabled Staff Sign In control with an explicit integration-status message.

The Staff screen maintains local input and password-visibility state only. It does not call authentication APIs, create sessions, select roles, enter `/admin`, or create Knowledge-Base Manager privileges. Existing Student authentication and protected-route behavior remain separate and unchanged.

Type checking, linting, and rendered web-preview verification were blocked in this checkpoint because the shell had no active Node.js version. These source-level implementation statements therefore do not establish runtime operation or visual acceptance.

## 5. Backend implementation reference

### 5.1 Historical backend

The historically inspected backend uses native Node.js HTTP handling.

Earlier reports describe backend capabilities related to:

- Authentication and account security.
- Institutional source registration and management.
- Source extraction and ingestion.
- Chat and retrieval requests.
- Database-oriented persistence.
- Error handling and demonstration behavior.

The current route inventory, middleware structure, service dependencies, and operational results have not been independently revalidated.

### 5.2 Approved backend direction

Under D-001, Node.js remains the backend platform and Express is to be introduced incrementally.

Future implementation should:

- Preserve useful existing services when appropriate.
- Establish database and configuration reliability.
- Keep authentication and authorization on the server.
- Validate incoming requests.
- Separate public information processing from private student data.
- Enforce institutional approval and version eligibility centrally.
- Report provider and database failures truthfully.
- Maintain suitable logs and operational diagnostics.

A wholesale backend replacement requires separate project-owner approval.

### 5.3 Backend inspection evidence to capture

When the appropriate repository checkpoint is approved, document:

| Evidence field | Required information |
|---|---|
| Entry point | Verified backend startup file |
| Framework | Actual HTTP framework and version |
| Routes | Verified route, method, and handler |
| Authentication | Verified login and session integration |
| Authorization | Server-enforced permission checks |
| Persistence | Actual database service and collections |
| Error handling | Observed error responses and failure behavior |
| External providers | Verified integration boundaries |
| Tests | Exact test names, results, environment, and date |

Do not populate unknown fields with plausible filenames or conventional Express routes.

## 6. MongoDB and persistence

### 6.1 Current evidence state

MongoDB is a key planned persistence component.

Phase 01A backend and MongoDB work is ongoing. Under `P01A-MONGODB-CONFIG-FIX-01` on 2026-11-09, the backend gained one shared validator for the approved Atlas host, database username, and explicit `trail_db` database. Missing, legacy, placeholder, or mismatched live configuration is rejected before initialization or provisioning. The effective private configuration passed sanitized validation, while the one isolated read-only Atlas ping failed and closed cleanly; the failure cause remains undetermined.

Successful backend connection, authentication, reads, writes, restart persistence, and durable operation have not been established through accepted current evidence. Source and automated-test evidence establishes the intended database-selection guard, but does not prove a successful live connection or database operation.

The controlled nonsecret configuration and verification register is maintained in [DATABASE.md](./DATABASE.md#20-mongodb-inspection-and-verification-register).

### 6.2 Current Phase 01A implementation priority

Phase 00 closed **READY WITH DOCUMENTED LIMITATIONS**. Phase 01A is now the active infrastructure checkpoint under bounded owner approvals.

Potential Phase 01A work includes:

- Determining the actual connection failure.
- Reviewing connection configuration without exposing credentials.
- Verifying database accessibility.
- Testing reads and writes.
- Checking persistence after application restart.
- Investigating connection failures and recovery behavior.
- Identifying required collections and indexes.

These remain investigation and verification areas. This document records priorities but does not authorize additional commands, provider access, database operations, or source changes.

### 6.3 Persistence obligations

The approved target requires durable handling of relevant:

- Accounts and role assignments.
- Institutional sources and exact content versions.
- Approval decisions and provenance.
- Audit history.
- Student concern submissions.
- Other records necessary for verified application workflows.

Exact collection names, schemas, indexes, migrations, and retention policies require verified implementation evidence or separately approved design.

## 7. Authentication and authorization

### 7.1 Historical evidence

Historical inspections identified authentication-related components, including password-security and password-recovery mechanisms.

Those findings do not establish current end-to-end login, recovery, token validation, or session security.

### 7.2 Approved role model

D-002 establishes exactly three distinct roles:

1. Student.
2. Admin.
3. Knowledge-Base Manager.

The Knowledge-Base Manager must be a separate backend-enforced role, not simply an informal designation or frontend-only permission.

### 7.3 Required authorization controls

Implementation must enforce permissions at protected backend operations.

Specific controls include:

- Secure authentication.
- Role-based access restrictions.
- Protection against privilege escalation.
- Appropriate account provisioning.
- Session expiry and logout behavior.
- Password recovery safeguards.
- Proper separation of institutional submission and independent review.

A Knowledge-Base Manager who submits a particular source version must not independently approve that same submission.

### 7.4 Verification

Evidence must include successful and denied requests across all three roles.

The absence of an Admin button in a Student interface does not prove authorization is enforced.

## 8. Institutional knowledge-base governance

### 8.1 Authoritative source principle

Official university information originates from its authorized issuing office.

The issuing office must officially approve and publish the information.

An authorized TRAIL Admin or Knowledge-Base Manager may then submit the information into the application's knowledge workflow.

A Knowledge-Base Manager independently reviews the exact submitted version before it becomes eligible for retrieval.

The issuing office is not required to have a separate TRAIL account.

### 8.2 Proposed lifecycle reference

The approved lifecycle can be represented conceptually as:

1. Official source established.
2. Source registered or submitted.
3. Exact content/version captured.
4. Provenance validated.
5. Content remains pending internal review.
6. Independent Knowledge-Base Manager reviews the version.
7. The version is approved or rejected.
8. Approved and eligible content may be processed and retrieved.
9. Later changes are staged as new versions.
10. Each changed version receives renewed approval.

The precise database states, event names, and API contracts are not yet approved.

### 8.3 Mandatory manual-entry provenance

Every manual institutional entry must include:

- Its issuing office.
- An independent official supporting reference or verifiable official provenance.

Missing required provenance must prevent approval and retrieval.

### 8.4 Version-specific approval

Approval must not automatically transfer to changed source content.

A prior approved version may remain eligible only while it remains valid and has not been officially withdrawn or superseded.

The backend must prevent pending, rejected, withdrawn, or otherwise ineligible versions from appearing in student-facing retrieval.

### 8.5 Historical conflict

Earlier evidence identified potential approval inheritance and insufficient manual-entry validation.

These are material historical risks that require later reproduction or resolution through current evidence.

They must not be described as fixed merely because this document specifies the correct target behavior.

## 9. Ingestion and external AI processing

### 9.1 Historical evidence

Historical reports describe institutional source extraction, ingestion, embeddings, and optional external AI integration.

The exact present processing sequence, provider-call boundaries, retry behavior, and background-job durability remain unverified.

### 9.2 Mandatory approval boundary

Under D-006:

**Pending or unapproved institutional source content must not be sent to external AI-generation or embedding providers before the applicable Knowledge-Base Manager approval.**

This applies to processing triggered by:

- New source submission.
- Uploaded documents.
- Manual institutional entries.
- Source refresh.
- Changed content versions.
- Retries or background jobs acting on pending content.

Internal parsing and staging must be designed to preserve this boundary.

Approval of one version must not authorize external processing of another unapproved version.

### 9.3 Other safety considerations

Future implementation should verify appropriate:

- Source-access permissions.
- URL validation and SSRF protections.
- Document parsing safeguards.
- File-type and size handling.
- Provider configuration and secret protection.
- Retry and duplicate processing controls.
- Audit visibility for content transitions.

Approval for institutional content does not automatically authorize disclosing private student records to an external AI provider.

## 10. RAG retrieval and response generation

### 10.1 Historical evidence

Historical implementation records describe chat submission, retrieval logic, prompt construction, context handling, and citation display.

These features require current inspection and integrated testing.

### 10.2 Approved retrieval boundary

Student-facing RAG must use only approved, eligible institutional content.

Retrieval should preserve sufficient information to identify:

- The originating source.
- The exact eligible source version.
- The relevant retrieved passage or chunk.
- Applicable verification and validity information.
- Supporting references needed for citation.

### 10.3 Approved answer behavior

University-specific answers must be grounded in supporting institutional evidence.

A valid citation must support the associated factual claim, not merely point to an official-looking page.

The assistant should accurately represent:

- Missing information.
- Insufficient evidence.
- Conflicting sources.
- Outdated material.
- Temporarily unavailable services.

A confident response with a citation marker is not automatically a verified institutional answer.

### 10.4 Conversation context and isolation

The approved student workflow includes relevant context for follow-up questions.

Future tests should establish:

- Correct within-session context handling.
- Separation between users and sessions.
- Appropriate context limits.
- Proper handling of retries and stale responses.
- No unintended access to private or ineligible source material.

### 10.5 Verification

Citation testing must assess substantive factual support and correct source-version associations.

Historical citation-display checks do not by themselves satisfy the stronger approved citation requirement.

## 11. Student-facing workflows

### 11.1 Institutional information

The target includes navigation and approved information about relevant university offices, policies, academic calendars, documentary requirements, enrollment, and related subjects.

Content availability and accuracy must be based on actual approved knowledge-base coverage.

### 11.2 Official memoranda

FR-017–FR-019 and D-008 require:

- Approved official memoranda and announcements.
- Issuing office, date, and source information.
- Student selection of a relevant reporting period.
- Current-week support.
- Asia/Manila date handling.
- Truthful period-specific absence messages.

Exact week-boundary definitions and additional period options remain open design details.

A missing approved memorandum in TRAIL does not prove that the university issued no memorandum.

### 11.3 Student concerns

FR-020–FR-023 and D-009 require a private durable concern workflow.

The approved target includes:

- Required-field validation.
- Protected persistence.
- Submission confirmation.
- Duplicate safeguards.
- Appropriate access restrictions.
- Retention controls.
- Truthful acknowledgement and resolution states.

Saving a concern in TRAIL is not the same as a university office officially receiving or resolving that concern.

Historical local demonstration behavior does not satisfy durable backend submission.

Private concern records must not enter public RAG retrieval.

## 12. Admin and Knowledge-Base Manager workflows

### 12.1 Admin

Potential responsibilities include authorized application administration, account operations, source registration, and institutional content submission.

Exact administrative permissions require later authorization and RBAC design.

### 12.2 Knowledge-Base Manager

The approved role is responsible for independent institutional information review and appropriate knowledge eligibility management.

It must support review of:

- Source and issuing-office provenance.
- Supporting official references.
- The exact submitted version.
- Changes to previously approved content.
- Relevant approval and rejection history.

A reviewer must be distinct from the submitter for the same version.

### 12.3 Role-specific verification

Future tests must establish both permitted and denied backend actions.

Frontend navigation alone cannot establish permission boundaries.

## 13. Temporary demo behavior

The approved demo policy allows explicitly identified demonstration functionality during early development.

The demo must not:

- Silently replace a failed production backend.
- Conceal a failed MongoDB connection.
- Represent simulated answers as verified institutional retrieval.
- Represent local concern previews as confirmed durable submissions.
- Become a required component of the final live application.

The intended live-application demo fallback will be retired after real database-backed operation, authentication, and three-role RBAC are established and verified, subject to separately approved phase gates.

No instruction in this document authorizes immediate demo removal.

Controlled development test fixtures may remain where useful and appropriate.

## 14. Security, privacy, and reliability

Security and privacy are cross-cutting implementation obligations, not features deferred entirely to Phase 07.

Future authorized work must address:

- Credential and secret protection.
- Password security and account recovery.
- Backend authentication and authorization.
- Student concern confidentiality.
- Institutional source validity.
- Unapproved-content isolation.
- Provider data disclosure controls.
- Secure source fetching.
- Input validation and abuse protection.
- Audit access and retention.
- Database and provider failure behavior.
- Backup and recovery planning.
- Device/browser support and appropriate usability safeguards.

The SRS privacy requirement references Republic Act No. 10173.

Documenting privacy controls does not establish legal compliance or correct runtime enforcement.

## 15. Configuration, environments, and operations

The MongoDB configuration contract uses `MONGODB_URI` for the private connection string and `MONGODB_DATABASE` for the required explicit database name. The current validator accepts live mode only for the approved SRV host, username, and `trail_db` target, and permits demo mode only when both live MongoDB settings are absent. The provisioning CLI uses the same validation before password input, client creation, indexes, or account writes. Values, passwords, and the URI must never be written into this document. Nonsecret verification evidence belongs in [DATABASE.md](./DATABASE.md#20-mongodb-inspection-and-verification-register).

Other exact configuration filenames, environment variables, startup commands, and deployment procedures have not been revalidated for this document.

Future updates should record only verified:

- Frontend and backend setup prerequisites.
- Dependency versions.
- Database connection requirements.
- External AI provider configuration.
- Secret-handling conventions.
- Environment distinctions.
- Startup and shutdown behavior.
- Failure and recovery procedures.
- Deployment and maintenance processes.

Never include live passwords, tokens, private connection strings, or API keys in this documentation.

If a setup operation fails, record the observed failure rather than substituting a presumed working command.

## 16. Implementation sequencing

The approved project roadmap is recorded in `PROJECT_PLAN.md`.

| Phase | Primary implementation or verification focus |
|---|---|
| 00 | Closed — ready with documented limitations; historical requirements, decisions, documentation, and readiness record retained |
| 01 | Active — real backend and MongoDB foundation; Phase 01A ongoing |
| 02 | Authentication and three-role RBAC |
| 03 | Institutional source approval and version governance |
| 04 | Approved-source RAG and citation reliability |
| 05 | Student information, memoranda, and concerns |
| 06 | Admin and Knowledge-Base Manager interfaces |
| 07 | Security, privacy, and reliability hardening |
| 08 | Integration testing and requirements acceptance |
| 09 | Deployment and operations |

These phases define development direction, not unrestricted implementation authorization.

P00-F is retained as a historical Phase 00 planning concept; it is not a future gate that reopens Phase 00.

Phase 01A is ongoing, but the creation or acceptance of this document does not authorize any additional MongoDB command, provider request, database operation, or source modification.

## 17. Implementation evidence register

The current Phase 01A entry must distinguish source/test-verified target validation, the earlier observed `ECONNREFUSED` diagnostic, the later sanitized ping failure, and still-unverified backend behavior. It must not identify a conclusive root cause until supported evidence exists.

After an authorized inspection or development checkpoint, verified implementation details should be recorded using this structure:

| Field | Required evidence |
|---|---|
| Feature or component | Descriptive name |
| Requirement IDs | Applicable original SRS clauses |
| Decision IDs | Applicable approved project decisions |
| Repository reference | Exact observed file, function, or module |
| Historical status | Relevant previous evidence |
| Current behavior | Observed implementation behavior |
| Verification procedure | Authorized test or review |
| Result | Passed, failed, blocked, or not verified |
| Environment and date | Relevant execution context |
| Known limitations | Outstanding uncertainties |
| Owner acceptance | Explicit checkpoint acceptance reference |

### Initial implementation evidence summary

| Component | Historical evidence | Current verification |
|---|---|---|
| Frontend navigation | Earlier application paths identified | End-to-end behavior not verified |
| Native Node.js backend | Earlier backend inspected | Current integration not verified |
| MongoDB | Explicit `trail_db` target validation and fail-closed configured startup/provisioning paths implemented and locally regression-tested; effective configuration validation passed | One isolated ping failed and closed cleanly; connectivity root cause, reads/writes, and durability remain unverified |
| Authentication | Login and recovery mechanisms identified | Production behavior not verified |
| Three-role RBAC | Historical Student/Admin structure | Separate manager role not verified |
| Knowledge approval | Historical management workflow | Independent exact-version approval not verified |
| External embeddings | Historical provider integration | Pending-content isolation not verified |
| Chat and citations | Historical retrieval and display paths | Claim-level support not verified |
| Memoranda | Historical announcement behavior | Selected-period workflow not verified |
| Student concerns | Historical local demo | Durable private workflow not verified |
| Demo fallback | Historical explicit demo support | Retirement readiness not verified |

The register must be updated from actual evidence, not from architectural expectations.

## 18. Known technical uncertainties

The following matters require separately authorized investigation or design.

| Area | Unresolved detail |
|---|---|
| Database | Actual connection failure, schemas, indexes, durability |
| Backend | Current entry point, route map, middleware, Express migration sequence |
| Authentication | Provisioning, recovery, session lifecycle, role enforcement |
| Knowledge governance | Review-state model, exact-version identity, withdrawal and supersession rules |
| Source validation | Official-reference validation and allowed document types |
| External processing | Current provider-call locations and approval-gate enforcement |
| RAG | Retrieval configuration, factual support evaluation, context isolation |
| Memoranda | Period-selection interface and precise week boundaries |
| Concerns | Storage schema, access policy, retention, routing and acknowledgements |
| Background work | Durability, retry behavior, concurrency and recovery |
| Testing | Current executable coverage and external integration results |
| Deployment | Operational environment, secrets, monitoring, backups and recovery |

These are open technical matters, not evidence that all listed capabilities are absent.

No architectural choice should be made solely because it is a common implementation pattern.

## 19. Documentation maintenance and change control

This document should remain an evidence-based implementation reference.

A future authorized update should:

1. Identify the current approved checkpoint.
2. State which component or implementation fact is being changed.
3. Identify supporting repository or test evidence.
4. Preserve the original SRS requirement references.
5. Cite relevant approved decisions.
6. Distinguish verified facts from proposed design.
7. Describe effects on other project documents.
8. Obtain project-owner approval for material changes.
9. Avoid changing unrelated documents without authorization.

Update this reference when authorized source inspection, implementation changes, configuration-contract changes, current test/runtime evidence, or approved architectural decisions alter the supported implementation record. Synchronize lifecycle summaries with [PROJECT_PLAN.md](./PROJECT_PLAN.md), persistence evidence with [DATABASE.md](./DATABASE.md), contracts with [API.md](./API.md), flows with [APP_FLOW.md](./APP_FLOW.md), and verification/issue evidence with [TESTING.md](./TESTING.md) and [BUGS.md](./BUGS.md).

The implementation reference must not silently override `DECISIONS.md` or `REQUIREMENTS_TRACEABILITY.md`.

As the system evolves, replace historical uncertainty with verified information only when the corresponding evidence exists.

## 20. Documentation completion and acceptance criteria

The `IMPLEMENTATION.md` documentation checkpoint is acceptable when:

1. The historical Node.js and Expo architecture is described accurately.
2. Incremental Express integration is identified as an approved future direction.
3. Live MongoDB connectivity is not falsely claimed.
4. Student, Admin, and Knowledge-Base Manager are distinguished.
5. Official publication and independent source approval are preserved.
6. Changed-version approval inheritance is prohibited.
7. Pending source content is excluded from external AI and embedding processing.
8. RAG citations require substantive claim support.
9. Memoranda and concerns retain their approved functional boundaries.
10. Temporary demo support and its retirement conditions are accurately stated.
11. No invented source paths, route names, schema names, or test results are introduced.
12. Historical evidence and current verification remain separate.
13. Unresolved technical details are clearly identified.
14. Future implementation work remains separately authorization-controlled.
15. Markdown structure and document completeness are verified.
16. The project owner accepts the resulting documentation.

Acceptance of this document does not establish application or production readiness.

## 21. Project authority

The project owner retains final authority over development scope, architecture, documentation acceptance, repository operations, and phase advancement.

ChatGPT may assist with documentation planning, evidence reconciliation, and acceptance review.

Codex may inspect or modify the local repository only within explicitly approved checkpoint boundaries.

Preparation or acceptance of this document does not authorize work by itself. Phase 01A commands, inspections, edits, and database operations must remain within an explicit owner-authorized scope; one approved execution batch may cover its internal files, checks, and documentation updates.

