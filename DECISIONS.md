# TRAIL AI Desk — Project Decisions Register

**Project:** TRAIL AI Desk  
**Institution:** University of Science and Technology of Southern Philippines (USTP), Cagayan de Oro Campus  
**Document status:** Living approved-decision register — recovered from the P00-E4 backup and modernized through an owner-authorized documentation batch  
**Decision authority:** Project owner  
**Requirements baseline:** Original October 2026 Software Requirements Specification  
**Lifecycle status:** Phase 00 closed — READY WITH DOCUMENTED LIMITATIONS; Phase 01A ongoing  
**Historical provenance:** Consolidated November 3, 2026 under P00-E3I and P00-E3J; backup provenance does not independently prove historical acceptance  
**Modernized:** November 8, 2026

## 1. Purpose

This document records approved architectural, functional, institutional governance, privacy, and development decisions for TRAIL AI Desk.

Its purposes are to:

- Maintain a consistent record of project-owner-approved decisions.
- Explain how subsequent approved decisions interact with the original SRS.
- Prevent conflicting implementation assumptions.
- Support requirements traceability and controlled development.
- Distinguish approved decisions from proposals and unresolved implementation details.
- Preserve continuity between ChatGPT planning sessions and authorized Codex repository work.

This document does not establish that approved features are already implemented.

Developers and Codex should consult this register before proposing architecture, governance, security, role, data, RAG, or phase-sensitive work. Updates are required when the owner approves, rejects, clarifies, or supersedes a material decision. ChatGPT or Codex may prepare an authorized record; only the project owner approves the decision and any phase or scope effect.

## 2. Decision authority and evidence

The project owner has final authority over architectural choices, scope changes, checkpoint execution, implementation permissions, and acceptance.

The original SRS remains the requirements baseline. Later owner-approved decisions must be recorded separately and must not silently rewrite original requirement clauses.

An approved decision establishes project direction but does not automatically authorize source-code modifications or terminal commands.

| Classification | Meaning |
|---|---|
| Approved | Explicitly accepted by the project owner |
| Proposed | Suggested but not yet accepted |
| Superseded | Replaced by a later explicitly approved decision |
| Open | A detail or choice still requiring a decision |

Historical descriptions of repository behavior are evidence, not architectural approvals.

An implementation or test claim may be linked to a decision only when current, attributable evidence supports it. Recovery from the P00-E4 backup establishes document provenance, not proof of historical acceptance or operational completion.

The exact original approval timestamps for individual P00-D decisions have not been independently established here. Their approved status follows the accepted project handoff and subsequent owner confirmations.

**Decision ID convention:** D-001 and D-007 through D-010 were referenced in the project handoff. D-002 through D-006 are documentation identifiers established through the approved P00-E3I register specification for the remaining approved decisions. These identifiers must not be presented as independently recovered historical numbering.

## 3. Approved decision summary

| ID | Decision | Status |
|---|---|---|
| D-001 | Incremental Node.js and Express architecture | Approved |
| D-002 | Exactly three separate application roles | Approved |
| D-003 | Official institutional provenance and independent approval | Approved |
| D-004 | Mandatory official references for manual entries | Approved |
| D-005 | Renewed approval for changed source versions | Approved |
| D-006 | No external AI or embedding processing of pending content | Approved |
| D-007 | Substantive claim-to-evidence citation assurance | Approved |
| D-008 | Date-sensitive memoranda and Asia/Manila reporting periods | Approved |
| D-009 | Private and durable student concern workflows | Approved |
| D-010 | Auditability, source versioning, reviewer history, and retention | Approved |
| P00-D-DEMO | Temporary demonstration fallback and its retirement | Approved |

## 4. Individual decision records

### D-001 — Incremental Node.js and Express Architecture

**Status:** Approved  
**Decision source:** P00-D  
**Relevant area:** Backend architecture and infrastructure

**Decision**

TRAIL AI Desk will retain Node.js as its backend platform and introduce Express incrementally.

The historically inspected backend uses native Node.js HTTP. Useful existing services should be evaluated for preservation and reuse.

A wholesale backend replacement is not authorized without a separate owner-approved architectural decision.

