# TRAIL AI Desk — Testing, Quality Assurance, and Acceptance Reference

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
**Workflow reference:** `APP_FLOW.md`  
**Database reference:** `DATABASE.md`  
**API reference:** `API.md`  
**Knowledge reference:** `RAG_KNOWLEDGE_BASE.md`  
**Security reference:** `SECURITY_PRIVACY.md`  
**Defect reference:** `BUGS.md`  
**Change-control reference:** `CHANGE_REQUESTS.md`

## 1. Purpose and scope

This document establishes the planned approach to testing, quality assurance, evidence collection, and acceptance for TRAIL AI Desk.

Its objectives are to:

- Preserve traceability to all 48 original SRS requirements.
- Verify later approved P00-D governance and architecture decisions.
- Distinguish historical test reports from current execution evidence.
- Describe unit, integration, system, security, usability, and regression testing.
- Establish meaningful positive and negative test coverage.
- Document test environments, prerequisites, expected behavior, and limitations.
- Define how defects and unresolved risks are recorded.
- Prevent a passing test count from being mistaken for complete requirements compliance.
- Support explicit owner acceptance at approved checkpoints.

This document is a testing plan and evidence framework. It is not a record of newly executed tests.

No test execution, repository inspection, database connection, network request, or application modification is authorized by its preparation or acceptance.

### Development use and maintenance

Consult this document before defining verification scope, executing an authorized test checkpoint, assessing a fix, or making an acceptance claim. It is authoritative for test evidence classifications, coverage expectations, result reporting, and quality gates; requirements remain in the SRS and `REQUIREMENTS_TRACEABILITY.md`, defects in `BUGS.md`, and implementation details in the relevant technical references.

Update it after authorized test execution, a material implementation or environment change, defect verification, or an approved requirement or decision change. Current evidence must identify the environment, date, command or procedure, actual result, limitations, and applicable requirement or decision. A historical count, source path, or unexecuted test definition is not a current pass.

Codex may prepare test documentation and synchronized evidence updates within an approved checkpoint. The project owner authorizes execution and accepts checkpoint outcomes. This document remains acceptable when coverage is traceable, pass/fail/blocked/skipped outcomes are honest, related defect and implementation records agree, and unverified capabilities remain explicit.

## 2. Authoritative sources and evidence distinctions

The governing references are:

1. Original October 2026 SRS.
2. `REQUIREMENTS_TRACEABILITY.md`.
3. `DECISIONS.md`.
4. `PROJECT_PLAN.md`.
5. `IMPLEMENTATION.md`.
6. Accepted functional, database, API, RAG, security, and design references.
7. `BUGS.md`.
8. `CHANGE_REQUESTS.md`.
9. Relevant authorized historical inspection and testing reports.

The following classifications must remain distinct:

| Classification | Meaning |
|---|---|
| Requirement | A behavior or quality specified by the original SRS |
| Approved decision | Later owner-approved project direction |
| Planned test | A proposed verification procedure not yet executed |
| Historical test evidence | A result reported by an earlier inspection or run |
| Current execution evidence | A result obtained through a separately authorized current test |
| Verified capability | A capability demonstrated through relevant current evidence |
| Unverified capability | A capability without sufficient current evidence |
| Owner-accepted result | A checkpoint outcome explicitly accepted by the owner |

Historical implementation evidence is useful for planning but cannot be substituted for current operational validation.

## 3. Current testing baseline

The project history includes a reported **75/75 passing-test result** from an earlier development state.

That result must remain labeled historical.

For the current evidence baseline:

- The Staff Login UI checkpoint authorized type checking, linting, and a local web preview. All three commands stopped before their scripts ran because no active Node.js version was configured, so they produced no application test or rendered-preview result.
- No successful live MongoDB connection has been independently confirmed.
- A prior sanitized Atlas diagnostic reported `ECONNREFUSED`; its root cause remains unknown.
- On 2026-11-09, the effective private configuration passed sanitized approved-target validation; the single isolated read-only ping failed and the client closed successfully.
- Database-backed authentication is unverified.
- Separate backend enforcement of all three roles is unverified.
- Independent source approval and version eligibility are unverified.
- External-provider exclusion of pending content is unverified.
- Substantive citation grounding is unverified.
- Selected-period memorandum functionality is unverified.
- Private durable concern submission is unverified.
- Production readiness is unverified.

