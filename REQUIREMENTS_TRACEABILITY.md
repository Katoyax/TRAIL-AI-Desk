# TRAIL AI Desk — Requirements Traceability

**Project:** TRAIL AI Desk — USTP Cagayan de Oro Campus  
**Document status:** Living traceability baseline — recovered from the P00-E4 backup and modernized through an owner-authorized documentation batch  
**Requirements baseline:** Original Software Requirements Specification, October 2026  
**Requirements covered:** 36 functional and 12 non-functional requirements  
**Lifecycle status:** Phase 00 closed — READY WITH DOCUMENTED LIMITATIONS; Phase 01A ongoing  
**Historical provenance:** Prepared under P00-E3F and P00-E3G; backup provenance does not independently prove historical acceptance  
**Evidence basis:** Approved Phase 00 handoff, audit archive, P00-E1C reconciliation, historical inspections, and explicitly identified later checkpoint evidence  
**Modernized:** November 8, 2026

## 1. Purpose and scope

This document establishes a traceability baseline connecting the original TRAIL AI Desk requirements to approved architectural decisions, historical implementation evidence, outstanding gaps, and future verification activities.

It preserves the original SRS wording without silently incorporating later changes into those clauses.

The document does not certify current requirements compliance, test success, production readiness, MongoDB connectivity, or live external-provider operation.

The October 2026 SRS is the authoritative source for the original requirements. Approved P00-D decisions provide subsequent project direction.

Developers and Codex should consult this document when planning, implementing, testing, accepting, or changing requirement-related work. It is authoritative for requirement identifiers and trace relationships, not proof that a feature works. The project owner approves requirement interpretations, acceptance outcomes, and phase transitions; authorized contributors maintain the evidence mappings.

## 2. Evidence classification and interpretation

Use the following evidence classifications:

| Classification | Meaning |
|---|---|
| Code Evidence Found | An authorized historical source inspection documented relevant implementation. This does not prove current runtime success. |
| Partial Evidence | Some relevant historical functionality or documentation was identified, but the complete requirement was not verified. |
| Not Observed | The authorized evidence did not establish the behavior. This does not prove repository-wide absence. |
| Potential Conflict | Historical behavior or documentation differs from the original requirement or an approved decision. |
| Not Yet Verified | Additional inspection, testing, or operational evidence is required. |

Historical P00-C S/P/G/C/U classifications, where available, remain separate historical classifications. Their definitions must not be invented or silently translated.

**Verification baseline:** None of the 48 requirements is certified as fully satisfied through current end-to-end testing by this document.

## 3. Functional requirements

### 3.1 Authentication and Dashboard — FR-001–FR-005

| ID | SRS page | Original SRS requirement | Historical evidence assessment | Future verification |
|---|---:|---|---|---|
| FR-001 | 7 | The system shall allow registered users to log in using valid credentials. | Partial Evidence — historical authentication and frontend login paths | Real MongoDB-backed login, invalid credentials, disabled accounts, session behavior |
| FR-002 | 7 | The system shall provide secure password recovery for registered users. | Partial Evidence — reset-token and password-security mechanisms historically inspected | Live reset, expiry, reuse prevention, session revocation, email delivery |
| FR-003 | 7 | The system shall restrict protected features according to user roles. | Partial Evidence — exact Student, Admin, and Knowledge-Base Manager authentication/route guards locally tested | Live three-role authorization and full knowledge-workflow permission tests |
| FR-004 | 7 | The system shall display a dashboard with navigation to available student features. | Partial Evidence — historical dashboard and navigation paths | Dashboard, navigation, usability, and accessibility testing |
| FR-005 | 7 | The system shall allow authenticated users to log out. | Partial Evidence — historical logout; potential pending-login race | Logout, token invalidation, stale-response handling, session-expiry tests |

**Historical bounded UI evidence — initial Staff Login UI checkpoint**

- `src/app/staff-login.tsx` provides the shared Staff Login presentation.
- `src/app/index.tsx` and `/staff-login` define two-way Student/Staff entry navigation.
- At that checkpoint, the Staff Sign In control was intentionally disabled and performed no authentication or session operation.
- That checkpoint added partial source-level UI evidence but did not satisfy registered-user staff login or three-role authorization; the later P01B foundation evidence below supersedes those current-state limitations.
- Runtime rendering, responsive behavior, and navigation remain unverified because the authorized web-preview command could not start without an active Node.js version.