**Implementation implications**

- Establish and verify the existing backend and database foundation first.
- Plan an incremental Express integration.
- Preserve useful functionality unless an approved change requires otherwise.
- Do not describe Express as implemented merely because it is the approved target.

**Verification**

Later authorized inspection and integration testing must establish the actual backend structure and behavior.

### D-002 — Exactly Three Distinct Application Roles

**Status:** Approved  
**Decision source:** P00-D  
**Related requirements:** FR-003, FR-024, FR-030, NFR-007

**Decision**

TRAIL AI Desk must have exactly three distinct application roles:

1. Student.
2. Admin.
3. Knowledge-Base Manager.

The Knowledge-Base Manager must be a separate role in backend-enforced role-based access control (RBAC), rather than merely an additional permission given to an Admin account.

This later approved decision supersedes the earlier SRS allowance for the Knowledge-Base Manager to share the administrator role.

**Implementation implications**

- Define secure role assignment and provisioning.
- Enforce backend authorization on every protected operation.
- Keep system administration distinct from institutional source approval.
- Do not assume an existing Student/Admin interface implements the third role.
- Prevent unauthorized access even if users bypass frontend navigation.

**Verification**

Prove all three roles through authenticated backend authorization tests and appropriate user workflows.

### D-003 — Institutional Provenance and Independent Human Approval

**Status:** Approved  
**Decision source:** P00-D  
**Related requirements:** FR-007, FR-025–FR-032, NFR-005–NFR-006

**Decision**

Institutional content follows this approved governance sequence:

1. The issuing university office officially approves and publishes information.
2. An authorized Admin or Knowledge-Base Manager submits the source or information to TRAIL.
3. A Knowledge-Base Manager independently reviews the exact submitted source version.
4. Only approved and otherwise eligible material becomes available for student-facing retrieval.

A separate issuing-office account is not required.

Submission into TRAIL does not replace official university publication or independent knowledge-base review.

The person who submits a version must not independently approve that same submission.

**Implementation implications**

- Preserve issuing-office identity and official source provenance.
- Record the exact submitted content or version.
- Establish independent reviewer identity.
- Restrict retrieval until the required approval is recorded.
- Apply approval rules in backend services, not merely frontend controls.

**Verification**

Test permitted submissions, independent reviews, self-approval rejection, and student retrieval eligibility.

### D-004 — Mandatory Provenance for Manual Entries

**Status:** Approved  
**Decision source:** P00-D, FR-029  
**Related requirements:** FR-028, FR-029, FR-032

**Decision**

Every manually entered institutional knowledge-base item must include:

- Its issuing university office.
- An independent official supporting reference or verifiable official provenance.

A manually entered statement is not sufficiently authoritative merely because an authorized TRAIL user submitted it.

**Implementation implications**

- Validate mandatory provenance fields.
- Reject submissions with missing required references.
- Associate supporting references with the exact source version.
- Preserve the provenance during review, retrieval, and revision.

**Verification**

Test valid entries and negative cases involving missing or inconsistent provenance.

### D-005 — Renewed Approval for Changed Source Versions

**Status:** Approved  
**Decision source:** P00-D, FR-034  
**Related requirements:** FR-031, FR-033–FR-035, NFR-005, NFR-012

**Decision**

A changed content version must receive renewed human approval before becoming eligible for retrieval.

Approval of an earlier version must not automatically transfer to a changed version.

An earlier approved version may remain retrievable during the new review only if it remains valid and has not been officially withdrawn or superseded.

**Implementation implications**

- Detect and stage changed content.
- Preserve separate version identities and approval states.
- Require independent review of the exact new version.
- Prevent automatic approval inheritance.
- Preserve applicable audit and supersession history.

**Verification**

Test changed-source staging, rejection, approval, withdrawal, supersession, and version-specific retrieval.

### D-006 — Restriction on External AI Processing of Pending Content

**Status:** Approved  
**Decision source:** P00-D  
**Related requirements:** FR-007, FR-027, FR-031, FR-036, NFR-009

**Decision**

Pending, unapproved institutional source content must not be transmitted to external AI-generation or embedding providers before the applicable Knowledge-Base Manager approval.