This list describes evidence limitations, not a declaration that every capability is absent.

No number of tests is recorded as newly executed or passed under P00-E4L.

### 3.1 Staff Login UI checkpoint evidence

**Scope:** Frontend presentation and navigation only. Staff authentication and RBAC were outside the authorized scope.

| Check | Actual status | Evidence and limitation |
|---|---|---|
| `npm run typecheck` | Blocked | The command exited `1` before TypeScript ran because no active Node.js version was configured |
| `npm run lint` | Blocked | The command exited `1` before Expo lint ran because no active Node.js version was configured |
| `npm run web` | Blocked | The command exited `1`; the Expo server did not start and no browser was inspected |
| Bounded source invariant check | Passed | Nine read-only assertions confirmed the exact title/message, disabled Staff submit, absence of Staff auth/API imports, both navigation targets, public route registration, shared password toggle, and hidden active-state arrow on the disabled button |
| Student-to-Staff navigation | Source Verified; runtime unverified | `src/app/index.tsx` defines replacement navigation to `/staff-login` |
| Staff-to-Student navigation | Source Verified; runtime unverified | `src/app/staff-login.tsx` defines replacement navigation to `/` |
| Staff password visibility | Source Verified; runtime unverified | Shared local UI state toggles secure password display |
| Staff Sign In disabled | Source Verified; runtime unverified | The Staff route supplies a disabled submit state and no submit handler, authentication call, or session operation |
| Admin/Knowledge-Base Manager authentication | Blocked — outside scope | Backend integration was not implemented or exercised |
| Three-role authorization | Not Run — outside scope | Requires separately authorized backend work |

## 4. Testing objectives and quality gates

The intended quality approach must verify both the presence of required behavior and the rejection of prohibited behavior.

The major quality objectives are:

1. Functional correctness.
2. Backend-enforced authorization.
3. Reliable database persistence.
4. Institutional source governance.
5. Version-specific retrieval eligibility.
6. Privacy-aware external provider processing.
7. Factual grounding and citation accuracy.
8. Reliable student-facing workflows.
9. Appropriate performance and usability.
10. Secure failure handling and recovery.
11. Auditability and regression safety.
12. Evidence-based phase and release acceptance.

An individual feature should not be declared operational merely because its interface renders.

A phase should not be declared complete merely because its documents or proposed tests exist.

## 5. Testing lifecycle and authorization

Testing is expected to occur throughout authorized implementation checkpoints, with comprehensive system validation planned for Phase 08.

The intended lifecycle is:

1. Identify relevant requirements and decisions.
2. Establish the specific authorized testing scope.
3. Define prerequisites and expected results.
4. Establish a suitable, controlled environment.
5. Execute only approved procedures.
6. Capture current evidence.
7. Record pass, fail, blocked, or skipped outcomes honestly.
8. Register confirmed defects and unresolved observations appropriately.
9. Re-test fixes under a separately authorized scope.
10. Assess requirement coverage and owner acceptance.

### Authorization boundary

A test plan does not grant permission to execute a test.

Each repository inspection, command, external request, database connection, test run, or environment modification remains subject to the applicable project-owner authorization.

This document does not authorize a test by itself; every execution remains bounded by the applicable owner-approved checkpoint.

## 6. Test categories

| Test category | Intended purpose |
|---|---|
| Static review | Inspect approved code or documentation without asserting runtime behavior |
| Unit testing | Check isolated functions and business rules |
| Backend integration testing | Verify service, API, persistence, and authorization interactions |
| Database testing | Verify real connectivity, writes, reads, and durability |
| Frontend integration testing | Verify screens and backend outcomes together |
| System testing | Verify end-to-end student and management workflows |
| RAG evaluation | Verify eligible-source retrieval and factual citation grounding |
| Security and privacy testing | Verify authorization, isolation, and protected processing |
| Negative-path testing | Confirm prohibited actions and invalid states are rejected |
| Failure and recovery testing | Verify truthful handling of unavailable services and interrupted actions |
| Usability and accessibility testing | Evaluate supported device interactions and readability |
| Compatibility testing | Validate approved Android devices and browser environments |
| Regression testing | Detect unintended behavior after authorized changes |
| Acceptance testing | Determine whether evidence satisfies requirements and approved decisions |

The exact tools, frameworks, environments, and scheduling remain to be verified or approved.

## 7. Test environments and prerequisites

Future test execution should identify the relevant environment explicitly.