**Current implementation evidence — P01A-ADMIN-STUDENT-PROVISION-01 (2026-11-11)**

- `server/src/app.mjs`, `server/src/auth/service.mjs`, and `server/src/auth/store.mjs` implement Admin-protected Student listing and provisioning while fixing the created role to `student`.
- `src/app/student-management.tsx` and `src/services/students.ts` implement the protected Admin workflow; `src/app/_layout.tsx` registers it inside the real, non-demo Admin route group.
- Focused authentication tests passed 27/27, the direct TypeScript check passed, focused ESLint passed, and the full local backend runner passed 89/89.
- Tests used in-memory/fake persistence. No live Student account was created, so Atlas persistence and the complete manual UI flow remain unverified in this checkpoint.
- At that checkpoint, FR-001 and FR-024 gained code/test evidence for controlled Student provisioning and subsequent login capability; the distinct manager-role gap was addressed later by the P01B foundation evidence below.

**Current implementation evidence — P01B-KB-MANAGER-FOUNDATION-01 (2026-11-20)**

- The existing User/session architecture now recognizes canonical `knowledge_manager` accounts, with Admin-only provisioning/lifecycle operations, salted-scrypt credentials, mandatory initial password replacement, and `credentialVersion` revocation.
- Staff Login supplies an exact expected staff role; mismatch is rejected before session creation. Expo protected routes and backend `requireRole()` guards isolate Student, Admin, and Knowledge-Base Manager destinations and APIs.
- The manager dashboard reads actual protected source status but exposes no manager source mutations; independent review, submitter separation, and final governance controls remain unimplemented.
- Focused authentication tests passed 47/47, the complete backend runner passed 109/109, TypeScript passed, and focused ESLint passed. No live Atlas record or rendered device/browser flow was exercised.

**Current implementation evidence â€” P01A-STUDENT-PROVISIONING-04 (2026-11-19)**

- Admin provisioning now requires a Student ID Number, stores it as an embedded Student-profile string under the existing UUID User identity, and enforces uniqueness with a partial MongoDB index. Existing records are not automatically backfilled.
- Newly provisioned Students retain email-based login but receive a backend-enforced initial-password-change restriction. Atomic completion replaces the salted-scrypt hash and increments `credentialVersion`, invalidating all temporary-password sessions.
- The Admin UI presents the approved identity fields and generated password once in component state with reveal/hide/copy controls; password values remain excluded from list responses and database documents.
- Focused authentication tests passed 32/32, the complete backend runner passed 94/94, TypeScript passed, and focused ESLint passed. No live Atlas record or rendered device/browser flow was exercised.
- This strengthens code/test evidence for FR-001, FR-002, FR-024, and NFR-007. Student ID-based login and the institution-approved Student ID format remain proposed decisions, not implemented requirements.

**Current implementation evidence — P01A-ADMIN-PASSWORD-MANAGEMENT-03 (2026-11-11)**

- The existing self-service reset path now also records deduplicated Student assistance metadata while preserving generic public responses and non-blocking delivery.
- Admin-protected endpoints support Student-only reset initiation, bounded safe request listing, and pending-to-handled/dismissed management. The registered account email remains authoritative.
- `/student-management`, `/password-requests`, `/admin-dashboard`, and the existing Admin protected route group expose the bounded recovery-assistance UI without tokens or passwords.
- Focused authentication tests passed 31/31, TypeScript and focused ESLint passed, and the full backend runner passed 93/93 using fake/in-memory dependencies.
- This adds current implementation/test evidence for FR-002 and backend Admin enforcement under FR-003. Live email delivery and Atlas request persistence were not executed, and three-role RBAC remains incomplete.

**Current implementation evidence — P01A-FORGOT-PASSWORD-REQUEST-UI-01 (2026-11-19)**

- The public Forgot Password operation now records only a deduplicated assistance request for an eligible active Student; it no longer requires configured email delivery or issues a reset token.
- Eligible, inactive, Staff, and unknown email submissions receive the same generic response, while only the eligible active Student produces an Admin-visible pending record.
- Focused authentication tests passed 35/35, TypeScript passed, and focused ESLint passed using local in-memory/fake dependencies. No live Atlas request or real email was performed.
- Admin-authorized reset-link delivery remains a separate operation. This updates implementation/test evidence for FR-002 without claiming automatic recovery approval or identity verification.

**Current implementation evidence — P01A-FORGOT-PASSWORD-ADMIN-RESET-02 (2026-11-19)**

