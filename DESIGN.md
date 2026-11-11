# TRAIL AI Desk — Interface Design and User Experience Guide

**Project:** TRAIL AI Desk  
**Institution:** University of Science and Technology of Southern Philippines (USTP), Cagayan de Oro Campus  
**Document status:** Living design reference — recovered from the P00-E4 backup and modernized through an owner-authorized documentation batch  
**Lifecycle status:** Phase 00 closed — READY WITH DOCUMENTED LIMITATIONS; Phase 01A ongoing  
**Historical provenance:** Prepared November 4, 2026 under P00-E4A; backup provenance does not independently prove historical acceptance  
**Modernized:** November 8, 2026  
**Requirements baseline:** Original October 2026 SRS — FR-001–FR-036 and NFR-001–NFR-012  
**Decision baseline:** `DECISIONS.md`  
**Roadmap:** `PROJECT_PLAN.md`  
**Implementation reference:** `IMPLEMENTATION.md`  
**Workflow reference:** `APP_FLOW.md`

## 1. Purpose

This document establishes a design reference for the TRAIL AI Desk user interface.

It addresses:

- Readability and usability.
- Navigation and information hierarchy.
- Consistent interaction patterns.
- Student-facing information and chat presentation.
- Institutional citation and memorandum presentation.
- Private concern-submission experiences.
- Admin and Knowledge-Base Manager management interfaces.
- Loading, empty, error, and confirmation states.
- Responsive interfaces and supported-device considerations.
- Accessibility requirements.
- Design consistency and acceptance criteria.

This document does not assert that the current application already meets these standards.

It also does not approve a specific visual theme or authorize frontend development.

Developers and Codex should consult this document for authorized frontend, interaction, accessibility, and role-specific workflow work. Actual implementation status belongs in `IMPLEMENTATION.md`, user journeys belong in `APP_FLOW.md`, and executed verification belongs in `TESTING.md`.

## 2. Design authority and evidence status

The original SRS provides the required user-facing functionality and relevant non-functional constraints.

`DECISIONS.md` governs the approved three-role architecture, independent institutional knowledge review, citation support, memoranda, concerns, and demo transition.

`APP_FLOW.md` describes the intended behavior and workflow boundaries.

`IMPLEMENTATION.md` separates historical application evidence from the approved target.

Design details must be classified appropriately.

| Classification | Meaning |
|---|---|
| SRS requirement | Behavior or quality explicitly required by the original specification |
| Approved decision | Later project-owner-approved direction |
| Design principle | Guidance intended to support those requirements |
| Proposed design | UI choice requiring owner review or approval |
| Historical interface | Screen or behavior described in earlier evidence |
| Verified design | Implementation or test result confirmed through current evidence |

A proposed interface pattern must not be described as an approved design merely because it is included here.

## 3. Historical frontend baseline

Prior authorized evidence identifies an application using:

- Expo v57.
- React Native.
- Expo Router.
- TypeScript.
- Historically documented authentication screens and navigation.
- Student dashboard and chatbot interfaces.
- University information browsing.
- Administrative management interfaces.
- Explicit local demonstration functionality.

Historical presence of these elements does not establish current usability, accessibility, responsive behavior, or integration correctness.

The exact screen hierarchy, component library, design tokens, theme values, and existing visual implementation remain to be verified through authorized inspection.

No existing screen should be redesigned solely because this document proposes a possible pattern.

## 4. Design goals

The interface should help users:

1. Understand where they are in the application.
2. Identify available actions appropriate to their role.
3. Find relevant university information efficiently.
4. Distinguish official approved information from unavailable or unverified content.
5. Read AI answers and their supporting evidence.
6. Select memorandum reporting periods clearly.
7. Submit private student concerns with confidence about the actual result.
8. Recover appropriately from errors.
9. Understand whether a session or feature is operating in demo mode.
10. Perform institutional review actions without confusing submission, approval, or publication authority.

The resulting design must remain consistent with the application's authorized information boundaries.

## 5. Design principles

### 5.1 Clarity

Navigation, headings, instructions, input labels, and status messages should use understandable language.

Critical actions should not depend on ambiguous icons alone.

### 5.2 Consistency

Similar actions should use consistent control placement, visual language, validation feedback, and interaction behavior.

### 5.3 Accuracy

The interface must truthfully represent the underlying system state.

A successful-looking screen must not hide a failed backend operation.

### 5.4 Evidence visibility

University information should make relevant citations and source details understandable and accessible.

### 5.5 Privacy

