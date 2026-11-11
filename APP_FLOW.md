# TRAIL AI Desk — Application Flows and Navigation

**Project:** TRAIL AI Desk  
**Institution:** University of Science and Technology of Southern Philippines (USTP), Cagayan de Oro Campus  
**Document status:** Active behavioral-flow reference; current modernization pending owner acceptance  
**Phase 00 status:** Closed — **READY WITH DOCUMENTED LIMITATIONS**  
**Current phase:** Phase 01A — backend and MongoDB work ongoing; completion not established  
**Originally prepared:** November 4, 2026  
**Last updated:** November 8, 2026  
**Requirements baseline:** Original October 2026 SRS — FR-001–FR-036 and NFR-001–NFR-012  
**Decision baseline:** [DECISIONS.md](./DECISIONS.md)  
**Roadmap:** [PROJECT_PLAN.md](./PROJECT_PLAN.md)  
**Implementation reference:** [IMPLEMENTATION.md](./IMPLEMENTATION.md)  
**Related design document:** [DESIGN.md](./DESIGN.md)  
**Provenance:** Recovered from the P00-E4 clean backup and modernized under the current documentation checkpoint; recovery is not evidence of prior repository acceptance or operational success.

## 1. Purpose

This document defines the intended application flows and navigation behavior for TRAIL AI Desk.

Use it as the behavioral and authorization-boundary reference for user journeys. Visual presentation belongs in [DESIGN.md](./DESIGN.md), backend contracts in [API.md](./API.md), persistence obligations in [DATABASE.md](./DATABASE.md), and implementation evidence in [IMPLEMENTATION.md](./IMPLEMENTATION.md).

Its purpose is to:

- Describe how students, Admins, and Knowledge-Base Managers interact with the application.
- Preserve the original functional requirements and approved project decisions.
- Distinguish historical interface evidence from target workflows.
- Identify server-enforced authorization and institutional approval boundaries.
- Specify appropriate loading, empty, error, and confirmation behavior.
- Identify unresolved navigation and workflow decisions.
- Provide a foundation for future interface design, implementation, and acceptance testing.

This document is a controlled behavioral reference. It is not a verified map of current source-code routes or existing screens.

## 2. Sources and evidence status

Phase 00 closed **READY WITH DOCUMENTED LIMITATIONS**. Phase 01A backend and MongoDB work is ongoing, but database-backed flows remain unverified until accepted backend and persistence evidence exists. This lifecycle statement changes dependency status, not the approved meaning of the flows below.

The primary references are:

1. Original October 2026 SRS.
2. `REQUIREMENTS_TRACEABILITY.md`.
3. Approved P00-D records in `DECISIONS.md`.
4. Current [PROJECT_PLAN.md](./PROJECT_PLAN.md), subject to its stated acceptance status.
5. Current [IMPLEMENTATION.md](./IMPLEMENTATION.md), subject to its stated acceptance status.
6. Prior authorized Phase 00 historical inspection reports.

The following distinctions apply:

| Status | Meaning |
|---|---|
| Historical evidence | A previous authorized inspection described the behavior or interface |
| Approved requirement | The SRS or a later owner-approved decision requires the behavior |
| Proposed presentation | A suggested UI organization or interaction not yet specifically approved |
| Not verified | Current end-to-end behavior has not been demonstrated |
| Verified operational | Appropriate current execution evidence establishes the behavior |

Historical evidence describes an Expo/React Native application with authentication, a student dashboard, chat interactions, category browsing, administrative screens, and a local concern demonstration.

The current navigation tree, route filenames, screen completeness, and operational integrations remain unverified.

No exact Expo Router pathname, navigation stack, screen component, or API endpoint is asserted here.

## 3. Actors and application boundaries

TRAIL AI Desk has exactly three approved application roles.

| Role | Intended purpose | Critical restriction |
|---|---|---|
| Student | Access approved university information, chat, memoranda, and concern submission | Cannot perform protected institutional management or review operations |
| Admin | Perform authorized system administration and institutional content submission | Cannot substitute for independent Knowledge-Base Manager review |
| Knowledge-Base Manager | Submit eligible information where authorized and independently review institutional content | Cannot approve a version submitted by the same user |

The issuing university office is the originator and official approver/publisher of institutional information. It is not a fourth TRAIL application role and does not need a TRAIL login solely for this governance function.

Backend authorization must protect every restricted operation. Navigation visibility alone is insufficient.

## 4. Overall application flow