- An authenticated Admin can approve a pending eligible Student request only after explicitly confirming an approved identity-verification procedure.
- One MongoDB transaction replaces the salted-scrypt credential, sets `mustChangePassword: true`, increments `credentialVersion`, and marks the request handled. Dismissal leaves the credential unchanged.
- The random temporary password is returned only in the successful approval response and is excluded from request listing/status APIs and persistence. The Admin UI hides it by default and provides reveal, copy, and clear controls.
- Focused authentication tests passed 41/41 and the complete backend runner passed 102/102; TypeScript and focused ESLint passed except for the pre-existing `Buffer` global lint finding in `server/src/app.mjs`. No live Atlas transaction or rendered UI test occurred.
- This strengthens local implementation/test evidence for FR-002, FR-003, and NFR-007 without establishing live operational acceptance or three-role RBAC completion.

### 3.2 AI Chatbot and Context-Aware Responses — FR-006–FR-012

| ID | SRS page | Original SRS requirement | Historical evidence assessment | Future verification |
|---|---:|---|---|---|
| FR-006 | 8 | The system shall allow students to submit university-related questions through a chat interface. | Partial Evidence — historical chat interface and API paths | Real frontend/backend chat integration |
| FR-007 | 8 | The system shall retrieve relevant approved information from the institutional knowledge base. | Potential Conflict — historical changed-content approval inheritance | Restrict retrieval to approved, eligible source versions |
| FR-008 | 8 | The system shall generate responses grounded in retrieved information using the configured AI service. | Partial Evidence — historical Gemini integration and prompt construction | Live provider integration and claim-to-evidence evaluation |
| FR-009 | 8 | The system shall maintain relevant conversation context for follow-up questions. | Partial Evidence — historical context and follow-up handling | Context retention, session isolation, retry behavior |
| FR-010 | 8 | The system shall display supporting source citations for university-specific responses. | Partial Evidence — citation display and checks; factual support unproven | Citation validity, version binding, claim-level support |
| FR-011 | 8 | The system shall inform students when sufficient verified information is unavailable. | Partial Evidence — insufficient-evidence paths historically documented | Missing, conflicting, outdated, and unapproved-source scenarios |
| FR-012 | 8 | The system shall display an appropriate error message when an AI or retrieval service is unavailable. | Partial Evidence — historical error and fallback handling | Real provider/database failure behavior and truthful messages |

### 3.3 University Information and Announcements — FR-013–FR-019

| ID | SRS page | Original SRS requirement | Historical evidence assessment | Future verification |
|---|---:|---|---|---|
| FR-013 | 8 | The system shall display university information organized into categories. | Partial Evidence — historical category browsing | Category navigation and approved-content coverage |
| FR-014 | 8 | The system shall provide available approved information on enrollment, academic calendars, and documentary requirements. | Partial Evidence — retrieval and browsing paths; official coverage unverified | Real approved content, accuracy, and date validity |
| FR-015 | 9 | The system shall display available office locations, public contact details, and services. | Partial Evidence — historical browsing; official data accuracy unverified | Approved office information and source accuracy |
| FR-016 | 9 | The system shall provide available approved university policies and procedures. | Not Yet Verified — authoritative policy coverage not established | Policy ingestion, validity, retrieval, and citations |
| FR-017 | 9 | The system shall display approved official memoranda and announcements with their issuing office, date, and source. | Partial Evidence — metadata and announcement functions | Authentic approved memorandum ingestion and display |
| FR-018 | 9 | The system shall allow students to view memoranda for a selected period, including the current week. | Not Observed — selected-period interface absent in historical inspected flows | Period selection, Manila-time boundaries, effective dates |
| FR-019 | 9 | The system shall indicate when no approved memoranda are available in its knowledge base for the selected period. | Partial Evidence — generic absence handling not sufficient | Period-specific empty results and accurate coverage messages |

### 3.4 Student Concern Submission — FR-020–FR-023

| ID | SRS page | Original SRS requirement | Historical evidence assessment | Future verification |
|---|---:|---|---|---|
| FR-020 | 9 | The system shall provide a form for submitting general student concerns. | Partial Evidence — local-only ticket preview | Production form integration |
| FR-021 | 9 | The system shall validate required concern details before submission. | Partial Evidence — demo workflow; backend validation unverified | Required-field and backend validation tests |
| FR-022 | 9 | The system shall store submitted concerns and display a submission confirmation. | Potential Conflict — historical local-only workflow lacks confirmed durable storage | Real persistence, restart durability, duplicate controls, truthful confirmation |
| FR-023 | 9 | The system shall not identify a concern as officially received or resolved by a university office without an authorized workflow. | Not Yet Verified — authorized office acknowledgement not established | Confirmation and status semantics; office-workflow authorization |