This is a mandatory governance and privacy boundary.

**Implementation implications**

- Separate internal submission and review from external-provider processing.
- Prevent unapproved ingestion or refresh jobs from invoking external AI or embedding providers with pending content.
- Preserve approval-to-version association.
- Permit subsequent processing only after the version becomes eligible.

This restriction does not independently authorize submission of confidential student information to external providers after approval.

**Verification**

Use provider-call isolation tests to establish that pending and rejected source versions are never externally processed.

### D-007 — Substantive Citation and Evidence Assurance

**Status:** Approved  
**Decision source:** P00-D  
**Related requirements:** FR-008, FR-010, FR-011, NFR-005–NFR-006

**Decision**

Institutional claims generated or displayed by TRAIL must be grounded in relevant, approved evidence.

The presence of a source identifier, official-looking URL, or citation marker alone is insufficient. The underlying cited material must actually support the claim.

**Implementation implications**

- Preserve source and version metadata.
- Restrict retrieval to eligible institutional content.
- Evaluate factual support, not just citation formatting.
- Represent insufficient or conflicting evidence accurately.
- Avoid unsupported confident claims.

**Verification**

Evaluate retrieved content, citations, claim-to-evidence support, refusals, and evidence-coverage limitations.

### D-008 — Memorandum Dates and Reporting Periods

**Status:** Approved  
**Decision source:** P00-D  
**Related requirements:** FR-017–FR-019

**Decision**

Memorandum and announcement functionality must account for effective dates, relevant reporting periods, and Asia/Manila time.

Students must be able to request official memoranda for a selected period, including the current week.

When no approved memoranda are present in the knowledge base for that period, TRAIL must communicate that limitation accurately.

**Implementation implications**

- Support selected-period filtering.
- Distinguish publication, effective, and relevant reporting dates where applicable.
- Apply defined Manila-time period boundaries.
- Preserve the issuing office and cited official source.
- Avoid converting missing knowledge-base evidence into a claim that no university announcement exists.

**Open implementation detail**

The exact week-boundary convention and any additional period options must be specified and accepted before final testing.

**Verification**

Test selected periods, date boundaries, empty results, superseded memoranda, and citation relevance.

### D-009 — Private, Durable Student Concerns

**Status:** Approved  
**Decision source:** P00-D  
**Related requirements:** FR-020–FR-023, NFR-009

**Decision**

Student concerns must eventually use a secure, durable backend workflow rather than relying on a local demonstration preview.

The required workflow includes:

- Input validation.
- Private durable storage.
- Appropriate authorization and access restrictions.
- Accurate submission confirmation or receipt.
- Duplicate-submission safeguards.
- Appropriate record retention.
- Truthful handling of official office acknowledgement and resolution status.

Student concern content must not enter public institutional retrieval.

**Implementation implications**

- Distinguish a saved submission from official receipt by a university office.
- Protect concern records from unauthorized users.
- Verify persistence and recovery.
- Design retention and duplicate-handling controls.
- Keep concern processing distinct from the public knowledge-base workflow.

**Open implementation detail**

Specific retention periods, office-routing procedures, and acknowledgement responsibilities require later owner-approved specifications.

**Verification**

Test validation, durable persistence, confidentiality, duplicate handling, and confirmation semantics.

### D-010 — Auditability and Source Version History

**Status:** Approved  
**Decision source:** P00-D  
**Related requirements:** FR-032–FR-035, NFR-006, NFR-012

**Decision**

Institutional information governance must maintain appropriate source versioning, approval status, reviewer history, administrative activity evidence, and retention controls.

**Implementation implications**

- Preserve source/version identity.
- Record review decisions and responsible reviewer identity.
- Maintain meaningful decision timestamps.
- Retain sufficient history to explain which version was eligible for retrieval.
- Support withdrawal, rejection, and supersession without silently replacing the evidence record.
- Design retention and audit access consistent with privacy requirements.

**Open implementation detail**

Exact audit-event fields, history-retention durations, and authorized access policies require later specification.

**Verification**

Test audit completeness, version reconstruction, reviewer attribution, retention behavior, and access authorization.