Potential environment categories include:

- Local development.
- Controlled integration testing.
- Authorized staging or preproduction.
- Production verification where specifically permitted.

These categories are conceptual and do not claim that corresponding deployed environments currently exist.

### Prerequisite evidence

Before an applicable integrated test, record:

- The authorized checkpoint and permitted operations.
- Relevant repository revision or inspected file versions.
- Frontend and backend configuration.
- Database availability.
- Authentication and test account arrangements.
- External-provider configuration or approved mock behavior.
- Permitted official institutional test sources.
- Controlled student concern test data.
- Applicable test fixtures.
- Approved device or browser targets.
- Required cleanup or retention rules.

Sensitive credentials and private student data must not be copied into reports.

### Dependency control

A failed prerequisite must be reported as blocked or failed according to the actual observed behavior; it must not be quietly replaced with simulated success.

## 8. Test-data management

Test data must preserve the distinction between:

- Official approved institutional information.
- Pending or rejected institutional information.
- Changed versions requiring renewed approval.
- Withdrawn or superseded versions.
- Deliberately insufficient evidence.
- Conflicting institutional sources.
- Simulated/demo content.
- Private student concerns.
- Authentication accounts and sessions.

### Required safeguards

- Use synthetic personal information unless an authorized process approves otherwise.
- Do not expose genuine student concern data through shared reports.
- Do not insert private test records into public RAG retrieval.
- Preserve source-version and provenance identity.
- Avoid transmitting pending fixtures to real external AI providers.
- Prevent test data from being mistaken for official university publications.
- Establish cleanup rules before any state-changing test.

The exact fixture format and dataset ownership are open design details.

## 9. Test case identification and structure

A proposed test identifier convention is:

`TC-<AREA>-<NUMBER>`

Examples:

- `TC-AUTH-001`
- `TC-RBAC-001`
- `TC-KB-001`
- `TC-RAG-001`
- `TC-MEMO-001`
- `TC-CONCERN-001`

These identifiers are documentation proposals, not verified existing test filenames.

### Required test case fields

| Field | Purpose |
|---|---|
| Test ID | Stable reference for the test |
| Requirement IDs | Relevant FR/NFR coverage |
| Decision IDs | Applicable P00-D governance |
| Objective | Behavior or restriction being tested |
| Preconditions | Required environment and approved data |
| Procedure | Authorized steps to perform |
| Expected result | Specific observable outcome |
| Actual result | What execution demonstrated |
| Result status | Pass, Fail, Blocked, Skipped, or Not Run |
| Evidence | Logs, screenshots, output, or other permitted references |
| Environment | Relevant runtime, configuration, and platform |
| Execution date | Date of actual execution |
| Executor | Person or authorized agent performing the test |
| Linked defects | Relevant entries in `BUGS.md` |
| Limitations | Missing evidence, conditions, or coverage |

Fields describing actual execution must not be filled in before the relevant test occurs.

## 10. Test execution and requirement assessment statuses

### Test execution status

| Status | Meaning |
|---|---|
| Not Run | The test has not been executed for the relevant baseline |
| Passed | Actual observed results satisfy the defined expectations |
| Failed | Actual results contradict one or more expectations |
| Blocked | A prerequisite or external condition prevents meaningful execution |
| Skipped | Execution was intentionally omitted, with a recorded reason |

These are proposed reporting labels.

### Requirement assessment status

| Status | Meaning |
|---|---|
| Not Verified | No sufficient current evidence establishes the requirement |
| Partial Evidence | Some behavior is supported but material acceptance gaps remain |
| Verified for Reviewed Scope | Evidence supports a defined subset or context |
| Accepted | The owner explicitly accepts the relevant requirement or checkpoint evidence |
| Open Limitation | A known, documented gap prevents unconditional acceptance |

A test passing is not automatically equivalent to owner acceptance of an entire requirement.

A requirement can require multiple positive, negative, integration, and security tests.

## 11. Authentication and role-based authorization testing

**Relevant requirements:** FR-001–FR-005, FR-024, FR-030; NFR-007.  
**Approved decision:** D-002.

Future tests should include:

1. Correct registered-user login.
2. Invalid credential rejection.
3. Appropriate inactive-account handling.
4. Secure password recovery.
5. Expired recovery mechanism rejection.
6. Recovery replay prevention.
7. Successful logout.
8. Revoked or expired session denial.
9. Student-only features under Student authorization.
10. Admin-only operations under Admin authorization.
11. Knowledge-Base Manager review operations under the separate manager role.
12. Direct backend access attempts that bypass frontend navigation.
13. Prohibition of client-controlled role escalation.
14. Prevention of stale privileged responses after logout.
15. Appropriate behavior when the database is unavailable.

Frontend button visibility is not sufficient proof of backend RBAC.

The final permission matrix and account-provisioning rules require later approval.

## 12. MongoDB and persistence testing

**Relevant requirements:** FR-001, FR-022, FR-032, FR-035; NFR-004, NFR-007, NFR-012.

Phase 01A verification is ongoing and must cover:

- Real connection establishment.
- Correct configuration without revealing credentials.
- Connection failure reporting.
- Database read and write operations.
- Durable persistence after process restart.
- Appropriate collection and index behavior.
- Source-version storage.
- Review and audit records.
- Protected concern records.
- Duplicate and concurrent operation handling.
- Recovery behavior after an interrupted request.

The prior `ECONNREFUSED` result and the later fixed-output `ATLAS_PING=FAIL` result do not establish a DNS, credential, allow-list, TLS, Atlas, or application-code cause. The intended target configuration is now source- and test-validated, but successful connection, reads, writes, restart durability, live schemas, and live indexes remain unverified.

### 12.1 `P01A-MONGODB-CONFIG-FIX-01` evidence — 2026-11-09

| Check | Actual result | Limitation |
|---|---|---|
| `node --test test/config.test.mjs` | PASS — 5/5 | Fictional configuration and injected clients only; no database operation |
| `node --test test/rag.test.mjs` | PASS — 14/14 | Includes explicit demo and configured-live failure regression coverage |
| `npm test` | BLOCKED before the test script — NVM event `NVM4306` | No reinstall or NVM repair was authorized |
| Direct declared test command, `node test/run.mjs` | PASS — 85/85 | Local backend suite; not full SRS or production acceptance |
| Effective private configuration validation | `CONFIG_VALIDATION=PASS`; `DATABASE_TARGET=PASS` | Secret values were neither printed nor recorded |
| One isolated direct-driver Atlas attempt | `ATLAS_PING=FAIL`; `CLIENT_CLOSE=PASS` | One attempt only; no raw error or root-cause classification; no writes, bootstrap, indexes, or seeding |

Regression coverage confirms that a missing live database name is rejected, both legacy names are rejected, `trail_db` is selected by the connection initializer, provisioning rejects a legacy target before password input or database work, explicit no-URI demo mode remains labeled, and configured live connection failure is propagated rather than represented as successful demo startup.

This document is not permission to troubleshoot or connect to MongoDB.

## 13. Institutional source submission and provenance testing

**Relevant requirements:** FR-025–FR-029, FR-032; NFR-005–NFR-006.  
**Approved decisions:** D-003, D-004.

Future positive-path tests should verify:

- Registration of appropriate official university webpages.
- Permitted public source retrieval and extraction.
- Institutional document submission.
- Manual institutional information submission.
- Correct issuing-office metadata.
- Required supporting references.
- Accurate submission and review-pending confirmation.

Negative tests must include:

- Unsupported or unsafe URLs.
- Missing issuing office.
- Missing independent official supporting reference for manual entries.
- Unsupported or malformed uploads.
- Unauthorized source submission.
- Source submission incorrectly displayed as approval.
- Forged or inconsistent provenance.

The final authenticity-validation rules and supported file formats remain open.

## 14. Independent knowledge-review testing

**Relevant requirements:** FR-030–FR-035; NFR-007, NFR-012.  
**Approved decisions:** D-002, D-003, D-005, D-010.

The required review behavior must be verified through both successful and denied operations.

### Positive scenarios

- A permitted Admin or manager submits content.
- A different eligible Knowledge-Base Manager reviews the exact version.
- Approval is recorded with reviewer attribution.
- The approved version becomes eligible only when all conditions are met.
- Rejection is retained and enforced.

### Negative scenarios

- Student attempts to review or approve.
- Admin attempts independent manager approval.
- Submitter attempts to approve their own version.
- Missing required provenance.
- An approval request targets a changed version.
- Concurrent decisions conflict.
- Stale approval attempts are replayed.
- Rejected content is requested through student retrieval.

An approval display alone does not establish persistence, version correctness, or independent review.

