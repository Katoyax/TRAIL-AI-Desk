# TRAIL AI Desk — Database and Persistence Reference

**Project:** TRAIL AI Desk  
**Institution:** University of Science and Technology of Southern Philippines (USTP), Cagayan de Oro Campus  
**Document status:** Active persistence reference; current modernization pending owner acceptance  
**Phase 00 status:** Closed — **READY WITH DOCUMENTED LIMITATIONS**  
**Current phase:** Phase 01A — backend and MongoDB work ongoing; completion not established  
**Originally prepared:** November 4, 2026  
**Last updated:** November 8, 2026  
**Requirements baseline:** Original October 2026 SRS — FR-001–FR-036 and NFR-001–NFR-012  
**Decision baseline:** [DECISIONS.md](./DECISIONS.md)  
**Development roadmap:** [PROJECT_PLAN.md](./PROJECT_PLAN.md)  
**Implementation reference:** [IMPLEMENTATION.md](./IMPLEMENTATION.md)  
**API reference:** [API.md](./API.md)  
**Provenance:** Recovered from the P00-E4 clean backup and modernized under the current documentation checkpoint; recovery is not evidence of prior repository acceptance or operational success.

## 1. Purpose and scope

This document defines the approved persistence requirements and a provisional logical data architecture for TRAIL AI Desk.

Use it as the controlled reference for persistence obligations, nonsecret database-configuration evidence, operational limitations, and future verified data architecture. It is not a secret store, a substitute for [IMPLEMENTATION.md](./IMPLEMENTATION.md), or proof that MongoDB is connected.

It addresses:

- Historical MongoDB implementation evidence and current verification limits.
- Database connectivity, persistence, and failure-handling expectations.
- The three distinct application roles.
- Institutional source registration, provenance, and exact-version review.
- Knowledge-base retrieval eligibility and citation traceability.
- The external AI and embedding approval boundary.
- Memorandum date and reporting-period requirements.
- Private, durable student concerns.
- Auditability, retention, indexes, and future verification.
- Dependencies between database design and backend APIs.

This is a controlled persistence reference. It does not authorize database connections, migrations, collection creation, or repository modifications.

## 2. Authoritative references and evidence classifications

The governing references are:

1. Original October 2026 SRS.
2. `REQUIREMENTS_TRACEABILITY.md`.
3. Approved P00-D decisions in `DECISIONS.md`.
4. `PROJECT_PLAN.md`.
5. `IMPLEMENTATION.md`.
6. `APP_FLOW.md`.
7. Applicable accepted historical inspection evidence.

The following classifications must be preserved:

| Classification | Meaning |
|---|---|
| Historical evidence | Previously inspected or documented behavior |
| Approved requirement | An original SRS obligation or later approved decision |
| Proposed logical record | A conceptual persistence responsibility, not an existing MongoDB collection |
| Open design detail | A technical choice awaiting authorization |
| Owner-reported configuration | A nonsecret deployment fact supplied by the owner but not established by runtime evidence |
| Observed diagnostic result | A bounded observation that does not by itself establish root cause or operational readiness |
| Not verified | Current execution evidence is insufficient |
| Verified operational | Current authorized execution demonstrates the relevant behavior |

A proposed record or field in this document must not be presented as an existing database schema.

## 3. Current database baseline

### 3.1 Historical architecture

Earlier project evidence identifies:

- A Node.js backend using native HTTP handling.
- MongoDB-oriented service and persistence logic.
- Authentication-related data handling.
- Institutional knowledge sources and version metadata.
- Retrieval-related content or metadata.
- Administrative knowledge-management operations.
- Temporary local demonstration functionality.

The actual current database structure has not been independently revalidated for this documentation checkpoint.

### 3.2 Operational uncertainty

