# TRAIL AI Desk — RAG and Institutional Knowledge-Base Reference

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
**Security reference:** `SECURITY_PRIVACY.md`  
**Testing reference:** `TESTING.md`  
**Traceability reference:** `REQUIREMENTS_TRACEABILITY.md`  
**Change control:** `DECISIONS.md` and `CHANGE_REQUESTS.md`

## 1. Purpose and scope

This document provides the controlled reference for Retrieval-Augmented Generation (RAG) and the institutional knowledge base of TRAIL AI Desk.

Its objectives are to:

- Define the approved institutional information lifecycle.
- Preserve official university issuing-office authority.
- Establish exact-version submission and independent review requirements.
- Prevent unapproved information from entering student-facing retrieval.
- Prevent pending content from reaching external AI-generation and embedding providers.
- Describe the intended ingestion, retrieval, and answer-generation responsibilities.
- Define substantive factual claim-to-evidence citation requirements.
- Address source updates, withdrawal, supersession, and historical traceability.
- Define appropriate behavior for missing, conflicting, or outdated information.
- Establish future testing and acceptance requirements.

This document describes required behavior and possible technical responsibilities without asserting that the corresponding implementation is currently operational.

It does not authorize source ingestion, provider requests, database operations, code changes, or repository inspection.

### Development use and maintenance

Use this document when planning or changing institutional source ingestion, independent review, version eligibility, external AI or embedding processing, retrieval, memoranda, or citations. It is authoritative for the approved knowledge-governance rules; implementation architecture belongs in `IMPLEMENTATION.md`, persistence details in `DATABASE.md`, API contracts in `API.md`, and test evidence in `TESTING.md`.

Update it when an approved requirement or decision changes, or when authorized implementation and test evidence materially changes the documented workflow. Operational claims require current inspected code and relevant authorized test evidence; historical reports and source presence are not sufficient. Codex may prepare synchronized changes within an approved checkpoint, while the project owner approves requirements, decisions, acceptance, and phase changes.

The document remains acceptable when it preserves the SRS and approved decisions, clearly separates required, proposed, implemented, tested, and accepted behavior, keeps related foundational documents consistent, and identifies unresolved evidence honestly.

## 2. Authoritative sources and evidence status

The governing sources are:

1. Original October 2026 Software Requirements Specification.
2. `REQUIREMENTS_TRACEABILITY.md`.
3. Approved `DECISIONS.md` records.
4. `PROJECT_PLAN.md`.
5. `IMPLEMENTATION.md`.
6. `DATABASE.md`.
7. `API.md`.
8. `APP_FLOW.md`.
9. `SECURITY_PRIVACY.md`.
10. `TESTING.md`.
11. `CHANGE_REQUESTS.md`.
12. Relevant authorized historical inspection reports.

The following classifications apply:

| Classification | Meaning |
|---|---|
| Historical evidence | Earlier inspection or reports identified a capability or behavior |
| Approved requirement | The original SRS or a later owner-approved decision requires the behavior |
| Proposed architecture | A possible technical organization not yet separately approved |
| Not verified | Current code or runtime evidence has not established the behavior |
| Verified operational | Authorized current execution establishes the specified behavior |
| Accepted | The project owner accepted the relevant checkpoint |

An approved workflow is not proof of an implemented workflow.

Exact repository paths, database collection names, processing-job names, API routes, model identifiers, and retrieval configuration values must not be invented.

## 3. Historical implementation baseline

Earlier authorized project evidence describes:

- Institutional source registration and management.
- Source extraction and ingestion.
- Retrieval of institutional information.
- AI prompt construction and response generation.
- Optional Gemini integration.
- Embedding-related processing.
- Source metadata and citation presentation.
- Administrative source approval and refresh operations.

Historical evidence also identified potential conflicts involving:

- Approval inherited by changed source content.
- Incomplete validation of manual-entry provenance.
- Possible external embedding of unapproved content.
- Insufficient demonstration of substantive citation support.
- Unverified source eligibility across retrieval paths.

These are historical findings and risks, not new live test results.

The current source-processing sequence, provider calls, storage structure, index behavior, and operational correctness remain unverified.

## 4. RAG and knowledge-base responsibilities

The target system separates the following conceptual responsibilities:

1. Official institutional publication.
2. Authorized source submission.
3. Internal provenance validation and content staging.
4. Exact content-version identification.
5. Independent Knowledge-Base Manager review.
6. Approval and eligibility determination.
7. Authorized downstream processing.
8. Retrieval of currently eligible material.
9. Evidence-grounded response generation.
10. Student-facing citation presentation.
11. Version updates, withdrawal, and audit history.

These are logical responsibilities. They do not require separate deployed services or prescribe an unapproved module structure.

The final technical implementation must be established through authorized inspection and approved development design.

## 5. Institutional authority and ownership

**Relevant requirements:** FR-007, FR-025–FR-032; NFR-005–NFR-006.  
**Approved decision:** D-003.

University institutional information originates from its authorized issuing office.

The required authority sequence is:

1. The issuing university office officially approves and publishes information.
2. An authorized TRAIL Admin or Knowledge-Base Manager submits that information.
3. TRAIL preserves the exact submitted version and official provenance.
4. An independent Knowledge-Base Manager reviews the submitted version.
5. Only approved and otherwise eligible content enters authorized student-facing retrieval.

The official issuing office is an institutional authority, not a fourth application role.

It is not required to have a separate TRAIL account.

A submission to TRAIL is not official publication by the university, and registration of a source is not equivalent to independent Knowledge-Base Manager approval.

## 6. Application roles and knowledge permissions

**Approved decision:** D-002.

TRAIL AI Desk has exactly three separate application roles.

| Role | Knowledge-related responsibility | Restriction |
|---|---|---|
| Student | Retrieve available approved institutional information | Cannot submit, manage, or approve protected institutional content |
| Admin | Register and submit sources within authorized permissions | Cannot substitute for independent manager review |
| Knowledge-Base Manager | Submit sources where authorized and independently review versions | Cannot approve the same version they submitted |

A Knowledge-Base Manager is a separate backend-enforced role.

The person reviewing a particular submission must be distinct from its submitter, regardless of their application-role label.

Frontend visibility must not be the sole enforcement mechanism.

Specific account-provisioning procedures and full administrative permissions remain open implementation details.

## 7. Supported source categories

**Relevant requirements:** FR-025–FR-029.

The SRS identifies three principal institutional submission paths:

### 7.1 Official university webpages

Authorized users may register official university webpages as sources, subject to source validity and permitted access.

A submitted URL must not automatically be treated as officially approved or trustworthy merely because its appearance resembles a university domain.

### 7.2 Institutional documents

Authorized users may upload institutional documents for the knowledge workflow.

Future implementation must validate supported file types, sizes, authenticity, content safety, and applicable official provenance.

### 7.3 Manual institutional entries

Authorized users may manually submit or update information obtained from relevant university offices.

Every such entry must include its issuing university office and an independent official supporting reference or verifiable official provenance.

The implementation must not accept an unsupported manual statement as authoritative based solely on the submitter's administrative privileges.

Exact source formats, upload limits, URL rules, and document-processing mechanisms remain unapproved technical details.

## 8. Source registration and mandatory provenance

**Relevant requirements:** FR-025–FR-029, FR-032.  
**Approved decisions:** D-003, D-004.

Before institutional information can become retrievable, the system must preserve appropriate provenance.

Conceptual information responsibilities include:

- Institutional source identity.
- Originating issuing office.
- Official source reference.
- Type of source.
- Identity of the submitting user.
- Exact submitted content or content-version association.
- Relevant publication or effective information.
- Applicable official supporting references.
- Review and eligibility history.

These are information obligations, not approved database field names.

### Manual-entry rule

For each manual item, the system must require:

1. The issuing office.
2. An independent official supporting reference or verifiable official provenance.

Missing required provenance must prevent approval and student retrieval.

The specific process for checking the authenticity of references remains open for later design and verification.

## 9. Internal staging before institutional review

Internal staging allows an authorized submission to be recorded and prepared for human review without making it publicly retrievable.

Possible future internal operations include:

- Basic file or URL validation.
- Locally controlled text extraction.
- Recording relevant source metadata.
- Capturing the exact submitted content.
- Determining whether a source has changed.
- Preparing an internal review representation.

Such operations must respect applicable access, privacy, and security restrictions.