Sensitive student information should not be inadvertently exposed through shared screens, error messages, navigation history, or unauthorized access.

### 5.6 Accessibility

Readable text, sufficient contrast, appropriate touch controls, and understandable feedback are required by the SRS.

### 5.7 Progressive disclosure

The interface should present essential information clearly while allowing users to inspect supporting details when relevant.

This is a design principle, not an approval of any specific expandable component.

## 6. User roles and interface boundaries

The approved roles are:

1. Student.
2. Admin.
3. Knowledge-Base Manager.

Each role needs an appropriate user experience without compromising backend authorization.

### Student

The student interface must prioritize:

- University information.
- Chat and evidence.
- Memoranda and announcements.
- Concern submission.
- Personal session controls.

### Admin

The Admin interface should support authorized administration and source-submission functions.

Exact administrative permissions and visual structure remain subject to later design and RBAC approval.

### Knowledge-Base Manager

The Knowledge-Base Manager interface must support independent institutional source review and appropriate knowledge eligibility management.

It should visually distinguish submission actions from independent review decisions.

The system must not infer permissions from frontend appearance.

## 7. Information architecture and navigation

### 7.1 Navigation objectives

The design should provide:

- Understandable feature names.
- Clear hierarchy.
- Orientation within the current area.
- Predictable return navigation.
- Appropriate role-specific destinations.
- Discoverable session actions.
- Safe handling of protected routes.

### 7.2 Open layout decisions

The following are not yet approved:

- Bottom tabs versus side navigation.
- Drawer menus.
- Header arrangement.
- Navigation depth.
- Dashboard card arrangement.
- Role-specific landing page design.
- Mobile versus web navigation differences.

The final information architecture should be selected using actual application requirements, current source evidence, and owner feedback.

### 7.3 Navigation and authorization

Role-specific navigation is a usability feature, not the primary security mechanism.

Protected backend operations must reject unauthorized users even when a route or endpoint is accessed directly.

## 8. Visual identity and styling

### 8.1 Institutional identity

The interface should be appropriate for a USTP-oriented student information assistant.

Use of university branding, logos, official typography, or institutional identity assets should follow applicable owner-approved guidance and asset permissions.

The document does not establish an official university brand manual or authorize unverified branding choices.

### 8.2 Visual design choices awaiting approval

The following remain open:

| Design element | Current decision status |
|---|---|
| Primary and secondary colors | Not yet approved |
| Light and dark theme support | Not yet approved |
| Font family and type scale | Not yet approved |
| Logo and icon treatment | Not yet approved |
| Corner radius and elevation | Not yet approved |
| Layout spacing system | Not yet approved |
| Illustration and imagery rules | Not yet approved |
| Component-library selection | Not yet approved |
| Motion and animation style | Not yet approved |

A future design-system checkpoint may propose exact values after relevant historical UI inspection.

### 8.3 Visual hierarchy

Until specific styling is approved, designs should prioritize:

- Distinct page and section headings.
- Clear primary actions.
- Readable body text.
- Understandable information groupings.
- Consistent spacing.
- Appropriate emphasis for errors and approvals.
- Unambiguous interactive elements.

Specific implementation tokens must not be invented as current project standards.

## 9. Typography, contrast, and accessibility

**Relevant requirements:** NFR-001, NFR-002, NFR-010.

The interface must provide:

- Readable text.
- Sufficient foreground/background contrast.
- Appropriately sized touch controls.
- Clear input labels.
- Understandable instructions.
- Distinguishable control states.
- Feedback that is not conveyed by color alone.
- Usable layouts on the supported device and browser set.

Future approved design and testing should establish:

- Exact accessibility conformance targets.
- Minimum font-size guidance.
- Contrast thresholds.
- Touch-target dimensions.
- Keyboard and focus-management requirements.
- Screen-reader labeling.
- Dynamic text scaling.
- Zoom and viewport handling.

These numerical and technical standards are not silently approved by this document.

## 10. Responsive design

TRAIL AI Desk is intended for supported Android devices and modern web browsers identified through testing.

The design must account for different screen sizes and input methods.

Future design work should evaluate:

- Small mobile viewports.
- Larger mobile screens.
- Web browser layouts.
- Text wrapping and content overflow.
- Form usability.
- Source and citation presentation.
- Tables and administrative review controls.
- Touch versus pointer/keyboard interaction.

Exact breakpoints and adaptive layouts require later approval.

No claim of device compatibility is established through this document.

## 11. Common interface components

A proposed component inventory includes:

| Component | Intended purpose |
|---|---|
| Page heading | Identify the current area |
| Navigation control | Move between available features |
| Form field | Capture required input |
| Validation message | Explain correctable input issues |
| Primary action | Identify the main action on a screen |
| Secondary action | Provide an alternative or return path |
| Loading indicator | Show ongoing work |
| Empty-state presentation | Explain unavailable or absent records |
| Error presentation | Describe failed operations truthfully |
| Confirmation feedback | Communicate a verified completed action |
| Source/citation presentation | Identify supporting institutional evidence |
| Status presentation | Distinguish pending, approved, rejected, or unavailable states where relevant |
| Session control | Support authenticated account actions |

This inventory represents design categories, not confirmed existing React Native components.

Final component props, styles, names, and code locations require authorized implementation work.

## 12. Authentication and session screens

**Relevant requirements:** FR-001–FR-005, NFR-007.

Authentication design should support:

- Understandable credential fields.
- Clearly labeled submission controls.
- Appropriate error feedback.
- Password-recovery access.
- Visible processing feedback.
- Consistent post-login orientation.
- Discoverable logout functionality.

Design considerations include:

- Avoiding sensitive credential disclosure.
- Preventing repeated submission confusion.
- Recovering from expired sessions.
- Preserving appropriate privacy after logout.
- Denying access when roles or sessions are unauthorized.

Public self-registration is not assumed to be approved.

The precise layout and wording require later design review.

### 12.1 Shared Student and Staff login presentation

**Status:** UI IMPLEMENTED — AUTHENTICATION NOT INTEGRATED

The Student Login and Staff Login share the established USTP/TRAIL identity panel, responsive layout, typography, credential-field styling, password visibility behavior, loading/error presentation patterns, keyboard behavior, and accessible interaction sizing.

The Staff Login is titled **Admin & Knowledge-Base Manager Login** and provides a return path to the Student Login. Its disabled Sign In control and integration-status message must remain visually and semantically clear until separately authorized authentication work is complete.

The shared presentation does not merge Admin and Knowledge-Base Manager permissions, establish a trusted role, or grant access to a protected destination. Source structure was reviewed during implementation, but rendered responsive and browser behavior remains unverified because the local web preview could not start without an active Node.js version.

## 13. Student dashboard and university information

**Relevant requirements:** FR-004, FR-013–FR-016.

The student dashboard should provide a clear entry point to available services.

Information presentation should:

- Group related university topics meaningfully.
- Use understandable category labels.
- Make important details easy to scan.
- Distinguish available approved content from missing information.
- Preserve relevant official-source context.
- Avoid overwhelming the student with unsupported or outdated information.

Possible dashboard tiles, category cards, lists, or search controls are design options rather than approved layouts.

The visual design must not imply that every institutional topic is covered by the knowledge base.

## 14. Chat and citation design

**Relevant requirements:** FR-006–FR-012, NFR-003–NFR-006.

### 14.1 Chat interaction

The chat experience should:

- Provide a clear question-entry control.
- Identify message authorship understandably.
- Show when processing is in progress.
- Present readable responses.
- Support follow-up questions with relevant context.
- Communicate failures and insufficient evidence accurately.

The exact message-bubble style, composer layout, and conversation-history treatment remain open design choices.

### 14.2 Institutional evidence

The interface should help a student evaluate supporting information.

Relevant source details may include:

- Document or source title.
- Issuing university office.
- Applicable publication or effective date.
- Official source reference.
- Relevant supporting passage, where appropriate.

The backend remains responsible for eligible-version selection and factual grounding.

Designing attractive citation cards does not establish citation accuracy.

### 14.3 Unsupported or insufficient answers

When approved evidence is insufficient, the presentation should:

- Explain the limitation without overstating certainty.
- Avoid fabricated official facts.
- Provide appropriate available context when supported.
- Avoid making a provider or retrieval failure appear as a verified university answer.

### 14.4 Failure behavior

If AI generation, retrieval, or the backend fails, the interface should present an understandable error state.

It must not silently substitute simulated successful content.

## 15. Memoranda and announcement design

**Relevant requirements:** FR-017–FR-019; D-008.

The memoranda experience must communicate:

- The selected reporting period.
- Whether the current week is selected.
- The relevant issuing office.
- The relevant memorandum date.
- The official source.
- Whether matching approved records are available.

### Proposed presentation considerations

Possible design choices include:

- A period selector.
- A readable list of matching memoranda.
- A detail view with evidence and dates.
- An empty-state explanation.
- A clear indication of changed or superseded status where relevant.

These are proposed presentation patterns, not approved component specifications.

### Date handling