## 15. Source versioning and update testing

**Relevant requirements:** FR-031–FR-035; NFR-012.  
**Approved decisions:** D-005, D-010.

Future tests must establish:

1. An initial approved version remains individually identifiable.
2. Changed content receives a distinct version identity.
3. New content remains pending until reviewed.
4. Approval is not inherited from an earlier version.
5. The previous approved version remains eligible only while valid and not withdrawn or superseded.
6. New approval applies only to the exact reviewed version.
7. Withdrawn or superseded material is excluded from current retrieval.
8. Cached and indexed material respects current eligibility.
9. Historical decisions remain traceable.
10. Concurrent refresh and review operations do not bypass controls.

The exact state machine, change-detection algorithm, and consistency mechanism remain unresolved.

## 16. RAG retrieval and citation testing

**Relevant requirements:** FR-006–FR-012, FR-036; NFR-003–NFR-006.  
**Approved decision:** D-007.

The intended RAG tests must address:

- University-related question submission.
- Retrieval from approved, eligible source versions.
- Relevant follow-up conversation context.
- Session isolation.
- Supported factual statements.
- Accurate source and version citations.
- Unsupported answers when evidence is insufficient.
- Conflicting or outdated source information.
- Provider failures and safe error messages.
- Retrieval failures distinct from empty approved coverage.

### Claim-level citation evaluation

A citation is substantively correct only when the underlying approved source supports the factual statement for which it is provided.

Evaluation must examine:

- The claim.
- The cited source.
- The exact source version.
- The relevant supporting passage.
- Whether the source actually supports the claim.
- Whether the source was eligible at the time of use.

A source marker's presence alone is not a sufficient passing condition.

Exact citation quality thresholds and evaluation datasets require subsequent approval.

## 17. External AI and embedding-provider boundary tests

**Relevant requirements:** FR-007, FR-027, FR-031, FR-034, FR-036; NFR-009.  
**Approved decision:** D-006.

A critical acceptance condition is that pending and otherwise unapproved institutional content must not reach external AI-generation or embedding providers.

### Required negative scenarios

- Initial unapproved webpage submission.
- Pending document upload.
- Pending manual entry.
- Changed version awaiting review.
- Rejected source.
- Withdrawn or otherwise ineligible source.
- Retry of a failed ingestion job.
- Scheduled refresh of a changed source.
- Approval revoked while a job is queued.
- Stale worker request using earlier eligibility.

### Verification evidence

Future testing should inspect authorized provider-call boundaries or controlled substitutes sufficient to demonstrate that prohibited content was not transmitted.

Actual external provider calls may be made only within separately approved test scopes and applicable privacy restrictions.

The absence of a visible UI answer is not proof that no external transmission occurred.

## 18. University information and memorandum testing

**Relevant requirements:** FR-013–FR-019.  
**Approved decision:** D-008.

### Institutional information

Future tests must examine:

- University information categories.
- Enrollment and academic-calendar coverage.
- Documentary requirements.
- Office locations, public contacts, and services.
- University policies and procedures.
- Relevant official source accuracy.
- Appropriate handling of missing approved coverage.

### Memoranda

Future tests must examine:

- Display of approved official memoranda and announcements.
- Issuing-office metadata.
- Relevant dates and source references.
- Period selection, including the current week.
- Asia/Manila date interpretation.
- Period boundary cases.
- Effective and publication-date distinctions where applicable.
- Withdrawn or superseded records.
- Period-specific empty results.

When no approved memorandum matches, the application must not claim that the university issued no memorandum.

The precise current-week convention remains open for later owner approval.

## 19. Student concern testing

**Relevant requirements:** FR-020–FR-023; NFR-009.  
**Approved decision:** D-009.

Future testing should verify:

1. Appropriate access to the concern form.
2. Required-field validation.
3. Server-side validation.
4. Durable persistence.
5. Persistence after backend restart.
6. Correct confirmation following successful storage.
7. Accurate failure when persistence fails.
8. Duplicate-submission controls.
9. Unauthorized read denial.
10. Separation from public institutional retrieval.
11. Appropriate retention and privacy handling.
12. Correct representation of office acknowledgement and resolution.

A concern saved by TRAIL must not be described as officially acknowledged or resolved without an authorized office workflow.

A local demonstration preview is not sufficient evidence for FR-022.

## 20. Security and privacy testing

