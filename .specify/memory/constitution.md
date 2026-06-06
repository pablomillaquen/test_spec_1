<!--
  Sync Impact Report:
  - Version change: [none] → 1.0.0
  - Added principles: Code Quality, Testing Standards, User Experience Consistency, Performance Requirements, Simplicity & Maintainability
  - Added sections: Security & Compliance, Development Workflow
  - Template pending review: .specify/templates/plan-template.md, spec-template.md, tasks-template.md
  - All placeholders resolved.
-->
# SpecTest Constitution

## Core Principles

### I. Code Quality
Every code change MUST conform to project linting and formatting rules, pass static analysis, and maintain or improve existing test coverage. Code duplication MUST be eliminated — reviewers MUST reject PRs with unexplained duplication. All public APIs MUST include typed documentation (JSDoc/TSDoc). Dead code MUST NOT be committed. Complexity budgets: max 40 lines per function, cyclomatic complexity ≤ 7, module coupling kept minimal.

### II. Testing Standards
Testing is NON-NEGOTIABLE. Three tiers are REQUIRED:
- **Unit tests**: MUST cover all business logic in isolation (no I/O, no network).
- **Integration tests**: MUST cover every boundary crossing (database queries, API calls, filesystem, external services).
- **E2E tests**: MUST cover every critical user journey end-to-end.

Coverage MUST NOT regress below 80%. All tests MUST be deterministic, isolated, and run in CI. Flaky tests MUST be quarantined or fixed immediately. TDD (Red-Green-Refactor) is strongly preferred for all new feature work.

### III. User Experience Consistency
All user-facing interfaces MUST adhere to the project's design system (component library, color tokens, spacing, typography). Every interactive element MUST handle four states: default, hover/focus, active, disabled. Error, loading, and empty states MUST be implemented for every data-driven component. Accessibility is REQUIRED: no keyboard traps, proper ARIA labels, sufficient color contrast (WCAG AA minimum), and semantic HTML. Responsive breakpoints MUST follow the defined grid. Consistency across pages/screens is measured through visual regression testing.

### IV. Performance Requirements
Features MUST meet defined budgets enforced in CI:
- Lighthouse scores ≥ 90 for all categories.
- First Contentful Paint (FCP) ≤ 1.5s.
- Time to Interactive (TTI) ≤ 3.5s on mobile 3G throttling.
- Bundle size budgets set per-page — violations fail the build.
- Database queries MUST be N+1 free and use proper indexing.
- API endpoint p95 latency MUST stay under 200ms.
- Assets (images, fonts, scripts) MUST be compressed and lazy-loaded where applicable.

### V. Simplicity & Maintainability
Apply YAGNI rigorously — build only what the current specification requires, not what might be needed later. Prefer composition over inheritance. Modules MUST have a single, well-defined responsibility. Every dependency addition MUST be justified in the PR description. Configuration over code where feasible. Refactoring is encouraged as part of every feature — leave code cleaner than you found it (Boy Scout Rule).

## Security & Compliance
Credentials, secrets, and tokens MUST NEVER be committed — use environment variables or a secrets manager. All user inputs MUST be validated and sanitized. API endpoints MUST enforce authentication and authorization. Dependencies MUST be scanned for known vulnerabilities in CI. Compliance with regional regulations (e.g., GDPR, LGPD) MUST be confirmed before storing personal data.

## Development Workflow
All changes flow through PRs with required reviews. A PR MUST NOT merge unless:
- All tests pass in CI.
- No lint or type errors.
- No performance budget violations.
- At least one approval from a qualified reviewer.
- The PR description explains what, why, and any trade-offs made.

Feature branches MUST be short-lived (≤ 3 days). Commits SHOULD be atomic and follow conventional commit format.

## Governance
This constitution supersedes all ad-hoc practices. Amendments require a documented proposal, team review, and migration plan. The constitution is reviewed quarterly. All PRs and reviews MUST verify compliance with these principles.

**Version**: 1.0.0 | **Ratified**: 2026-06-06 | **Last Amended**: 2026-06-06
