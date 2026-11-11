# TRAIL AI Desk — Security, Privacy, and Reliability Reference

**Project:** TRAIL AI Desk  
**Institution:** University of Science and Technology of Southern Philippines (USTP), Cagayan de Oro Campus  
**Document status:** Active foundational reference — recovered from the P00-E4 historical backup and modernized November 8, 2026  
**Project status:** Phase 00 closed — **READY WITH DOCUMENTED LIMITATIONS**; Phase 01A ongoing  
**Historical draft prepared:** November 4, 2026  
**Requirements baseline:** Original October 2026 SRS — FR-001–FR-036 and NFR-001–NFR-012  
**Decision baseline:** Approved D-001–D-010 and P00-D-DEMO in `DECISIONS.md`  
**Development roadmap:** `PROJECT_PLAN.md`  
**Implementation reference:** `IMPLEMENTATION.md`  
**Database reference:** `DATABASE.md`  
**API reference:** `API.md`  
**Workflow reference:** `APP_FLOW.md`  
**Knowledge reference:** `RAG_KNOWLEDGE_BASE.md`  
**Testing reference:** `TESTING.md`  
**Defect reference:** `BUGS.md`  
**Change control:** `DECISIONS.md` and `CHANGE_REQUESTS.md`

## 1. Purpose and scope

This document establishes the security, privacy, and reliability obligations for TRAIL AI Desk.

It addresses:

- User authentication and session protection.
- Backend-enforced authorization.
- Exactly three distinct application roles.
- Institutional source submission and independent approval.
- Sensitive-data separation and privacy.
- Protection of student concern submissions.
- External AI and embedding-provider disclosure boundaries.
- Secure source retrieval and document processing.
- RAG retrieval and prompt-injection risks.
- Database and API security.
- Credential and secret management.
- Audit history, retention, and operational monitoring.
- Failure handling, backup, recovery, and security testing.
- Open design decisions and acceptance criteria.

This document does not claim that all controls are already implemented or legally certified.

It does not authorize a security scan, code modification, repository inspection, database operation, or production configuration change.

### Development use and maintenance

Consult this document for authentication, backend authorization, role separation, database and API protection, institutional knowledge governance, external-provider use, student concerns, retention, deployment, or incident-related work. It is authoritative for approved security and privacy obligations; detailed implementation, contracts, persistence, RAG rules, and test evidence belong in their respective foundational documents.

Update it when an approved control, data classification, trust boundary, dependency, retention rule, incident finding, or authorized verification result changes. A control may be described as operational only when current inspected implementation and relevant authorized evidence support that claim. Historical reports and intended configuration are not operational proof.

Codex may prepare synchronized documentation within an approved checkpoint. The project owner approves security decisions, accepted residual risks, phase changes, and production-readiness claims. This reference remains acceptable when required safeguards and open risks are explicit, related documents agree, secrets stay excluded, and verification limitations remain visible.

## 2. Authoritative requirements and evidence

The governing references are:

1. Original October 2026 SRS.
2. `REQUIREMENTS_TRACEABILITY.md`.
3. Approved `DECISIONS.md`.
4. `PROJECT_PLAN.md`.
5. `IMPLEMENTATION.md`.
6. `DATABASE.md`.
7. `API.md`.
8. `APP_FLOW.md`.
9. `RAG_KNOWLEDGE_BASE.md`.
10. `TESTING.md`.
11. `BUGS.md`.
12. `CHANGE_REQUESTS.md`.
13. Relevant authorized historical project reports.

### Evidence classifications

| Classification | Meaning |
|---|---|
| Historical evidence | Earlier authorized inspection described a security-related mechanism |
| Approved requirement | Required by the original SRS or an approved project decision |
| Proposed safeguard | A possible technical protection requiring later design approval |
| Not verified | Current operational security evidence is insufficient |
| Verified operational | A control was demonstrated through appropriate current evidence |
| Accepted | The owner explicitly accepted the related result or checkpoint |