### 3.5 Knowledge-Base and Administrative Management — FR-024–FR-031

| ID | SRS page | Original SRS requirement | Historical evidence assessment | Future verification |
|---|---:|---|---|---|
| FR-024 | 10 | The system shall provide an administrative interface accessible only to authorized users. | Partial Evidence — Admin and Knowledge-Base Manager dashboards and exact role guards locally tested | Live role acceptance and full governed management workflow |
| FR-025 | 10 | The system shall allow administrators to register approved official university webpages as information sources. | Partial Evidence — historical source registration | Source validation, provenance, submission and approval lifecycle |
| FR-026 | 10 | The system shall retrieve and process publicly accessible information from registered university webpages, subject to permitted access. | Partial Evidence — extraction and URL/SSRF safeguards | Permitted access, extraction, and real-source validation |
| FR-027 | 10 | The system shall allow administrators to upload institutional documents for knowledge-base processing. | Partial Evidence — historical upload paths | Supported formats, provenance, staging, approval-first external processing |
| FR-028 | 10 | The system shall allow administrators to manually add or update information obtained from relevant university offices. | Partial Evidence — historical manual-entry workflow | Authorized submission and independent approval |
| FR-029 | 10 | The system shall require manually added information to include its originating office and supporting reference. | Potential Conflict — historical validation accepted incomplete provenance | Reject missing issuing office or independent official reference |
| FR-030 | 10 | The system shall allow authorized administrators to verify, approve, reject, or deactivate information sources. | Potential Conflict — historical Admin approval differs from the later separate manager role | Independent Knowledge-Base Manager review, rejection, deactivation, separation of duties |
| FR-031 | 10 | The system shall exclude unapproved or inactive information from student-facing retrieval. | Potential Conflict — inherited approval can expose changed content | Version-specific retrieval filtering and negative tests |

### 3.6 Source Updates, Traceability, and Restrictions — FR-032–FR-036

| ID | SRS page | Original SRS requirement | Historical evidence assessment | Future verification |
|---|---:|---|---|---|
| FR-032 | 11 | The system shall record source metadata, including origin, review date, and approval status. | Partial Evidence — historical source/version metadata | Complete metadata persistence, accuracy, and version association |
| FR-033 | 11 | The system shall support checking registered sources for possible changes and flagging them for review. | Potential Conflict — historical refresh may activate changes without renewed review | Change detection, staging, and review flags |
| FR-034 | 11 | The system shall require approval before updated source information becomes available for retrieval. | Potential Conflict — historical approval inheritance explicitly documented | Exact-version reapproval and blocked preapproval retrieval |
| FR-035 | 11 | The system shall maintain source version information and relevant administrative activity records. | Partial Evidence — versions documented; durable audit history unverified | Reviewer identity, decisions, timestamps, history durability |
| FR-036 | 11 | The system shall prevent student-facing retrieval of confidential student records and shall not modify official university records. | Partial Evidence — historical personal-record safeguards | Confidentiality, access control, provider isolation, non-modification tests |

## 4. Non-functional requirements

