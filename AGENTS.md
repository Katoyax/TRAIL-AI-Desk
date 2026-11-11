# TRAIL AI Desk — Codex Development Instructions

## Document responsibility and lifecycle

This file is the standing local instruction and documentation-routing authority for Codex and AI-assisted engineering in TRAIL AI Desk. It defines project protections, authorization boundaries, evidence discipline, and which project references to consult; it does not itself authorize implementation, testing, external access, database work, or phase advancement.

Consult it at the start of every task. Update it only when the owner approves a change to development governance, documentation routing, authorization practice, or a protected project boundary. Operational statements require current inspected or runtime evidence; plans and historical reports must remain labeled. Codex may prepare authorized changes, while the project owner approves them. Keep this file consistent with [README.md](README.md), [PROJECT_PLAN.md](PROJECT_PLAN.md), [DECISIONS.md](DECISIONS.md), [CHANGE_REQUESTS.md](CHANGE_REQUESTS.md), and [REQUIREMENTS_TRACEABILITY.md](REQUIREMENTS_TRACEABILITY.md). It is acceptable when its instructions are actionable, non-conflicting, evidence-aware, and do not silently alter the SRS or approved decisions.

## 1. Expo v57 safeguard (preserved)
Expo HAS CHANGED. Before writing or modifying any Expo, React Native, or Expo Router code, consult the exact versioned documentation at https://docs.expo.dev/versions/v57.0.0/. Do not substitute another Expo SDK version's documentation or assume an API works in v57.

If the approved task does not permit the documentation lookup or other needed access, stop and request a separately authorized step. Never expand a task's permissions to satisfy this instruction.
## 2. Project purpose and boundaries
TRAIL AI Desk is a student-facing institutional information assistant for the University of Science and Technology of Southern Philippines (USTP), Cagayan de Oro Campus. Its intended architecture uses retrieval-augmented generation (RAG) grounded in approved university information and verifiable citations.

The system is not authorized to access private student grades, schedules, balances, confidential PRISMS records, or to modify official university records. It must not perform official university transactions or impersonate institutional decision-makers. Student concerns must not be represented as officially received or resolved without an authorized institutional workflow.

The October 2026 Software Requirements Specification (SRS) is the requirements baseline. Preserve its requirement IDs FR-001–FR-036 and NFR-001–NFR-012. Document proposed changes explicitly; do not silently rewrite the baseline. Later owner-approved decisions may clarify or supersede specific SRS design choices, and those distinctions must be recorded rather than concealed.

## 3. Current technical baseline versus approved targets
- Frontend: React Native, Expo v57, Expo Router, and TypeScript.
- Existing backend: native Node.js HTTP services using ES modules.
- Approved backend direction: incremental introduction of Node.js + Express, reusing useful existing services. Do not replace the backend wholesale without a separate decision and approval.
- Database direction: MongoDB. Existing schema, setup instructions, or code do not prove a working live connection or durable persistence. MongoDB connectivity remains unverified until supported by direct evidence.
- AI and retrieval: optional/configured Gemini, RAG, source ingestion, extraction, and citation-related functions may exist in varying states of completion. Source presence and historical reports do not prove operational readiness.
- Demo and production behavior must be clearly differentiated. Demo fallback may not silently conceal production service failures; its eventual removal is tied to separately approved implementation work.
Do not describe a planned, partially implemented, or historically reported capability as fully working without current appropriate evidence.
## 4. Authorization and execution workflow
The project owner has final authority over scope, repository changes, architectural decisions, and phase advancement. ChatGPT helps plan and review; Codex performs authorized local repository work in VS Code.