A security mechanism mentioned in historical reports must not be treated as currently verified without new evidence.

## 3. Security and privacy development principles

Security and privacy apply across the entire project.

They must be considered during:

- Phase 01 infrastructure and database work.
- Phase 02 authentication and RBAC.
- Phase 03 institutional knowledge governance.
- Phase 04 RAG and citations.
- Phase 05 student workflows.
- Phase 06 administrative interfaces.
- Phase 07 security and reliability hardening.
- Phases 08–09 testing, deployment, and maintenance.

Phase 07 provides a planned hardening and verification focus. It does not permit earlier phases to omit necessary protections.

### Governing principles

- Authentication before protected access.
- Server-side authorization.
- Least-privilege access consistent with approved roles.
- Data minimization.
- Separation of public institutional and private student information.
- Exact-version institutional approval.
- Protection against unauthorized external disclosure.
- Truthful error and confirmation behavior.
- Traceable administrative decisions.
- Explicit verification before operational acceptance.

The specific technical mechanisms require subsequent approval and evidence.

## 4. Protected assets and trust boundaries

The intended architecture contains several protected asset categories.

| Asset or boundary | Protection objective |
|---|---|
| User credentials | Prevent unauthorized disclosure or use |
| Authentication sessions | Prevent unauthorized or stale access |
| Role assignments | Prevent privilege escalation |
| Institutional source submissions | Preserve provenance and exact submitted content |
| Review decisions | Preserve independent reviewer identity and decision integrity |
| Source versions | Prevent approval inheritance and unauthorized substitution |
| Retrieval indexes | Prevent exposure of ineligible information |
| External AI requests | Restrict disclosure to eligible and permitted material |
| Student concerns | Protect private content and truthful status |
| Database credentials | Restrict database access |
| API and provider secrets | Prevent exposure through frontend code and logs |
| Audit records | Preserve integrity and authorized access |
| Backups and operational logs | Prevent secondary data leakage |

### Trust-boundary principle

The backend must not treat an untrusted client, uploaded document, external webpage, or AI model response as an authority to override authentication, authorization, governance, or privacy rules.

Exact deployment boundaries and network arrangements remain unverified.

## 5. Information categories and data separation

The system handles information with different access expectations.

### 5.1 Public institutional information

Official university information may become available to students through TRAIL only when its applicable source version is approved and otherwise eligible.

Public availability alone does not eliminate the required Knowledge-Base Manager review.

### 5.2 Pending institutional information

Submitted information that has not completed review remains protected by the approved eligibility restrictions.

Pending content must not enter student-facing retrieval or external AI-generation and embedding processing.

### 5.3 Account and authentication information

Credentials, recovery data, role assignments, and protected session information require appropriate restricted handling.

### 5.4 Private student concerns

Concern text, associated identities, and sensitive submission details require protected storage and authorized access.

They are not public institutional knowledge.

### 5.5 Confidential university student records

The SRS prohibits student-facing retrieval of confidential student records and modification of official university records.

TRAIL must not assume unrestricted access to university systems containing protected student information.

No integration with a student information system or confidential university database is authorized by this document.

### Open classification details

Precise institutional data-classification labels, handling policies, and retention schedules require later approval.

## 6. Threat and risk considerations

A later formal threat assessment should evaluate the application against relevant misuse and failure scenarios.

| Threat area | Illustrative risk |
|---|---|
| Authentication | Credential abuse and unauthorized login |
| Authorization | Student or Admin bypass of protected manager functions |
| Review integrity | Self-approval or approval of an incorrect content version |
| Source provenance | Forged or unsupported official information |
| Ingestion | Unsafe URLs, redirects, or malicious documents |
| Prompt injection | Source text attempts to control the assistant or leak protected data |
| External providers | Transmission of pending or private information |
| RAG retrieval | Exposure of unapproved, stale, or confidential content |
| Student concerns | Unauthorized reads or misleading submission confirmations |
| Secrets | API keys or database credentials exposed |
| Database | Incorrect access, failed persistence, or data loss |
| Operations | Hidden service failures, inadequate recovery, or sensitive logs |

