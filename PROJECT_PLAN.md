# TRAIL AI Desk — Project Development Plan

**Project:** TRAIL AI Desk  
**Institution:** University of Science and Technology of Southern Philippines (USTP), Cagayan de Oro Campus  
**Document status:** Active roadmap reference; current modernization pending owner acceptance  
**Phase 00 status:** Closed — **READY WITH DOCUMENTED LIMITATIONS**  
**Current phase:** Phase 01A — backend and MongoDB foundation work ongoing; completion not established  
**Originally prepared:** November 3, 2026  
**Last updated:** November 8, 2026  
**Requirements baseline:** Original October 2026 SRS — 36 functional and 12 non-functional requirements  
**Decision baseline:** Approved P00-D decisions, as recorded in `DECISIONS.md`  
**Execution environment:** VS Code with Codex operating on the project owner's local repository  
**Repository root:** `C:\Users\Rensel\TRAIL-AI-Desk`  
**Provenance:** Recovered from the P00-E4 clean backup and modernized under the current documentation checkpoint; recovery is not evidence of prior repository acceptance or operational success.

## 1. Purpose

This document maintains the development roadmap for TRAIL AI Desk, including phases, milestones, dependencies, deliverables, implementation priorities, risks, evidence requirements, and approval gates.

Use this document for project sequence, lifecycle state, gates, dependencies, and risks. Use [IMPLEMENTATION.md](./IMPLEMENTATION.md), [DATABASE.md](./DATABASE.md), [API.md](./API.md), and [APP_FLOW.md](./APP_FLOW.md) for domain detail; this roadmap does not replace their evidence registers or authorize their implementation work.

Its objectives are to:

- Preserve the approved project direction.
- Guide incremental completion of the existing application.
- Connect development work to the original SRS.
- Prevent premature implementation or phase advancement.
- Separate historical functionality from verified functionality.
- Define meaningful evidence requirements for each major phase.
- Maintain continuity between project-owner decisions, ChatGPT planning, and authorized Codex implementation.

The recovered Phase 00 text recorded the roadmap's overall structure as accepted. Recovery and current modernization do not independently establish acceptance of this version; future implementation details, milestone acceptance criteria, and phase-specific execution tasks still require separate approval.

This document does not establish that application features are implemented, tests pass, or the system is ready for production.

## 2. Project overview and boundaries

TRAIL AI Desk is a student-facing institutional information assistant intended for USTP Cagayan de Oro Campus.

The approved target uses Retrieval-Augmented Generation (RAG) to answer questions grounded in approved institutional information.

Intended capabilities include:

- Secure user authentication and authorization.
- Student-facing university information and chatbot services.
- Institutional source registration and knowledge-base management.
- Independent Knowledge-Base Manager approval of institutional information.
- Approved-source retrieval and substantiated citations.
- Official memoranda and announcements, including selected-period viewing.
- Private and durable student concern submission.
- Appropriate administration, auditability, security, and operational safeguards.

### Scope restrictions

The application must not access confidential student grades, personal schedules, financial balances, or private records controlled by other university systems.

It must not directly modify official university records or represent itself as an authorized university transaction-processing system.

Private student concerns must not be inserted into the public institutional knowledge base.

The system must not claim that university information is officially verified merely because a record exists in its database or contains a citation.

## 3. Authoritative project sources

Development planning and implementation must respect the following sources and their different purposes:

| Source | Purpose | Authority or limitation |
|---|---|---|
| Original October 2026 SRS | Functional and non-functional requirements | Original requirements baseline |
| `REQUIREMENTS_TRACEABILITY.md` | Maps all 48 requirements to evidence and gaps | Accepted traceability baseline; not runtime certification |
| `DECISIONS.md` | Records approved architectural and governance choices | Authoritative approved project direction |
| `AGENTS.md` | Defines coding-agent instructions and execution boundaries | Applies to authorized repository work |
| `README.md` | Project overview and development setup | Historical implementation descriptions and accepted documentation corrections |
| Historical development and implementation reports | Earlier implementation and testing information | Historical evidence, not current verification |
| Owner-approved checkpoint instructions | Defines the specific authorized task | Governs that task's execution boundaries |