The approved Atlas target is host `cluster1.9duxxbp.mongodb.net`, application database `trail_db`, and database username `trail_db`. Under `P01A-MONGODB-CONFIG-FIX-01` on 2026-11-09, the privately loaded effective configuration passed fixed-output validation for those identifiers without exposing secret values. The checkpoint's single isolated read-only connection attempt reported `ATLAS_PING=FAIL` and `CLIENT_CLOSE=PASS`; no raw error category was collected, so the cause is not established. An earlier diagnostic separately reported `ECONNREFUSED`, which also remains non-conclusive.

The following remain unverified:

- Successful live MongoDB connection.
- Successful live connection using the validated `trail_db` target.
- Authorized database access.
- Functional database reads and writes.
- Persistence after service restart.
- Actual collection and index inventory.
- Real account and session persistence.
- Complete institutional approval history.
- Durable student concern storage.
- Backup and restoration behavior.

Historical code and earlier passing tests do not establish that these capabilities currently work.

### 3.3 Current infrastructure checkpoint

Phase 00 closed **READY WITH DOCUMENTED LIMITATIONS**. Phase 01A — MongoDB Connection and Troubleshooting — is ongoing under bounded owner approvals.

Its commands, access permissions, test environment, and execution boundaries must be defined by the applicable owner-authorized checkpoint. A coordinated approved batch may cover all listed operations without separate per-file approval.

This document records current evidence and obligations but grants no additional Phase 01A authority.

## 4. Persistence architecture principles

The intended persistence design must support:

1. Durable records for workflows requiring persistence.
2. Backend-controlled access.
3. Distinct identity and role assignments.
4. Traceable institutional source provenance.
5. Distinct immutable or reliably versioned submitted content.
6. Independent approval decisions associated with exact versions.
7. Retrieval restricted to approved and otherwise eligible content.
8. Prevention of unapproved external provider processing.
9. Private student concern storage.
10. Meaningful audit and retention controls.
11. Accurate error handling when storage is unavailable.
12. Reliable recovery from interruptions and retries.

Actual schema organization, data-access libraries, consistency mechanisms, and transaction boundaries require later verification and approval.

## 5. Proposed logical data domains

The following table describes conceptual data responsibilities, not confirmed physical collections.

| Logical domain | Information responsibility | Approved boundary |
|---|---|---|
| User identity | Registered account identity and authentication references | Protect credentials and account data |
| Role assignment | Student, Admin, or Knowledge-Base Manager authorization | Exactly three distinct application roles |
| Session and recovery | Authentication/session and password-recovery state where persistent storage is required | Secure expiry and revocation |
| Institutional source | Official origin, source identity, and submission context | Official issuing-office provenance |
| Source version | The exact content submitted for review | Changed content requires new approval |
| Review decision | Approve/reject outcome and independent reviewer evidence | No self-approval |
| Ingestion state | Processing eligibility, progress, and outcomes | Pending content excluded from external AI |
| Retrieval material | Eligible passages and related metadata | Approved-version association |
| Memorandum metadata | Official dates, issuing office, reporting information | Asia/Manila period support |
| Student concern | Protected submission and durable outcome | Not part of public knowledge retrieval |
| Audit history | Relevant actor, event, version, and decision evidence | Privacy-aware access and retention |

These domains may ultimately be represented by multiple collections, embedded documents, or other approved database structures.

No exact collection names or physical relationships are specified here.

## 6. User identity and role persistence

**Relevant requirements:** FR-001–FR-005, FR-024, FR-030; NFR-007–NFR-009.  
**Approved decision:** D-002.

The system must support exactly three application roles:

1. Student.
2. Admin.
3. Knowledge-Base Manager.

Persistence must support reliable server-side evaluation of a user's authorized role.

### Required properties

- Stable user identity sufficient for authentication and auditing.
- Secure credential handling.
- Controlled role assignment and provisioning.
- Account-status handling where required.
- Appropriate session and recovery state.
- Revocation and authorization checks.
- Separation of reviewer and submitter identity.