Internal staging is not independent approval.

### Mandatory restrictions

Pending content must remain outside:

- Student-facing information retrieval.
- Student-facing RAG context.
- Published institutional knowledge results.
- External AI-generation and embedding requests.

An implementation may use additional internal states, but no state or queue may bypass these restrictions.

## 10. Exact-version identity and content changes

**Relevant requirements:** FR-031, FR-033–FR-035; NFR-012.  
**Approved decision:** D-005.

Approval is associated with the exact version reviewed.

The system must distinguish:

- The registered source.
- The content version submitted for review.
- The reviewing person's decision.
- The content version currently eligible for processing or retrieval.

A changed version must not inherit approval from an earlier version.

### Mandatory invariants

- A review decision applies only to its exact version.
- Changed content receives fresh independent review.
- Unapproved changes do not replace approved material automatically.
- Earlier approved material can remain eligible only while still valid and not officially withdrawn or superseded.
- Historical decisions remain traceable to their original versions.
- Derived retrieval material retains the corresponding source-version association.

A future technical design may use immutable snapshots, fingerprints, hashes, version identifiers, or another verified mechanism.

No specific hashing algorithm, version identifier, or storage structure is approved by this document.

## 11. Independent Knowledge-Base Manager approval

**Relevant requirements:** FR-030–FR-035; NFR-007, NFR-012.  
**Approved decisions:** D-002, D-003, D-005, D-010.

The target review sequence is:

1. An authorized manager accesses a pending submission.
2. The system identifies the exact version and provenance.
3. Required supporting official references are available for review.
4. The backend determines whether the reviewer is authorized.
5. The backend verifies the reviewer is not the submitting person.
6. The manager records an approval or rejection decision.
7. The decision is associated with the exact reviewed version.
8. Applicable eligibility and audit records are updated consistently.
9. The user receives a truthful outcome.

### Prohibited approval outcomes

The system must reject:

- Student approval attempts.
- Ordinary Admin attempts to substitute for independent manager approval.
- Approval by the same person who submitted the version.
- Approval without required official provenance.
- Decisions against a stale or changed version.
- Attempts to reuse an earlier version's approval for changed content.

Exact approval-state names, rejection-reason requirements, review-note fields, and concurrency mechanisms remain open design details.

## 12. Eligibility for downstream processing

Institutional approval and technical retrieval eligibility are related but not identical.

The system must consider the current status of the exact source version.

Relevant circumstances can include:

- Approval outcome.
- Source validity.
- Official withdrawal.
- Supersession.
- Applicable time validity.
- Other approved access or eligibility restrictions.

A version must not become retrievable solely because it was approved at some point in the past.

### Eligibility control

The backend must enforce current eligibility when material enters or remains in:

- Processing jobs.
- Derived retrieval indexes.
- Search results.
- RAG context.
- Student-facing answers.

This control must not depend solely on an administrative UI status label.

## 13. External AI and embedding approval boundary

**Relevant requirements:** FR-007, FR-027, FR-031, FR-034, FR-036; NFR-009.  
**Approved decision:** D-006.

**Pending or unapproved institutional source content must not be transmitted to external AI-generation or embedding providers before the applicable independent Knowledge-Base Manager approval.**

This restriction applies to all supported source types and processing mechanisms.

### Required coverage

The gate must protect:

- New webpage submissions.
- Uploaded documents.
- Manual entries.
- Changed webpage versions.
- Source refreshes.
- Scheduled or delayed work.
- Background ingestion jobs.
- Retries after failures.
- Reprocessing of previously approved sources that have since changed.

Approval of version A does not authorize external processing of an unapproved version B.

### Independent privacy boundary

Even after institutional approval, confidential student records or private concern content are not automatically authorized for external disclosure.

Provider-related privacy controls remain separately mandatory.

### Future verification

Tests must establish that unapproved content does not reach an external provider, including through retries, queues, and concurrent state changes.

## 14. Extraction, parsing, and ingestion

**Relevant requirements:** FR-026–FR-027.

The intended ingestion process may include:

1. Source access validation.
2. Controlled retrieval or document intake.
3. Safe extraction and parsing.
4. Internal provenance and content-version association.
5. Independent approval gating.
6. Authorized downstream content preparation.
7. Eligible retrieval-material creation.
8. Processing-state and error recording.