| ID | SRS page | Original SRS requirement | Historical evidence assessment | Future verification |
|---|---:|---|---|---|
| NFR-001 | 11 | The system shall provide clear navigation and understandable instructions for student tasks. | Partial Evidence — historical navigation | Usability evaluation |
| NFR-002 | 11 | The interface shall use readable text, sufficient contrast, and appropriately sized touch controls. | Not Yet Verified — complete accessibility evidence unavailable | Readability, contrast, touch-target testing |
| NFR-003 | 11 | The system shall display a loading indicator during AI processing and be evaluated against response-time targets established before final testing. | Not Yet Verified — loading-state and performance verification unavailable | Loading behavior and approved response-time targets |
| NFR-004 | 12 | The system shall handle network, database, and AI service failures with appropriate messages. | Partial Evidence — historical error/fallback handling | Real failure injection and recovery |
| NFR-005 | 12 | University-specific responses presented as verified shall be grounded in approved institutional content. | Potential Conflict — historical approval inheritance and limited factual-grounding assurance | Eligible-version retrieval and claim-support testing |
| NFR-006 | 12 | Retrieved information shall retain an association with its originating source or approved administrative record. | Partial Evidence — historical source metadata | Source, version, and chunk traceability |
| NFR-007 | 12 | Passwords shall be securely hashed, and protected functions shall require authentication and authorization. | Partial Evidence — historical scrypt and authorization controls | Real database authentication and three-role enforcement |
| NFR-008 | 12 | API keys and sensitive backend credentials shall not be exposed in publicly accessible frontend code. | Partial Evidence — historically documented server-side secrets | Current secret-exposure and deployment review |
| NFR-009 | 12 | The system shall apply appropriate safeguards for personal information consistent with Republic Act No. 10173. | Partial Evidence — privacy controls documented; full protection unverified | Concern privacy, logging, retention, external-provider handling |
| NFR-010 | 12 | The system shall operate on supported Android devices and modern web browsers identified through testing. | Not Yet Verified — historical exports do not establish device support | Android/browser acceptance tests |
| NFR-011 | 12 | Authorized administrators shall be able to update institutional information without modifying the application's primary source code. | Partial Evidence — historical management interfaces | Authorized information updates and review lifecycle |
| NFR-012 | 12 | Institutional information shall retain its source, verification status, and revision details; unapproved changes shall not automatically replace approved content. | Potential Conflict — changed-version activation under inherited approval | Version integrity, reapproval, and supersession tests |

## 5. Approved P00-D decision cross-reference

The following decisions are approved project directions. They do not rewrite the original SRS clauses.

| Decision | Approved direction | Affected requirements or areas |
|---|---|---|
| D-001 | Incremental Node.js/Express integration | Backend architecture, integration, maintainability |
| D-002 | Exactly three distinct roles | FR-003, FR-024, FR-030, NFR-007 |
| D-003 | Official issuing-office publication, provenance, and independent human approval | FR-007, FR-025–FR-031, FR-032, NFR-005, NFR-006, NFR-012 |
| D-004 | Mandatory official reference for manual entries | FR-029, FR-032, NFR-005, NFR-006 |
| D-005 | Renewed exact-version approval for changed content | FR-031, FR-033–FR-035, NFR-005, NFR-012 |
| D-006 | No external AI or embedding processing of pending content | FR-007, FR-027, FR-031, FR-036, NFR-009 |
| D-007 | Stronger factual claim-to-evidence citations | FR-008, FR-010, FR-011, NFR-005, NFR-006 |
| D-008 | Selected-period memoranda and Manila-time handling | FR-017–FR-019 |
| D-009 | Private durable student concerns | FR-020–FR-023, NFR-009 |
| D-010 | Auditability, source versions, reviewer history, and retention | FR-032–FR-035, NFR-006, NFR-012 |
| P00-D-DEMO | Temporary demo fallback and eventual retirement | FR-012, NFR-004, production readiness |

The existing demo fallback is to remain clearly labeled during early development and be retired from intended live operation after real database-backed authentication and three-role RBAC are established and verified, subject to the approved phase gates.

No permanent production demo dependency is authorized by this document.

## 6. Historical evidence register

| Evidence source | Role | Limitation |
|---|---|---|
| Original October 2026 SRS | Authoritative wording and page references | Does not establish implementation |
| Approved P00-D decisions | Approved project direction | Does not establish implementation |
| Phase 00 Audit Archive | Consolidated historical source inspections and risk findings | Secondary evidence, not fresh repository inspection |
| P00-E1B historical-report inspections | Historical documentation evidence | No current test execution |
| Accepted P00-E1C reconciliation | Analytical requirements mapping | Not runtime certification |
| P00-E3A documentation inventory | File/path discovery evidence | Not document-content verification |
| P00-E3B documentation inspection | AGENTS and README evidence | Not application verification |
| P00-E3D README correction report | Reported documentation changes | Not implementation verification |
| P00-E3E README acceptance | Content alignment review | Not operational compliance |

When a future authorized inspection establishes exact source paths and lines, add those references under a separately approved documentation update.

Do not invent source-code references from this historical evidence.

## 7. Priority findings and unresolved work

