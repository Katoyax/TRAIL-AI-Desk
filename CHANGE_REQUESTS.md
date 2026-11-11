# TRAIL AI Desk — Change Requests and Approval Control

**Project:** TRAIL AI Desk  
**Institution:** University of Science and Technology of Southern Philippines (USTP), Cagayan de Oro Campus  
**Document status:** Living change-control reference — recovered from the P00-E4 backup and modernized through an owner-authorized documentation batch  
**Lifecycle status:** Phase 00 closed — READY WITH DOCUMENTED LIMITATIONS; Phase 01A ongoing  
**Historical provenance:** Prepared November 4, 2026 under P00-E4L; backup provenance does not independently prove historical acceptance  
**Modernized:** November 8, 2026  
**Requirements baseline:** Original October 2026 SRS — FR-001–FR-036 and NFR-001–NFR-012  
**Decision baseline:** Approved P00-D decisions in `DECISIONS.md`  
**Development roadmap:** `PROJECT_PLAN.md`  
**Traceability reference:** `REQUIREMENTS_TRACEABILITY.md`  
**Implementation reference:** `IMPLEMENTATION.md`  
**Testing reference:** `TESTING.md`  
**Defect reference:** `BUGS.md`  
**Security reference:** `SECURITY_PRIVACY.md`

## 1. Purpose and scope

This document defines how TRAIL AI Desk proposes, evaluates, approves, implements, verifies, and records changes.

Its objectives are to:

- Preserve the original SRS as the traceable requirements baseline.
- Protect approved project decisions from unauthorized changes.
- Distinguish proposed changes from accepted decisions.
- Document functional, architectural, privacy, security, schedule, and testing impacts.
- Ensure the project owner controls scope and execution authorization.
- Prevent silent phase advancement or unrelated repository modifications.
- Coordinate relevant updates across planning and technical documents.
- Preserve a clear history of approval and implementation outcomes.

This document governs change-control preparation. It does not authorize any specific repository operation, system modification, or phase transition.

Developers, ChatGPT, and Codex should consult it when requested work would alter requirements, approved architecture, governance, security posture, phase sequencing, or accepted scope. Updates are triggered when a material proposal is submitted, reviewed, approved, rejected, superseded, implemented, verified, or closed. Authorized contributors may prepare records; the project owner controls approval, execution authorization, acceptance, and phase effects.

## 2. Authoritative change-control baseline

The primary references are:

1. Original October 2026 SRS.
2. `REQUIREMENTS_TRACEABILITY.md`.
3. `DECISIONS.md`.
4. `PROJECT_PLAN.md`.
5. `IMPLEMENTATION.md`.
6. `TESTING.md`.
7. `BUGS.md`.
8. Other accepted architectural, workflow, security, and design references.
9. Explicit project-owner approvals and applicable checkpoint reports.

### Authority hierarchy

The original SRS retains its original wording and identifiers.

Later approved project decisions may clarify or supersede particular implementation allowances without erasing the original requirements.

Proposed technical choices, historical reports, assistant recommendations, and Codex observations are not approved changes merely because they appear in documentation.

Where sources conflict, the governing decision and its approval evidence must be identified explicitly.

## 3. Existing approved decision baseline

`DECISIONS.md` contains the already approved P00-D decisions.

| Decision | Approved direction |
|---|---|
| D-001 | Retain Node.js and integrate Express incrementally |
| D-002 | Exactly three distinct application roles |
| D-003 | Official institutional provenance and independent KB Manager review |
| D-004 | Mandatory official supporting reference for manual entries |
| D-005 | Renewed approval for changed source versions |
| D-006 | No external AI or embedding processing of unapproved content |
| D-007 | Substantive claim-to-evidence citations |
| D-008 | Selected-period memoranda and Asia/Manila handling |
| D-009 | Private durable student concerns and truthful confirmation |
| D-010 | Institutional source versioning, auditability, reviewer history and retention |
| P00-D-DEMO | Explicit temporary demo support and controlled retirement |

These are existing approved decisions, not new change requests created by this document.

Their accepted identifiers must be preserved.

