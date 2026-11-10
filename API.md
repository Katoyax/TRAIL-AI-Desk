# TRAIL AI Desk — Backend API and Interface Contracts

**Project:** TRAIL AI Desk  
**Institution:** University of Science and Technology of Southern Philippines (USTP), Cagayan de Oro Campus  
**Document status:** Active API-contract reference; current modernization pending owner acceptance  
**Phase 00 status:** Closed — **READY WITH DOCUMENTED LIMITATIONS**  
**Current phase:** Phase 01A — backend and MongoDB work ongoing; completion not established  
**Originally prepared:** November 4, 2026  
**Last updated:** November 8, 2026  
**Requirements baseline:** Original October 2026 SRS — FR-001–FR-036 and NFR-001–NFR-012  
**Decision baseline:** [DECISIONS.md](./DECISIONS.md)  
**Development roadmap:** [PROJECT_PLAN.md](./PROJECT_PLAN.md)  
**Implementation reference:** [IMPLEMENTATION.md](./IMPLEMENTATION.md)  
**Database reference:** [DATABASE.md](./DATABASE.md)  
**Workflow reference:** [APP_FLOW.md](./APP_FLOW.md)  
**Provenance:** Recovered from the P00-E4 clean backup and modernized under the current documentation checkpoint; recovery is not evidence of prior repository acceptance or operational success.

## 1. Purpose

This document defines the intended backend API responsibilities and conceptual interface contracts for TRAIL AI Desk.

Use it for approved API responsibilities, verified interface contracts when evidence exists, trust boundaries, and open contract decisions. Use [IMPLEMENTATION.md](./IMPLEMENTATION.md) for handler/code evidence, [DATABASE.md](./DATABASE.md) for persistence and MongoDB status, and [APP_FLOW.md](./APP_FLOW.md) for user-visible journeys.

It covers:

- Existing architecture evidence and verification limitations.
- Backend authentication and role-based authorization.
- Student-facing university information and chat.
- Institutional source submission, review, and version control.
- External AI and embedding eligibility restrictions.
- Official memorandum retrieval.
- Private student concerns.
- Administrative operations and auditability.
- Input validation, error handling, and response integrity.
- API security, privacy, and testing expectations.
- Open technical decisions and future contract documentation.

This is a controlled API reference, not a verified list of implemented routes.

It does not authorize backend inspection, endpoint creation, service integration, or repository changes.

## 2. API evidence classifications

The following classifications apply:

| Classification | Meaning |
|---|---|
| Historical evidence | Earlier inspections identified a relevant backend capability |
| Approved requirement | Functionality or restriction required by the SRS or accepted decisions |
| Conceptual contract | Required operation behavior without a fixed route or payload schema |
| Proposed implementation | A future technical option requiring approval |
| Not verified | The actual endpoint or integrated behavior has not been established |
| Verified operational | Current authorized tests confirm the behavior |

No endpoint path, HTTP method, request field name, response schema, authentication header, or error code is established as currently implemented by this document.

Future contract records must be based on authorized repository evidence and approved API design.