The conceptual entry sequence is:

1. The user opens TRAIL AI Desk.
2. The application establishes whether a valid authenticated session exists.
3. If no valid session exists, the user receives an appropriate authentication entry point.
4. If authentication succeeds, the backend establishes the user's authorized role.
5. The application presents appropriate navigation and available actions for that role.
6. Protected requests remain subject to backend authorization.
7. A session that expires, is revoked, or becomes invalid must not retain access to protected functionality.
8. Logout ends the authenticated experience and removes access to protected screens and data.

The final screen hierarchy, navigation labels, deep-link behavior, and exact redirect rules require subsequent design and implementation validation.

No role should be inferred from an untrusted frontend preference or silently defaulted to Student after an authorization failure.

## 5. Authentication and account flows

### 5.1 Login

**Relevant requirements:** FR-001, FR-003, FR-004, FR-005; NFR-007.

**Approved target sequence**

1. A registered user enters valid credentials.
2. The frontend submits credentials to the approved backend authentication service.
3. The backend validates the credentials and applicable account status.
4. The backend establishes an authenticated session and authorized role.
5. The interface shows only role-appropriate navigation.
6. Protected backend actions independently verify authorization.

**Failure and exception handling**

- Invalid credentials produce a clear, non-sensitive error.
- Network or database failure must not be presented as an incorrect password without evidence.
- An expired session requires appropriate reauthentication.
- An unknown or unauthorized role must not receive privileged access.
- Duplicate login submissions should not create contradictory UI states.

**Evidence status:** Historical authentication and frontend navigation paths exist; live database-backed authentication and three-role enforcement are unverified.

#### Current UI-only staff entry

**Status:** UI IMPLEMENTED — AUTHENTICATION NOT INTEGRATED

The public `/` Student Login and `/staff-login` Staff Login provide two-way in-app navigation. The Staff Login presents the shared Admin and Knowledge-Base Manager credential interface, but its Sign In control is disabled and performs no authentication, API request, session creation, role resolution, or privileged navigation.

This is source-level presentation and navigation evidence only. The local web preview was not available during this checkpoint because no active Node.js version was configured, so rendered navigation remains unverified. This implementation does not establish the approved login sequence, backend role enforcement, or operational Admin or Knowledge-Base Manager access.

### 5.2 Password recovery

**Relevant requirements:** FR-002, NFR-007.

The target includes:

1. A registered user requests password recovery.
2. The backend validates the request and applies appropriate privacy safeguards.
3. The user follows the authorized recovery mechanism.
4. The backend enforces token or equivalent recovery validity, expiry, and reuse prevention.
5. The user receives an accurate completion or failure message.

The exact recovery delivery method and screens require current verification and approved technical design.

The interface must not expose sensitive account information unnecessarily.

### 5.3 Logout and session expiry

**Relevant requirements:** FR-005, NFR-007.

The target behavior includes:

- A discoverable logout action for authenticated users.
- Appropriate session invalidation.
- Removal of access to role-protected information.
- Prevention of stale responses reappearing as authenticated content after logout.
- Clear recovery when a session expires during a workflow.

Current logout and invalidation behavior requires integrated verification.

## 6. Student dashboard and information navigation

**Relevant requirements:** FR-004, FR-013–FR-016; NFR-001–NFR-002.

### Target sequence

1. The authenticated Student enters the student-facing application.
2. The dashboard presents understandable navigation to available information and services.
3. The student chooses an information category or feature.
4. The application retrieves or displays eligible approved institutional information.
5. Relevant source details are presented where needed.
6. The student can navigate back or change topics without losing appropriate context.

Potential categories include the SRS subjects of enrollment, academic calendars, documentary requirements, university offices, public contacts, services, policies, and procedures.

The final category taxonomy, labels, hierarchy, and visual arrangement are not yet approved.

### Information coverage

An available interface does not prove that the required institutional content has been approved and ingested.

Where approved information is missing, the application must communicate its knowledge-base limitations rather than fabricate an answer.

Private student records, grades, schedules, financial balances, or protected records from other university systems remain outside the authorized scope.

## 7. Student AI chat flow

**Relevant requirements:** FR-006–FR-012, FR-036; NFR-003–NFR-006, NFR-009.

**Approved target sequence**

1. The Student enters the chat interface.
2. The Student submits a university-related question.
3. The interface displays an appropriate processing state.
4. The backend authenticates the relevant request and retrieves eligible institutional evidence.
5. The backend uses appropriate authorized AI processing where configured.
6. The response is grounded in approved source passages.
7. The interface displays the answer and substantively supporting citations.
8. The Student may ask a follow-up question with relevant permitted conversation context.