The D-002 through D-006 identifier convention is documented in `DECISIONS.md` and must not be misrepresented as independently reconstructed historical numbering.

## 4. Changes requiring controlled review

A change request may be necessary when a proposal affects:

- Original SRS functionality or quality expectations.
- Approved role or authorization boundaries.
- Institutional issuing-office authority.
- Independent source approval.
- Exact content-version governance.
- External AI disclosure restrictions.
- Citation and RAG evidence standards.
- Student concern privacy or status semantics.
- Database architecture or major data migration.
- Backend architecture or dependency strategy.
- API contracts with compatibility implications.
- User workflows or accepted visual-design decisions.
- Deployment security or operational responsibilities.
- Phase sequencing, milestones, or acceptance gates.
- Project scope, resources, or significant deliverables.

The fact that a change seems beneficial does not make it approved.

## 5. Change requests versus defect fixes

A defect is an evidenced failure to meet an applicable approved requirement or behavior.

A change request proposes a modification to what is required, how approved architecture should operate, or the controlled project scope.

| Situation | Primary handling |
|---|---|
| Existing required behavior fails under current evidence | `BUGS.md` |
| Existing requirement is ambiguous | Clarification and potentially a change request |
| New feature is proposed | Change request |
| Approved role model would be altered | Change request |
| Architectural direction would change materially | Change request |
| A narrow correction preserves approved behavior | Authorized defect-fix checkpoint |
| A defect fix requires changing an approved requirement | Defect record plus change request |
| Documentation header is outdated | Authorized documentation-maintenance task |
| Current evidence is missing | Verification or investigation proposal |
| An implementation detail remains open | Design proposal and applicable owner approval |

Not every implementation task requires changing the SRS.

However, all repository operations still require the applicable bounded owner authorization.

## 6. Change request identification

A proposed identifier convention is:

`CR-001`, `CR-002`, `CR-003`, and so on.

An identifier should be assigned when an actual request is entered into the controlled change register.

### Identifier distinctions

- `CR-###` — Proposed change record.
- `D-###` — Accepted project decision.
- `FR-###` — Original functional requirement.
- `NFR-###` — Original non-functional requirement.
- `R-##` — Existing project risk.
- `BUG-###` — Proposed defect-record convention.
- `P00-...` — Project checkpoint identifier.

A new change request must not reuse or overwrite an original SRS identifier.

An accepted request may lead to a decision update, but the CR and decision histories should remain distinguishable.

No new CR number is assigned by this draft.

## 7. Required change request fields

| Field | Purpose |
|---|---|
| Change request ID | Stable register identifier |
| Title | Concise proposed change |
| Requester | Person proposing the change |
| Date submitted | Submission date |
| Current status | Proposed, reviewed, approved, rejected, or other applicable state |
| Current baseline | Existing required or approved behavior |
| Proposed change | Requested new behavior or direction |
| Rationale | Why the change is being considered |
| Affected requirements | Original FR/NFR identifiers |
| Affected decisions | Existing D identifiers or demo policy |
| Affected documents | Expected documentation updates |
| Functional impact | User-facing behavior and workflow consequences |
| Architectural impact | Backend, frontend, database, API, or provider effects |
| Security/privacy impact | Confidentiality, authorization, external disclosure, and retention |
| Data impact | Schema, migration, compatibility, and recovery considerations |
| Testing impact | New, removed, or modified verification |
| Phase/dependency impact | Schedule and prerequisite implications |
| Alternative options | Other reasonable approaches |
| Risk assessment | Potential harms and mitigation |
| Proposed scope | Files, systems, and workstreams potentially affected |
| Owner decision | Explicit approval, rejection, or deferral |
| Execution authorization | Separate bounded implementation permission where applicable |
| Completion evidence | What was actually changed |
| Verification | Current test or review results |
| Acceptance | Final owner-reviewed outcome |

A change request should not falsely populate future execution fields.

## 8. Proposed change lifecycle

The following sequence is a planning model:

1. Identify a possible need for change.
2. Record the current approved baseline.
3. Describe the proposed change.
4. Identify requirements, decisions, and affected components.
5. Assess functional, technical, security, and privacy impacts.
6. Evaluate alternatives and risks.
7. Present the proposal to the project owner.
8. Record approval, rejection, request for revision, or deferral.
9. If approved, prepare a bounded execution package or task.
10. Obtain explicit execution authorization where repository or system actions are involved.
11. Perform only the authorized work.
12. Report resulting modifications and limitations.
13. Verify changed behavior.
14. Obtain final acceptance and update relevant documentation.

The sequence must not be shortened by interpreting a general planning approval as permission for unrelated implementation.

## 9. Proposed change statuses

| Status | Meaning |
|---|---|
| Proposed | Request recorded but not approved |
| Needs Clarification | Essential rationale or scope is unresolved |
| Impact Review | Effects and alternatives are being assessed |
| Approved in Principle | Direction accepted, execution scope not necessarily authorized |
| Preparation Authorized | Drafting or packaging activities specifically approved |
| Execution Authorized | Explicit bounded operational work approved |
| Implementation Reported | Authorized work reported as performed |
| Verification Pending | Current testing or evidence review remains |
| Accepted / Closed | Owner accepted the completed outcome |
| Rejected | Owner declined the proposed change |
| Deferred | Owner postponed consideration |
| Withdrawn | Requester or owner withdrew the proposal |

These are proposed tracking labels.

The explicit text and scope of the owner's actual approval control what actions are permitted, regardless of the status label.

## 10. Owner approval and execution boundaries

The project owner retains final authority over:

- Requirements and project scope.
- Architectural decisions.
- Application role boundaries.
- Official knowledge governance.
- Security and privacy decisions.
- Phase advancement.
- Repository access and modification.
- Testing and operational actions.
- Final checkpoint acceptance.

### Separate approval concepts

A project may distinguish:

1. Approval to investigate or prepare a proposal.
2. Acceptance of the proposed documentation or design.
3. Approval to prepare source artifacts.
4. Authorization to execute repository operations.
5. Acceptance of verified completed work.

These approvals are not automatically interchangeable.

### Codex boundary

Codex may inspect, create, edit, run commands, or perform other local repository operations only within an explicit, bounded authorization.

A previous checkpoint does not grant continuing unrestricted access.

## 11. Controlled scope definition

An executable change authorization should specify:

- Checkpoint ID.
- Objective.
- Permitted operations.
- Exact affected files or components where possible.
- Permitted commands or procedures.
- Source artifacts and integrity requirements.
- Existing-file protection rules.
- Forbidden operations.
- Required verification.
- Stop conditions.
- Completion report format.

### Scope escalation

If execution requires additional files, commands, permissions, dependencies, database operations, or network access beyond the approved scope, work must stop and obtain further owner authorization.

Agents must not interpret an implementation obstacle as permission to broaden the task.

## 12. Requirements baseline preservation

The original October 2026 SRS contains:

- FR-001 through FR-036.
- NFR-001 through NFR-012.

These 48 requirements remain traceable.

A later approved decision may affect how a requirement is implemented or interpreted.

### Example: role model

The original SRS allowed a knowledge-management function within an administrator-oriented model.

Approved D-002 requires a separate Knowledge-Base Manager role.

The original SRS record must not be silently rewritten or treated as though it originally mandated the new role design.

### Required traceability

A material change should preserve:

- Original requirement identifier.
- Original wording and source.
- Existing approved decision.
- Description of the new approved direction.
- Effect on implementation and testing.
- Current verification status.

`REQUIREMENTS_TRACEABILITY.md` remains the principal requirements-mapping reference.

## 13. Architecture change assessment

**Relevant decision:** D-001.

The approved direction retains Node.js and introduces Express incrementally.

A proposal for a wholesale backend rewrite would be a material architectural change requiring explicit owner review.

Similarly, proposals affecting database technologies, data models, major dependencies, provider arrangements, or deployment architecture require appropriate impact assessment.

### Assessment topics

- Compatibility with current verified behavior.
- Preservation of useful existing services.
- Data migration and rollback.
- Security and operational effects.
- Test coverage implications.
- Phase prerequisites.
- Additional dependency costs and maintenance.