The exact order of internal processing operations must be designed to preserve the external-processing approval boundary.

### Safety considerations

Future implementation should evaluate:

- Permitted external URL access.
- Server-side request forgery prevention.
- Document and archive parsing limits.
- Oversized or malformed content.
- Duplicate submissions.
- Malicious embedded instructions.
- Timeouts and interrupted extraction.
- Source authenticity and origin.
- Data minimization.

The current parsing libraries, crawler behavior, and ingestion-job structure have not been reverified.

## 15. Chunking, embeddings, and derived retrieval material

Chunking and embeddings are potential techniques for preparing retrieved institutional evidence.

Their precise implementation remains open.

### Proposed responsibilities

If content is transformed into chunks or other derived material, the system should preserve:

- The originating institutional source.
- The exact approved source version.
- The relevant extracted content.
- The association between chunk and original evidence.
- Any necessary citation location or reference.
- Processing and validity information.

### Version and eligibility integrity

Derived data must not erase approval boundaries.

When a version becomes ineligible, associated derived retrieval material must not continue appearing as currently approved content.

A stale embedding or cached search result is not authority to disclose withdrawn or pending material.

### Open design choices

- Chunk size and overlap.
- Embedding model and provider.
- Lexical, vector, or hybrid retrieval.
- Storage engine and index layout.
- Reindexing and invalidation.
- Ranking and relevance settings.
- Version-aware cache keys.
- Processing retries and durability.

No specific model, vendor, vector database, or numerical retrieval setting is approved here.

## 16. Student-facing retrieval

**Relevant requirements:** FR-007, FR-013–FR-016, FR-031, FR-036; NFR-005–NFR-006.

The retrieval stage must operate on eligible, approved institutional material.

### Target sequence

1. The student submits an authorized university information request.
2. The backend interprets the request and applies necessary access controls.
3. Candidate institutional material is located.
4. Version-specific eligibility is verified.
5. Relevant evidence is selected.
6. Provenance is retained for answer generation and citation.
7. Ineligible or confidential material is excluded.

### Required restrictions

Retrieval must not expose:

- Pending or rejected institutional content.
- Withdrawn or superseded versions that are no longer eligible.
- Private student concerns.
- Confidential student records.
- Another user's private conversation or authenticated data.

Where the approved corpus lacks sufficient information, the application must state the limitation accurately.

## 17. RAG answer generation and context

**Relevant requirements:** FR-006–FR-012; NFR-003–NFR-006.

The intended answer-generation workflow is:

1. Receive and validate the student question.
2. Retrieve relevant eligible institutional evidence.
3. Preserve appropriate conversation context.
4. Construct an authorized request to the configured AI service where applicable.
5. Generate or assemble an answer grounded in available evidence.
6. Associate university-specific factual claims with supporting sources.
7. Validate applicable grounding and eligibility boundaries.
8. Return the answer or an accurate limitation/failure state.

### Conversation context

Relevant follow-up context must remain associated with the authorized user or session.

Future tests must address:

- Context preservation.
- Cross-user isolation.
- Logout and session-expiry behavior.
- Stale or delayed responses.
- Context size and retention.
- Inclusion of only permitted source content.

The exact prompt structure, provider configuration, context window, and answer-generation orchestration remain unverified.

## 18. Substantive citation and factual support

**Relevant requirements:** FR-008, FR-010–FR-011; NFR-005–NFR-006.  
**Approved decision:** D-007.

University-specific answers must be grounded in relevant, approved evidence.

A citation is acceptable only when its underlying material substantively supports the associated factual claim.

### Required evidence attributes

Depending on the source, supporting information should preserve:

- Official source identity.
- Exact approved content version.
- Relevant text or supporting passage.
- Issuing office where applicable.
- Appropriate source reference.
- Publication or effective date where relevant.

### Unacceptable evidence behavior

The system must not:

- Cite a real document that does not support the claim.
- Cite one approved version while using factual content from another.
- Attach citations merely to make an unsupported answer appear trustworthy.
- Use withdrawn or ineligible sources as current official evidence.
- Treat a plausible source URL as verified substantive support.

### Verification standard