The Knowledge-Base Manager cannot merely be an Admin label displayed in the frontend.

### Open design questions

- Exact user record structure.
- Whether and how account identifiers connect to university identity systems.
- Session-storage approach.
- Token and recovery-record lifecycle.
- Role-change audit requirements.
- Provisioning and credential-recovery procedures.

No integration with confidential university student-record systems is authorized or assumed.

## 7. Institutional source records and provenance

**Relevant requirements:** FR-025–FR-032, FR-035; NFR-005–NFR-006.  
**Approved decisions:** D-003, D-004, D-010.

Institutional source persistence must preserve enough evidence to identify the officially originating information.

### Conceptual source information

Potential data responsibilities include:

- Official originating university office.
- Official webpage, document, or other authorized source reference.
- Source type.
- Submission identity.
- Submission time.
- Source metadata relevant to student display.
- Supporting references.
- Current eligibility and withdrawal context.
- Associated version history.

These are conceptual information categories, not approved field names.

### Official authority boundary

The university issuing office must officially approve and publish the information before it is treated as an institutional source eligible for TRAIL's approval workflow.

An authorized Admin or Knowledge-Base Manager may submit the information into TRAIL.

The official issuing office does not need a separate application account.

Database storage of submitted content is not proof of official publication or Knowledge-Base Manager approval.

### Manual entries

Each manual institutional entry requires:

1. An issuing university office.
2. An independent official supporting reference or verifiable official provenance.

Missing required provenance must prevent approval and retrieval.

## 8. Exact source version identity

**Relevant requirements:** FR-031–FR-035; NFR-012.  
**Approved decisions:** D-005, D-010.

Every content version that requires review must be identifiable separately from earlier versions.

### Mandatory invariants

- Approval applies only to the exact reviewed version.
- Changed content must receive renewed review.
- A later version must not inherit approval solely from an earlier one.
- Earlier approved material may remain eligible only while valid and not officially withdrawn or superseded.
- Historical decisions must remain attributable to the version they concerned.
- Retrieval material must retain its version association.

### Proposed technical considerations

Future design should assess:

- Stable source and version identifiers.
- Reliable content-change detection.
- Content fingerprints or integrity metadata.
- Version immutability or equivalent change safeguards.
- Revision sequencing.
- Concurrency and stale-review protection.
- Supersession and withdrawal history.

No content-hashing algorithm, identifier format, schema field name, or locking mechanism is approved by this document.

## 9. Independent review and approval persistence

**Relevant requirements:** FR-030–FR-035; NFR-007, NFR-012.  
**Approved decisions:** D-002, D-003, D-005, D-010.

Institutional knowledge review must support:

1. The exact submitted version.
2. The submitter's identity.
3. An eligible Knowledge-Base Manager reviewer's identity.
4. A decision on that version.
5. Relevant decision timing and history.
6. Reliable visibility of the resulting eligibility state.

The reviewer must be a different person from the submitter for the same submission.

### Required negative controls

- Student approval attempts must fail.
- Unauthorized Admin approval attempts must fail under the approved separation-of-duties model.
- A submitter's attempt to approve their own version must fail.
- An approval attempt against a stale or changed version must not silently apply to another version.
- Missing required official provenance must prevent approval.
- A rejected version must not become retrievable through an inconsistent state.

### Consistency considerations

The design must prevent a mismatch where a review decision succeeds but corresponding retrieval eligibility or audit history is falsely reported.

The use of transactions, atomic updates, optimistic concurrency, or another mechanism is an open implementation choice.

## 10. Source lifecycle and eligibility

The following conceptual lifecycle supports the approved governance model:

1. Official information is established by its issuing office.
2. Source and exact version are submitted.
3. Version is staged for internal validation.
4. Independent review takes place.
5. The version is approved or rejected.
6. Approved material may become eligible for permitted downstream processing.
7. Withdrawn, superseded, expired, or otherwise ineligible material is excluded from retrieval.
8. A changed version is staged and reviewed independently.

