# TRAIL AI Desk UI redesign

Implemented in the existing Expo 57 / React Native application on October 27, 2026. No new app, runtime dependency, backend route, database schema, Git commit, or GitHub push was introduced.

The exact [Expo v57 reference](https://docs.expo.dev/versions/v57.0.0/), [Router reference](https://docs.expo.dev/versions/v57.0.0/sdk/router/), and [safe-area reference](https://docs.expo.dev/versions/v57.0.0/sdk/safe-area-context/) were reviewed before implementation. Academix screenshots were not present in the supplied attachment; the split-screen and sidebar structure follows the written brief.

## Changed files

| File | Change |
| --- | --- |
| `src/app/index.tsx` | Responsive campus-photo/login split, USTP logo, exact tagline, real sign-in, explicit demo selection, forgot-password navigation, validation, loading/errors, account availability explanation, hydration-safe layout. |
| `src/app/dashboard.tsx` | Opens the shared chat-first student workspace. |
| `src/app/ai-desk.tsx` | Keeps the existing route and question deep links using the same workspace. |
| `src/app/_layout.tsx` | Loads global focus styling, sets page title/description, selects readable status-bar appearance; retains session expiry and protected routes. |
| `src/app/information.tsx` | Shared brand styling, resource sections including announcements, clear demo/empty/loading/error states, source-backed entries. |
| `src/app/ticket.tsx` | Accessible concern form with profile prefill, validation, explicit local preview, and accurate submission limitations. |
| `src/components/desk-form.tsx` | Shared styling for existing forgot/reset-password screens, safe areas, keyboard handling and larger controls. |
| `src/components/source-card.tsx` | Readable citation metadata, verification badges, freshness warnings and accessible document/source links. |
| `src/global.css` | Visible keyboard focus, hover feedback and reduced-motion support. |

## Created files

| File | Purpose |
| --- | --- |
| `src/constants/brand.ts` | Shared colors, spacing and radius tokens. |
| `src/components/desk-icon.tsx` | Consistent native line icons without an additional dependency. |
| `src/components/student-desk.tsx` | Sidebar/drawer, assistant, conversation layout, composer, history, profile and settings. |
| `src/services/conversations.ts` | Session-isolated, memory-only chat history and pending-response state across route navigation. |
| `docs/TRAIL-UI-REDESIGN.md` | This implementation and validation report. |

Temporary browser helpers, logs, screenshots and build output are under the ignored `dist/` directory.

## Palette and provenance

The supplied `assets/images/ustp-logo.jpg` visibly uses deep blue and gold; `assets/images/USTP.jpg` shows the campus with blue architectural accents. The three main colors below were reused from existing TRAIL screen constants. They were **not** sampled and presented as exact official university standards. No authoritative official hex specification was supplied.

| Token | Hex | Purpose / origin |
| --- | --- | --- |
| navy | `#123553` | Existing TRAIL navy; primary navigation, actions and user messages. |
| blue | `#1E6484` | Existing TRAIL blue; links, icons and focus. |
| gold | `#E6B95F` | Existing TRAIL gold; New Chat, large text on navy and restrained accents. |
| ink | `#172B3A` | Supporting UI choice for main text. |
| muted | `#526675` | Supporting UI choice for secondary text with AA contrast. |
| canvas | `#F7F8FA` | Supporting neutral page background. |
| surface | `#FFFFFF` | Cards, form surfaces and inverse text. |
| line | `#DCE4EA` | Decorative dividers and noninteractive card boundaries. |
| inputBorder | `#718193` | Meaningful input/control borders. |
| pale | `#EAF2F6` | Supporting blue-tinted surface and hover state. |
| goldPale | `#FFF4DB` | Restrained assistant and warning surfaces. |
| onNavy | `#CBD8E4` | Supporting text/icons on navy. |
| success | `#16734C` | Verified and success labels. |
| warning | `#87631B` | Unverified information and source-check warnings. |
| error | `#A72B3A` | Validation and service errors. |
| disabled | `#526675` | Disabled action surface with readable inverse icon/text. |

## Contrast

Ratios were calculated from WCAG sRGB relative luminance and rounded to two decimal places. Text combinations below exceed 4.5:1; meaningful borders exceed 3:1. Status labels and selected states also use words, borders or marks.

| Foreground / background | Ratio | Use |
| --- | --- | --- |
| White / navy | 12.65:1 | Primary buttons and user messages. |
| White / blue | 6.54:1 | Primary hover state. |
| Navy / gold | 6.91:1 | New Chat label/icon; inverse pairing for large hero accent. |
| Ink / white | 14.55:1 | Body text. |
| Ink / canvas | 13.69:1 | Page text. |
| Muted / white | 5.97:1 | Helper text, placeholders and metadata. |
| Muted / canvas | 5.62:1 | Chat helper text. |
| Muted / pale | 5.27:1 | Supporting text on tinted surfaces. |
| On-navy / navy | 8.72:1 | Sidebar supporting text. |
| Blue / white | 6.54:1 | Links and focus indicator. |
| Blue / pale | 5.77:1 | Icons/links on tinted surfaces. |
| Success / white | 5.85:1 | Success text. |
| Warning / gold pale | 5.02:1 | Demo and warning badges. |
| Error / white | 6.89:1 | Errors. |
| Input border / white | 3.99:1 | Inputs and interactive card outlines. |
| Input border / canvas | 3.75:1 | Control boundary against surrounding canvas. |
| Input border / pale | 3.52:1 | Control boundary against tinted surfaces. |

Gold on white is only 1.83:1, so it is reserved for decoration there. Decorative dividers are not used as the sole identifying outline of inputs or suggestion controls. Web keyboard focus uses a 3px blue outline plus a white separation ring; text inputs also have explicit focus styling. These calculations establish the listed color pairs, not a claim of full WCAG certification.

## Landing and student workspace

The desktop landing page places the existing campus photograph and USTP identity on the left and a white sign-in panel on the right. The photo is retained without a dark cover; a separate navy text region provides reliable text contrast. The logo, TRAIL AI Desk name and “Be certain. Choose TRAIL.” tagline remain prominent. Phone layouts stack the image, identity and form with vertical scrolling.

The student dashboard now opens directly into the assistant. Its collapsible navy sidebar contains New Chat, AI Assistant, Chat History, University Information, Offices and Services, Academic Calendar, Official Announcements, My Concerns, Profile, Settings and Logout. Authorized real admins retain access to knowledge management. Below 900px the sidebar becomes a dismissible drawer.

The assistant uses the available profile name and device-local time for its greeting. Four suggested topics cover enrollment, certificates, offices and the calendar; announcements have a separate quick question. User/assistant messages are distinct, reading width is bounded, and the composer remains below the scrollable conversation. Sending includes disabled/pending states, an error/retry path, source citations and verification details. Unsupported questions continue through the existing service behavior. A concern-preview link remains available beneath answers.

Chat history survives navigation to information/concern screens and is isolated by session object. It is not stored on disk or restored after logout/reload. Pending-response state is shared with the session, preventing duplicate sends after leaving and returning to a conversation. Web Enter-to-send supports Shift+Enter, IME composition guards, and a Settings switch. Native keyboards use the send button for multiline input.

## Preserved behavior and existing limitations

Authentication services, password reset, session expiry, Expo Router protected routes and the real admin guard are retained. The redesigned landing page reconnects the existing real `signIn` service; demo mode requires explicit selection. Tokens remain in memory.

The Node API, MongoDB data/models, Gemini/RAG, source verification/freshness logic and knowledge-management routes were not changed. The UI still uses `askTrail`, `listKnowledge`, actual citation metadata and the existing document/source URL checks. No institutional content, AI answer, citation or check timestamp was added or fabricated. The Announcements section queries the backend's supported category filter and explains incomplete coverage/empty results.

The current codebase has **no public student-registration endpoint**. Create account explains administrator-provisioned access instead of accepting a form that cannot create an account. A working self-registration flow requires a separately scoped backend change.

The current codebase has **no concern-submission or ticket-history backend**. My Concerns remains an explicitly local preview. The previous generated demo receipt was removed so the interface cannot imply successful submission. Submitted concern tracking requires backend support.

No Academix screenshots were attached. Live MongoDB/Gemini/email and real student/admin sign-in need configured services and credentials. Device testing requires a physical Android device or emulator; a bundle export does not establish runtime keyboard or safe-area behavior on hardware.

## Validation

| Check | Result |
| --- | --- |
| `npm.cmd run typecheck` | Passed after implementation. |
| `npm.cmd run lint` | Passed without warnings after implementation. |
| `npm.cmd run test:backend` | 79 passed, 0 failed. |
| `npm.cmd run export:web` | Passed; 11 static routes exported. |
| `npx.cmd expo export --platform android --output-dir dist/trail-android` | Passed, including Hermes bytecode; compiler execution required running the same build outside the subprocess sandbox after an initial EPERM. |
| Desktop browser checks | Final 51-action flow passed: validation, account explanation, password reset, explicit demo sign-in, chat/citation rendering, collapse/expand, new chat/history, profile/settings and unverified time-sensitive answers. Zero runtime errors or warnings. |
| Phone-size browser checks | Final 60-action flow passed at 390×844: drawer, resources, restored conversation, profile/settings, local concern preview, logout, landing and password reset. Zero runtime errors or warnings. Logged-out `/dashboard` and `/admin` redirect to sign-in. |
| Keyboard, pending requests and retry | 37-action flow passed. Actual Tab events show the 3px blue focus ring and white separation. Shift+Enter inserts a newline without sending; composing and keyCode 229 events do not send; ordinary Enter sends. A deliberately delayed demo reply completes after information/back navigation, with duplicate sending disabled. An injected service failure renders the error state and succeeds after retry. |
| Responsive regression | 15-action flow passed. Inspected 1440×1000, 1366×768, 768×1024, 390×844 and 320×740 layouts have no horizontal overflow. The welcome view resets to scrollTop 0 for a new chat, and the image stays within its container. |
| Android device/emulator | Not available; native runtime keyboard, accessibility-service and safe-area behavior still need hardware/emulator validation. |
| `git diff --check` | Passed. |

Browser QA found and prompted fixes for the landing's initial hydration mismatch, intrinsic campus-image dimensions, and new-chat scroll reset. The final **163 scripted browser actions** across four scenarios completed with **zero runtime errors or warnings**. The browser title is `TRAIL AI Desk | USTP`.

Representative screenshots:

- [Desktop landing](../dist/redesign-qa/desktop-landing.png)
- [Desktop student dashboard](../dist/redesign-qa/desktop-dashboard.png)
- [Chat with source citation](../dist/redesign-qa/desktop-chat-citations.png)
- [Phone student dashboard](../dist/redesign-qa/mobile-dashboard.png)
- [Phone navigation drawer](../dist/redesign-qa/mobile-navigation-drawer.png)
- [Phone campus/landing](../dist/redesign-qa/mobile-landing-campus.png)
- [Phone concern preview](../dist/redesign-qa/mobile-concern-preview.png)
- [320px-wide layout](../dist/redesign-qa/mobile-320-dashboard.png)

Machine-readable local results: `dist/redesign-qa/qa-summary.json`, `desktop-final-results.json`, `mobile-final-results.json`, `keyboard-pending-results.json`, and `responsive-results.json`. These logs and images are ignored by Git and remain local artifacts. Browser tests used the offline demo plus deliberate in-browser latency/failure injection; they do not establish live provider, email-delivery or database availability. The isolated QA browser and preview server were stopped after verification.