Citation evaluation must examine claim-to-evidence relationships, not just citation formatting or the existence of metadata.

The exact evaluation method, acceptance threshold, and automated/manual test mix require later approval.

## 19. Insufficient, conflicting, and outdated evidence

**Relevant requirements:** FR-011–FR-012; NFR-004–NFR-006.

RAG must represent knowledge limitations accurately.

### Insufficient evidence

If eligible evidence does not answer a question, the system should communicate that it cannot establish the requested university-specific fact from the available approved material.

### Conflicting evidence

If multiple eligible sources appear to conflict, the system must avoid presenting an unsupported single conclusion as certain.

A later-approved conflict-resolution policy may take issuing authority, effective dates, supersession, and document type into account.

### Outdated evidence

Information that has expired, been officially withdrawn, or become superseded must not be presented as currently authoritative.

### Service failure

A database, retrieval, or AI-provider failure must not be represented as an ordinary empty knowledge-base result if the underlying cause is service unavailability.

The final error categories and response wording require subsequent design and verification.

## 20. Memoranda, announcements, and reporting periods

**Relevant requirements:** FR-017–FR-019.  
**Approved decision:** D-008.

The knowledge system must support approved official memoranda and announcements for selected reporting periods, including the current week.

### Required information

Appropriate memorandum records must preserve:

- The issuing office.
- Relevant official source.
- Applicable dates.
- The exact eligible institutional source version.
- Applicable validity or withdrawal information.

### Manila-time handling

Reporting periods must be interpreted using Asia/Manila.

The following require separate approval:

- Exact beginning and ending of the week.
- Additional period options.
- Publication versus effective-date selection rules.
- Handling of documents spanning multiple periods.

### Absence semantics

When no matching approved memoranda are available in the TRAIL knowledge base, the system must communicate that knowledge-base limitation.

It must not claim that the university issued no announcements or memoranda.

## 21. Source refresh, withdrawal, and supersession

**Relevant requirements:** FR-031, FR-033–FR-035; NFR-012.  
**Approved decisions:** D-005, D-010.

### Changed source flow

1. A registered source is checked or updated.
2. Changed content is identified as a distinct version.
3. The new version is staged for review.
4. Its provenance is validated.
5. An independent Knowledge-Base Manager reviews it.
6. Only after approval and eligibility checks can the new version enter authorized processing and retrieval.

### Existing approved content

An earlier approved version may remain available while the new version is pending only if the earlier material remains valid and has not been officially withdrawn or superseded.

### Withdrawal and supersession

The system must prevent invalidated source versions from remaining available through:

- Direct retrieval.
- Cached results.
- Derived indexes.
- Delayed background jobs.
- Previously staged processing requests.

The precise invalidation and concurrency mechanisms require approved implementation design.

## 22. Auditing, version history, and retention

**Relevant requirements:** FR-032–FR-035; NFR-006, NFR-009, NFR-012.  
**Approved decision:** D-010.

The governance system must preserve meaningful evidence of:

- Source registration and provenance.
- Submitted content-version identity.
- Submission actor.
- Review actor.
- Approval or rejection outcome.
- Relevant review timestamps.
- Changed, withdrawn, or superseded versions.
- Applicable processing and eligibility transitions.

### Audit integrity

Audit history must support reconstruction of which version was eligible at a relevant point in time.

It must be protected against unauthorized alteration and inappropriate disclosure.

### Retention

Exact retention periods, archive methods, audit access permissions, and deletion procedures remain open decisions.

Private student concern data must not be included in institutional knowledge audit or retrieval material merely for convenience.

## 23. Security, privacy, and failure handling

RAG source content is an input to the application, not an instruction source with authority over system behavior.

### Source-content threats

Future implementation must address:

- Malicious instructions embedded in webpages or uploaded documents.
- Source spoofing or forged provenance.
- Unsafe URL access and redirects.
- Harmful or malformed documents.
- Sensitive information embedded in otherwise public-looking material.
- Unapproved-content exposure through background workers.
- Cross-user data leakage.
- Unsupported citations or hallucinated references.

### Data boundaries

The application must not retrieve confidential university student records or modify official university records.

Student concerns and protected user information must remain separate from public institutional RAG.

### Failures