This table is a proposed risk inventory, not evidence that any specific attack has succeeded against the current application.

The actual severity, probability, and mitigation priority of each risk require future assessment.

## 7. Authentication security

**Relevant requirements:** FR-001–FR-002, FR-005; NFR-007.

The target authentication system must support registered users and secure account access.

### Required behavior

- Validate credentials through the authorized backend.
- Protect passwords using appropriate secure hashing.
- Reject invalid credentials.
- Protect account recovery.
- Apply appropriate session validity and expiry controls.
- Support logout.
- Prevent access after session invalidation.
- Avoid revealing sensitive account information through failure messages.

### Historical evidence

Earlier inspection identified password-security, login, token, and recovery-related mechanisms.

Their current end-to-end correctness and integration with live MongoDB remain unverified.

### Future testing

Later authorized tests must establish valid and invalid login behavior, recovery security, session revocation, password handling, and backend authorization.

Exact algorithms, authentication tokens, storage formats, and identity providers must be verified or separately approved.

## 8. Three-role RBAC and separation of duties

**Relevant requirements:** FR-003, FR-024, FR-030; NFR-007.  
**Approved decision:** D-002.

TRAIL AI Desk must enforce exactly three distinct application roles:

1. Student.
2. Admin.
3. Knowledge-Base Manager.

The Knowledge-Base Manager is not a renamed Admin account or frontend-only designation.

### Conceptual authorization rules

| Protected action | Required authorization principle |
|---|---|
| Student information retrieval | Authorized student workflow and eligible public evidence |
| Student concern submission | Appropriate authenticated Student access |
| System administration | Specific authorized Admin permissions |
| Institutional source submission | Authorized Admin or Knowledge-Base Manager |
| Independent source approval | Eligible Knowledge-Base Manager who did not submit that version |
| Privileged account provisioning | Separately approved provisioning policy |
| Protected concern access | Separately approved need-to-access policy |
| Audit-history access | Appropriate role and purpose-based restrictions |

The exact permission matrix requires later specification.

### Backend enforcement

Every protected operation must independently validate authorization.

Hiding buttons or routes is not sufficient.

### Separation-of-duties rule

The person who submits a source version must not independently approve that same submission.

Administrative privileges must not bypass this restriction.

## 9. Account provisioning and password recovery

**Relevant requirements:** FR-002–FR-003; NFR-007.

The system needs a controlled account lifecycle.

Future implementation must address:

- Account creation and provisioning.
- Role assignment and changes.
- Credential recovery.
- Expired or revoked access.
- Account disabling.
- Appropriate administrative recordkeeping.

### Privilege assignment

The application must not permit an ordinary user to promote themselves into Admin or Knowledge-Base Manager privileges.

The exact authority to create privileged accounts remains an open policy decision.

### Recovery safeguards

Password recovery should prevent unauthorized account takeover.

Future design should address:

- Recovery-token validity.
- Expiry.
- One-time or equivalent replay-safe behavior.
- Sensitive account-discovery leakage.
- Credential-reset completion.
- Appropriate session handling after recovery.

The actual recovery service, delivery method, and implementation remain unverified.

## 10. Session security and user isolation

**Relevant requirements:** FR-005, FR-009; NFR-007, NFR-009.

Authenticated sessions must preserve identity and user isolation.

### Required safeguards

- A user's requests must be associated with the proper authenticated identity.
- Protected operations must reject expired or revoked sessions.
- Conversation context must not cross between unrelated users.
- Private concern records must not appear in another user's session.
- Stale responses must not restore protected data after logout.
- A frontend role change must not elevate backend permissions.

### Future design considerations

