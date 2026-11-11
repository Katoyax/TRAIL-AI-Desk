# TRAIL AI Desk — Defect, Issue, and Technical Risk Register

**Project:** TRAIL AI Desk  
**Institution:** University of Science and Technology of Southern Philippines (USTP), Cagayan de Oro Campus  
**Document status:** Active foundational reference — recovered from the P00-E4 historical backup and modernized November 8, 2026  
**Project status:** Phase 00 closed — **READY WITH DOCUMENTED LIMITATIONS**; Phase 01A ongoing  
**Historical draft prepared:** November 4, 2026  
**Requirements baseline:** Original October 2026 SRS — FR-001–FR-036 and NFR-001–NFR-012  
**Decision baseline:** Approved D-001–D-010 and P00-D-DEMO in `DECISIONS.md`  
**Development roadmap:** `PROJECT_PLAN.md`  
**Traceability reference:** `REQUIREMENTS_TRACEABILITY.md`  
**Implementation reference:** `IMPLEMENTATION.md`  
**Testing reference:** `TESTING.md`  
**Change-control reference:** `CHANGE_REQUESTS.md`  
**Security reference:** `SECURITY_PRIVACY.md`

## 1. Purpose and scope

This document defines how TRAIL AI Desk identifies, records, investigates, prioritizes, resolves, and verifies defects and related technical issues.

Its objectives are to:

- Preserve evidence about observed application failures.
- Separate confirmed current defects from historical findings and unverified risks.
- Provide a consistent defect-reporting structure.
- Support traceability to original requirements and approved decisions.
- Distinguish software defects from missing requirements, design questions, and change requests.
- Prevent unsupported claims about root causes or fixed behavior.
- Record verification and regression evidence for authorized corrections.
- Maintain accurate issue status through project checkpoints.
- Support owner-controlled scope and repository operations.

This document is a tracking reference, not permission to investigate, reproduce, or fix any issue.

### Development use and maintenance

Consult this document when diagnosing a reported failure, planning a correction, verifying regression coverage, or assessing unresolved technical risk. It is authoritative for defect classification and investigation records; requirements and approved behavior remain authoritative in the SRS, `DECISIONS.md`, and the applicable technical references, while executed evidence belongs in `TESTING.md`.

Update it when authorized evidence establishes or changes a symptom, reproduction status, impact, root cause, fix, regression result, blocker, or acceptance state. A suspected cause must remain unknown until supported; a historical risk or failed diagnostic is not automatically a confirmed application defect.

Codex may prepare evidence-based issue updates within an approved checkpoint. The project owner controls investigation scope, priority, fix authorization, acceptance, and phase status. This register remains acceptable when records distinguish symptoms from causes, severity from priority, fixes from verified fixes, and current evidence from historical reports.

## 2. Evidence and terminology

The governing references are:

1. Original October 2026 SRS.
2. `REQUIREMENTS_TRACEABILITY.md`.
3. `DECISIONS.md`.
4. `PROJECT_PLAN.md`.
5. `IMPLEMENTATION.md`.
6. `TESTING.md`.
7. Applicable accepted architecture and security documents.
8. Relevant authorized historical inspection reports.

### Issue classifications

| Classification | Meaning |
|---|---|
| Confirmed current defect | A reproducible or otherwise sufficiently evidenced failure against an applicable requirement or approved behavior |
| Historical finding | An earlier inspection identified a problem or potential problem |
| Unverified risk | A possible failure or adverse outcome not established through current evidence |
| Verification gap | Sufficient current evidence is unavailable |
| Implementation gap | Required functionality is not established as implemented |
| Documentation issue | Inconsistent, outdated, missing, or misleading documentation |
| Design question | A decision or technical detail awaiting specification |
| Change request | A proposed modification to scope, requirements, design, or approved behavior |
| External blocker | A dependency or condition preventing authorized work |

These classifications are proposed record-management conventions, not newly verified facts.

A historical finding may become a confirmed current defect only after sufficient authorized evidence is obtained.

## 3. Current issue-register baseline

As of the November 8, 2026 documentation modernization:

- Phase 00 is closed — **READY WITH DOCUMENTED LIMITATIONS**.
- Phase 01A backend and MongoDB integration work is ongoing.
- This documentation batch executed no application tests, builds, or database operations.
- Historical risks and potential conflicts remain documented.
- The current reproducibility of most historical risks is not established.
- The prior Atlas failure remains an investigation and verification gap, not a confirmed root-cause finding.
- No new confirmed-current application defect is created by this documentation update.