The application must not hide provider or MongoDB failure behind apparently verified institutional answers.

Temporary demo behavior may remain only when explicitly identified under the approved development policy.

The detailed security controls and verification obligations are documented in `SECURITY_PRIVACY.md`.

## 24. Integration, testing, and evidence

The RAG and knowledge system depends on several separately verified components.

| Dependency | Required future evidence |
|---|---|
| Database | Real connectivity, source/version persistence, and durability |
| Authentication | Verified identity and session handling |
| RBAC | Three backend-enforced roles |
| Source submission | Official origin and required provenance |
| Knowledge review | Exact-version approval and self-approval denial |
| External processing | No provider transmission of unapproved content |
| Retrieval | Current eligible-version filtering |
| Citations | Substantive support for generated institutional claims |
| Memoranda | Correct selected-period and Manila-time behavior |
| Student privacy | No private concern or confidential record exposure |
| Failures | Accurate database/provider errors and safe retries |
| Demo transition | Explicit separation and approved retirement conditions |

### Negative-path test scenarios

Later authorized verification must include:

1. Student tries to access protected source management.
2. Admin tries to approve without independent manager authority.
3. Submitting Knowledge-Base Manager attempts self-approval.
4. Manual entry lacks an issuing office.
5. Manual entry lacks an independent official reference.
6. Pending version is requested through retrieval.
7. Rejected version is requested through retrieval.
8. Changed version attempts to inherit prior approval.
9. Pending version reaches an embedding or generation job.
10. Approved version is withdrawn while indexed.
11. Background job uses stale version eligibility.
12. Citation references a passage that does not support the claim.
13. Student requests information absent from the approved corpus.
14. Memorandum period yields no approved records.
15. Confidential student data appears in a candidate source.
16. AI provider or database becomes unavailable.
17. Session context or response is exposed to another user.

These are proposed future test scenarios, not executed tests.

No historical passing-test total should be presented as current end-to-end acceptance evidence.

## 25. Open decisions, acceptance, and project authority

### Open technical decisions

The following remain unresolved:

- Actual source-registration and ingestion code paths.
- Operational MongoDB storage and search integration. Owner-reported configuration is recorded in `DATABASE.md`, but connection, persistence, indexing, and RAG readiness remain unverified.
- Exact institutional source-state machine.
- Official-reference verification procedures.
- Version representation and integrity strategy.
- Reviewer concurrency controls.
- Accepted document formats and safe parsing.
- AI and embedding provider configuration.
- Chunking, indexing, and ranking strategies.
- External-provider isolation and job durability.
- Retrieval-cache invalidation.
- Citation evaluation methodology and acceptance thresholds.
- Memorandum date boundaries and filtering rules.
- Audit event structure and retention.
- Data handling for incident investigation and recovery.

### Maintenance and acceptance criteria

`RAG_KNOWLEDGE_BASE.md` remains acceptable as a living foundational reference when:

1. Original SRS requirements and approved decisions are preserved.
2. Official issuing-office publication authority is respected.
3. Exactly three distinct TRAIL roles are maintained.
4. Institutional source submission and independent review are separated.
5. Self-approval is prohibited.
6. Manual entries require issuing-office provenance and independent official support.
7. Changed versions require new approval.
8. Pending and ineligible content cannot enter student retrieval.
9. Pending content cannot reach external AI-generation or embedding providers.
10. Citation grounding requires substantive claim support.
11. Missing, conflicting, and outdated knowledge is handled truthfully.
12. Memorandum period requirements remain intact.
13. Private student and concern data are excluded from public RAG.
14. Audit, version history, and retention duties are represented.
15. Historical evidence is not mistaken for current verified operation.
16. Unresolved implementation choices are clearly identified.
17. Markdown completeness and structure are verified.
18. The project owner accepts the documentation.

### Change control and authority

Future changes must identify their approved checkpoint, relevant requirements and decisions, supporting evidence, and affected project documents.

The project owner retains final authority over repository operations, architecture, scope, acceptance, and phase advancement.

Codex may inspect or modify the local repository only within separately approved checkpoint boundaries.

Preparation or acceptance of this document does not by itself authorize RAG implementation, AI-provider calls, database operations, or work outside an owner-approved checkpoint.