- Session-storage mechanism.
- Token validation and revocation.
- Concurrent sessions.
- Device/session expiration.
- Refresh behavior.
- Replay resistance.
- Logout response races.
- Protection of locally cached sensitive data.

Exact session and token mechanisms require verification and approval.

## 11. Institutional information governance as a security boundary

**Relevant requirements:** FR-025–FR-035; NFR-005–NFR-006, NFR-012.  
**Approved decisions:** D-003–D-005, D-010.

Institutional source governance prevents unauthorized or unsupported information from being presented as university-approved evidence.

### Mandatory lifecycle

1. Authorized university issuing office officially approves and publishes information.
2. Authorized TRAIL Admin or Knowledge-Base Manager submits the information.
3. TRAIL preserves the exact content version and provenance.
4. An independent Knowledge-Base Manager reviews that version.
5. Only approved and otherwise eligible material becomes available for student retrieval.

### Required controls

- Preserve issuing-office identity.
- Require official supporting references for manual entries.
- Bind review decisions to exact submitted versions.
- Reject self-approval.
- Require renewed review for changed versions.
- Exclude rejected, pending, withdrawn, or otherwise ineligible content.
- Preserve meaningful reviewer and version history.

These controls must be enforced in backend logic and durable state, not only through interface conventions.

## 12. External AI and embedding-provider disclosure

**Relevant requirements:** FR-007, FR-027, FR-031, FR-036; NFR-008–NFR-009.  
**Approved decision:** D-006.

**Pending or unapproved institutional source content must not be transmitted to external AI-generation or embedding providers before independent approval of the exact source version.**

This applies to:

- Source submissions.
- File uploads.
- Manual institutional entries.
- Changed content versions.
- Refresh tasks.
- Background jobs.
- Retries.
- Delayed or concurrent processing.

### Required authorization boundary

Before external transmission, the relevant backend service must determine that:

1. The exact content version has completed required review.
2. The version remains eligible for the intended processing.
3. The disclosure is otherwise appropriate under the project's privacy restrictions.

### Additional privacy restriction

Institutional content approval does not automatically authorize disclosure of confidential student records, private concerns, credentials, or other protected information.

### Open provider controls

Future design should address:

- Approved provider configuration.
- Permitted data categories.
- Data minimization.
- Appropriate transport security.
- Provider logs and retention considerations.
- Retry and background-job safeguards.
- API-key management.
- Disclosure review and audit evidence.

No current provider contract, configuration, or live call is verified through this document.

## 13. Secure external source retrieval

**Relevant requirements:** FR-025–FR-027; NFR-004, NFR-008–NFR-009.

The application is expected to process permitted publicly accessible institutional sources.

Source retrieval must not permit arbitrary unsafe access.

### Potential risks

- Server-side request forgery.
- Access to private network services.
- Unsafe redirects.
- Unsupported protocols.
- Excessive content downloads.
- Untrusted or spoofed domains.
- Resource exhaustion.
- Incorrect handling of authentication-required resources.

### Proposed protections

Future design should evaluate:

- Approved URL schemes.
- Appropriate official-source validation.
- Host and destination restrictions.
- Redirect revalidation.
- Network-target safety checks.
- Timeouts and response-size limits.
- Safe error handling.
- Logging that avoids exposing sensitive URLs or credentials.

Exact URL allowlists, accepted schemes, network controls, and fetching implementation require separate approval.

Historical references to existing URL or SSRF safeguards are not current validation evidence.

## 14. Document processing and prompt-injection protection

**Relevant requirements:** FR-007–FR-011, FR-027, FR-036; NFR-005–NFR-009.

Uploaded documents and extracted webpage text must be treated as untrusted content.

### Document-processing risks

Future implementation should consider:

- Malformed or malicious documents.
- Unsupported file formats.
- Oversized uploads.
- Unexpected embedded content.
- Resource-intensive parsing.
- Content with concealed sensitive information.
- Forged source metadata.