The current implementation must be inspected only under authorized scope before asserting that a particular migration is necessary.

## 14. Role and governance change protection

**Relevant decisions:** D-002, D-003, D-004, D-005, D-010.

The approved governance model requires:

1. Exactly three distinct application roles.
2. Official publication by the issuing university office.
3. Authorized TRAIL submission.
4. Independent Knowledge-Base Manager review.
5. No self-approval.
6. Required official references for manual information.
7. Fresh review of changed versions.
8. Appropriate source and reviewer history.

Any proposal to alter these rules is a material governance change.

### Non-negotiable current baseline

Until the owner explicitly approves an applicable replacement decision, implementation must preserve the existing approved governance rules.

A convenience-driven UI change must not silently convert source submission into approval.

## 15. External AI, RAG, and citation changes

**Relevant decisions:** D-006, D-007.

Material proposals may involve:

- Changing AI or embedding providers.
- Modifying content eligibility gates.
- Changing source ingestion architecture.
- Altering retrieval or ranking methods.
- Introducing new data disclosures.
- Changing claim-grounding evaluation.
- Modifying citation display or provenance requirements.

### Required review

Every relevant proposal must assess:

- Approved versus pending content.
- Source version identity.
- User and concern privacy.
- External provider data handling.
- Citation accuracy.
- Retry and background-job behavior.
- Cache and index invalidation.
- Relevant tests and rollback needs.

Pending content must not be disclosed to external AI-generation or embedding providers under the existing approved D-006 rule.

No provider migration or model change is authorized by this document.

## 16. Memorandum and student concern changes

**Relevant decisions:** D-008, D-009.

### Memoranda

Changes to reporting periods, week boundaries, date selection, or official memorandum presentation require evaluation against the original FR-017–FR-019 obligations.

Asia/Manila remains the approved period interpretation context.

A missing TRAIL knowledge-base record must not be equated with absence of an official university memorandum.

### Student concerns

Changes to concern fields, attachments, routing, tracking, status reporting, access, or retention must preserve:

- Private handling.
- Durable submission.
- Accurate validation.
- Honest success and failure feedback.
- Distinction between TRAIL storage and official office acknowledgement or resolution.

The current approval does not establish an official university concern-management workflow.

New integrations with university systems would require separate review.

## 17. Security and privacy impact assessment

**Relevant requirements:** FR-036; NFR-007–NFR-009.

A material change should evaluate:

- Authentication and backend authorization.
- User-role boundaries.
- Sensitive-data collection.
- Student concern confidentiality.
- Source provenance and approval integrity.
- Provider disclosures and data retention.
- Client and backend secret handling.
- Logs, backups, and audit records.
- Operational recovery.
- Applicable institutional privacy obligations.

The original SRS references Republic Act No. 10173.

Change approval is not itself a certification of legal compliance.

Where needed, the appropriate institutional privacy or information-security authority must be consulted through an approved process.

No change request may be used to silently authorize access to confidential student records or modification of official university records.

## 18. Data migration, rollback, and recovery

Proposals affecting persistence should assess:

- Existing source and version records.
- User identity and role assignments.
- Approval and audit history.
- Derived retrieval indexes.
- Memorandum metadata.
- Private student concern records.
- Existing operational data.
- Backup and recovery expectations.

### Migration requirements

Before execution, the approved task should identify:

- Necessary prerequisites.
- Expected transformations.
- Data integrity checks.
- Backup or restoration safeguards.
- Failure and stop conditions.
- Verification and acceptance evidence.

The exact MongoDB schema and live database state remain unverified.

No data migration, schema creation, index modification, or database connection is authorized under P00-E4L.

## 19. Testing and regression impact

Every accepted change should identify the relevant test impact.

Possible consequences include:

- New functional test cases.
- Changed API contract tests.
- New authorization negative cases.
- Source-version approval tests.
- Provider-processing boundary tests.
- RAG citation evaluation updates.
- Memorandum period edge cases.
- Concern confidentiality and persistence tests.
- Performance or accessibility verification.
- Regression testing across related workflows.

