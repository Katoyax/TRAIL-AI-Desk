# TRAIL AI Desk — Code Style and Commenting

## Document purpose

This document defines the coding and commenting conventions for TRAIL AI Desk. It applies to new implementation code and to implementation code changed during an authorized checkpoint. It supports student developers by making intent, security boundaries, and maintenance responsibilities easier to understand.

This standard does not authorize code changes, broad comment-only rewrites, formatting passes, dependency changes, or refactoring. Follow the authorization and evidence requirements in [AGENTS.md](AGENTS.md) before modifying the repository.

The conventions below reflect the current React Native, Expo Router, TypeScript, native Node.js ES-module, and MongoDB architecture. Preserve a file’s established local structure when a task does not authorize broader cleanup.

## 1. Function and component comments

Every meaningful function, method, and React component should have a short purpose comment immediately above it.

Use a single clear sentence in most cases:

```typescript
// Retrieves Student accounts for the Admin Dashboard.
async function loadStudents() {
  // Existing implementation
}
```

```tsx
// Displays the Admin Dashboard and its management modules.
export default function AdminDashboardScreen() {
  // Existing implementation
}
```

```javascript
// Validates the user's credentials and creates an authenticated session.
async function login(credentials) {
  // Existing implementation
}
```

Purpose comments must:

- Explain what responsibility the function or component owns.
- Use beginner-friendly English.
- Usually remain one sentence.
- Mention an important security or data-integrity boundary when it is not obvious.
- Avoid describing every statement inside the function.
- Avoid promising behavior that the function does not implement or that has not been verified.

Small callbacks, simple accessors, obvious predicates, direct property mappers, and trivial event adapters do not need individual comments when their names and surrounding context already explain them.

## 2. Comments for complex logic

Add a short comment immediately before non-obvious or security-sensitive logic. Prefer explaining why the safeguard or sequence exists instead of translating the code into English.

Comment the reason for logic involving:

- Backend role-based authorization and protected-route boundaries.
- Password hashing, reset-token handling, session hashing, expiry, and revocation.
- Atomic MongoDB updates, uniqueness constraints, concurrency handling, and TTL cleanup.
- Bounded queries, projections that exclude sensitive fields, and deduplication.
- RAG retrieval, source-version eligibility, indexing, citations, and document verification.
- SSRF defenses, external-provider restrictions, and input-size limits.
- Generic authentication or recovery responses that prevent account discovery.
- Stale-request cancellation or session-change protection in React effects.
- Unusual error translation, fallback behavior, or deliberately non-blocking work.

Good comment:

```javascript
// Consume the reset token and update the password atomically so only one request can succeed.
```

Avoid comments that merely repeat syntax:

```javascript
// Set active to true.
user.active = true;
```

Use `TODO` comments only for a real, acknowledged follow-up. Include the missing behavior or decision clearly; do not use `TODO` to conceal an incomplete security control.

## 3. Naming conventions

### Variables and functions

- Use `camelCase`: `studentEmail`, `listStudents`, `requestPasswordReset`.
- Use descriptive nouns for values and verb phrases for operations.
- Prefix booleans with words such as `is`, `has`, `can`, or `should`: `isDemo`, `hasConfiguredApi`.
- Name React event handlers `handleX` when they coordinate UI behavior: `handleLogout`, `handleCreate`.
- Name hooks with the `use` prefix and follow the Rules of Hooks.
- Avoid unexplained abbreviations and one-letter names outside short, conventional loops.

### React components, types, and classes

- Use `PascalCase` for React components: `AdminDashboardScreen`.
- Use `PascalCase` for TypeScript types, interfaces, and error classes: `SessionUser`, `RequestOptions`, `ApiError`.
- Use a `Screen` suffix for route-screen components when it improves clarity.
- Prefer `type` for the project’s current TypeScript data shapes. Use `interface` when extension or declaration merging is specifically useful; do not mix styles without a reason.

### Constants and configuration

- Use clear module-level names for application constants.
- Use `UPPER_SNAKE_CASE` for environment-variable names and external configuration keys, such as `MONGODB_DATABASE`.
- Preserve established exported token objects such as `Brand` rather than introducing competing constants.
- Do not embed credentials, completed connection strings, or environment-specific secrets in constants.

### Files and routes

- Use lowercase kebab-case for Expo route and reusable component files: `admin-dashboard.tsx`, `password-requests.tsx`, `login-layout.tsx`.
- Use descriptive lowercase service filenames: `auth.ts`, `api.ts`, `password-requests.ts`.
- Use `.mjs` for the existing Node.js ES-module backend and include the file extension in relative imports.
- Name API resource paths with stable lowercase plural nouns where appropriate: `/api/admin/students`.
- Name service functions after the operation they perform: `listStudents`, `createStudent`, `updatePasswordResetRequest`.

## 4. Formatting and imports

- Use two spaces for indentation in new or substantially edited code.
- Use single quotes for JavaScript and TypeScript strings unless escaping would make another form clearer.
- End statements with semicolons in TypeScript and in backend modules that follow that convention.
- Use trailing commas in multiline objects, arrays, parameters, and imports where supported.
- Break complex conditions, function calls, and JSX props across lines so they remain readable.
- Avoid compressing security-sensitive or multi-step logic into dense one-line statements.
- Keep imports at the top of the module.
- Group imports in this order when practical: external packages, platform/framework modules, then local project modules.
- Remove imports that are no longer used.

Do not introduce a new formatter, linter rule, or mass-formatting change without separate approval. A focused change should not reformat unrelated lines.

## 5. Frontend conventions

TRAIL AI Desk frontend code uses React Native, Expo SDK 57, Expo Router, and TypeScript.