The exact lifecycle state names and transitions remain open technical design details.

### Eligibility rules

Student retrieval must evaluate the relevant version's current eligibility.

Approval status alone may be insufficient if a record has expired, been withdrawn, or otherwise lost eligibility.

Cached responses, search indexes, or derived documents must not bypass current eligibility controls.

## 11. Ingestion, embeddings, and derived records

**Relevant requirements:** FR-007–FR-012, FR-027, FR-031, FR-034, FR-036.  
**Approved decision:** D-006.

The system may require durable processing state for source extraction, chunking, embeddings, retrieval indexing, or background work.

### Mandatory processing gate

**Pending, rejected, or otherwise unapproved institutional source content must not be sent to external AI generation or embedding providers before approval of the exact version.**

This restriction applies to:

- New submissions.
- Uploaded documents.
- Manual entries.
- Changed webpage content.
- Source refreshes.
- Retries.
- Delayed or background processing jobs.

### Derived-material requirements

Where derived content is stored, future design must preserve associations with:

- The originating approved source.
- The exact eligible version.
- The relevant passage or chunk.
- Processing status and error evidence where needed.

An approved version becoming withdrawn or otherwise ineligible must not remain available indirectly through derived indexes or stale retrieval outputs.

### Open implementation details

- Exact internal preprocessing sequence.
- Background job storage and retry strategy.
- Provider-call orchestration.
- Derived-index invalidation.
- Embedding and search technology.
- Idempotency and interruption recovery.

The proposed technical architecture must be reviewed before implementation.

## 12. Retrieval metadata and citation provenance

**Relevant requirements:** FR-007–FR-011, FR-032–FR-035; NFR-005–NFR-006.  
**Approved decision:** D-007.

Institutional retrieval must preserve sufficient provenance to associate displayed claims with their supporting evidence.

### Conceptual metadata

Potential requirements include:

- Institutional source identity.
- Exact approved source version.
- Relevant supporting content.
- Official origin or issuing office.
- Appropriate publication or effective date.
- Eligibility or validity context.
- Source reference for citation display.

### Verification boundary

Retrieval metadata alone does not prove citation correctness.

Claim-level evaluation must establish that the cited material substantively supports the answer.

The database must not make unapproved or private records retrievable simply because they are technically indexed.

## 13. Memorandum and announcement persistence

**Relevant requirements:** FR-017–FR-019.  
**Approved decision:** D-008.

The intended system must support approved memoranda and announcements for a selected reporting period, including the current week.

### Required information responsibilities

Appropriate records must retain:

- The issuing office.
- The relevant official source.
- Applicable dates.
- The associated approved content or source version.
- Eligibility and validity information.

### Date handling

Period interpretation must support Asia/Manila.

The design must distinguish applicable date concepts rather than silently treating all dates as interchangeable.

Possible date concepts include:

- Publication date.
- Effective date.
- Reporting-period relevance.

The exact period-selection options, week-boundary convention, and date interpretation rules require later approval.

Storing timestamps consistently and converting for Asia/Manila presentation is a potential implementation approach, not an approved physical storage specification.

### Missing results

An empty query for a selected period means no matching approved records were found within TRAIL's available knowledge base. It does not prove that the university issued no memorandum.

## 14. Student concern persistence and privacy

**Relevant requirements:** FR-020–FR-023, FR-036; NFR-009.  
**Approved decision:** D-009.

Student concern submissions must eventually use private, durable backend persistence.

### Required properties

- Authenticated and appropriately authorized submission.
- Required-field validation.
- Durable storage of accepted submissions.
- Protection against unauthorized reads and changes.
- Accurate submission confirmation.
- Duplicate-submission safeguards.
- Appropriate retention and deletion controls.
- Truthful status updates.

### Confirmation semantics

The persistence model must distinguish:

1. Submission received for processing.
2. Submission successfully saved by TRAIL.
3. Official acknowledgement by an authorized university office.
4. Official resolution through an authorized workflow.

A record existing in the TRAIL database does not automatically establish official office receipt.

### Data separation

Student concern content must not enter the public institutional knowledge base or student-facing RAG retrieval.

Concern information must not be sent to an external AI provider merely because institutional-source processing uses that provider.

### Open details

- Exact concern form fields.
- Authorized office access and routing.
- Retention periods.
- Attachment policy.
- Duplicate-detection rules.
- Acknowledgement and resolution responsibility.
- Whether any student-facing tracking history is required.

These details require separate owner-approved specification.

## 15. Audit, version history, and retention

**Relevant requirements:** FR-032–FR-035; NFR-006, NFR-009, NFR-012.  
**Approved decision:** D-010.

The data architecture must support meaningful accountability for institutional governance.

### Required audit responsibilities

Appropriate history should establish:

- Who submitted a source version.
- Which version was reviewed.
- Who reviewed it.
- What decision was recorded.
- When relevant actions occurred.
- Why or how eligibility changed, where applicable.
- Which version supported institutional retrieval at a relevant point in time.

### Audit protection

Audit information must not become an unrestricted source of personal information.

Access should be controlled, and audit integrity should be protected against unauthorized alteration.

### Retention

Specific retention periods, archival rules, deletion procedures, and access permissions remain open implementation decisions.

Retention design must consider student concern privacy separately from institutional knowledge-source history.

## 16. Data consistency and concurrency

Future authorized implementation must assess consistency in workflows where multiple events can occur.

Examples include:

- Two reviewers acting on the same version.
- A source changing during review.
- A background job starting after a version is withdrawn.
- A retry occurring after a concern was already saved.
- A session being revoked while a protected request is pending.
- A source being superseded while a retrieval request is in progress.

The required behavior is to preserve authorization, exact-version identity, and truthful outcomes.

The specific consistency tools—transactions, conditional updates, unique constraints, or other mechanisms—remain proposed options pending inspection and approval.

## 17. Indexes and database performance

A database implementation may require indexes supporting:

- Account identity and controlled lookup.
- Source identity and version history.
- Pending review identification.
- Source approval and eligibility filtering.
- Time-bounded memorandum retrieval.
- Authorized concern access.
- Audit event retrieval.
- Safe deduplication or idempotency.

This is a list of workload requirements, not an approved physical index inventory.

Exact indexes, uniqueness rules, query plans, and performance measurements require current database evidence and approved design.

Index creation is not authorized through this document.

## 18. Database security and privacy

**Relevant requirements:** FR-036; NFR-007–NFR-009.

The approved architecture requires appropriate protection of:

- Credentials and account data.
- Authentication and recovery state.
- Role assignments.
- Institutional review decisions.
- Private student concerns.
- Configuration secrets.
- Audit history.
- Provider-related data.

Future implementation should verify:

- Server-side authorization on database-backed operations.
- Secure secret handling.
- Appropriate least-privilege database credentials.
- Input validation.
- Protected network access.
- Sensitive-data minimization.
- Privacy-aware logs.
- Backup access controls.
- Appropriate retention and deletion.
- Isolation of public institutional information from private data.

This document does not assert present compliance with Republic Act No. 10173 or any completed production security certification.

## 19. Database errors, availability, and recovery

**Relevant requirements:** NFR-004, NFR-007.

The application must communicate storage-dependent failures accurately.

Examples include:

- Database connection unavailable.
- Database operation rejected.
- Persistence not confirmed.
- Duplicate or conflicting operation.
- Temporary service interruption.
- Incomplete background processing.

### Required behavior

- Do not report an operation as saved before the backend can substantiate its completion.
- Do not convert a database failure into an apparent successful demo response.
- Do not claim official concern receipt when a database write merely succeeded.
- Avoid disclosing secrets or internal sensitive details in client errors.
- Preserve safe retry and recovery behavior.