A change is not operationally accepted merely because a file was edited or a patch was applied.

Testing remains subject to separate authorization.

`TESTING.md` defines the proposed execution and evidence reporting framework.

## 20. Defect-driven change requests

A confirmed defect may lead to a change request if its correction requires a material change to approved behavior or architecture.

### Example sequence

1. An authorized test demonstrates a current defect.
2. `BUGS.md` records the actual failure.
3. Investigation identifies a proposed correction.
4. The correction is compared with the accepted baseline.
5. If it would change an approved decision, a change request is prepared.
6. The owner reviews the change and its impact.
7. Execution requires an appropriate bounded authorization.
8. Current tests verify the resulting behavior.
9. The owner accepts or rejects the outcome.

### Restriction

A bug label must not be used to bypass change control.

Likewise, a change request must not be used to avoid acknowledging an existing confirmed defect.

## 21. Documentation changes

Documentation maintenance may include:

- Correcting outdated status headers.
- Updating accepted document inventories.
- Adding verified API routes or database structures.
- Recording tested implementation details.
- Updating requirement-to-test mappings.
- Recording new approved decisions.
- Correcting inconsistent cross-references.

### Administrative updates

A minor documentation correction may not require a material architectural change request.

However, the actual repository edit must still be authorized under the applicable project workflow.

### Historical observation and current maintenance

Some previously accepted Phase 00 documents retained preparation-stage metadata.

The November 8, 2026 owner-authorized recovery and modernization batch corrects those administrative fields and establishes the foundational documents as living references.

That documentation maintenance does not create a new architecture or scope decision, prove prior acceptance, or authorize application implementation.

## 22. Phase and schedule changes

The approved roadmap contains Phases 00 through 09.

Phase 00 is closed — READY WITH DOCUMENTED LIMITATIONS.

Historical P00-F planning remains part of the record and does not override the latest owner-approved status.

Phase 01A backend/MongoDB integration work is ongoing. The earlier Atlas diagnostic returned `ECONNREFUSED`, its root cause remains unknown, and the updated configuration remains owner-reported but unverified.

### Phase protection

A proposed change must not automatically:

- Advance to the next phase.
- Remove a prerequisite.
- Treat historical tests as current readiness evidence.
- Start MongoDB troubleshooting.
- Authorize new dependencies or network access.
- Trigger implementation outside the approved checkpoint.

Changes to phase sequencing or gates require explicit owner approval.

## 23. Change impact analysis template

For each material request, the following analysis should be prepared.

### A. Baseline

What behavior, architecture, requirement, or decision is currently approved?

### B. Proposed change

What exactly would be different?

### C. Rationale

What problem, opportunity, or constraint motivates the change?

### D. Alternatives

What reasonable alternatives exist, including retaining the current baseline?

### E. Functional impact

Which users, roles, screens, services, and workflows are affected?

### F. Technical impact

Which backend, frontend, database, API, RAG, or deployment elements would be affected?

### G. Security and privacy impact

What data, permissions, provider boundaries, or institutional safeguards are implicated?

### H. Requirements and decisions

Which original SRS requirements and accepted decisions would remain, change, or require clarification?

### I. Testing impact

What new evidence would be needed?

### J. Schedule and dependency impact

Which checkpoints or phases would be affected?

### K. Execution boundary

What operations would later require separate explicit authorization?

### L. Acceptance criteria

What evidence would demonstrate successful implementation?

Incomplete impact analysis must not be represented as full approval.

## 24. Decision records and accepted changes

Approved changes must remain traceable.

An accepted decision record should identify:

- Source request.
- Owner decision.
- Approved date or checkpoint when established.
- Exact accepted direction.
- Affected requirements.
- Superseded or clarified assumptions.
- Implementation implications.
- Testing implications.
- Remaining open details.

### Existing accepted decisions

D-001 through D-010 and P00-D-DEMO remain maintained in `DECISIONS.md`.

This document does not recreate their approval histories or assign new decision IDs.

### Future decisions