When documents appear inconsistent, the original requirement must remain identifiable and later approved changes must be traced explicitly.

An implementation shortcut or historical repository behavior does not override an approved decision.

## 4. Current project baseline

### 4.1 Known historical architecture

Earlier authorized inspections and project documentation describe:

- An Expo v57, React Native, Expo Router, and TypeScript frontend.
- A native Node.js HTTP backend.
- MongoDB-oriented services and persistence structures.
- Optional Gemini-based generation and embeddings.
- Knowledge-source ingestion, retrieval, and historical Admin-oriented management functions.
- Demonstration profiles and local demonstration workflows.

These descriptions are historical evidence. They do not prove that every component is currently operational.

### 4.2 Important unverified capabilities

Current end-to-end verification has not established:

- A successful backend MongoDB connection. The current Atlas configuration is owner-reported, prior diagnostics failed with `ECONNREFUSED`, and the root cause is not conclusively determined; see the controlled register in [DATABASE.md](./DATABASE.md#20-mongodb-inspection-and-verification-register).
- Durable database persistence through restarts.
- Complete production authentication and account recovery.
- Backend-enforced authorization for all three approved roles.
- Independent Knowledge-Base Manager approval.
- Mandatory approval of every changed source version.
- Isolation of pending content from external AI and embedding providers.
- Complete citation grounding.
- Selected-period memorandum functionality.
- Private durable student concern submissions.
- Physical-device acceptance or production deployment readiness.

The historical 75/75 passing-test claim must not be interpreted as a current test result.

### 4.3 Lifecycle status and Phase 00 history

Phase 00 is closed **READY WITH DOCUMENTED LIMITATIONS**. The checkpoint identifiers below are retained as historical records; closure does not convert unexecuted or unverified work into completed evidence.

| Checkpoint group | Status |
|---|---|
| P00-C — Requirements and SRS audit | Completed |
| P00-D — Major architectural and governance decisions | Approved |
| P00-E1 — Historical inspections and SRS reconciliation | Completed and accepted |
| P00-E2 — Documentation blueprint | Accepted |
| P00-E3A–E3B — Inventory and existing documentation inspection | Completed |
| P00-E3C–E3E — README correction and acceptance | Completed |
| P00-E3F–E3H — Requirements traceability preparation and acceptance | Completed |
| P00-E3I–E3K — Decision register preparation and acceptance | Completed |
| P00-E3L — Project plan preparation | Accepted |
| P00-E3M — Project plan creation | Historical creation authorization; recovery does not itself establish acceptance |
| P00-F — Phase 00 consolidation and readiness | Historical readiness concept; Phase 00 closed with documented limitations |
| Phase 01A — MongoDB troubleshooting | Ongoing under bounded owner approvals; not complete |

### 4.4 Documentation inventory status

The following root-level documents have accepted or verified content:

- `AGENTS.md`
- `README.md`
- `REQUIREMENTS_TRACEABILITY.md`
- `DECISIONS.md`

The two preserved historical reports are:

- `docs/TRAIL-DEVELOPMENT-STATUS.md`
- `docs/TRAIL-IMPLEMENTATION-REPORT.md`

The Phase 00 baseline originally classified the following root-level documents as proposed:

- `PROJECT_PLAN.md`
- `IMPLEMENTATION.md`
- `APP_FLOW.md`
- `DATABASE.md`
- `API.md`
- `RAG_KNOWLEDGE_BASE.md`
- `SECURITY_PRIVACY.md`
- `TESTING.md`
- `BUGS.md`
- `DESIGN.md`
- `CHANGE_REQUESTS.md`

That historical classification is retained for provenance but no longer establishes current file presence or acceptance. The five documents inspected and modernized in the current checkpoint are `PROJECT_PLAN.md`, `IMPLEMENTATION.md`, `APP_FLOW.md`, `DATABASE.md`, and `API.md`; each still requires owner review of the current changes.

The actual repository file state must be established through authorized evidence; a planning reference does not itself establish file existence.

## 5. Development governance

### 5.1 Owner-controlled execution

The project owner must authorize each bounded repository task.

ChatGPT is responsible for planning assistance, requirements analysis, architectural review, documentation drafting, and evaluation of submitted evidence.

Codex may inspect, edit, or test the local repository only within the permissions granted for the current checkpoint.

No completed checkpoint automatically authorizes another checkpoint.

No phase may be advanced solely because a document has been created or a historical implementation has been described.

### 5.2 Required execution cycle

The intended controlled workflow is:

1. Identify the current phase and checkpoint.
2. Define the objective and specific permitted scope.
3. Obtain explicit project-owner approval.
4. Provide bounded instructions to Codex when repository operations are required.
5. Execute only the authorized work.
6. Collect the Codex report and relevant evidence.
7. Review results and deviations.
8. Accept the outcome, require correction, or document limitations.
9. Propose the next bounded task.
10. Obtain separate approval before proceeding.

### 5.3 Evidence classification

Development reporting must distinguish:

- **Proposed:** Planned but not approved or executed.
- **Approved:** The project owner has authorized the direction or specific task.
- **Reported complete:** Codex reports completing the task.
- **Evidence reviewed:** The relevant output has been assessed.
- **Accepted:** The owner-approved acceptance process has been satisfied.
- **Verified operational:** Current, relevant execution or test evidence demonstrates the stated behavior.
- **Blocked:** Completion requires resolving a documented impediment.

Documentation acceptance does not imply operational verification.

### 5.4 Execution-boundary deviations

Unexpected commands, attachment-access attempts, unauthorized inspections, or modifications must be disclosed in checkpoint reports.

Repeated procedural deviations should be addressed through clearer direct instructions and appropriately bounded tool use.

An execution deviation must not be concealed because its observed impact appears harmless.

## 6. Development phases and milestones

The project follows a ten-phase sequence.

Phases 01–09 establish planning direction, not blanket implementation authorization.

| Phase | Development focus | Proposed milestone |
|---|---|---|
| 00 | Planning, requirements, decisions, documentation | M00 — Owner-accepted project readiness |
| 01 | Backend and infrastructure | M01 — Verified database and backend foundation |
| 02 | Authentication and RBAC | M02 — Verified authentication and three-role enforcement |
| 03 | Institutional knowledge governance | M03 — Verified source/version approval lifecycle |
| 04 | RAG and citation reliability | M04 — Evidence-grounded retrieval and responses |
| 05 | Student information and concerns | M05 — Verified student-facing workflows |
| 06 | Admin and KB Manager interfaces | M06 — Role-appropriate management interfaces |
| 07 | Security, privacy, and reliability hardening | M07 — Reviewed and verified protective controls |
| 08 | Integration and system acceptance | M08 — Evidence-supported requirements acceptance |
| 09 | Deployment and operations | M09 — Owner-approved operational release |

Milestone identifiers are proposed planning references, not previously approved execution checkpoints.

No target completion dates, staffing commitments, or budget estimates have been approved.

## 7. Phase 00 — Planning, Requirements Validation, and Project Readiness

**Status:** Closed — **READY WITH DOCUMENTED LIMITATIONS**  
**Purpose:** Prepare a reliable basis for controlled implementation.

### Objectives

- Understand the historical application and architecture.
- Reconcile the original 48 SRS requirements.
- Record approved architectural and governance decisions.
- Identify known historical implementation conflicts.
- Create and reconcile foundational project documentation.
- Preserve evidence and uncertainty.
- Prepare the development roadmap.
- Establish an explicitly approved readiness process before implementation.

### Established accomplishments

- Original requirements reconciled.
- Major P00-D decisions recorded.
- Historical evidence inspected.
- Repository documentation inventory established.
- `AGENTS.md` instructions reviewed.
- `README.md` corrected and accepted.
- `REQUIREMENTS_TRACEABILITY.md` created and accepted.
- `DECISIONS.md` created and accepted.

### Limitations carried forward at closure

- Complete only documentation reconciliation that receives separate authorization.
- Preserve unresolved documentation acceptance and consistency issues.
- Carry unverified infrastructure, persistence, authorization, governance, and production-readiness work into the applicable later phases.
- Continue requiring explicit authorization for each infrastructure operation.

### P00-F — Phase 00 consolidation and readiness

P00-F was a Phase 00 planning concept. It is preserved here for historical continuity, but it is not a future gate that reopens Phase 00 and it must not be represented as fully executed without evidence.

Possible areas for later consideration include reviewing requirements coverage, decisions, documentation consistency, known risks, infrastructure prerequisites, and Phase 01A preparation.

These possibilities are **not an approved P00-F task list**.

### Proposed Phase 00 completion principle

The historical completion principle required explicit owner authority. Phase 00 has since closed **READY WITH DOCUMENTED LIMITATIONS**, and those limitations remain visible rather than being treated as completed work.

## 8. Phase 01 — Backend and Infrastructure Foundation

**Status:** Active at Phase 01A under bounded owner approvals; not complete  
**Dependency:** Phase 00 closure with documented limitations

### Primary objective

Establish the real backend and database foundation needed for the application.

### Phase 01A — MongoDB Connection and Troubleshooting

This is the current infrastructure priority.

**Current evidence:** the intended Atlas configuration is owner-reported, prior diagnostics failed with `ECONNREFUSED`, backend connection success is unconfirmed, and the root cause is not conclusively determined. Exact nonsecret configuration identifiers and remaining verification gaps are maintained in [DATABASE.md](./DATABASE.md#20-mongodb-inspection-and-verification-register).

**Proposed activities**

- Inspect authorized database configuration and connection code.
- Identify the actual MongoDB connection failure.
- Check required environment variables without revealing secrets.
- Verify connectivity to the intended database.
- Verify connection errors and retry behavior.
- Verify real data persistence and retrieval.
- Check required collections and indexes.
- Verify persistence after server restart.
- Confirm the application is not silently using demo data in place of failed database services.
- Document observed errors, causes, fixes, and test evidence.

Phase 01A is ongoing, but every action must remain within an applicable owner-authorized checkpoint. One approved execution batch may cover its listed commands, inspections, edits, tests, and documentation synchronization without artificial per-file approvals. This roadmap alone grants no execution authority.

### Other proposed Phase 01 work

- Assess the existing native Node.js HTTP architecture.
- Design incremental Express integration under D-001.
- Preserve useful existing backend services.
- Improve environment and configuration handling.
- Review startup, shutdown, and service failure behavior.
- Verify database-dependent backend operations.

### Proposed deliverables

- MongoDB connectivity evidence.
- Database configuration and architecture documentation.
- Verified persistence and retrieval results.
- Backend integration plan.
- Documented unresolved infrastructure issues.

### Proposed completion gate

Current test evidence must demonstrate successful database connection, persistence, retrieval, and appropriate failure handling.

A valid-looking connection string or existing database code is insufficient.

**Key requirements:** FR-001, FR-022, FR-032, FR-035, NFR-004, NFR-007.

## 9. Phase 02 — Authentication and Three-Role RBAC

**Status:** Proposed  
**Dependency:** Reliable backend/database foundation

### Primary objective

Establish real authentication and backend-enforced role-based authorization.

### Required roles

1. Student.
2. Admin.
3. Knowledge-Base Manager.

The Knowledge-Base Manager must be independent from the Admin role.

### Proposed activities

- Review and complete real login.
- Establish secure account provisioning and role assignment.
- Validate credentials and session handling.
- Complete password-recovery safeguards.
- Enforce authorization on protected backend operations.
- Implement secure Knowledge-Base Manager provisioning.
- Prevent public privilege escalation.
- Test role boundaries and unauthorized access.
- Test session expiry, logout, and revocation.
- Evaluate the approved retirement conditions for the temporary demo fallback.

Public self-registration is not assumed to be authorized merely because authentication is a project requirement; account creation and provisioning details require an approved design.

### Demo transition

The existing demo may remain explicitly labeled during early development.

After real database-backed operation, authentication, and three-role RBAC have been verified, the temporary live-application demo fallback is intended to be retired under a separately authorized checkpoint.

Demo behavior must never silently conceal production service failures.

### Proposed deliverables

- Verified authentication services.
- Three-role authorization model.
- Role provisioning guidance.
- Authentication and RBAC test evidence.
- Demo retirement readiness assessment.

### Proposed completion gate

All three roles are independently represented and enforced at the backend, with positive and negative authorization evidence.

**Key requirements:** FR-001–FR-005, FR-024, FR-030, NFR-007–NFR-009.

## 10. Phase 03 — Institutional Knowledge-Base Governance

**Status:** Proposed  
**Dependencies:** Verified backend, database, and authorization foundations

### Primary objective

Implement the approved institutional source lifecycle.

### Required workflow

1. The issuing university office officially approves and publishes the information.
2. An authorized Admin or Knowledge-Base Manager submits the source.
3. The source and exact content version are recorded with provenance.
4. An independent Knowledge-Base Manager reviews the submitted version.
5. Only approved and eligible source versions become retrievable.

### Proposed activities

- Register authorized official webpages and documents.
- Support appropriate HTML, PDF, and text processing.
- Capture issuing office, source origin, and supporting references.
- Validate manual-entry provenance.
- Implement source submission and review states.
- Enforce reviewer/submitting-user separation.
- Require renewed approval for changed content.
- Block pending and rejected content from student retrieval.
- Block unapproved content from external AI and embedding processing.
- Implement rejection, correction, resubmission, withdrawal, and supersession handling.
- Preserve reviewer identity, decisions, and version history.

### Proposed deliverables

- Knowledge-source lifecycle specification.
- Approved source/version persistence.
- Independent approval controls.
- External-processing approval gate.
- Governance test evidence.
- Audit records for source decisions.

### Proposed completion gate

An uploaded, refreshed, or extracted source must not become retrievable or externally processed before the applicable exact-version approval.

Historical automatic approval inheritance must be eliminated from the approved workflow.

**Key requirements:** FR-025–FR-035, NFR-005–NFR-006, NFR-009, NFR-012.

## 11. Phase 04 — RAG Retrieval and Citation Reliability

**Status:** Proposed  
**Dependency:** Source-governance approval and eligibility controls

### Primary objective

Deliver reliable institutional answers grounded in approved evidence.

### Proposed activities

- Restrict retrieval to eligible approved versions.
- Verify source/version/chunk metadata.
- Review lexical and vector retrieval behavior.
- Validate hybrid ranking and relevance.
- Test provider failures and appropriate fallback behavior.
- Strengthen claim-level citation support.
- Prevent unsupported references.
- Handle conflicting, missing, expired, or insufficient evidence.
- Preserve source coverage limitations.
- Verify source and citation display in student workflows.

### Proposed deliverables

- Approved-source retrieval workflow.
- Citation-grounding evaluation procedures.
- Test cases for evidence coverage and unsupported claims.
- External-provider privacy evidence.
- RAG failure-handling results.

### Proposed completion gate

Institutional answers must be traceable to eligible approved evidence, and citations must substantively support the claims they accompany.

**Key requirements:** FR-006–FR-012, NFR-004–NFR-006.

## 12. Phase 05 — Student Information and Service Workflows

**Status:** Proposed  
**Dependencies:** Backend, approved source retrieval, and appropriate privacy controls

### Primary objective

Complete real student-facing information and service functions.

### Student information

Proposed work includes:

- Student dashboard and category navigation.
- Approved information on academic and administrative topics.
- Office information, public contacts, and policies.
- Official announcements and memoranda.
- Selected-period memorandum filtering.
- Current-week date handling using Asia/Manila.
- Clear handling of withdrawn, expired, or superseded information.
- Accurate messages when no approved evidence is available.

### Student concerns

Proposed work includes:

- Replace the local-only concern preview with backend storage.
- Validate required input.
- Store submissions privately and durably.
- Enforce proper access restrictions.
- Provide truthful confirmation.
- Handle duplicate submissions.
- Establish retention and appropriate deletion procedures.
- Prevent concern records from entering public retrieval.
- Avoid falsely claiming official office receipt or resolution.

### Proposed deliverables

- Integrated student workflows.
- Selected-period memorandum functionality.
- Secure concern-submission backend.
- Student-flow acceptance evidence.
- Privacy and persistence test results.

### Proposed completion gate

Student features must use verified real services, and confidential concern information must be stored and accessed appropriately.

**Key requirements:** FR-004, FR-013–FR-023, FR-036, NFR-001–NFR-002, NFR-009–NFR-010.

## 13. Phase 06 — Admin and Knowledge-Base Manager Interfaces

**Status:** Proposed  
**Dependencies:** Backend authorization and knowledge governance

### Primary objective

Provide interfaces appropriate to each approved role.

### Admin interface

Proposed responsibilities include:

- Authorized operational administration.
- Approved user and account management.
- Institutional source submission.
- System status information.
- Appropriate activity visibility.

### Knowledge-Base Manager interface

Proposed responsibilities include:

- Review pending institutional content.
- Inspect issuing-office provenance.
- Review exact source versions.
- Approve or reject eligible submissions.
- Review changed versions independently.
- Inspect approval and rejection history.
- Manage eligibility and status of approved knowledge sources.

### Proposed deliverables

- Role-appropriate screens and workflows.
- Backend authorization evidence.
- Approval and rejection interaction tests.
- Administrative usability results.

### Proposed completion gate

Admin and Knowledge-Base Manager actions must be consistent with the approved backend role policy. Hiding frontend controls is not an authorization mechanism.

**Key requirements:** FR-003, FR-024–FR-035, NFR-007, NFR-011–NFR-012.

## 14. Phase 07 — Security, Privacy, and Reliability Hardening

**Status:** Proposed  
**Dependency:** Earlier security controls must already exist where relevant

### Primary objective

Review, strengthen, and verify system-wide protection and resilience.

### Proposed activities

- Authentication and authorization reviews.
- Backend input validation and output handling.
- Secure institutional-source fetching.
- SSRF prevention and parser isolation.
- External AI and embedding data protections.
- Student concern confidentiality.
- Secrets and credential handling.
- Rate limiting and abuse prevention.
- Source auditability and access restrictions.
- Durable background processing.
- Logging and monitoring.
- Backup and restore procedures.
- Reliability and recovery testing.
- Dependency and configuration review.

### Proposed deliverables

- Security and privacy assessment.
- Corrective action records.
- Reliability testing evidence.
- Privacy and audit-control verification.
- Backup and recovery verification.

### Proposed completion gate

Relevant security, privacy, and reliability controls must be supported by evidence, with unresolved limitations documented.

**Important:** Security and privacy safeguards must be incorporated in Phases 01–06 rather than postponed until Phase 07.

**Key requirements:** NFR-004–NFR-009, NFR-012 and applicable functional requirements.

## 15. Phase 08 — Integration Testing, System Validation, and Acceptance

**Status:** Proposed  
**Dependency:** Integrated features and necessary safeguards ready for testing

### Primary objective

Validate the application against all 48 original SRS requirements and later approved project decisions.

### Proposed activities

- Unit and backend integration testing.
- Live MongoDB testing.
- Authentication and RBAC testing.
- Knowledge approval lifecycle testing.
- Changed-version and approval-isolation testing.
- External-provider privacy testing.
- Retrieval and citation-grounding evaluation.
- Student workflow testing.
- Memorandum and concern testing.
- Frontend/backend integration testing.
- Network, provider, and database failure testing.
- Mobile-device and web-browser testing.
- Regression testing.
- Requirements traceability updates.

### Required testing distinctions

Reports must identify:

- Tests defined.
- Tests executed.
- Tests passed.
- Tests failed.
- Tests skipped.
- Manually verified capabilities.
- Unverified capabilities.
- Relevant environment, date, and limitations.

Historical 75/75 claims must not be imported as current test results.

### Proposed deliverables

- Current execution reports.
- Updated requirement-to-test mappings.
- Defect and issue records.
- Regression evidence.
- Requirements acceptance assessment.

### Proposed completion gate

All requirements must be accounted for with current evidence or explicitly documented, owner-reviewed limitations.

A comprehensive test count alone does not demonstrate SRS compliance.

**Key requirements:** FR-001–FR-036, NFR-001–NFR-012.

## 16. Phase 09 — Deployment, Operations, and Maintenance

**Status:** Proposed  
**Dependency:** Owner-accepted system validation and release readiness

### Primary objective

Prepare TRAIL AI Desk for controlled institutional operation.

### Proposed activities

- Establish approved hosting and deployment arrangements.
- Configure production credentials and environments.
- Verify database access.
- Verify HTTPS and secure API operation.
- Establish monitoring and alerting.
- Establish logging and operational diagnostics.
- Establish backup and restoration.
- Document deployment and rollback procedures.
- Define maintenance and update processes.
- Confirm operational responsibilities and access controls.
- Complete final production-readiness review.

### Proposed deliverables

- Deployment documentation.
- Verified operational configuration.
- Backup and recovery evidence.
- Monitoring and maintenance procedures.
- Owner-approved release decision.

### Proposed completion gate

The application must demonstrate a verified deployment and recovery process and receive explicit project-owner release approval.

**Relevant requirements:** All production-applicable requirements, particularly the NFRs.

## 17. Cross-phase dependencies and controls

The major dependencies are:

| Prerequisite | Dependent work |
|---|---|
| Phase 00 closure with documented limitations | Ongoing Phase 01A work and explicit carry-forward risks |
| Real MongoDB and backend foundation | Authentication, concern persistence, source history |
| Three-role backend authorization | Knowledge governance and protected interfaces |
| Independent source approval | Eligible institutional retrieval |
| Version-specific eligibility | Reliable RAG processing and citations |
| Source evidence and date metadata | Selected-period memorandum functions |
| Private storage and access controls | Production student concerns |
| Integrated capabilities | Full system validation |
| Current acceptance evidence | Production release |

These dependencies are architectural and risk-based. They do not prevent earlier approved design work or isolated testing where appropriate.

All implementation activities remain subject to bounded authorization.

## 18. Project risk and issue register

The following entries are based on historical findings or currently unverified capabilities. They must not automatically be treated as presently reproducible defects.

| ID | Risk or issue | Consequence | Proposed treatment |
|---|---|---|---|
| R-01 | Owner-reported Atlas configuration exists, but prior diagnostics failed with `ECONNREFUSED`; backend connectivity and persistence remain unverified and the root cause is inconclusive | Real authentication and persistence cannot be trusted | Continue bounded Phase 01A diagnosis and record evidence in `DATABASE.md` and `BUGS.md` |
| R-02 | Separate Knowledge-Base Manager RBAC not established | Improper authorization or review roles | Implement and test Phase 02 role boundaries |
| R-03 | Historical changed-version approval inheritance | Unreviewed content could become retrievable | Implement exact-version approval gate |
| R-04 | Pending source content may reach external AI providers | Governance and privacy violation | Enforce pre-provider approval controls |
| R-05 | Incomplete manual-entry provenance | Unsubstantiated institutional information | Require official references and validation |
| R-06 | Citations may lack substantive factual support | Misleading institutional answers | Evaluate claim-level grounding |
| R-07 | Memorandum period selection unverified | Incorrect or missing student information | Implement period-aware retrieval and tests |
| R-08 | Concern submission remains demo-only | No reliable private institutional submission record | Build durable protected workflow |
| R-09 | Demo fallback could mask service failure | False operational confidence | Maintain explicit demo labeling and truthful errors |
| R-10 | Historical tests mistaken for current evidence | Premature acceptance | Require dated current test results |
| R-11 | Background jobs and shared coordination unverified | Reliability and consistency risks | Review concurrency, durability, and recovery |
| R-12 | Deployment and operational safeguards unverified | Operational instability or privacy exposure | Establish evidence-based release gates |

Risk priority, current reproducibility, root cause, ownership, and resolution must be refined through separately authorized investigation.

Do not classify every historical risk as a confirmed current bug.

## 19. Documentation roadmap

The planned documentation set supports corresponding development activities:

| Document | Primary role |
|---|---|
| `PROJECT_PLAN.md` | Development sequence, gates, risks, and milestones |
| `IMPLEMENTATION.md` | Implemented architecture and development guidance |
| `APP_FLOW.md` | Navigation and user workflows |
| `DATABASE.md` | MongoDB data model, persistence, and indexes |
| `API.md` | Backend interfaces and endpoint contracts |
| `RAG_KNOWLEDGE_BASE.md` | Source governance, ingestion, retrieval, and citations |
| `SECURITY_PRIVACY.md` | Authentication, authorization, privacy, and security |
| `TESTING.md` | Test plans, execution evidence, and acceptance |
| `BUGS.md` | Evidence-based issue tracking and root causes |
| `DESIGN.md` | Frontend design guidance under owner direction |
| `CHANGE_REQUESTS.md` | Controlled scope and decision changes |

Actual implementation tasks and document updates require separate owner approval.

A document may evolve as verified implementation evidence becomes available; it must not present planned functionality as already implemented.

Update this roadmap when the owner changes a phase, checkpoint, dependency, acceptance gate, material risk, or approved project direction. Technical observations belong first in the applicable domain evidence document and should be summarized here only when they affect sequence, risk, or phase state.

## 20. Change management and decision control

Material changes to scope, requirements, architecture, security, institutional governance, or approved workflows require explicit owner authorization.

A proposed change should document:

1. The affected existing requirement or decision.
2. The reason for the change.
3. Functional and architectural impact.
4. Privacy and governance implications.
5. Affected phases and documents.
6. Testing and migration consequences.
7. The owner's approval or rejection.

The original SRS must remain traceable even when an approved later decision changes project direction.

Unresolved implementation details must be labeled open, not silently decided by a repository-editing agent.

## 21. Checkpoint reporting standard

Every authorized repository checkpoint should report:

- Checkpoint identifier and approved scope.
- Exact operations performed.
- Files inspected, created, or modified.
- Commands executed and their observed results.
- Tests performed or explicitly not performed.
- Evidence of completed work.
- Errors, limitations, and execution deviations.
- Changes in implementation or verification status.
- One bounded recommended next checkpoint.
- Confirmation that no unauthorized phase advancement occurred.

Reports must distinguish observed evidence from inference and historical claims.

## 22. Project and roadmap acceptance principles

A phase should not be declared complete solely because its planned deliverables exist.

The phase-acceptance review should establish:

- Owner-approved scope and completion criteria.
- Relevant implementation or documentation deliverables.
- Actual evidence of required behavior.
- Appropriate negative and failure-path testing.
- Resolution or documented treatment of material risks.
- Updated requirements and decision references.
- Known limitations and remaining dependencies.
- Explicit project-owner acceptance.

These principles are maintained planning standards. Exact phase-specific acceptance gates require approval before implementation.

## 23. Current bounded next steps

Phase 01A backend and MongoDB work is ongoing. The next useful checkpoints are to:

1. Reconcile the current documentation batch and obtain owner acceptance or specific corrections.
2. Continue bounded diagnosis of the prior `ECONNREFUSED` result without assuming that DNS, firewall, Atlas, credentials, or application code is the conclusive root cause.
3. Establish successful backend connection evidence before testing authentication, reads, writes, or persistence.
4. Record observed results, limitations, and any supported root cause in [DATABASE.md](./DATABASE.md), [IMPLEMENTATION.md](./IMPLEMENTATION.md), [BUGS.md](./BUGS.md), and [TESTING.md](./TESTING.md) within the same authorized checkpoint when those documents are materially affected.
5. Keep later phase advancement subject to explicit owner approval and evidence-supported gates.

These are bounded recommendations only. They do not authorize commands, provider access, database operations, source changes, or automatic phase advancement.

## 24. Project authority

The project owner retains final authority over scope, decisions, phase advancement, implementation, and acceptance.

ChatGPT may assist in planning and documentation review.

Codex may perform local repository actions only within the exact authorization granted.

No planning document, completed audit, or accepted checkpoint authorizes unrestricted future work.