- Consult the exact Expo SDK 57 documentation required by [AGENTS.md](AGENTS.md) before changing Expo or Expo Router behavior.
- Keep route screens under `src/app/` and reusable presentation under `src/components/`.
- Put backend communication in `src/services/`; do not duplicate `fetch` and authentication logic inside screens.
- Reuse `apiRequest()`, `useSession()`, and established authentication services.
- Treat Expo protected routes as navigation controls. Backend authorization remains the security authority.
- Declare hooks at the top level and provide complete dependency arrays.
- Clean up timers, subscriptions, abort controllers, and asynchronous work in effects.
- Prevent stale requests from restoring protected state after logout, unmount, or session change.
- Derive display values during render when possible instead of duplicating them in state.
- Keep JSX readable by extracting repeated or conceptually separate sections into components when that reduces duplication.
- Use design tokens such as `Brand` and existing shared components before adding new visual constants.
- Include accessible labels, roles, live regions, disabled/busy states, keyboard behavior, and reasonable touch targets.
- Show truthful loading, empty, success, and error states. Do not fabricate successful backend results.
- Never store passwords, reset tokens, or privileged bearer tokens in local storage merely for UI convenience.

## 6. Backend conventions

The current backend uses native Node.js HTTP services, ES modules, and MongoDB.

- Keep relative backend imports explicit with `.mjs` extensions.
- Use `async`/`await` for asynchronous operations and handle every rejected operation at the correct boundary.
- Validate request shape, types, lengths, allowlisted fields, and identifiers before database work.
- Apply authentication and role authorization before protected reads or writes.
- Keep the backend authoritative for account roles, privileges, approval state, and protected destinations.
- Do not accept client-supplied privileged fields when the server can assign them safely.
- Use service functions for business and security rules and store functions for database access.
- Use explicit MongoDB projections or response allowlists for administrative and public data.
- Bound list sizes and use deterministic ordering.
- Preserve unique indexes and atomic operations for concurrency-sensitive behavior.
- Return sanitized, useful HTTP errors. Do not expose raw provider errors, database errors, stacks, topology, or secrets.
- Preserve generic responses where a more specific response would reveal account existence.
- Do not silently replace configured live-service failure with demo success.
- Do not manually construct partial account records when an established provisioning service exists.
- Log fixed, non-sensitive operational messages; never log request bodies containing credentials.

API route handlers should remain small: authenticate, validate or parse, call the appropriate service, and return a bounded response. Move reusable business logic into the service layer rather than duplicating it across routes.

## 7. Security and privacy in comments, examples, and logs

Never place any of the following in source comments, documentation examples, test output, application logs, or reports:

- Real passwords or temporary credentials.
- Bearer tokens or session-token hashes.
- Password reset tokens, reset URLs containing tokens, or token hashes.
- Password hashes or salts copied from real accounts.
- API keys or provider credentials.
- Database connection strings containing credentials.
- `.env` contents.
- Sensitive student, staff, or institutional personal information.

Use clearly fictional placeholders such as `student@example.test` and values generated at test runtime. Even URL-encoded credentials remain secrets.

Security comments should describe the control or reason without revealing the protected value or enough operational detail to weaken the control.

## 8. Error handling and evidence

- Prefer project error types and status-bearing errors over unstructured strings.
- Preserve the distinction between validation errors, authorization failures, missing records, rate limits, dependency failures, and unexpected server errors.
- Show users actionable messages without exposing internal diagnostics.
- Do not catch and ignore failures unless the operation is explicitly best-effort; explain that decision when it is security-sensitive.
- Tests and comments must describe actual behavior. Do not label a feature working merely because a route or UI control exists.
- Keep demo, mocked, locally tested, manually verified, and live operational evidence clearly separated.

## 9. Tests

- Give tests behavior-focused names that state the expected result.
- Use fictional identities and runtime-generated secrets.
- Prefer existing in-memory or fake adapters for bounded unit and HTTP tests.
- Assert both permitted behavior and rejection of unauthorized or unsafe behavior.
- Verify that public and administrative responses omit passwords, hashes, tokens, and other sensitive fields.
- Do not weaken an expectation to hide an implementation defect.
- Do not contact live databases, email providers, or AI services unless the checkpoint explicitly authorizes it.

## 10. Comment maintenance

Comments are part of the maintained code.

- Update a comment when the related behavior or security boundary changes.
- Remove outdated, misleading, speculative, or duplicated comments.
- Keep historical claims in the appropriate Markdown record rather than embedding a long project history in source code.
- Do not leave comments claiming a future control is already enforced.
- During review, check that comments still match the function, its callers, and its actual failure behavior.

## 11. Avoid over-commenting

Do not add comments for:

- Obvious variable declarations.
- Closing braces or routine returns.
- Straightforward property assignments.
- Self-explanatory component markup.
- Every line in a sequence already explained by one useful purpose comment.

The goal is readable, trustworthy code—not a high comment count. Prefer clear names and small, focused functions first, then add comments where intent, security, or non-obvious reasoning would otherwise be lost.

## 12. Review checklist

Before completing an authorized implementation change, confirm:

1. Meaningful new or modified functions and components have concise purpose comments where needed.
2. Non-obvious security, concurrency, retrieval, or lifecycle logic explains why it exists.
3. Names follow the existing project conventions.
4. Frontend code uses the existing services, session model, router, and design tokens.
5. Backend code validates inputs and enforces authorization before protected operations.
6. Responses, comments, tests, and logs contain no secrets or sensitive personal information.
7. Comments remain accurate and redundant comments were not added.
8. Unrelated files and formatting were preserved.