A future accepted request should be reflected in the appropriate decision record only through an approved documentation operation.

The existence of an accepted decision does not prove implementation or test completion.

## 25. Change request register and reporting

### 25.1 Requests recorded by documentation checkpoints

No new project-scope or architecture change request is submitted through P00-E4L.

The three Batch D drafts are documentation preparation under an already approved checkpoint, not proposals to change the accepted application architecture.

No `CR-###` identifier is assigned.

The November 8, 2026 recovery and modernization batch likewise records no new material change request and assigns no `CR-###` identifier.

### 25.2 Future request template

**CR ID:** To assign  
**Title:** To specify  
**Requester:** To identify  
**Date:** To record  
**Status:** Proposed  
**Existing approved baseline:** To reference  
**Proposed change:** To describe  
**Rationale:** To document  
**Affected FR/NFR:** To identify  
**Affected approved decisions:** To identify  
**Architecture impact:** Not yet assessed  
**Security and privacy impact:** Not yet assessed  
**Data and migration impact:** Not yet assessed  
**Testing impact:** Not yet assessed  
**Phase and schedule impact:** Not yet assessed  
**Alternatives:** Not yet evaluated  
**Owner approval:** Not granted  
**Execution authorization:** Not granted  
**Implementation evidence:** None  
**Verification evidence:** None  
**Acceptance:** Pending

This is a template, not a live change request.

### 25.3 Checkpoint reporting

After an authorized change operation, the completion report should identify:

1. Approved scope and checkpoint.
2. Exact work performed.
3. Files and systems affected.
4. Commands or operations executed.
5. Tests performed or not performed.
6. Actual results and supporting evidence.
7. Errors and deviations.
8. Remaining risks.
9. Acceptance status.
10. One bounded recommended next checkpoint.

No activity should be described as executed without supporting evidence.

## 26. Acceptance, maintenance, and project authority

### Documentation acceptance criteria

`CHANGE_REQUESTS.md` is accurate and maintainable when:

1. It preserves the original 48 SRS requirements.
2. It acknowledges the existing approved decision baseline.
3. It distinguishes changes from defects, risks, and open design questions.
4. It defines a traceable proposed change-record structure.
5. It requires functional and architectural impact assessment.
6. It includes security and privacy considerations.
7. It addresses data migration, rollback, and recovery implications.
8. It requires appropriate regression and acceptance evidence.
9. It distinguishes drafting approval from execution authorization.
10. It protects explicit owner authority.
11. It prohibits silent scope and phase expansion.
12. It preserves the three-role and independent-review governance baseline.
13. It preserves external AI provider restrictions.
14. It protects private student concerns and confidential records.
15. It does not fabricate new accepted decisions or change requests.
16. It keeps unverified implementation details labeled open.
17. It aligns with `PROJECT_PLAN.md`, `DECISIONS.md`, `TESTING.md`, and `BUGS.md`.
18. Markdown completeness and structure are verified.
19. Material change decisions and acceptance outcomes are explicitly owner-approved.

### Maintenance principles

Future updates must preserve the history of proposed, accepted, rejected, deferred, and implemented changes.

An approved implementation should be documented only after relevant actual evidence is available.

An accepted documentation draft is not proof that the corresponding application functionality is operational.

Updates must remain consistent with `DECISIONS.md`, `PROJECT_PLAN.md`, `REQUIREMENTS_TRACEABILITY.md`, `IMPLEMENTATION.md`, `TESTING.md`, and `BUGS.md`. Completion requires a supportable status, identified evidence, explicit authority, valid cross-references, and no silent change to the SRS or approved decisions.

### Project authority

The project owner retains final authority over scope, requirements, decisions, documentation, repository actions, testing, acceptance, and phase advancement.

ChatGPT may prepare and review proposed change documentation.

Codex may perform local repository operations only under explicit, bounded authorization.

Preparation or acceptance of this document does not authorize source-code modifications, test execution, database operations, dependency changes, security scans, external provider requests, Git operations, or phase advancement. Those actions must be covered by an applicable owner-authorized scope; a single approved scope may cover a coordinated batch without per-file approval.