**Relevant requirements:** FR-003, FR-036; NFR-007–NFR-009.

Testing must eventually establish suitable safeguards for:

- Authentication and session handling.
- Backend RBAC.
- Privileged account provisioning.
- Password storage and recovery.
- API and database secrets.
- Sensitive logs.
- Cross-user data isolation.
- Private concern access.
- Confidential institutional records.
- Source authenticity and unsafe URL processing.
- Document parsing and prompt-injection boundaries.
- Approved external-provider data processing.
- Audit trail integrity and access.

The original privacy requirement references Republic Act No. 10173.

Security testing must not be described as legal compliance certification.

Testing involving sensitive data, production services, security scanning, or external providers requires explicit authorization and appropriate scope controls.

## 21. Usability, accessibility, performance, and compatibility testing

**Relevant requirements:** FR-004, FR-006, FR-013–FR-023; NFR-001–NFR-004, NFR-010.

Future evaluation should examine:

- Clear navigation and instructions.
- Readable text.
- Sufficient contrast.
- Appropriately sized touch controls.
- Understandable validation errors.
- AI processing indicators.
- Chat and citation readability.
- Memorandum selection usability.
- Concern form usability.
- Appropriate mobile and web layouts.
- Keyboard, focus, and assistive-technology behavior where applicable.
- Network interruption handling.
- Response-time behavior.

### Open acceptance targets

The project has not yet approved specific numerical performance thresholds, accessibility conformance levels, screen-size breakpoints, or a final Android/browser compatibility matrix in this documentation baseline.

These values must be approved before final acceptance testing.

They must not be invented as existing project standards.

## 22. Demo-mode and failure-injection testing

**Relevant requirements:** FR-011–FR-012, FR-022; NFR-004.  
**Approved decision:** P00-D-DEMO.

Historical development demo behavior may remain during early phases when explicitly labeled.

Tests must establish that:

- Demo mode is clearly identifiable.
- Simulated answers are not represented as approved institutional retrieval.
- Simulated authentication is not represented as real database-backed authentication.
- Local concern previews are not represented as durable submissions.
- Backend or MongoDB outages are reported truthfully.
- AI-provider failure does not silently trigger fake successful answers.
- The final live application does not depend on demo fallback after the separately approved retirement checkpoint.

The current project does not authorize immediate demo removal.

## 23. Requirement-to-test coverage register

The following coverage register proposes verification obligations. Every row is **Not Run for the current documentation checkpoint**.

### Functional requirements

| Requirement | Principal future verification |
|---|---|
| FR-001 | Registered login, valid and invalid credentials |
| FR-002 | Secure recovery, expiry, replay prevention |
| FR-003 | Three-role backend RBAC and denial |
| FR-004 | Student dashboard and navigation |
| FR-005 | Logout, session expiry and stale responses |
| FR-006 | Student chat submission and integration |
| FR-007 | Approved eligible-source retrieval |
| FR-008 | Configured AI response and evidence grounding |
| FR-009 | Follow-up context and user isolation |
| FR-010 | Correct, substantively supporting citations |
| FR-011 | Accurate insufficient-evidence behavior |
| FR-012 | AI/retrieval service failure messages |
| FR-013 | Organized university information categories |
| FR-014 | Approved enrollment, calendar and requirements data |
| FR-015 | Approved office locations, contacts and services |
| FR-016 | Approved policies and procedures |
| FR-017 | Approved memoranda with office, date and source |
| FR-018 | Selected period, current week and Manila-time filtering |
| FR-019 | Truthful selected-period absence message |
| FR-020 | General concern form availability |
| FR-021 | Frontend and backend required-field validation |
| FR-022 | Durable concern storage and truthful confirmation |
| FR-023 | Distinct official acknowledgement and resolution |
| FR-024 | Protected administrative interface |
| FR-025 | Official webpage registration |
| FR-026 | Permitted webpage retrieval and processing |
| FR-027 | Document upload and approval-safe processing |
| FR-028 | Authorized manual institutional submission |
| FR-029 | Issuing office and official supporting reference |
| FR-030 | Independent manager review, rejection and deactivation |
| FR-031 | Exclusion of unapproved or inactive information |
| FR-032 | Source origin, review and approval metadata |
| FR-033 | Source change detection and review flags |
| FR-034 | Fresh approval before updated content retrieval |
| FR-035 | Version history and administrative activity records |
| FR-036 | Confidential-record exclusion and no official-record modification |