### Future verification

Later authorized work should establish connection handling, write durability, restart recovery, failure reporting, and backup/restore behavior.

Current diagnostic evidence includes the earlier `ECONNREFUSED` result and the 2026-11-09 isolated attempt that passed sanitized configuration and database-target validation but returned `ATLAS_PING=FAIL`. Neither result establishes a root cause or a successful database operation. The repair now rejects missing, legacy, or mismatched live database configuration before initialization and does not convert a configured live connection failure into demo startup.

## 20. MongoDB inspection and verification register

This register separates owner-reported configuration, observed diagnostics, and verified operational evidence.

| Evidence item | Evidence class | Current observation | Limitation |
|---|---|---|---|
| MongoDB deployment target | Owner-approved configuration and source-validated policy | MongoDB Atlas | Deployment accessibility and successful backend use remain unconfirmed |
| Atlas host | Sanitized effective-configuration validation | `cluster1.9duxxbp.mongodb.net` | The isolated ping failed, so successful resolution and connection are unconfirmed |
| Intended database name | Source and test evidence | `trail_db` is required explicitly; legacy names are rejected | No successful live database operation has been observed |
| Database username | Sanitized effective-configuration validation | `trail_db` | Identifier only; never record its password or private URI |
| Environment keys | Owner-reported configuration | `MONGODB_URI`, `MONGODB_DATABASE` | Values and connection strings must not be recorded here |
| Prior Atlas diagnostic | Observed diagnostic result | Failed with `ECONNREFUSED` | Root cause is not conclusively determined |
| `P01A-MONGODB-CONFIG-FIX-01` isolated check, 2026-11-09 | Executed fixed-output validation and one read-only attempt | `CONFIG_VALIDATION=PASS`; `DATABASE_TARGET=PASS`; `ATLAS_PING=FAIL`; `CLIENT_CLOSE=PASS` | No retry, write, bootstrap, index creation, or root-cause diagnostic was performed |
| Backend connection entry point | Source evidence found | `server/src/db/mongo.mjs` uses the shared validator before `MongoClient` initialization | Successful runtime connection remains unverified |
| Backend connection and authentication | Not verified | No confirmed success | Atlas reachability, credentials, TLS, and database selection remain unverified |
| Actual collections | Not verified | No current accepted inventory | Requires authorized database/implementation evidence |
| Actual document schemas | Not verified | No current accepted schema evidence | Conceptual records below are not physical schema proof |
| Actual indexes and constraints | Not verified | No current accepted inventory | Requires authorized database evidence |
| Current data-access library and configuration | Source and test evidence found | MongoDB Node.js driver with shared explicit-target validation in `server/src/config.mjs` | Driver configuration tests do not establish live connectivity or persistence |
| Read/write persistence | Not verified | No confirmed operation | Requires authorized persistence checks |
| Persistence after restart | Not verified | No confirmed operation | Requires authorized restart/durability checks |
| Authorization through persistence services | Not verified | No accepted end-to-end evidence | Requires positive and negative three-role tests |
| Backup and restore | Not verified | No accepted evidence | Requires an approved recovery procedure and test |

No credentials, private connection strings, or secret values should be written into this register.

A future verified result should include the approved checkpoint, environment, observation, result, date, and limitations.

## 21. Database-to-API integration responsibilities

The backend API is responsible for enforcing the approved rules before or while performing persistence operations.

It must not depend on the frontend as the sole authority for:

- Authentication and RBAC.
- Submitter/reviewer separation.
- Version-specific eligibility.
- Approval-before-external-processing.
- Concern confidentiality.
- Source provenance validation.
- Accurate confirmation semantics.

`API.md` describes the conceptual operation contracts.

`DATABASE.md` describes the corresponding persistence obligations.

Neither document authorizes the other to invent current implementation details.

## 22. Requirement and decision mapping