The absence of a confirmed-current record in this checkpoint does not mean that the application is defect-free.

Historical descriptions, including the reported 75/75 tests, must not be used to certify the current application.

## 4. Defect identification and record IDs

A proposed future defect ID format is:

`BUG-001`, `BUG-002`, `BUG-003`, and so on.

IDs should be assigned only when an issue is formally entered into the controlled defect register.

The following identifiers already exist for a different purpose:

- `R-01` through `R-12` in `PROJECT_PLAN.md` identify historical or unverified project risks.
- `FR-001` through `FR-036` identify original functional requirements.
- `NFR-001` through `NFR-012` identify original non-functional requirements.
- `D-001` through `D-010` identify approved project decisions.
- `P00-D-DEMO` identifies the approved temporary demonstration policy.

These identifiers must not be silently converted into confirmed bug IDs.

A single defect may affect multiple requirements, and a single requirement may have multiple defect records.

## 5. Required defect-record fields

A future confirmed defect record should contain:

| Field | Purpose |
|---|---|
| Defect ID | Unique tracking reference |
| Title | Concise description of the problem |
| Classification | Confirmed defect, historical finding, gap, risk, or other category |
| Reported by | Person or authorized agent identifying the issue |
| Reported date | Date of observation |
| Checkpoint | Authorized scope under which the observation occurred |
| Environment | Backend, frontend, database, browser, device, and configuration context |
| Affected component | Verified module, feature, or workflow |
| Requirements | Applicable original FR/NFR identifiers |
| Decisions | Applicable approved P00-D identifiers |
| Preconditions | Conditions required to observe the issue |
| Reproduction steps | Specific authorized sequence |
| Expected behavior | Applicable requirement or approved outcome |
| Actual behavior | Directly observed deviation |
| Evidence | Permitted logs, output, screenshots, or test references |
| Reproducibility | Observed frequency or conditions |
| Severity | Assessed impact |
| Priority | Approved or proposed order of treatment |
| Root-cause status | Confirmed, suspected, or unknown |
| Owner | Authorized person responsible for next action |
| Fix scope | Proposed or approved correction boundaries |
| Resolution evidence | Changes and results, when authorized |
| Regression evidence | Relevant re-test results |
| Current status | Evidence-based workflow state |
| Acceptance | Explicit owner-reviewed outcome where required |

Sensitive information must not be copied into issue records unnecessarily.

## 6. Expected versus actual behavior

Every confirmed defect must identify the expectation it violates.

An expectation may come from:

- An original SRS requirement.
- A later approved project decision.
- A separately approved API or design contract.
- An applicable security or privacy restriction.
- A verified behavior that an authorized change was required to preserve.

An unexpected outcome is not necessarily a defect if the expected behavior has not been specified.

In that situation, the record should remain a design question or investigation item until an authoritative expectation is established.

### Example distinction

**Expected:** A changed institutional content version requires fresh independent approval.

**Possible defect:** A currently executed test demonstrates that changed content becomes retrievable before approval.

**Not yet confirmed:** An earlier report described approval inheritance, but the current implementation has not been tested.

Only the second example establishes a confirmed current defect.

## 7. Historical project risk register

`PROJECT_PLAN.md` identifies twelve risks or historical issue areas.

The table below preserves them as an investigation watchlist.

| Existing risk ID | Historical or unverified concern | Current classification |
|---|---|---|
| R-01 | MongoDB connectivity remains unverified | Verification gap |
| R-02 | Separate Knowledge-Base Manager RBAC not established by current evidence | Implementation/verification gap |
| R-03 | Historical changed-version approval inheritance | Historical potential conflict |
| R-04 | Pending source content may reach external AI providers | Historical privacy/governance risk |
| R-05 | Incomplete manual-entry provenance | Historical potential conflict |
| R-06 | Citations may lack substantive factual support | Verification gap |
| R-07 | Memorandum period selection unverified | Implementation/verification gap |
| R-08 | Concern submission remains historically demo-only | Historical implementation gap |
| R-09 | Demo fallback could conceal a service failure | Historical operational risk |
| R-10 | Historical test claims could be mistaken for current evidence | Evidence-management risk |
| R-11 | Background job coordination and recovery remain unverified | Reliability risk |
| R-12 | Deployment and operational safeguards remain unverified | Readiness risk |

These are existing planning risks, not twelve newly confirmed current software defects.

Their severity, current reproducibility, assigned owners, and remediation status require later authorized investigation.

## 8. MongoDB and persistence issue handling