### Prompt-injection boundary

Institutional source content may contain text that attempts to instruct the RAG assistant to:

- Ignore system restrictions.
- Change its role.
- Disclose private information.
- Call unauthorized services.
- Invent or suppress citations.
- Treat unapproved text as official authority.

Such content must be treated as source data, not authoritative application instructions.

### Future safeguards

Design and verification should evaluate:

- Clear separation between trusted instructions and retrieved evidence.
- Strict backend source eligibility checks.
- Restricted data availability.
- Appropriate output validation.
- Negative tests using malicious source instructions.
- Prevention of unauthorized data transmission.

No particular prompt template or injection-detection product is approved here.

## 15. RAG retrieval and private-data isolation

**Relevant requirements:** FR-007–FR-011, FR-036; NFR-005–NFR-006, NFR-009.  
**Approved decision:** D-007.

Student-facing RAG must use only eligible approved institutional evidence.

It must not retrieve:

- Pending institutional versions.
- Rejected or withdrawn source content.
- No-longer-eligible superseded material.
- Private student concerns.
- Confidential university student records.
- Another user's conversation or protected information.

### Citation integrity

The associated citation must substantively support each relevant university-specific claim.

A citation identifier is not sufficient without factual support.

### Security and accuracy overlap

Knowledge eligibility is both a content-governance obligation and a security boundary.

A leaked pending source or private concern is not made acceptable by producing a correctly formatted citation.

### Testing

Future evaluation must cover retrieval eligibility, source-version associations, claim support, malicious source instructions, and user-session separation.

## 16. Student concern privacy and durable submission

**Relevant requirements:** FR-020–FR-023, FR-036; NFR-009.  
**Approved decision:** D-009.

Student concerns require secure and durable backend handling.

### Required safeguards

- Appropriate authentication and authorization.
- Validation of required fields.
- Private durable storage.
- Accurate submission confirmation.
- Duplicate-submission protections.
- Controlled record access.
- Appropriate retention.
- Separation from public RAG retrieval.

### Confirmation boundaries

The interface and backend must distinguish:

1. A submission entering processing.
2. A concern being durably stored.
3. Official acknowledgement by a university office.
4. Official resolution by an authorized university workflow.

A successfully saved concern must not be presented as officially acknowledged or resolved without supporting evidence.

### Access policy

The exact university office routing, staff access, retention periods, and escalation rules remain open decisions.

Neither Admin nor Knowledge-Base Manager is automatically entitled to read all private concerns merely because the role is privileged in another part of the application.

### Historical limitation

The previously documented local concern demonstration is not evidence of secure production persistence.

## 17. Memoranda and trusted institutional dates

**Relevant requirements:** FR-017–FR-019.  
**Approved decision:** D-008.

Official memorandum handling must protect source accuracy and date interpretation.

The system must preserve:

- Issuing office.
- Official source reference.
- Appropriate date information.
- Exact eligible source version.
- Applicable withdrawal or supersession status.

### Date handling

Selected periods, including the current week, must use approved Asia/Manila time boundaries.

The exact beginning and ending of the week and other period-selection options require later specification.

### Accuracy protection

No matching approved record in TRAIL must not be presented as proof that no university memorandum was issued.

Incorrect source dates or stale documents must not create misleading official claims.

## 18. Backend API and input validation

**Relevant requirements:** FR-003, FR-021, FR-024–FR-029; NFR-004, NFR-007–NFR-009.

Every protected request must be evaluated by the backend.

### Validation responsibilities

Future implementation must consider:

- Required fields.
- Data types.
- Length limits.
- Supported values.
- File type and size.
- Safe URLs.
- Valid date and time inputs.
- Authentication state.
- Role permissions.
- Source and version identity.
- Current approval eligibility.
- Duplicate or stale operations.

### Authorization responsibilities

The backend must not trust user-supplied claims about:

- Account role.
- Institutional source approval.
- Reviewer eligibility.
- Concern ownership.
- Official office acknowledgement.
- Provider-processing eligibility.

### Response protection

Client responses must avoid disclosing passwords, credentials, private documents, sensitive internal diagnostics, or unauthorized records.

Exact routes, request schemas, middleware, status codes, and validation libraries remain unverified.

## 19. Secrets, configuration, and external dependencies

**Relevant requirements:** NFR-007–NFR-009.

The SRS prohibits exposing sensitive backend credentials and API keys in publicly accessible frontend code.

Protected information may include:

- Database credentials.
- AI-provider API keys.
- Session secrets.
- Password-recovery secrets.
- Administrative bootstrap credentials.
- Deployment-related credentials.

### Required protection goals

- Keep backend secrets out of publicly distributed client bundles.
- Do not commit secrets to documentation or source-control history.
- Avoid including secret values in logs or error responses.
- Restrict secret access to the components requiring it.
- Support appropriate credential rotation and incident response.

The owner has established `MONGODB_URI` and `MONGODB_DATABASE` as the MongoDB configuration keys. Live operation now requires the explicit approved `trail_db` target and validates the approved nonsecret host and username before client initialization. The Admin provisioning path uses the same fail-closed validation before password input or any database operation. Configuration values, passwords, and the URI are protected and must not be copied into documentation, logs, client bundles, or reports.

### Open implementation details

- Environment-variable inventory beyond the established MongoDB keys.
- Secret-storage mechanism.
- Environment separation.
- Rotation procedures.
- Deployment credential provisioning.
- Dependency and configuration inventory.

This document contains no live secrets and authorizes no credential inspection.

## 20. Database protection and data integrity

**Relevant requirements:** FR-022, FR-032–FR-036; NFR-004, NFR-007–NFR-009, NFR-012.

MongoDB-backed persistence is part of the approved target architecture.

Its current live connectivity remains unverified.

A prior sanitized Atlas diagnostic reported `ECONNREFUSED`. During `P01A-MONGODB-CONFIG-FIX-01` on 2026-11-09, private effective-configuration validation passed for the approved target, but the single isolated read-only ping reported `ATLAS_PING=FAIL`; client closure passed. These results establish failed connection paths, not a conclusive DNS, credential, allow-list, TLS, Atlas, or application-code root cause. Authentication, database privileges, reads, writes, restart durability, and persistence therefore remain unverified.

### Protection objectives

Future implementation must address:

- Restricted database access.
- Appropriate application database privileges.
- Secure credential handling.
- Integrity of account roles and sessions.
- Exact institutional version identity.
- Reviewer decision records.
- Isolation of student concerns.
- Audit history.
- Reliable write completion.
- Appropriate backup and recovery protection.

### Security properties requiring design

Appropriate future design should evaluate:

- Encryption in transit.
- Encryption at rest where required.
- Database network exposure.
- Least-privilege access.
- Backup protection.
- Consistent authorization and database updates.
- Concurrency safeguards.
- Secret rotation and recovery.

This document does not claim that any of these mechanisms is currently enabled. `DATABASE.md` is authoritative for the intended nonsecret deployment identifiers and their evidence status.

### Verification boundary

No database connection attempt, credential inspection, migration, index creation, or troubleshooting is authorized here.

## 21. Audit logging, monitoring, and accountability

**Relevant requirements:** FR-032–FR-035; NFR-006, NFR-009, NFR-012.  
**Approved decision:** D-010.

The application must preserve appropriate records for institutional governance and security accountability.

### Audit responsibilities

Future implementation should support traceability of:

- Source submission identity.
- Exact submitted version.
- Independent reviewer identity.
- Approval and rejection decisions.
- Relevant authorization failures.
- Source withdrawal and supersession.
- Changes affecting retrieval eligibility.
- Applicable administrative activity.

### Privacy limitations

Logging must not unnecessarily expose:

- Student concern content.
- Passwords or tokens.
- API or database credentials.
- Private user conversations.
- Unapproved institutional content to unauthorized log consumers.

### Monitoring

Future operational monitoring should identify service failures and relevant security events without making sensitive information broadly accessible.

Exact log schemas, retention periods, alert thresholds, access permissions, and audit-review procedures require later approval.

## 22. Retention, deletion, backup, and recovery

**Relevant requirements:** FR-022, FR-032–FR-035; NFR-004, NFR-009, NFR-012.

Retention and recovery must balance integrity, availability, and privacy.

### Data classes requiring policies

- Account and session information.
- Password-recovery records.
- Official source versions.
- Review decisions.
- Derived retrieval material.
- Audit records.
- Private student concerns.
- Operational logs.
- Backups.

### Future policy decisions

The owner must later approve or validate appropriate:

- Retention durations.
- Archiving procedures.
- Deletion eligibility.
- Backup frequency.
- Backup access.
- Restoration testing.
- Incident preservation requirements.
- Cleanup of ineligible retrieval material.

A deleted or withdrawn source version must not remain accessible through an active retrieval index merely because its primary source record changed status.

### Verification

Future tests should include persistence across restart, appropriate restoration behavior, and protection against unauthorized recovery of private or ineligible information.

No specific retention duration or backup schedule is established here.

## 23. Failure handling and temporary demo controls

**Relevant requirements:** FR-011–FR-012, FR-022–FR-023; NFR-003–NFR-004.  
**Approved decision:** P00-D-DEMO.

The interface and backend must represent service failures truthfully.

### Required failure behavior

- A database outage must not be reported as a successful persistent write.
- An AI-provider failure must not produce a fabricated verified answer.
- An authentication error must not create privileged access.
- A failed concern submission must not receive a false saved confirmation.
- A failed approval operation must not make content retrievable.
- A source-processing failure must not bypass review restrictions.

### Temporary demo behavior

The existing demo functionality may remain clearly labeled during early development.

It must not:

- Silently substitute for failed real services.
- Conceal a broken MongoDB connection.
- Present simulated authentication as real authenticated access.
- Present simulated retrieval as verified institutional information.
- Present local concern previews as real durable submissions.

The configured live MongoDB startup path now propagates a safe failure instead of returning a successful demo connection. Explicit demo behavior remains available only when both live MongoDB configuration keys are absent. A later query-time read failure can still visibly switch knowledge reads to labeled demo data; that separate behavior was not changed by `P01A-MONGODB-CONFIG-FIX-01` and requires its own owner-approved review if the policy is to change.

### Retirement condition

The temporary live-application demo fallback is intended to be retired only after real database-backed operation, authentication, and all three backend roles are established and verified, through separately approved work.

No immediate removal is authorized by this document.

## 24. Security and privacy verification framework

Future authorized assessment should include both successful and denied behavior.

| Verification area | Required evidence |
|---|---|
| Authentication | Valid, invalid, expired, and revoked session cases |
| Password recovery | Expiry, replay prevention, and safe completion |
| RBAC | Permitted and denied backend actions for all three roles |
| Privilege escalation | Client cannot assign or claim protected roles |
| Source submission | Authorized actor and official provenance |
| Manual entries | Reject missing issuing office or official reference |
| Independent review | Deny self-approval and unauthorized reviewer actions |
| Version control | Changed content requires renewed approval |
| External AI | No transmission of pending content, including retries |
| Source fetching | Safe URL, redirect, and source validation |
| Document processing | Malformed, oversized, and adversarial inputs |
| Prompt injection | Retrieved text cannot override trust boundaries |
| Retrieval | Exclude pending, withdrawn, and private information |
| Citations | Substantive factual claim-to-evidence support |
| User isolation | No cross-user session or concern access |
| Concerns | Private durable storage and truthful confirmation |
| Memoranda | Correct official provenance and period behavior |
| Secrets | No exposed backend keys in client or logs |
| Database | Connectivity, authorization, durability, and recovery |
| Logging | Appropriate audit coverage without sensitive leakage |
| Failure handling | Correct behavior when dependencies fail |
| Demo behavior | Clear labeling and no silent failure substitution |

