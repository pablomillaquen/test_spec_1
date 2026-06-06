# Implementation Plan: Photo Album Organizer

**Branch**: `001-photo-album-organizer` | **Date**: 2026-06-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-photo-album-organizer/spec.md`

## Summary

A single-page browser application for organizing photos into flat, date-grouped albums with drag-and-drop reordering. Uses Vite + vanilla HTML/CSS/JS with sql.js (SQLite via WASM) for metadata storage and IndexedDB for image blob storage. Images remain local-only — no server uploads.

## Technical Context

**Language/Version**: JavaScript (ES2022+), no transpilation beyond Vite defaults

**Primary Dependencies**: `vite` (dev), `sql.js` (SQLite WASM), `vitest` (dev, testing), `playwright` (dev, E2E)

**Storage**: sql.js (SQLite compiled to WASM) persisted to IndexedDB; image blobs stored directly in IndexedDB

**Testing**: Vitest for unit + integration tests, Playwright for E2E (drag-and-drop, UI flows)

**Target Platform**: Modern browser (Chrome, Firefox, Safari, Edge — latest 2 versions)

**Project Type**: Single-page web application (client-side only)

**Performance Goals**: Tile grid renders 100+ photos within 2s (IntersectionObserver lazy-load); drag-and-drop responds within 200ms; sql.js queries < 10ms

**Constraints**: No server-side code; images never uploaded; SQLite + IndexedDB only; zero runtime dependencies beyond sql.js; WASM binary overhead (~1MB) accepted for initial load

**Scale/Scope**: Single-user, local-only, up to 50 albums with 100+ photos each

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate I — Code Quality
- **PASS**: Vite provides built-in dev server with HMR. ESLint can be added as a dev dependency. Vitest provides coverage reporting. All within vanilla JS constraints.
- **NOTE**: No TypeScript (user chose vanilla JS) — JSDoc comments used instead for public API documentation.

### Gate II — Testing Standards
- **PASS**: Vitest for unit/integration (src/*.test.js), Playwright for E2E (drag-and-drop requires browser automation). Three tiers covered.

### Gate III — UX Consistency
- **PASS**: UI contracts document defines all interactive element states (default/hover/active/disabled). Empty states documented for all views. CSS handles responsive breakpoints.
- **NOTE**: No formal design system exists (greenfield project) — but documented UI contracts serve as the standard.

### Gate IV — Performance Requirements
- **PASS with trade-off**: sql.js WASM binary (~1MB) impacts initial FCP/TTI. Mitigated by loading WASM asynchronously with a loading state. Photo tiles use lazy-loading via IntersectionObserver. Thumbnails pre-generated on import.

### Gate V — Simplicity & Maintainability
- **PASS**: Zero runtime dependencies beyond sql.js. Vanilla JS throughout. Single-page architecture with flat file structure.

### Gate VI — Security & Compliance
- **PASS**: No credentials, no network requests, no user data leaves the browser. Input validation on file type and size.

### Gate VII — Development Workflow
- **PASS**: Standard PR workflow, conventional commits, short-lived feature branches.

**Re-check after Phase 1**: ✅ All gates pass.

## Project Structure

### Documentation (this feature)

```text
specs/001-photo-album-organizer/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Technical research & decisions
├── data-model.md        # SQLite schema + IndexedDB blob store
├── quickstart.md        # Validation/run guide
├── contracts/
│   └── ui-contracts.md  # UI interaction contracts
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── index.html           # Main page (album grid)
├── album.html           # Album detail page (photo grid)
├── style.css            # All application styles
├── main.js              # App entry point, page routing logic
├── db.js                # SQLite init, schema, CRUD queries + IndexedDB blob ops
├── import.js            # File API handling, thumbnail generation via canvas
├── render.js            # DOM rendering (album grid, photo grid, empty states)
├── drag.js              # HTML5 Drag & Drop handlers for album reordering
├── lightbox.js          # Full-size photo lightbox overlay
└── lib/
    └── sql-wasm.wasm    # sql.js WASM binary (loaded at runtime)
```

## Complexity Tracking

> No constitution violations to justify — this design is minimal by construction.