### Non-functional requirements

| Requirement | Principal future verification |
|---|---|
| NFR-001 | Clear navigation and instructions |
| NFR-002 | Readability, contrast and touch-control usability |
| NFR-003 | AI loading indicator and approved response-time criteria |
| NFR-004 | Network, database and provider failures |
| NFR-005 | Verified answers grounded in approved content |
| NFR-006 | Source and record traceability |
| NFR-007 | Secure password handling and backend authorization |
| NFR-008 | Backend credential and API-key protection |
| NFR-009 | Personal-information safeguards and privacy |
| NFR-010 | Approved Android and modern-browser compatibility |
| NFR-011 | Authorized information updates without source-code edits |
| NFR-012 | Source, verification and revision integrity |

The original requirement wording remains authoritative in `REQUIREMENTS_TRACEABILITY.md`.

This register does not replace the original SRS or certify any requirement as complete.

## 24. Approved-decision coverage register

| Decision | Required future verification |
|---|---|
| D-001 | Native Node.js preservation and authorized incremental Express integration |
| D-002 | Three distinct backend-enforced roles |
| D-003 | Official issuing-office origin and independent review |
| D-004 | Manual-entry official supporting reference |
| D-005 | Fresh exact-version approval |
| D-006 | No external AI processing of pending content |
| D-007 | Substantive claim-to-evidence citation support |
| D-008 | Selected-period memoranda using Asia/Manila |
| D-009 | Private durable concerns and honest office-status semantics |
| D-010 | Audit history, reviewer identity, versioning and retention |
| P00-D-DEMO | Explicit demo behavior and authorized retirement conditions |

These checks complement, rather than replace, the original SRS requirement coverage.

## 25. Defects, regression, and evidence reporting

### Defect linkage

A failed current test should be evaluated for an evidence-based defect record under `BUGS.md`.

Historical risks should not automatically become confirmed bugs.

### Regression obligations

Following an authorized change, re-test:

- The directly affected capability.
- Closely related integration boundaries.
- Applicable security and privacy constraints.
- Existing approved governance invariants.
- Previously reported confirmed defects.
- Relevant SRS and decision mappings.

### Execution summary

Each authorized test report should distinguish:

| Metric | Meaning |
|---|---|
| Defined | Number of test cases specified |
| Executed | Number actually run |
| Passed | Executed cases meeting expectations |
| Failed | Executed cases contradicting expectations |
| Blocked | Cases prevented by unmet prerequisites |
| Skipped | Intentionally omitted cases and reasons |
| Unverified | Requirements or capabilities lacking sufficient current evidence |

Report the environment, date, relevant version, executor, permitted actions, evidence, limitations, and linked defects.

Do not present a historical passing count as a current result.

## 26. Acceptance criteria and project authority

### Maintenance and acceptance criteria

`TESTING.md` remains acceptable as a living foundational reference when:

1. All 36 FR and 12 NFR identifiers are represented.
2. All approved P00-D decisions are included.
3. Historical testing and current execution evidence remain separate.
4. No new test run is falsely claimed.
5. Positive and negative test strategies are included.
6. MongoDB, authentication and RBAC verification obligations are covered.
7. Source provenance, exact-version approval and provider gating are covered.
8. RAG citations require substantive support.
9. Memorandum and concern requirements are preserved.
10. Security, privacy, performance and compatibility testing are addressed.
11. Test statuses and evidence expectations are explicit.
12. Defect, regression and change-control links are defined.
13. Unapproved technical thresholds are not invented.
14. The document aligns with accepted project records.
15. Its Markdown structure is complete and readable.
16. The project owner accepts the documentation.

### Future operational acceptance

Phase 08 acceptance requires current evidence or explicitly documented, owner-reviewed limitations for all original requirements and applicable decisions.

Passing tests do not automatically prove full compliance, legal compliance, or production readiness.

### Change control and authority

Future test-plan changes must identify the affected requirements, approved checkpoint, evidence, relevant documents, and owner decision.

ChatGPT may draft and review documentation.

Codex may inspect or modify the local repository only under explicit, bounded owner authorization.

The project owner retains final authority over testing, scope, repository operations, acceptance, and phase advancement.

Preparation or acceptance of this document does not by itself authorize test execution, database access, security scanning, provider requests, or implementation work outside an owner-approved checkpoint.