| Data responsibility | Applicable references |
|---|---|
| Authentication, account and session records | FR-001–FR-005, NFR-007–NFR-009; D-002 |
| Institutional source registration and provenance | FR-025–FR-029, FR-032; D-003–D-004 |
| Independent review and version eligibility | FR-030–FR-035, NFR-012; D-002–D-005, D-010 |
| External AI processing boundary | FR-007, FR-027, FR-031, FR-036; D-006 |
| RAG evidence traceability | FR-007–FR-011, NFR-005–NFR-006; D-007 |
| Memoranda and periods | FR-017–FR-019; D-008 |
| Private durable concerns | FR-020–FR-023, NFR-009; D-009 |
| Audit and historical accountability | FR-032–FR-035, NFR-012; D-010 |
| Reliability and service failure | FR-012, NFR-004 |
| Confidential records and official-system boundaries | FR-036, NFR-009 |

All requirement IDs refer to the original SRS and accepted traceability baseline.

## 23. Open database design decisions

The following remain unresolved:

- Actual MongoDB connection failure and required remediation.
- Exact collection structure and document relationships.
- Account provisioning and session persistence.
- Stable source/version identity representation.
- Approval state machine and review-event schema.
- Manual-reference validation.
- Derived-content storage and invalidation.
- Background processing durability and retries.
- Exact memorandum date rules.
- Concern fields, routing, access, and retention.
- Audit event schema and retention.
- Indexes, uniqueness, and performance requirements.
- Backup, restoration, and migration procedures.
- Production database hosting and monitoring.

These are proposed investigation and design topics, not defects conclusively verified in the current repository.

## 24. Acceptance and maintenance criteria

`DATABASE.md` can be accepted as the maintained database reference when:

1. Historical MongoDB evidence is accurately distinguished from current verification.
2. No live database connection is falsely claimed.
3. No collection, schema, index, connection string, or operation is invented as an implemented fact.
4. Exactly three application roles are preserved.
5. Institutional issuing-office provenance is required.
6. Manual entry provenance is mandatory.
7. Independent review is tied to exact submitted versions.
8. Changed versions cannot inherit approval.
9. Pending versions cannot reach external AI or embedding providers.
10. Retrieval eligibility and citation provenance are addressed.
11. Memorandum date and Asia/Manila requirements are preserved.
12. Student concerns remain private and durable.
13. Audit, security, failure handling, and retention are addressed.
14. All unresolved technical decisions are explicitly identified.
15. The document remains consistent with [API.md](./API.md), [IMPLEMENTATION.md](./IMPLEMENTATION.md), and accepted project records.
16. Its Markdown structure and completeness are verified.
17. The project owner accepts the document.

Future revisions must use the approved checkpoint workflow and evidence from authorized repository inspection or testing.

Update this document when the owner changes the intended database configuration, or when authorized evidence changes connection status, supported root cause, collections, schemas, indexes, read/write behavior, restart durability, authorization persistence, backup/recovery, or data-governance obligations. Synchronize lifecycle impact with [PROJECT_PLAN.md](./PROJECT_PLAN.md), implementation facts with [IMPLEMENTATION.md](./IMPLEMENTATION.md), contracts with [API.md](./API.md), security controls with [SECURITY_PRIVACY.md](./SECURITY_PRIVACY.md), and verification/issues with [TESTING.md](./TESTING.md) and [BUGS.md](./BUGS.md).

Document acceptance does not establish database operation, production readiness, or legal compliance.

## 25. Project authority

The project owner retains final authority over technical architecture, database design, repository operations, implementation, and acceptance.

ChatGPT may prepare documentation and review evidence.

Codex may perform local repository operations only within separately approved checkpoint boundaries.

This document authorizes no work by itself. Phase 01A troubleshooting, database connections, schema or index changes, migrations, and application-code modifications must remain inside an explicit owner-authorized scope; once approved, that coordinated scope does not require artificial per-file approval.