### Evidence reporting

Each verified control should record:

1. Applicable requirement and decision.
2. Authorized checkpoint.
3. Exact system component or operation tested.
4. Environment.
5. Test procedure.
6. Expected result.
7. Actual result.
8. Date and relevant evidence.
9. Open limitations.
10. Owner acceptance status.

Historical reported test counts are not a substitute for current execution evidence.

## 25. Privacy, legal, and unresolved design decisions

### Original privacy requirement

NFR-009 requires appropriate safeguards for personal information consistent with Republic Act No. 10173.

This document preserves that SRS requirement.

It does not represent a legal opinion, certify regulatory compliance, or establish that the university's applicable privacy governance requirements have been fully assessed.

### Open privacy and security decisions

The following remain unresolved:

- Institutional privacy roles and approval responsibilities.
- Exact data-classification policy.
- Personal-information processing purposes and notices.
- Retention schedules.
- Data access and correction procedures where applicable.
- Incident handling and notification responsibilities.
- Account provisioning and privileged-role governance.
- Session and credential mechanisms.
- Database and backup protection.
- Staff access to private concern records.
- External provider disclosure and retention policies.
- Official source authenticity verification.
- Security logging and monitoring.
- Rate limiting and abuse thresholds.
- Supported platform and deployment security baselines.
- Incident response and disaster recovery procedures.
- Security test acceptance thresholds.
- Formal deployment and production security review requirements.

These matters require evidence, design review, and appropriate owner or institutional authority decisions.

No unresolved item should be silently treated as an existing, fully implemented control.

## 26. Acceptance, maintenance, and project authority

### Maintenance and acceptance criteria

`SECURITY_PRIVACY.md` remains acceptable as a living foundational reference when:

1. The original SRS and approved decisions are preserved.
2. Security is treated as a cross-phase obligation.
3. Exactly three backend-enforced application roles are maintained.
4. Independent source review and self-approval prevention are explicit.
5. Official provenance and changed-version approval rules are preserved.
6. Pending content is prohibited from external AI and embedding providers.
7. Confidential student records and private concerns remain protected.
8. Student-facing RAG cannot retrieve private or ineligible content.
9. Citation accuracy is treated as a required trust property.
10. Authentication, session protection, input validation, and secrets are addressed.
11. Source-fetching, document-processing, and prompt-injection risks are identified.
12. Database durability, access protection, auditing, and recovery are covered.
13. Failure handling does not conceal unavailable live services.
14. Demo support and retirement conditions match approved policy.
15. Privacy obligations are represented without unsupported legal-compliance claims.
16. Unverified controls remain clearly marked.
17. Open security design decisions are identified.
18. The document aligns with `RAG_KNOWLEDGE_BASE.md`, `DATABASE.md`, `API.md`, and `PROJECT_PLAN.md`.
19. Markdown completeness and structure are verified.
20. The project owner accepts the documentation.

### Maintenance requirements

Future revisions must identify:

- Approved checkpoint and scope.
- Applicable SRS requirement.
- Relevant approved decision.
- Observed security or privacy evidence.
- Proposed change or verified control.
- Affected documents.
- Validation results.
- Remaining risks.
- Owner acceptance.

The document must not be used to claim production readiness without current operational evidence.

### Project authority

The project owner retains final authority over project scope, security design, documentation, repository operations, implementation, acceptance, and phase advancement.

ChatGPT may assist with documentation preparation and evidence review.

Codex may inspect or modify the local repository only within explicitly authorized checkpoint boundaries.

Preparation or acceptance of this document does not by itself authorize source-code changes, security scans, database operations, provider requests, or work outside an owner-approved checkpoint.