### Evidence and citations

The system must not:

- Retrieve pending, rejected, withdrawn, or otherwise ineligible institutional versions.
- Present unsupported claims as verified university information.
- Treat a citation marker alone as proof of factual accuracy.
- Reveal another user's conversation or private information.

A citation presentation should allow a student to understand which official evidence supports the relevant claim. Exact citation components require future design approval.

### Insufficient evidence

If the knowledge base lacks sufficient approved information:

1. The system communicates the limitation clearly.
2. It avoids inventing an official answer.
3. It may present appropriate available source information or a neutral next step, without falsely claiming coverage.

### Provider or retrieval failure

The interface should show a truthful service error and appropriate retry behavior.

A failed real backend request must not silently switch to simulated successful retrieval.

## 8. Official memoranda and announcements flow

**Relevant requirements:** FR-017–FR-019; D-008.

### Target sequence

1. The Student opens the memoranda or announcements feature.
2. The interface presents approved information and an understandable reporting-period selection mechanism.
3. The Student selects a period, including support for the current week.
4. The system interprets the period using the approved Asia/Manila boundaries.
5. Eligible memoranda are filtered using applicable publication, effective, or reporting dates.
6. Matching records are displayed with the issuing office, relevant date, and official source.
7. The Student may inspect the supporting details.

### No-results state

When no approved memoranda are found for the selected period, the application must state that **no matching approved records are available in the TRAIL knowledge base**.

It must not assert that the university issued no memoranda.

### Open design details

- Exact beginning and ending of the current week.
- Additional selectable periods.
- Whether results use list, card, or another presentation.
- Date sort order.
- Treatment and display of superseded or withdrawn memoranda.

These decisions require later approval.

## 9. Student concern submission flow

**Relevant requirements:** FR-020–FR-023; D-009; NFR-009.

### Target sequence

1. The authenticated Student opens the concern-submission feature.
2. The interface explains the purpose and required information.
3. The Student completes the form.
4. Frontend validation identifies missing or invalid entries.
5. Backend validation independently checks the submission.
6. The backend stores the concern privately and durably.
7. The system returns the actual outcome.
8. The interface displays a truthful submission confirmation or failure message.

### Confirmation boundary

The following events must remain conceptually distinct:

- The application accepted a submission.
- The concern was durably saved.
- An authorized university office acknowledged the concern.
- An authorized university office resolved the concern.

The interface must not label a saved concern as officially received or resolved without an authorized workflow supporting that claim.

The exact concern fields, attachment support, office routing, acknowledgement procedures, and retention durations require later specification.

### Privacy and duplicate handling

- Concerns must not enter public knowledge retrieval.
- Students must not access other students' concern records.
- Only authorized users may access protected concern information.
- Retry or duplicate-submission behavior must not create misleading confirmations.
- A failed save must not be displayed as successful.

### Current status

Historical evidence supports a local demonstration preview, not verified durable submission.

## 10. Admin application flow

**Relevant requirements:** FR-003, FR-024–FR-035; NFR-007, NFR-011–NFR-012.

The Admin must authenticate under the distinct Admin role.

Proposed Admin-facing workflows include:

- Appropriate application administration.
- Authorized user/account management.
- Institutional source registration.
- Official webpage submission.
- Document upload.
- Manual institutional entry submission.
- Viewing permitted source status and operational information.

The exact Admin navigation, account-management permissions, and operational dashboards are still open implementation/design details.

Admin submission of institutional content does not replace independent Knowledge-Base Manager approval.

Any previous Admin-oriented interface that allows direct approval must be reconciled with the newer approved separation-of-duties model.

## 11. Knowledge-Base Manager application flow

**Relevant requirements:** FR-003, FR-024, FR-030–FR-035; D-002–D-006, D-010.

The Knowledge-Base Manager must authenticate using a separately enforced role.

### Independent review sequence

1. The manager opens an authorized source-review workflow.
2. Pending submissions are displayed with relevant provenance and version information.
3. The manager selects a specific submitted version.
4. The interface presents the exact submitted material and associated official references.
5. The backend verifies that the reviewer is authorized and is not the submitter of that version.
6. The manager chooses an authorized approval or rejection action.
7. The backend records the decision, reviewer identity, exact version, and relevant history.
8. The interface displays the actual resulting state.