Phase 00 closed **READY WITH DOCUMENTED LIMITATIONS**. Phase 01A backend and MongoDB work is ongoing, but database-backed API operation remains unverified. Owner-reported configuration and diagnostic details are maintained in [DATABASE.md](./DATABASE.md#20-mongodb-inspection-and-verification-register), not duplicated here.

## 3. Historical backend architecture

Earlier evidence describes a backend using native Node.js HTTP handling.

Historical capabilities include:

- Authentication and account security.
- Password-recovery mechanisms.
- Institutional source registration and administration.
- Source extraction and ingestion.
- Chat and retrieval operations.
- Database-oriented persistence.
- External AI service integration.
- Error and demonstration behavior.

The exact current route handlers, authentication middleware, data contracts, and production service behavior remain unverified.

### Approved architectural direction

D-001 approves continued use of Node.js with incremental Express integration.

The intended API must preserve useful current services where appropriate.

This document does not presume Express is installed or that migration has started.

No wholesale backend replacement is authorized.

## 4. API architecture and trust boundaries

The conceptual architecture consists of:

1. Frontend application or authorized client.
2. Backend request handling.
3. Authentication and backend authorization.
4. Application business rules.
5. Database persistence.
6. Institutional knowledge-governance services.
7. Eligible retrieval and AI processing.
8. Appropriate audit and operational controls.

The backend—not the frontend—must enforce protected permissions and institutional approval rules.

### Trust boundaries

Untrusted client input must not independently determine:

- The user's effective role.
- Whether a source is officially approved.
- Whether an institutionally submitted version is eligible for retrieval.
- Whether pending content may be processed by an external AI provider.
- Whether a student concern has been officially acknowledged.
- Whether a privileged operation succeeded.

All relevant decisions require backend validation and authoritative persistent evidence.

## 5. Approved application roles and API access

**Decision:** D-002.

The three application roles are:

1. Student.
2. Admin.
3. Knowledge-Base Manager.

The university issuing office is an external institutional authority, not a fourth TRAIL role.

### Conceptual authorization matrix

| Capability | Student | Admin | Knowledge-Base Manager |
|---|---|---|---|
| Use authorized student information services | Permitted | Subject to approved policy | Subject to approved policy |
| Submit a private student concern | Permitted | Subject to approved policy | Subject to approved policy |
| Perform authorized system administration | Denied | Permitted where authorized | Not implicitly permitted |
| Submit institutional sources | Denied | Permitted | Permitted where authorized |
| Independently approve a source version | Denied | Denied under the approved manager-review model | Permitted only when eligible and not the submitter |
| Review eligible source history | Limited to permitted public information | Subject to authorized scope | Permitted where authorized |
| Change another user's privileged role | Denied | Requires an approved provisioning policy | Not implicitly permitted |

Entries marked "subject to approved policy" are unresolved permission details, not permissions granted by this document.

All authorization must be verified in the backend.

## 6. Conceptual API operation catalog

The following identifiers are planning references, not route names or existing endpoint IDs.

| Contract ID | Operation | Primary actor | Main obligation |
|---|---|---|---|
| AC-01 | Authenticate registered user | Registered user | Validate credentials and establish authorized session |
| AC-02 | Recover account access | Registered user | Secure controlled recovery |
| AC-03 | End authenticated session | Authenticated user | Revoke or terminate access appropriately |
| AC-04 | Retrieve available institutional information | Student | Return only eligible approved evidence |
| AC-05 | Submit university-related chat question | Student | Ground answers in approved evidence |
| AC-06 | Retrieve memoranda for a period | Student | Apply selected-period and Manila-time rules |
| AC-07 | Submit student concern | Student | Validate, persist privately, and confirm truthfully |
| AC-08 | Perform authorized administrative account action | Admin | Enforce approved provisioning and authorization policy |
| AC-09 | Register or submit official webpage | Admin or authorized KB Manager | Record source and provenance |
| AC-10 | Upload institutional document | Admin or authorized KB Manager | Validate and stage for review |
| AC-11 | Submit manual institutional information | Admin or authorized KB Manager | Require official provenance |
| AC-12 | View pending source versions | Authorized KB Manager | Expose review-eligible records only |
| AC-13 | Approve or reject exact source version | Independent KB Manager | Prevent self-approval and stale decisions |
| AC-14 | Check registered source for changes | Authorized management workflow | Stage changed versions for review |
| AC-15 | Inspect authorized source history | Authorized management role | Preserve version and decision traceability |
| AC-16 | Initiate or observe approved processing | Authorized internal service or management workflow | Enforce approval before external AI processing |
| AC-17 | Obtain permitted operational status | Authorized actor | Report real service condition without exposing secrets |

Each contract requires subsequent mapping to actual routes, implementation paths, request/response schemas, and tests.

Operations that are internal background functions are not necessarily public HTTP endpoints.

## 7. Authentication contracts

**Relevant requirements:** FR-001–FR-005; NFR-007–NFR-009.

### AC-01 — Authentication

**Conceptual input**

- Registered user's authentication credentials.
- Any additional approved authentication requirements.

**Required behavior**

1. Validate the submitted credentials.
2. Verify applicable account status.
3. Establish an authenticated identity.
4. Determine the user's backend-authoritative role.
5. Return an appropriate authenticated result or non-sensitive failure.

The precise credential fields, transport format, session mechanism, and account provisioning flow remain unapproved details.

**Failure conditions**

- Invalid credentials.
- Unauthorized or inactive account.
- Expired or invalid authentication state.
- Database or backend unavailability.
- Other appropriately protected authentication errors.

A database outage must not be misleadingly presented as invalid credentials.

### AC-02 — Password recovery

The conceptual contract must support secure account recovery and appropriate token or equivalent mechanism expiry, invalidation, and replay prevention.

The exact email or recovery-delivery integration requires later verification.

### AC-03 — Logout

The backend must support meaningful session termination or revocation consistent with the approved authentication architecture.

The frontend must not display protected information after the session ends.

### Verification

Later tests must cover valid and invalid credentials, session expiry, logout, revocation, and all three roles.

## 8. Authorization and account administration

**Relevant requirements:** FR-003, FR-024, FR-030; NFR-007.  
**Approved decision:** D-002.

Authorization must be based on authenticated identity and backend-controlled permissions.

### AC-08 — Administrative account action

Potential operations include approved account provisioning, role assignment, or other authorized administration.

The exact account-management capabilities must be explicitly specified before implementation.

### Mandatory controls

- Reject unauthenticated protected requests.
- Reject authenticated requests lacking the appropriate role or permission.
- Prevent client-supplied privilege escalation.
- Prevent ordinary Admin privileges from substituting for independent source approval.
- Protect privileged account provisioning.
- Record appropriate administrative actions where required.

The existence of an Admin user does not authorize unrestricted changes to all accounts or institutional records.

### Open details

- Account provisioning mechanism.
- Password-recovery administration.
- Role-change permissions.
- Session revocation behavior.
- Administrative audit requirements.

## 9. Student information retrieval contract

**Relevant requirements:** FR-007, FR-011, FR-013–FR-016, FR-036; NFR-005–NFR-006.

### AC-04 — Retrieve institutional information

**Conceptual input**

- An authorized information request or category.
- Relevant permitted filtering or search context.

**Required behavior**

1. Authenticate and authorize the request where applicable.
2. Retrieve only eligible approved institutional source versions.
3. Preserve relevant provenance and validity metadata.
4. Return suitable information and supporting references.
5. Clearly represent missing or insufficient approved coverage.

### Data restrictions

The response must not include:

- Confidential student records.
- Another user's private information.
- Pending or rejected institutional content.
- Withdrawn or superseded content that is no longer eligible.

Exact category identifiers, search parameters, pagination, and response fields remain open contract details.

## 10. RAG chat contract

**Relevant requirements:** FR-006–FR-012, FR-036; NFR-003–NFR-006.  
**Approved decision:** D-007.

### AC-05 — Submit chat question

**Conceptual input**

- Student's university-related question.
- Relevant authorized conversation context.
- Any appropriately validated request metadata.

**Required behavior**

1. Authenticate the requester and protect session isolation.
2. Validate the question and applicable limits.
3. Retrieve eligible approved institutional evidence.
4. Invoke authorized AI processing where configured and permitted.
5. Produce a response grounded in the retrieved material.
6. Associate factual institutional claims with substantively supporting evidence.
7. Return an answer, supported citations, and appropriate limitations.
8. Preserve appropriate context for future follow-up questions.

### Grounding requirements

A valid citation must substantively support the claim it accompanies.

The presence of a citation marker or official-looking source reference alone is insufficient.

### Insufficient evidence

If the approved knowledge base cannot support an answer, the API must represent that limitation without inventing an official statement.

### Provider failures

A failed provider or retrieval service must produce truthful failure handling, not fabricated successful output.

### Open contract details

- Exact conversation-context format.
- Message and response schemas.
- Citation representation.
- Streaming versus non-streaming behavior.
- Request limits.
- Retry and cancellation semantics.
- Accepted response-time targets.

## 11. Memorandum and announcement contract

**Relevant requirements:** FR-017–FR-019.  
**Approved decision:** D-008.

### AC-06 — Retrieve memoranda for a selected period

**Conceptual input**

- A supported reporting-period selection.
- Any approved date or category filters.

**Required behavior**

1. Validate the requested period.
2. Interpret period boundaries using Asia/Manila.
3. Select eligible approved memoranda relevant to that period.
4. Preserve the issuing office, relevant date, and official source.
5. Exclude content that is no longer eligible.
6. Return matching results or a truthful knowledge-base absence state.

### Required distinction

No matching approved records in TRAIL must not be reported as proof that the university issued no memoranda.

### Open details

- Current-week boundary convention.
- Additional supported periods.
- Handling of overlapping effective dates.
- Sorting and pagination.
- Exact date serialization.
- Supersession display and filtering rules.

These must be defined before final contract acceptance.

## 12. Student concern submission contract

**Relevant requirements:** FR-020–FR-023; NFR-009.  
**Approved decision:** D-009.

### AC-07 — Submit student concern

**Conceptual input**

- Authenticated Student identity.
- Required concern details established by future approved form design.
- Any approved submission-safety metadata.

**Required behavior**

1. Authenticate and authorize the Student.
2. Validate the required concern details.
3. Apply approved duplicate safeguards.
4. Store the concern in protected durable persistence.
5. Confirm the actual outcome of the storage operation.
6. Return only information the Student is authorized to see.

### Confirmation integrity

The response must distinguish:

- Validation or processing acceptance.
- Durable storage success.
- Official office acknowledgement.
- Official office resolution.

Durable storage in TRAIL does not automatically establish official office receipt.

### Privacy

The API must not expose another student's concern.

Concern text must not be inserted into public institutional RAG or disclosed to external providers without separate authorization and applicable safeguards.

### Failure and retry handling

A failed persistence operation must not produce a success confirmation.

Retry behavior must avoid misleading duplicate records or contradictory acknowledgements.

### Open details

- Exact required fields.
- Submission reference or tracking mechanism.
- Duplicate-detection policy.
- Office routing.
- Authorized staff access.
- Retention and deletion.
- Attachment support.
- Status-update ownership.

## 13. Institutional source submission contracts

**Relevant requirements:** FR-025–FR-029, FR-032; NFR-011.  
**Approved decisions:** D-003, D-004.

### AC-09 — Official webpage registration

An authorized Admin or Knowledge-Base Manager may submit an appropriate official webpage for review.

The backend must validate permitted source access, record relevant provenance, and stage the exact source content or version under applicable review requirements.

Submitting a URL does not itself establish that the source is officially published, currently accessible, or approved within TRAIL.

### AC-10 — Institutional document upload

An authorized submitter may upload an institutional document through an approved upload workflow.

The backend must apply:

- Authorization.
- File validation.
- Source and issuing-office provenance.
- Appropriate parsing and storage safeguards.
- Version-specific review eligibility.

The exact permitted formats, size limits, and upload transport contract are open details.

### AC-11 — Manual institutional entry

Every manual entry must include:

1. The originating university office.
2. An independent official supporting reference or verifiable official provenance.

Missing required provenance must prevent approval and retrieval.

### Shared submission outcome

Successful submission means a record has been accepted for the applicable workflow.

It must not be represented as independent Knowledge-Base Manager approval.

## 14. Independent knowledge review contract

**Relevant requirements:** FR-030–FR-035; NFR-007, NFR-012.  
**Approved decisions:** D-002, D-003, D-005, D-010.

### AC-12 — View pending versions

An eligible Knowledge-Base Manager must be able to inspect submitted versions, provenance, official references, and relevant review information.

Returned content must be limited to the reviewer's authorization.

### AC-13 — Approve or reject exact source version

**Conceptual input**

- Identity of the exact submitted version.
- An authorized review decision.
- Any later-approved required review metadata.

**Required behavior**

1. Authenticate the reviewer.
2. Establish Knowledge-Base Manager authorization.
3. Identify the exact submitted source version.
4. Verify required official provenance.
5. Verify that the version remains reviewable.
6. Verify the reviewer is not the submitter.
7. Record the decision and reviewer evidence.
8. Update eligibility consistently with the decision.
9. Return the actual persisted outcome.

### Mandatory denial scenarios

- Student attempts to approve.
- Admin attempts to substitute for the independent reviewer.
- Submitter attempts to approve their own version.
- Version has already changed or become stale.
- Required provenance is missing.
- Version is no longer reviewable.
- Storage or audit persistence fails.

An approval must never silently apply to a different version.

The exact concurrency mechanism and decision schema remain open implementation details.

## 15. Source change detection and version history

**Relevant requirements:** FR-031–FR-035, NFR-012.  
**Approved decisions:** D-005, D-010.

### AC-14 — Check for source changes

An authorized management workflow may check a registered source for changes.

If changed content is found:

1. Preserve the existing historical version.
2. Stage a distinct new version.
3. Associate the changed material with its source.
4. Require fresh independent review.
5. Prevent retrieval or external processing of the unapproved version.

An earlier approved version may remain eligible only while valid and not officially withdrawn or superseded.

### AC-15 — Inspect source history

Authorized users must have access appropriate to their role to relevant source history, reviewer decisions, and version status.

The response must not reveal more personal or administrative information than the actor is permitted to access.

### Open details

- Source-refresh scheduling.
- Change-detection algorithm.
- Version-identifier representation.
- History retention.
- Withdrawal and supersession operations.
- Pagination and audit-history query contracts.

## 16. External AI and ingestion eligibility contract

**Relevant requirements:** FR-007, FR-027, FR-031, FR-034, FR-036.  
**Approved decision:** D-006.

### AC-16 — Process approved institutional content

This conceptual contract may be implemented as an internal service operation, background job, or future approved management interface.

It must not automatically be treated as a public endpoint.

### Mandatory eligibility gate

Before transmitting institutional source content to external AI generation or embedding providers, the backend must establish that the exact relevant version has received the required approval and remains eligible.

Pending, rejected, or otherwise unapproved source content must not reach those providers.

### Required protections

- Version-specific approval verification.
- Separation of internal staging from external processing.
- Protection against stale approval state.
- Safe retries and background jobs.
- Appropriate provider secret protection.
- No accidental disclosure of private student concern records.
- Auditability of relevant processing outcomes.

An approval for one version must not authorize external processing of a different version.

The final API or internal worker boundary requires separate implementation design.

## 17. Operational status and service errors

**Relevant requirements:** FR-011–FR-012; NFR-003–NFR-004.

### AC-17 — Obtain permitted operational status

Where an operational status interface is approved, it should describe relevant service availability without exposing secrets or private infrastructure details.

Potential status concepts include:

- Backend availability.
- Database connectivity.
- External provider availability.
- Background-processing health.
- Recoverable service degradation.

Current documentation does not establish database availability. Any approved operational-status response must describe the supported service state without exposing infrastructure identifiers, credentials, private connection information, or speculative root-cause claims.

The existence of such an endpoint, its exposure level, and its exact payload remain open technical details.

### Error integrity

Errors must truthfully distinguish, where appropriate:

- Invalid input.
- Authentication failure.
- Authorization denial.
- Missing or ineligible records.
- Stale or conflicting operations.
- Database unavailability.
- External provider failure.
- Other internal processing failures.

Exact HTTP status codes, error identifiers, and response schemas require verification or later approved contract design.

Do not return sensitive stack traces, credentials, private database details, or protected source material to unauthorized clients.

## 18. Conceptual request validation and response rules

All external request-handling operations should apply suitable validation.

### Validation considerations

- Required inputs.
- Data type and length restrictions.
- Authorized values.
- File size and content type where uploads are supported.
- Safe handling of URLs.
- Appropriate date and time formats.
- Source identity and version integrity.
- Submission idempotency where required.
- User authorization.

### Response obligations

Responses should communicate:

- The actual outcome.
- Authorized and relevant information only.
- Appropriate error or limitation details.
- Reliable citation or provenance context where necessary.
- Consistent semantics for completed and pending operations.

An API must not claim successful database persistence or independent source approval merely because a request was accepted into an intermediate processing stage.

## 19. Security and privacy requirements

**Relevant requirements:** FR-003, FR-036; NFR-007–NFR-009.

Future implementation must address:

- Secure authentication.
- Backend-enforced RBAC.
- Appropriate session and recovery mechanisms.
- Credential and API-key protection.
- Sensitive-data minimization.
- Input and output validation.
- Request abuse prevention.
- Safe source fetching and SSRF protections.
- Confidential student concern access.
- Institutional approval enforcement.
- External-provider disclosure restrictions.
- Privacy-aware logs.
- Audit trails for privileged operations.

Exact security middleware, headers, token formats, rate limits, and deployment controls require later verification and approval.

This document does not assert that all security controls are currently implemented or that legal compliance has been certified.

## 20. Consistency, retries, and idempotency

The backend must handle interrupted and repeated operations without creating misleading results.

Examples include:

- Repeated login attempts.
- Concurrent approval decisions.
- Duplicate source submissions.
- Changed source versions during review.
- Provider retries.
- Background processing after withdrawal.
- Repeated student concern submission.
- Session revocation during a request.

The correct behavior must preserve authorization, exact-version identity, durable outcomes, and accurate response semantics.

The choice of idempotency keys, optimistic concurrency, transactions, request identifiers, or other mechanisms requires separately approved technical design.

## 21. API and database integration

The API must enforce business rules while the persistence layer maintains necessary integrity and durable evidence.

| Operation category | Corresponding persistence responsibility |
|---|---|
| Authentication | Identity, role, session, and recovery state |
| Source submission | Source, provenance, submitter, and exact version |
| Independent review | Reviewer, decision, version identity, and eligibility |
| Content processing | Approval gate and derived-material version association |
| Student retrieval | Eligible source content and citation metadata |
| Memoranda | Date, issuing office, source, and eligibility |
| Student concerns | Private durable submission and accurate outcome |
| Audit | Authorized action and decision history |

[DATABASE.md](./DATABASE.md) remains the conceptual data and persistence-evidence reference.

This API document does not approve a physical database schema.

## 22. Temporary demonstration behavior

**Relevant decision:** P00-D-DEMO.

During development, explicitly labeled demo functionality may remain while real services are established.

The API and frontend must not:

- Hide real database failures behind demo success.
- Treat simulated authentication as verified production authentication.
- Present simulated retrieval as approved institutional evidence.
- Present a local concern preview as durable backend submission.
- Make the final live application depend on demo fallback behavior.

Retirement of the temporary live-application demo fallback requires verified real database operation, authentication, and three-role backend RBAC, followed by a separately approved checkpoint.

Immediate demo removal is not authorized.

## 23. Future endpoint inventory template

Once repository inspection is separately authorized, actual API endpoints should be documented using the following structure.

Populate or revise this inventory only after authorized handler/route inspection or approved contract design provides exact evidence.

| Field | Required evidence |
|---|---|
| Contract ID | Applicable conceptual AC identifier |
| Requirement and decision IDs | Relevant SRS and approved decisions |
| Method and path | Exact observed HTTP method and route |
| Handler location | Verified source file and implementation reference |
| Authentication | Actual mechanism |
| Authorization | Actual server-side permission checks |
| Request contract | Verified inputs, validation, and constraints |
| Response contract | Verified success and failure structures |
| Database interaction | Relevant verified persistence behavior |
| External processing | Provider boundary and eligibility gate |
| Error behavior | Actual observed codes and messages |
| Tests | Test reference, result, environment, and date |
| Status | Historical, not verified, verified, or accepted |

No invented route may be inserted into this register as a current implementation fact.

## 24. API verification and acceptance

Future authorized testing should cover:

1. Real authentication with MongoDB-backed persistence.
2. All three backend-enforced application roles.
3. Unauthorized and unauthenticated request denial.
4. Appropriate account and session behavior.
5. Student information retrieval from eligible sources only.
6. RAG conversation context and citation grounding.
7. Selected-period memorandum retrieval using approved Manila-time boundaries.
8. Durable and private student concern submission.
9. Authorized institutional source registration and uploads.
10. Mandatory issuing-office and manual-entry provenance.
11. Independent Knowledge-Base Manager approval.
12. Self-approval denial.
13. Changed-version reapproval.
14. Pending-content exclusion from external AI processing.
15. Ineligible-source exclusion from retrieval and derived indexes.
16. Accurate API error and confirmation behavior.
17. Race-condition, retry, and duplicate-handling scenarios.
18. Privacy and provider data restrictions.
19. Network, database, and AI-provider failure handling.
20. Relevant audit completeness and persistence.

Historical passing-test counts are not current API acceptance evidence.

### Documentation acceptance criteria

`API.md` can be accepted as the maintained API reference when:

- Historical native Node.js architecture is represented accurately.
- Incremental Express integration is described as approved future direction.
- No invented current routes, schemas, or test results are introduced.
- The three-role authorization model is preserved.
- Source submission and independent approval remain distinct.
- Manual provenance and exact-version review rules are explicit.
- Changed content requires renewed approval.
- Pending content is prohibited from external AI processing.
- RAG citation requirements are preserved.
- Memoranda and concern workflows retain their approved semantics.
- API errors and success states remain truthful.
- Unresolved technical contracts are clearly labeled.
- The document aligns with [DATABASE.md](./DATABASE.md), [IMPLEMENTATION.md](./IMPLEMENTATION.md), [APP_FLOW.md](./APP_FLOW.md), and existing approved records.
- Its Markdown structure is verified.
- The project owner accepts the documentation.

## 25. Open API implementation decisions

The following remain unresolved:

| Area | Open detail |
|---|---|
| Current backend | Exact entry point, handlers, and route inventory |
| Express integration | Incremental migration sequence and compatibility |
| Authentication | Credential, token, recovery, and session contracts |
| RBAC | Permission policy and privileged provisioning |
| API format | Exact endpoint paths, methods, and serialization |
| Source ingestion | Upload formats, limits, processing, and safety |
| Knowledge review | Decision request/response schema and concurrency control |
| External AI | Internal processing contract and provider handling |
| RAG | Context structure, streaming, citation and evidence representation |
| Memoranda | Period parameters, date rules, and result structure |
| Concerns | Input schema, idempotency, receipt, and office workflow |
| Errors | Response envelope, identifiers, and HTTP mappings |
| Operations | Health checks, background jobs, logging, and monitoring |
| Testing | Current automated test mapping and integration evidence |
| Deployment | Base URL, transport, credential management, versioning, and release process |

None of these unresolved choices is silently decided by this document.

## 26. Maintenance and project authority

API documentation must be updated using the project's approval-controlled workflow.

Future revisions should:

1. Identify the authorized checkpoint.
2. Record verified route and handler evidence.
3. Preserve original requirement and decision references.
4. Explain proposed or observed contract changes.
5. Assess security, privacy, and compatibility effects.
6. Synchronize affected database, workflow, implementation, and testing documents.
7. Report tests and verification limits accurately.
8. Obtain required owner approval.

Update this document when authorized evidence changes a route, handler, request/response contract, authentication or RBAC rule, persistence/provider integration, error behavior, compatibility obligation, approved API decision, or current test result. Synchronize security implications with [SECURITY_PRIVACY.md](./SECURITY_PRIVACY.md), verification with [TESTING.md](./TESTING.md), confirmed failures with [BUGS.md](./BUGS.md), and lifecycle impact with [PROJECT_PLAN.md](./PROJECT_PLAN.md).

The project owner retains final authority over API design, implementation, repository operations, and phase advancement.

ChatGPT may assist with planning, drafting, and evidence review.

Codex may inspect or modify the local repository only under explicit, bounded authorization.

Preparation or acceptance of this document authorizes no work by itself. Phase 01A backend changes, database troubleshooting, and API execution must remain within an explicit owner-authorized scope; one approved execution batch may cover all listed files and checks.