**Related risk:** R-01.  
**Relevant requirements:** FR-001, FR-022, FR-032, FR-035; NFR-004, NFR-007.

Phase 01A investigation is ongoing and must establish actual database connection behavior.

Potential defect reports may involve:

- Failed database connection.
- Incorrect configuration.
- Failed reads or writes.
- Missing persistence after restart.
- Misleading success confirmation.
- Database failures hidden by demo fallback.

### Current evidence boundary

A prior Atlas attempt failed, and a sanitized diagnostic reported `ECONNREFUSED`. The root cause remains unknown. The updated Atlas configuration is owner-reported but has not been verified through a successful backend connection.

This evidence does not establish a DNS, credential, allow-list, TLS, Atlas, deployment, or application-code defect. It remains an investigation and verification gap until authorized reproduction and diagnosis support a cause.

This document does not itself authorize another connection attempt or MongoDB troubleshooting operation.

## 9. Authentication and role-security issues

**Related risk:** R-02.  
**Relevant requirements:** FR-001–FR-005, FR-024, FR-030; NFR-007.  
**Approved decision:** D-002.

Future verification should distinguish:

- Missing functionality.
- Failed authentication.
- Incorrect role assignment.
- Backend authorization bypass.
- Session invalidation failure.
- Password-recovery weaknesses.
- Frontend-only permission enforcement.

The required model contains exactly three distinct roles:

1. Student.
2. Admin.
3. Knowledge-Base Manager.

A confirmed unauthorized action would require direct relevant evidence.

Historical absence of a verified separate manager role is not itself proof of a current exploitable authorization bypass.

## 10. Institutional approval and provenance issues

**Related risks:** R-03, R-05.  
**Relevant requirements:** FR-025–FR-035; NFR-012.  
**Approved decisions:** D-003, D-004, D-005, D-010.

Potential defects may include:

- Missing issuing-office provenance.
- Missing official supporting reference for manual entries.
- Self-approval.
- Admin approval substituting for independent manager review.
- Approval applied to the wrong source version.
- Changed content inheriting approval.
- Rejected or withdrawn material remaining retrievable.
- Missing reviewer attribution or decision history.

Each reported defect must identify the exact submitted version, expected governance rule, observed behavior, and relevant evidence.

Current implementation status remains to be established through authorized tests.

## 11. External AI and retrieval-boundary issues

**Related risks:** R-04, R-06.  
**Relevant requirements:** FR-007–FR-012, FR-027, FR-031, FR-036; NFR-005–NFR-006, NFR-009.  
**Approved decisions:** D-006, D-007.

High-impact potential issues include:

- Pending content sent to an external embedding provider.
- A changed but unapproved source version used in AI processing.
- Private concern content entering public RAG.
- Withdrawn material remaining retrievable.
- Citation attached to an unrelated factual claim.
- Incorrect source-version association.
- A provider failure represented as a verified institutional answer.

The relevant negative-path and citation tests are planned in `TESTING.md`.

A source appearing in a historical report is not enough to establish present provider transmission or current citation failure.

## 12. Memorandum and concern-workflow issues

**Related risks:** R-07, R-08.  
**Relevant requirements:** FR-017–FR-023.  
**Approved decisions:** D-008, D-009.

Possible future defects include:

- Selected-period filtering missing or incorrect.
- Incorrect Asia/Manila boundaries.
- Incorrectly dated official memoranda.
- Misleading claim that no university memorandum exists.
- Concern validation missing.
- Concern not durably saved.
- False successful submission confirmation.
- Student accessing another student's concern.
- TRAIL storage presented as official office acknowledgement.
- Demo concern preview presented as live submission.

The exact concern form, office-routing workflow, and memorandum week boundary remain open implementation details.

An unresolved design detail must not automatically be classified as a software defect.

## 13. Demo, concurrency, and operational risks

**Related risks:** R-09, R-11, R-12.  
**Approved decision:** P00-D-DEMO.

The temporary demo fallback may remain explicitly labeled during early development.

Potential future defects include:

- Demo behavior silently replacing failed live services.
- Simulated authentication being presented as real.
- Background processing using stale approval state.
- Concurrent reviewers overwriting one another's decisions.
- Interrupted concern submissions producing duplicates.
- Queued processing continuing after withdrawal.
- Sensitive operational data appearing in logs.

These cases require evidence-based classification after authorized testing.

No immediate demo removal is authorized.

## 14. Severity assessment

The following is a proposed severity framework.

It does not assign severity to any current issue.