### P00-D-DEMO — Temporary Demonstration Fallback

**Status:** Approved  
**Decision source:** P00-D, subsequently clarified in project-owner discussion  
**Related requirements:** FR-012, NFR-004; production readiness

**Decision**

The existing demonstration functionality may remain clearly labeled during early development while real services are being established.

Demo behavior must not silently substitute for failed production services or conceal a failed database connection.

The existing demo fallback is intended to be retired from the live application after real database-backed operation, authentication, and the three-role RBAC model are established and verified, subject to the approved phase gates.

The final application must not depend on simulated data or demo authentication for its production operation.

**Implementation implications**

- Keep demo selection explicit.
- Identify demo data and sessions accurately.
- Do not present demo responses as real institutional retrieval.
- Report real service failures truthfully.
- Remove the temporary fallback only after its approved retirement conditions are met.
- Preserve controlled test fixtures where needed for development and verification.

**Clarification**

A separate permanent thesis-demonstration environment has not been approved or required.

No current instruction authorizes immediate removal of the demo during Phase 00.

**Verification**

Validate production failure handling, isolation of demo data, database-backed login, three-role authorization, and successful demo retirement.

## 5. Approved decisions versus historical implementation

| Area | Historically inspected state | Approved target |
|---|---|---|
| Backend | Native Node.js HTTP | Incremental Express integration |
| Roles | Student and Admin model historically documented | Student, Admin, separate Knowledge-Base Manager |
| Source review | Admin-oriented workflow | Independent Knowledge-Base Manager review |
| Manual provenance | Incomplete requirements enforcement suspected | Mandatory issuing office and official reference |
| Changed versions | Historical approval inheritance | Renewed exact-version approval |
| Embeddings | Historically may process content during ingestion | No external processing before approval |
| Citations | Citation display and partial validation | Substantive claim-to-evidence support |
| Memoranda | General freshness and announcement behavior | Selected-period retrieval with Manila-time handling |
| Concerns | Local demonstration preview | Secure durable submission workflow |
| Demo fallback | Existing labeled demo behavior | Temporary development aid; retired from live operation after approved gate |

This comparison is based on historical evidence. It does not assert that every historical behavior remains unchanged in the current repository.

## 6. Current evidence and verification limits

The following have not been established through current authorized integration testing:

- Successful live MongoDB connectivity.
- Database-backed persistence and restart durability.
- Complete three-role provisioning and authorization.
- Independent Knowledge-Base Manager approval enforcement.
- Exact-version reapproval and exclusion of pending content.
- Pending-content isolation from external AI and embedding providers.
- Complete claim-level citation accuracy.
- Selected-period memorandum functionality.
- Private durable concern submission.
- Production deployment readiness.

Historical passing-test claims, including the reported 75/75 result, are not current test evidence.

Phase 01A MongoDB/backend investigation remains ongoing. A prior sanitized Atlas diagnostic returned `ECONNREFUSED`; its root cause was not conclusively established. The updated Atlas configuration is owner-reported but unverified, and its exact infrastructure details are maintained in `DATABASE.md`. Successful connection, authentication, persistence, and durability therefore remain unverified.

## 7. Decision dependency and development sequence

These decisions guide implementation but do not independently authorize it.

The approved planning framework uses the following phase sequence. Phase 00 is closed with documented limitations; Phase 01A is the current ongoing backend/MongoDB investigation. This status does not advance any later phase.

| Phase | Primary focus |
|---|---|
| 00 | Planning, requirements validation, and documentation readiness |
| 01 | Backend and infrastructure foundation, beginning with separately authorized MongoDB troubleshooting |
| 02 | Real authentication and three-role RBAC |
| 03 | Institutional knowledge-base governance |
| 04 | RAG retrieval and citation reliability |
| 05 | Student information and concern workflows |
| 06 | Admin and Knowledge-Base Manager interfaces |
| 07 | Security, privacy, and reliability hardening |
| 08 | Integration testing and system acceptance |
| 09 | Deployment, operations, and maintenance |

Security and privacy requirements apply throughout development; they must not be postponed until Phase 07.