For every task:
1. Identify the applicable phase/checkpoint, objective, authorized paths and operation type, permitted commands or checks, and expected report.
2. For substantial new development not already covered by explicit execution authorization, use **Stage A — Planning**: inspect only the relevant project material and implementation, identify applicable requirements and decisions, and present one consolidated implementation proposal.
3. After owner approval, use **Stage B — Execution**: complete the entire authorized scope as one coordinated batch, including authorized tests and materially affected documentation. Do not request unnecessary approval for each file inside that scope.
4. A task may authorize planning and execution together. In that case, proceed through the approved batch without creating artificial per-file checkpoints.
5. Stop for new authorization only when work would materially exceed scope, introduce a security or privacy concern, conflict with a protected requirement or decision, require unavailable or broader access, or perform an unapproved destructive or external action.
6. Preserve existing user files, uncommitted changes, and deleted-file states. Do not reset, clean, checkout, revert, overwrite, or disturb unrelated work.
7. Do not run builds, tests, formatters, linters, package operations, Git commands, migrations, database operations, background processes, scripts, or network/provider calls unless the task authorizes them.
8. Do not advance phases or checkpoints automatically. Report evidence and obtain the owner's explicit phase decision.

Task-specific instructions may be more restrictive than this file and always control the authorized scope.

## 5. Mandatory institutional knowledge governance
The approved institutional-content flow is:
1. The issuing university office officially approves and publishes the information.
2. An authorized Admin or Knowledge-Base Manager submits the source or entry, preserving official provenance.
3. A separate Knowledge-Base Manager role independently reviews the exact submitted source/version.
4. Only the approved and otherwise eligible version may be made available to student-facing retrieval.
The application has three distinct roles: Student, Admin, and Knowledge-Base Manager. The manager is not merely an Admin permission. Authorization must be enforced by the backend, not just hidden UI controls.

Requirements that must not be weakened:
- Manual entries must identify their issuing office and an independent official supporting reference.
- Changed content requires renewed human approval for the changed version. Do not automatically inherit approval from an older version.
- An earlier approved version may remain retrievable during review only while still valid and not officially withdrawn or superseded.
- Pending, rejected, inactive, withdrawn, or otherwise ineligible content must not become retrievable.
- Never transmit pending/unapproved institutional source content to external AI or embedding providers. Embedding or preprocessing workflows must honor the approval gate.
- Preserve review decisions, source/version identity, provenance, timestamps, and relevant audit history.
- Citations must refer to actual approved evidence; syntactically valid links or citation numbers do not by themselves establish that a claim is supported.
Existing README or code descriptions of Admin-only review, pre-review embeddings, or automatic version activation are current-state/historical descriptions, not permission to violate these approved target requirements. Do not silently change behavior under a read-only or documentation-only task.
## 6. Student information, privacy, and security
- Keep confidential student records outside public knowledge retrieval and AI-provider prompts.
- Student concerns require future authorized implementation of validated submission, private durable storage, appropriate access controls, truthful receipts/status wording, duplicate controls, and defined retention. A local demo ticket preview is not a live concern service.
- Protect credentials, passwords, tokens, reset links, API keys, environment files, student details, and private office materials. Never output secrets in prompts, logs, reports, or example values.
- Restrict any external source fetching to explicitly authorized work. Preserve existing URL safety, SSRF, size, timeout, and allowed-domain safeguards when relevant.
- For memoranda and time-sensitive information, distinguish issue date, effective period, withdrawn/superseded status, and evidence coverage. Use Asia/Manila when the approved workflow calls for local periods.
- If evidence is missing, conflicting, outdated, or insufficient, report uncertainty rather than fabricate a university-specific answer.
## 7. Documentation and evidence discipline
The accepted Phase 00 documentation inventory consists of:

AGENTS.md, README.md, PROJECT_PLAN.md, IMPLEMENTATION.md, APP_FLOW.md, DATABASE.md, API.md, RAG_KNOWLEDGE_BASE.md, SECURITY_PRIVACY.md, TESTING.md, BUGS.md, DESIGN.md, REQUIREMENTS_TRACEABILITY.md, DECISIONS.md, and CHANGE_REQUESTS.md.