| Finding | Affected requirements | Verification needed |
|---|---|---|
| Separate Knowledge-Base Manager RBAC not established | FR-003, FR-024, FR-030, NFR-007 | Backend authorization tests |
| Approval inheritance for changed content | FR-007, FR-031, FR-034, NFR-012 | Exact-version approval tests |
| Incomplete mandatory manual-entry provenance | FR-029, FR-032 | Validation and negative-path tests |
| Pending content may be externally embedded | FR-027, FR-031, NFR-009 | Provider-call isolation and approval-gate tests |
| Citation grounding not demonstrated | FR-008, FR-010, NFR-005–NFR-006 | Claim-level evidence evaluation |
| Selected-period memoranda missing or incomplete | FR-018–FR-019 | Selected-week/period tests |
| Student concerns remain demo-only | FR-020–FR-023 | Real persistence, access, confirmation tests |
| MongoDB connectivity and durability unverified — Phase 01A is ongoing; a prior Atlas diagnostic returned `ECONNREFUSED`, its root cause remains unknown, and the updated configuration is owner-reported but unverified | FR-001, FR-022, FR-032, FR-035 | Redacted connection, persistence, restart-durability, and authorization evidence |
| Production authentication and recovery unverified | FR-001–FR-005, NFR-007 | End-to-end authentication tests |
| Security and deployment verification incomplete | NFR-004, NFR-008–NFR-010 | Security, device, recovery, and deployment checks |

These are historical findings and verification priorities. They do not authorize implementation or override the approved development sequence.

## 8. Future verification record

For each requirement, future evidence should record:

| Field | Purpose |
|---|---|
| Requirement ID | Exact FR/NFR identifier |
| SRS source | Original document page and section |
| Original wording | Unmodified SRS clause |
| Applicable decision | Approved change or clarification |
| Implementation reference | Verified code path or component |
| Historical evidence | Dated inspection or report |
| Current verification | Test or review result and environment |
| Open gap | Unresolved requirement or uncertainty |
| Next verification | Specific necessary evidence |
| Acceptance status | Explicit owner-reviewed outcome |

Do not mark implementation as complete solely because a code path or historical passing test is documented.

Current verification entries must identify the checkpoint date, environment, command or test actually executed, result, limitations, and supporting path or report. Historical test claims remain historical until rerun under authorization.

## 9. Completion and acceptance criteria

The requirements traceability document must:

1. Contain FR-001 through FR-036, each exactly once in its functional primary tables.
2. Contain NFR-001 through NFR-012, each exactly once in its non-functional primary table.
3. Preserve the exact original SRS wording and corresponding PDF page references.
4. Separate approved P00-D decisions from original requirements.
5. Attribute historical evidence correctly.
6. Avoid invented repository paths, test results, or implementation claims.
7. Clearly identify unverified behavior and unresolved conflicts.
8. Define future verification needs for every requirement.
9. Preserve original requirement identifiers.
10. Avoid asserting that all 48 requirements are operationally satisfied.

Document completeness does not establish application readiness.

## 10. Change control

The original traceability baseline was prepared under P00-E3G. This recovered file is now maintained as a living reference; recovery provenance does not by itself prove earlier acceptance.

Updates are triggered by an approved requirement clarification, decision, verified implementation change, executed test, accepted milestone, or corrected evidence classification. Every update must preserve the original SRS wording and IDs, identify its evidence, and synchronize material effects with `DECISIONS.md`, `CHANGE_REQUESTS.md`, `IMPLEMENTATION.md`, and `TESTING.md`.

ChatGPT or Codex may prepare authorized traceability updates. The project owner retains final authority over scope, requirement interpretation, architectural decisions, acceptance, and phase advancement. Completion means all 48 primary entries remain present, links and classifications are supportable, and no implementation or test status is overstated.

## Current implementation evidence — P01B-KNOWLEDGE-SOURCE-MANAGEMENT-01 (2026-11-20)

- FR-003 and FR-030 gain code/test evidence for a distinct backend-authorized `knowledge_manager` source workspace; Admin and Student accounts are denied manager-only routes.
- FR-031–FR-035 and NFR-012 gain partial evidence for creator-attributed source/version drafts, official supporting references, immutable version history, and a submission boundary that does not equal approval or publication.
- FR-007–FR-012 and FR-036 gain regression evidence that unapproved manager drafts create no chunks/embeddings and remain excluded from Student retrieval while existing approved content remains retrievable.
- Independent reviewer assignment, approval/rejection decisions, publication/index activation, live Atlas persistence, and rendered UI validation remain Not Yet Verified or not implemented. The legacy Admin ingestion path's pre-review processing remains a documented conflict with the approved pre-approval provider boundary.