The detailed tasks and implementation actions for later phases require separate approval.

## 8. Open implementation decisions

The following are unresolved specification details, not newly approved project decisions:

| Area | Open question |
|---|---|
| Express migration | Exact integration order and service boundaries |
| RBAC | Secure Knowledge-Base Manager provisioning and credential lifecycle |
| Knowledge governance | Detailed submission/review state machine and administrative permissions |
| Source references | Validation requirements for different official document/reference types |
| Citation evaluation | Acceptance thresholds and assessment methodology |
| Memorandum periods | Exact week boundaries and supported period-selection options |
| Student concerns | Retention period, duplicate criteria, routing, and institutional acknowledgement |
| Audit history | Event schema, access permissions, retention, and backup rules |
| Demo retirement | Final verification checklist and whether any separate demonstration environment is justified |
| Deployment | Hosting, monitoring, backup, recovery, and production release criteria |

Open details must be resolved through appropriate owner-approved checkpoints. They must not be silently selected by Codex or inferred from existing code.

## 9. Change control

An approved decision remains authoritative until explicitly superseded.

Any proposed material change must identify:

1. The existing decision affected.
2. The reason for the proposed change.
3. The original SRS requirements affected.
4. Architectural, privacy, governance, and testing consequences.
5. Affected documents and implementation phases.
6. The project owner's explicit approval or rejection.

Future change proposals belong in `CHANGE_REQUESTS.md`; recording a proposal does not approve or authorize it.

Do not treat a new recommendation or historical implementation shortcut as an approved change.

## 10. Related project documents

- `AGENTS.md` — repository agent instructions and execution boundaries.
- `README.md` — project overview, historical implementation, and setup guidance.
- `PROJECT_PLAN.md` — phase objectives, dependencies, and milestone status.
- `IMPLEMENTATION.md` — inspected architecture, verified progress, and engineering gaps.
- `DATABASE.md` — MongoDB architecture and current configuration direction.
- `API.md` — backend contracts and authorization boundaries.
- `RAG_KNOWLEDGE_BASE.md` — knowledge governance and retrieval rules.
- `SECURITY_PRIVACY.md` — security, privacy, and role enforcement.
- `TESTING.md` — current and historical verification evidence.
- `BUGS.md` — confirmed defects and investigations.
- `DESIGN.md` and `APP_FLOW.md` — interface and workflow specifications.
- `REQUIREMENTS_TRACEABILITY.md` — original SRS clauses and evidence mappings.
- `CHANGE_REQUESTS.md` — proposed changes, impacts, and approval states.
- `docs/TRAIL-DEVELOPMENT-STATUS.md` — historical development status.
- `docs/TRAIL-IMPLEMENTATION-REPORT.md` — historical audit and implementation reporting.

Historical report links remain evidence references and do not override this decision register or prove current behavior.

## 11. Completion and acceptance criteria

The repository decision register is acceptable when:

- All approved P00-D decisions are represented accurately.
- The three separate roles are explicit.
- Official issuing-office approval and independent Knowledge-Base Manager review remain distinct.
- Manual provenance requirements are included.
- Changed-version approval inheritance is prohibited.
- Pending content is excluded from external provider processing.
- Citation, memorandum, concern, and auditability decisions are preserved.
- Temporary demo behavior and its retirement conditions are correctly represented.
- Approved decisions are separated from proposed implementation details.
- Original SRS requirements are not silently rewritten.
- Evidence limitations and open questions are clearly documented.
- No implementation or production-readiness claim is implied by completing the document.
- The project owner approves the final documentation.

Maintenance is triggered by an owner decision, an explicit supersession or clarification, or evidence that changes a recorded implementation relationship. Completion requires preserved IDs, accurate status, traceable authority, valid related-document links, and clear separation between decisions and operational evidence.

## 12. Project authority

The project owner retains final authority over the decision register, implementation instructions, source modifications, acceptance, and phase advancement.

ChatGPT may prepare and review proposed documentation. Codex may perform only explicitly authorized repository work.

Neither preparation of this document nor acceptance of its contents automatically authorizes implementation, database operations, Git operations, or phase advancement.