### Required safeguards

- A submitter must not approve their own submitted version.
- Missing mandatory provenance must prevent approval.
- A changed version must undergo fresh approval.
- An approval decision must apply to the exact reviewed version.
- Unauthorized or stale review attempts must not silently succeed.

The final screen names, review controls, comments, and rejection-reason requirements are open design details.

A Knowledge-Base Manager may submit content where authorized, but another eligible manager must conduct the independent review.

## 12. Institutional source submission and approval lifecycle

**Relevant requirements:** FR-025–FR-035; D-003–D-006, D-010.

### 12.1 Official provenance

Before TRAIL can publish institutional information for student retrieval:

1. The issuing university office officially approves and publishes the information.
2. An authorized Admin or Knowledge-Base Manager submits the source.
3. TRAIL records the exact submitted content version and provenance.
4. An independent Knowledge-Base Manager reviews that version.
5. Only an approved and otherwise eligible version becomes available for processing and retrieval.

### 12.2 Submission channels

The SRS identifies:

- Registered official university webpages.
- Institutional document uploads.
- Manual entries or updates based on relevant university offices.

Manual entries require both an issuing office and an independent official supporting reference.

### 12.3 Pending-content processing

While a version is pending or otherwise unapproved:

- It is not eligible for student-facing retrieval.
- It must not be transmitted to external AI generation or embedding providers.
- Any internal parsing or staging must preserve this restriction.

After appropriate approval, the version may become eligible for authorized downstream processing.

### 12.4 Changed sources

When a registered source changes:

1. The system detects or receives the changed material.
2. It creates or identifies a distinct new version.
3. The new version remains pending.
4. It receives a fresh independent review.
5. Only after the required approval may it become eligible.

An earlier approved version may remain eligible during review only if it is still valid and has not been officially withdrawn or superseded.

### 12.5 Rejection, withdrawal, and supersession

The interface must accurately represent source eligibility and decision history.

Rejected or withdrawn material must not remain student-retrievable through stale indexes, cached results, or inappropriate fallback behavior.

Detailed database states and transition names remain unapproved technical design details.

## 13. Loading, empty, error, and recovery flows

Every significant user journey should consider:

| Situation | Required user-facing behavior |
|---|---|
| Request in progress | Display an understandable processing state |
| Empty approved dataset | Explain that available approved records do not match the request |
| Invalid form fields | Identify correctable input problems |
| Authentication rejected | Deny entry with appropriate feedback |
| Session expired | Protect private data and require appropriate recovery |
| Forbidden operation | Deny action; backend remains authoritative |
| MongoDB unavailable | Show a truthful backend-service limitation |
| AI provider unavailable | Explain processing failure without inventing an answer |
| Network interruption | Permit an appropriate safe retry |
| Duplicate submission | Avoid misleading success or duplicate durable records |
| Stale review/version | Prevent approval of a version other than the one reviewed |
| Source withdrawn | Prevent display as currently approved institutional evidence |

Exact text and visual error components belong in the approved design specification.

## 14. Demonstration behavior

**Relevant decision:** P00-D-DEMO.

Historically documented demo functionality may remain during early development when clearly labeled.

The interface must distinguish:

- Simulated or local demonstration data.
- Real authenticated services.
- Real approved institutional information.
- Real saved student concerns.

Demo operation must not silently hide a production service failure.

The temporary demo fallback is intended to be retired from the live application after real MongoDB-backed operation, authentication, and all three backend roles are verified, subject to separately approved work.

No immediate demo removal is authorized.

Current backend and persistence limitations should be read from [IMPLEMENTATION.md](./IMPLEMENTATION.md) and [DATABASE.md](./DATABASE.md). This flow document intentionally does not duplicate private infrastructure details.

## 15. Navigation and interaction principles

These principles guide the proposed application flow without committing to an unapproved visual layout:

- Navigation must be clear and understandable.
- Each role should see actions appropriate to that role.
- Protected information must remain server-protected.
- Users should know when an action is pending, completed, rejected, or unavailable.
- Forms should provide clear validation and recovery paths.
- Citations should lead users to relevant supporting evidence.
- Critical confirmation messages should accurately represent backend results.
- Sensitive information should not remain visible after unauthorized access or session termination.
- Existing frontend routes must be inspected before exact paths are documented.

These principles support NFR-001–NFR-004 and applicable functional requirements.

## 16. Flow-to-requirement register

The following identifiers are local planning references, not new SRS requirement IDs or approved code route names.