This is an accepted documentation inventory, not independent proof of current repository state, application functionality, or permission to create or modify files. DESIGN.md remains under the owner's design direction; BUGS.md must identify confirmed root causes and label unproven causes as unknown.
- Preserve the historical record; distinguish original SRS requirements, owner-approved directions, inspected code, historical reports, runtime-verified behavior, and unresolved gaps.
- Do not treat historical test claims (including the reported 75/75) as newly executed tests.
- Use observed file paths and exact line references where available. Do not invent logs, paths, results, filenames, test counts, citations, or explanations.
- Useful evidence classes: Code Evidence Found, Partial Evidence, Not Observed, Potential Conflict, and Not Yet Verified. An absence from bounded inspection is not proof of repository-wide absence.
- For bugs, record symptoms, source evidence, reproduction status, supported cause (or unknown), impact, and historical/current status.

## 8. Development workflow and document routing

For every feature request, understand the owner's objective, consult only the relevant specifications below, inspect the existing implementation within the approved scope, identify applicable SRS requirements and decisions, plan when needed, implement only what is authorized, run only authorized verification, synchronize materially affected documentation, and report actual results and limitations.

| Work area | Consult |
|---|---|
| Backend development | [IMPLEMENTATION.md](IMPLEMENTATION.md), [API.md](API.md), and [SECURITY_PRIVACY.md](SECURITY_PRIVACY.md) when relevant |
| MongoDB and persistence | [DATABASE.md](DATABASE.md), [IMPLEMENTATION.md](IMPLEMENTATION.md), [SECURITY_PRIVACY.md](SECURITY_PRIVACY.md) |
| Frontend development | [DESIGN.md](DESIGN.md), [APP_FLOW.md](APP_FLOW.md) |
| Authentication and RBAC | [SECURITY_PRIVACY.md](SECURITY_PRIVACY.md), [API.md](API.md), [DATABASE.md](DATABASE.md) |
| AI chatbot and RAG | [RAG_KNOWLEDGE_BASE.md](RAG_KNOWLEDGE_BASE.md), [SECURITY_PRIVACY.md](SECURITY_PRIVACY.md), and [DATABASE.md](DATABASE.md) when relevant |
| Bug resolution | [BUGS.md](BUGS.md), [TESTING.md](TESTING.md), and the affected implementation specification |
| Planning and milestones | [PROJECT_PLAN.md](PROJECT_PLAN.md), [REQUIREMENTS_TRACEABILITY.md](REQUIREMENTS_TRACEABILITY.md) |
| Requirements or architecture changes | [DECISIONS.md](DECISIONS.md), [CHANGE_REQUESTS.md](CHANGE_REQUESTS.md), [REQUIREMENTS_TRACEABILITY.md](REQUIREMENTS_TRACEABILITY.md) |

After an authorized development checkpoint, update only materially affected documents in the same approved batch. Preserve history; distinguish planned, implemented, tested, and owner-accepted states; maintain SRS traceability; record relevant bugs, decisions, or change requests; and never convert an unexecuted test or proposed requirement into an accepted result.

All repository work is local unless the owner separately authorizes Git or another external synchronization operation. Never perform Git operations or push to GitHub automatically, and never modify unrelated files.

## 9. Required completion report
After an authorized task, report concisely:
1. Approved checkpoint and exact scope actually performed.
2. Files inspected or changed, relevant line references, and the reason for each change (if editing was approved).
3. Commands executed (if any), order, observed outputs, exit codes where available, errors, and any truncation.
4. Tests/checks actually run with pass/fail/skipped outcomes; explicitly state when none ran.
5. Findings, SRS/decision alignment, risks, evidence limitations, and unresolved items.
6. Any deviations or blockers; confirm that no unauthorized actions were taken.
7. One bounded recommendation for the next checkpoint, clearly marked not executed.
Do not claim success without evidence. Do not continue automatically after reporting.
## 10. Project continuity
The current phase/checkpoint and approvals must come from the latest owner-provided handoff and approved task, not a hard-coded status in this file. Switching Codex accounts or starting a new chat does not authorize new work, establish fresh test results, or change the local repository.

Default stance: preserve, inspect only if authorized, explain evidence honestly, and stop at the approval boundary.