| Severity | Proposed meaning |
|---|---|
| Critical | Direct and substantial compromise of protected data, authorization, or institutional integrity; or an equivalent severe service impact |
| High | Major required functionality or security boundary is impaired |
| Medium | Important behavior is incorrect, but impact is narrower or a controlled workaround may exist |
| Low | Limited functional, usability, or documentation impact |
| Undetermined | Evidence is insufficient to assess impact |

Severity describes impact, not the order in which work is approved.

Specific escalation triggers and release-blocking thresholds require future owner approval.

A high-severity description does not itself authorize emergency commands or code changes.

## 15. Priority assessment

Priority concerns scheduling and approved work sequencing.

A proposed priority framework is:

| Priority | Proposed meaning |
|---|---|
| Immediate review | Prompt owner attention required before dependent work proceeds |
| High | Should be addressed in an early authorized checkpoint |
| Normal | Address through the appropriate approved development sequence |
| Low | May be deferred with documented rationale |
| Unassigned | Requires additional evidence or owner direction |

Priority may depend on:

- User or institutional impact.
- Privacy and security significance.
- Reproducibility.
- Requirements affected.
- Phase dependencies.
- Availability of a safe workaround.
- Complexity and risk of the proposed correction.

Actual priorities must be evidence-based and consistent with project-owner decisions.

## 16. Reproducibility and investigation

Reproducibility must be reported accurately.

Possible outcomes include:

- Reproduced consistently.
- Reproduced under defined conditions.
- Observed once with sufficient evidence.
- Not reproduced.
- Blocked by missing prerequisites.
- Not investigated.

A failure to reproduce an issue once does not conclusively establish that it never occurs.

### Investigation safeguards

An authorized investigation should identify:

1. What behavior was expected.
2. What actually occurred.
3. Which exact operation and version were involved.
4. Whether the environment was functioning correctly.
5. Whether the issue depends on timing, role, source state, or data.
6. Whether sensitive information is involved.
7. What evidence is sufficient to support a current classification.

No investigative command may be executed beyond its approved scope.

## 17. Root-cause analysis

Root cause must remain marked **Unknown** until evidence supports a conclusion.

A suspected explanation may be recorded separately as a hypothesis.

Possible areas for later investigation include:

- Incorrect business-rule implementation.
- Missing backend authorization.
- Version-state mismatch.
- Persistence failure.
- Retry or concurrency error.
- Improper input validation.
- Stale derived-index or cache state.
- Provider integration failure.
- Frontend/backend contract mismatch.
- Misconfigured runtime environment.

These categories do not establish actual causes for current TRAIL problems.

A root-cause claim should reference appropriate inspected code, observed runtime behavior, test evidence, or another authorized reliable source.

## 18. Issue lifecycle

A proposed issue lifecycle is:

1. Observation recorded.
2. Evidence and classification reviewed.
3. Reproduction or verification authorized.
4. Current defect confirmed, dismissed, or left unverified.
5. Severity and priority assessed.
6. Remediation proposed.
7. Owner approves bounded correction work.
8. Authorized correction is implemented.
9. Relevant tests are executed under authorization.
10. Result is reviewed and accepted or reopened.

### Proposed tracking statuses

- Open — Awaiting Triage.
- Needs Evidence.
- Historical / Unverified.
- Confirmed — Awaiting Authorization.
- Authorized for Investigation.
- Authorized for Fix.
- Fix Reported — Verification Pending.
- Verified — Acceptance Pending.
- Accepted / Closed.
- Reopened.
- Deferred.
- Not a Defect.

These are proposed workflow labels and do not themselves authorize actions.

## 19. Fix authorization and scope control

Every repository correction must have a bounded owner-approved scope.

A fix authorization should identify:

- The defect and evidence.
- Exact permitted files or components.
- Allowed inspection and commands.
- Expected correction.
- Restrictions on dependencies and unrelated edits.
- Required tests.
- Failure and stop conditions.
- Reporting and acceptance requirements.

### Prohibited scope expansion

A defect fix must not silently:

- Change the original SRS.
- Introduce a fourth application role.
- Bypass independent source review.
- Remove approval requirements for changed content.
- Permit pending content to reach external AI providers.
- Reveal private student information.
- Change unrelated architecture.
- Remove demo behavior before its approved retirement gate.
- Begin an unauthorized phase.

If the proposed solution requires a material change to an approved requirement or design, `CHANGE_REQUESTS.md` must be used.

## 20. Fix verification and regression testing

A reported correction does not automatically mean a defect is resolved.

Future verification should establish:

1. The originally observed failure no longer occurs under relevant conditions.
2. The applicable requirement or decision is satisfied.
3. Adjacent workflows remain functional.
4. Authorization and privacy rules remain intact.
5. Relevant negative tests pass.
6. Data or schema changes behave safely.
7. No improper source approval or retrieval behavior was introduced.
8. Execution evidence is current and traceable.

A passing unit test alone may be insufficient when the defect involves live database persistence, provider calls, or end-to-end workflow behavior.

The owner must review the applicable acceptance evidence before the issue is recorded as accepted or closed.

## 21. Blockers, workarounds, and deferred defects

An unresolved defect or dependency may prevent a planned task.

A blocker record should distinguish:

- The blocked operation.
- The unmet prerequisite.
- The supporting evidence.
- The affected requirements or phases.
- Any safe temporary workaround.
- The necessary approval to continue.

### Workaround restrictions

A workaround must not circumvent:

- Authentication.
- Backend RBAC.
- Institutional approval.
- Source version eligibility.
- External AI processing restrictions.
- Student concern privacy.
- Honest confirmation or error behavior.

Deferral requires documented reasoning and applicable owner review.

No unresolved issue may be silently accepted as safe for production.

## 22. Documentation observations

Documentation inaccuracies should be recorded separately from functional defects.

Examples include:

- An outdated preparation-status header.
- An obsolete documentation inventory.
- An unverified repository path presented as fact.
- A stale claim that a feature is already operational.
- A requirement mapping inconsistent with the accepted SRS.

### Known nonblocking administrative observation

The recovered P00-E4 documents contained headers describing their earlier drafting or repository-creation status as pending. The authorized November 8, 2026 documentation batch modernized those status labels while preserving the historical draft dates.

This was an administrative documentation-maintenance observation, not a confirmed application defect.

## 23. Issue register template and current entries

### 23.1 Confirmed current defects

No new confirmed-current application defect entries are established by the current documentation evidence.

This is an evidence statement, not a finding that the current application has zero defects.

### 23.2 Historical watchlist

The current historical watchlist is maintained under existing `PROJECT_PLAN.md` risk IDs R-01 through R-12.

Future updates should link relevant risk IDs to current defect records only when sufficient evidence is obtained.

### 23.3 Future defect-entry template

**Defect ID:** To assign  
**Title:** To specify  
**Classification:** To determine  
**Relevant requirement(s):** To identify  
**Approved decision(s):** To identify  
**Observed environment:** Not yet recorded  
**Actual observation:** Not yet recorded  
**Expected behavior:** To reference  
**Reproduction steps:** Not yet authorized or recorded  
**Evidence:** Not yet recorded  
**Severity:** Undetermined  
**Priority:** Unassigned  
**Root cause:** Unknown  
**Resolution proposal:** None approved  
**Fix authorization:** None  
**Regression evidence:** None  
**Acceptance status:** Not accepted

A template must not be mistaken for an actual defect.

## 24. Reporting, maintenance, and acceptance

### Issue reporting

Each authorized checkpoint should identify:

- Newly confirmed defects.
- Newly observed but unverified findings.
- Existing defects re-tested.
- Fixes reported.
- Fixes verified.
- Issues blocked or deferred.
- Residual risks.
- Relevant requirement and decision impacts.

If no defect investigation occurred, the report must say so.

### Maintenance and acceptance criteria

`BUGS.md` remains acceptable as a living issue-management reference when:

1. Historical risks are not presented as newly confirmed current defects.
2. The existing R-01 through R-12 risk IDs are preserved.
3. The document defines evidence-based defect classification.
4. Reproduction and root-cause requirements are explicit.
5. Severity and priority remain distinct.
6. Security and privacy risks are appropriately represented.
7. Issue status does not imply authorization for code changes.
8. Fixes require bounded owner approval.
9. Verification and regression evidence are required before closure.
10. Change requests remain distinct from defect tracking.
11. Documentation observations are distinguished from runtime defects.
12. The current lack of new test evidence is represented truthfully.
13. The document aligns with `TESTING.md`, `CHANGE_REQUESTS.md`, and accepted project records.
14. Markdown structure and completeness are verified.
15. The project owner accepts the documentation.

### Project authority

The project owner retains final authority over investigation, prioritization, fixes, repository operations, defect acceptance, and phase advancement.

ChatGPT may prepare issue records and analyze supplied evidence.

Codex may inspect or modify the local repository only within explicit, bounded owner authorization.

Preparation or acceptance of this document does not by itself authorize defect reproduction, code correction, MongoDB troubleshooting, security scanning, test execution, or implementation work outside an owner-approved checkpoint.