| Flow ID | Target flow | Primary requirements |
|---|---|---|
| AF-01 | Login and role-based entry | FR-001, FR-003, FR-004, NFR-007 |
| AF-02 | Password recovery | FR-002, NFR-007 |
| AF-03 | Logout and session expiry | FR-005, NFR-007 |
| AF-04 | Student dashboard and information categories | FR-004, FR-013–FR-016 |
| AF-05 | Evidence-grounded chat | FR-006–FR-012, FR-036 |
| AF-06 | Selected-period memoranda | FR-017–FR-019 |
| AF-07 | Private student concerns | FR-020–FR-023 |
| AF-08 | Admin protected functions | FR-003, FR-024–FR-029 |
| AF-09 | Institutional source submission | FR-025–FR-029 |
| AF-10 | Independent Knowledge-Base Manager review | FR-030–FR-032 |
| AF-11 | Change detection, versions, and audit history | FR-033–FR-035 |
| AF-12 | Error, loading, and recovery behavior | FR-011–FR-012, NFR-003–NFR-004 |
| AF-13 | Temporary explicit demo behavior | FR-012, NFR-004; P00-D-DEMO |

Security, privacy, accessibility, and source-governance obligations apply across multiple flows.

## 17. Open navigation and workflow decisions

The following are not approved implementation details:

| Area | Open question |
|---|---|
| Entry navigation | Exact authentication and role landing screens |
| Student navigation | Tab, sidebar, stack, or other layout |
| Knowledge navigation | Final institutional category hierarchy |
| Chat | History display, citation interaction, and session controls |
| Memoranda | Period options, week boundaries, and sort order |
| Concerns | Exact fields, receipt presentation, and routing |
| Admin | Exact account and source-management actions |
| KB Manager | Review-screen layout, rejection reasons, and review notes |
| Responsive design | Approved device-specific navigation behavior |
| Session handling | Exact redirect and recovery states |
| Accessibility | Approved testing criteria and interaction details |

The application implementation or future approved design may resolve these items. This document does not decide them implicitly.

## 18. Verification and acceptance

Accepting this document means its behavioral descriptions, role boundaries, evidence labels, and requirement mappings are accurate. It does not establish that a route, screen, database write, provider call, or end-to-end journey currently works.

Before these flows are described as operational, later authorized tests should establish:

1. End-to-end authentication and session handling.
2. Backend authorization for all three approved roles.
3. Correct student dashboard and navigation behavior.
4. Retrieval exclusively from eligible approved source versions.
5. Substantive claim-level citation support.
6. Accurate insufficient-evidence responses.
7. Selected-period memorandum behavior and Manila-time boundaries.
8. Private, durable concern submission.
9. Independent Knowledge-Base Manager review and denial of self-approval.
10. New approval for changed source versions.
11. No external AI or embedding processing of pending content.
12. Accurate errors during backend, database, and provider failures.
13. Clear separation of demo and real-service behavior.
14. Appropriate usability, accessibility, and supported-device behavior.
15. Traceability to original SRS requirements and applicable approved decisions.

Historical implementation reports and historical passing-test totals are insufficient as current acceptance evidence.

## 19. Documentation updates and project authority

Future revisions must be supported by approved design decisions, authorized repository inspection, or current test evidence.

Update this document when an approved workflow, role boundary, navigation decision, API contract, persistence outcome, error/empty state, or current journey test changes the supported behavior. Synchronize affected details with [DESIGN.md](./DESIGN.md), [API.md](./API.md), [DATABASE.md](./DATABASE.md), [IMPLEMENTATION.md](./IMPLEMENTATION.md), [SECURITY_PRIVACY.md](./SECURITY_PRIVACY.md), and [TESTING.md](./TESTING.md) without duplicating their evidence registers.

When exact screens and routes are verified, the document may be expanded with:

- Navigation hierarchy.
- Actual route and component references.
- Role-to-route authorization mapping.
- Screen-state and interaction diagrams.
- Test evidence for each user journey.

Do not replace original requirements with inferred interface behavior.

`DESIGN.md` should specify how accepted flows are presented visually; `APP_FLOW.md` remains the reference for their behavior and authorization boundaries.

The project owner retains authority over scope, design, implementation, repository actions, acceptance, and phase advancement.

Preparation or acceptance of this document authorizes no work by itself. Phase 01A commands, inspections, edits, and database operations must remain within an explicit owner-authorized scope; an approved coordinated batch may cover its internal files and checks.