Period definitions must follow the approved Asia/Manila convention.

Exact current-week boundaries and additional period options require owner-approved design and test criteria.

When no approved records match, the interface must not claim that no official memorandum was issued by the university.

## 16. Student concern-form design

**Relevant requirements:** FR-020–FR-023; D-009; NFR-009.

The concern form should support:

- Clearly labeled required fields.
- Understandable instructions.
- Input validation.
- Appropriate privacy cues.
- Accurate processing feedback.
- A truthful submission confirmation.
- Correct handling of failed or duplicate submissions.

### Privacy considerations

- Do not display another student's concern.
- Avoid exposing concern text in inappropriate shared areas.
- Do not send private concerns into public knowledge retrieval.
- Do not reveal protected details through general error messages.
- Keep authorization and storage guarantees in the backend.

### Confirmation design

The design must distinguish:

- A form submitted for processing.
- A concern successfully saved by TRAIL.
- An acknowledgement by an authorized university office.
- A resolution confirmed through an authorized university workflow.

Possible reference numbers, tracking pages, status timelines, or office-routing controls require later specification and approval.

Historical local concern-preview screens do not prove real submission.

## 17. Admin source-management design

**Relevant requirements:** FR-024–FR-029, FR-032–FR-035; NFR-011.

The Admin interface should make permitted operations understandable and traceable.

Potential source-submission presentations include:

- Official webpage registration.
- Document upload.
- Manual institutional information entry.
- Source-origin details.
- Issuing-office identification.
- Supporting official references.
- Submission status.
- Available historical version details.

The exact interface layout and permissions require subsequent approval.

### Review-boundary clarity

Admin content submission must not appear equivalent to independent institutional knowledge approval.

Controls should clearly communicate when submitted content is pending review.

A successful submission must not be represented as approved publication within TRAIL.

## 18. Knowledge-Base Manager review design

**Relevant requirements:** FR-030–FR-035; D-002–D-006, D-010.

The Knowledge-Base Manager experience must support meaningful independent review.

### Required information visibility

An authorized reviewer should be able to inspect:

- The source title or identifier.
- The issuing office.
- Official provenance.
- Supporting references.
- The exact submitted version.
- Relevant change details.
- Submission identity.
- Review eligibility and current status.
- Relevant approval and rejection history.

### Decision integrity

The interface must support an accurate distinction between:

- Submission.
- Pending review.
- Approval.
- Rejection.
- Withdrawal.
- Supersession.
- Changed-version resubmission.

These are conceptual states; their exact backend identifiers and transition rules remain to be designed.

### Critical interactions

- A manager must not approve their own submitted version.
- The backend must independently enforce this rule.
- Stale version decisions must not silently apply to newer content.
- Missing official provenance must prevent successful approval.
- A rejected version must not be presented as student-retrievable.
- Confirmation must reflect the actual persisted review result.

Exact approval-dialog layouts, review-note requirements, and status-label colors remain open design choices.

## 19. Loading, empty, error, and confirmation states

**Relevant requirements:** FR-011–FR-012; NFR-003–NFR-004.

Each major workflow requires appropriate feedback.

| State | Design requirement |
|---|---|
| Loading | User can understand that processing is underway |
| Success | Confirmation reflects an actual completed backend action |
| Input error | Explain what needs correction |
| Empty information | State the relevant approved-content limitation |
| Unauthorized | Explain lack of access without exposing protected details |
| Session expired | Provide a clear recovery route |
| Provider failure | Communicate service unavailability |
| Database failure | Avoid indicating false success |
| Pending source review | Do not imply that content is already approved |
| Rejected source | Accurately represent rejection and next allowed steps |
| Demo mode | Clearly identify simulated behavior |
| Retry | Avoid accidental duplicate durable actions |

Specific wording should be reviewed against real API behavior.

Loading indicators must be evaluated against response-time targets established before final testing.

No performance target is newly approved here.

## 20. Demo presentation requirements

**Relevant decision:** P00-D-DEMO.

During early development, temporary demo functionality may remain visibly labeled.

Its presentation must not:

- Imitate verified live database operation without disclosure.
- Conceal service failure.
- Represent simulated responses as approved institutional answers.
- Present local concern previews as stored official submissions.
- Become a necessary dependency of the final live application.

The demo fallback is intended to be retired after verified database-backed operation, real authentication, and three-role backend authorization, under a separately authorized checkpoint.

This document does not authorize removal or redesign of current demo screens.

## 21. Design system and future tokens

A future design-system specification may define:

| Token group | Possible contents |
|---|---|
| Colors | Brand, text, background, border, status, interaction |
| Typography | Font families, sizes, weights, line spacing |
| Spacing | Consistent layout increments |
| Dimensions | Component sizes and responsive constraints |
| Shapes | Corners, borders, elevation |
| Navigation | Common role-specific layout patterns |
| Forms | Inputs, labels, errors, validation |
| Feedback | Loading, confirmation, warning, error |
| Citations | Source labels, evidence previews, links |
| Review states | Source eligibility and approval presentation |

All exact token values remain unapproved.

The future design system should preserve consistency with actual React Native/Expo implementation constraints and verified supported platforms.

## 22. Proposed design verification checklist

Later authorized testing and design review should verify:

1. Readable text and understandable instructions.
2. Sufficient contrast.
3. Appropriate touch-control sizes.
4. Clear role-specific navigation.
5. Backend authorization independent of frontend visibility.
6. Usable login, recovery, and logout interactions.
7. Chat loading and error states.
8. Accurate institutional citation presentation.
9. Correct insufficient-evidence messages.
10. Memorandum reporting-period selection.
11. Accurate Manila-time date presentation.
12. Private and usable concern forms.
13. Truthful concern confirmation and office statuses.
14. Clear source submission and approval distinction.
15. Review of the exact source version.
16. Clear self-approval denial and stale-review behavior.
17. Explicit demo labeling.
18. Appropriate Android and browser layouts.
19. Keyboard, focus, and assistive-technology behavior where applicable.
20. Consistency across common components.

The checklist is a proposed verification framework. Specific test thresholds and device targets require approval before final acceptance testing.

## 23. Design decisions requiring future approval

The following are not established by the available evidence or currently approved decisions:

- Official theme and color palette.
- Font family and typography system.
- Exact iconography and logo treatment.
- Student dashboard layout.
- Mobile and web navigation design.
- Role-specific landing screen arrangements.
- Chat history and evidence-panel design.
- Memorandum period-picker details.
- Concern-form field specifications.
- Admin management navigation.
- Knowledge-Base Manager review controls.
- Component-library selection.
- Responsive breakpoints.
- Motion and animation behavior.
- Accessibility acceptance thresholds.
- Exact wording and style of application status messages.

These items should be resolved through later owner-approved design or implementation tasks.

No design proposal may silently override an original requirement or accepted governance decision.

## 24. Maintenance and acceptance

The design document should be revised only through the authorized project workflow. Updates are triggered by an approved screen or workflow change, accepted design decision, accessibility finding, verified implementation change, or executed design-validation result.

ChatGPT or Codex may prepare an authorized revision. The project owner approves design direction, scope, acceptance, and phase implications. A change is recorded as implemented or verified only when current code or test evidence supports that classification.

A future revision should identify:

- The affected screen, flow, or design pattern.
- The supporting SRS requirement.
- Any approved P00-D decision.
- Relevant current interface evidence.
- The proposed design change.
- Accessibility and responsive implications.
- Any backend/security dependencies.
- The approval and verification outcome.

Related references that must remain consistent are `APP_FLOW.md`, `IMPLEMENTATION.md`, `SECURITY_PRIVACY.md`, `TESTING.md`, `REQUIREMENTS_TRACEABILITY.md`, and `DECISIONS.md`.

### Document acceptance criteria

`DESIGN.md` is accurate and maintainable when:

1. It distinguishes historical interface evidence from future design.
2. It preserves all three roles.
3. It respects approved independent source review.
4. It supports student chat, institutional information, memoranda, and concerns.
5. It incorporates SRS usability and readability requirements.
6. It addresses real loading, error, and confirmation states.
7. It preserves citation and evidence requirements.
8. It does not imply unauthorized access to private records.
9. It avoids asserting unapproved colors, fonts, screens, or routes.
10. It does not claim unverified application behavior is operational.
11. It clearly identifies unresolved design decisions.
12. It remains aligned with `APP_FLOW.md`, `IMPLEMENTATION.md`, and `PROJECT_PLAN.md`.
13. Its Markdown structure is verified.
14. Material design directions and acceptance outcomes are explicitly owner-approved.

Acceptance of the document is not acceptance of a completed visual design or production interface.

## 25. Project authority

The project owner retains final authority over design, scope, implementation, repository modifications, and phase advancement.

ChatGPT may prepare and review design documentation.

Codex may modify the repository only after receiving explicit, bounded authorization.

This document does not authorize frontend redesign, new dependencies, source-code modifications, or phase advancement. Those actions require a separately authorized implementation scope.

