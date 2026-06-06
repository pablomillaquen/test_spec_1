---

description: "Task list for Photo Album Organizer feature implementation"

---

# Tasks: Photo Album Organizer

**Input**: Design documents from `/specs/001-photo-album-organizer/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui-contracts.md

**Tests**: Included per Constitution Testing Standards — three tiers required (unit, integration, E2E).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Vite vanilla JS project — `npm create vite@latest . -- --template vanilla`, then `npm install sql.js`, `npm install -D vitest @playwright/test eslint`
- [x] T002 [P] Create project directory structure: `src/lib/`, `tests/unit/`, `tests/integration/`, `tests/e2e/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Implement SQLite database initialization, schema creation (albums + photos tables), and IndexedDB persistence in `src/db.js`
- [x] T004 [P] Implement IndexedDB blob store (save/load/delete blobs) in `src/db.js`
- [x] T005 [P] Create base CSS with design tokens (colors, spacing, typography, breakpoints) in `src/style.css`
- [x] T006 [P] Copy sql.js WASM binary from node_modules to `src/lib/sql-wasm.wasm`

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 — View Albums Grouped by Date (Priority: P1) 🎯 MVP

**Goal**: User opens the app and sees albums grouped by date with name, cover thumbnail, and photo count.

**Independent Test**: Launch the app with pre-seeded albums and verify they appear under correct date headers with accurate metadata.

### Tests for User Story 1

- [ ] T007 [P] [US1] Unit test for date group derivation logic in `tests/unit/db.test.js`
- [ ] T008 [P] [US1] Unit test for album grid rendering (empty state, populated state) in `tests/unit/render.test.js`
- [ ] T009 [P] [US1] Integration test — seed albums in SQLite, verify main page renders correct groups in `tests/integration/main-page.test.js`

### Implementation for User Story 1

- [x] T010 [P] [US1] Create `src/index.html` with album grid layout skeleton (date group headers, album tiles container, empty state template)
- [x] T011 [US1] Implement main page renderer in `src/render.js` — `renderAlbumGrid(albums)` function: group by `date_group`, render `<h2>` headers and `<article>` tiles with name/cover/count
- [x] T012 [US1] Implement app entry point in `src/main.js` — async init: load sql.js WASM, initialize DB, render main page

**Checkpoint**: At this point, User Story 1 should be fully functional — albums display grouped by date on the main page.

---

## Phase 4: User Story 2 — Browse Photos in an Album (Priority: P1)

**Goal**: User clicks an album and sees photos in a tile grid. Clicking a tile opens a full-size lightbox.

**Independent Test**: Open an album with 10 photos, verify all 10 appear as tiles, click one to see full-size lightbox.

### Tests for User Story 2

- [ ] T013 [P] [US2] Unit test for photo grid rendering (tile layout, empty state) in `tests/unit/render.test.js`
- [ ] T014 [P] [US2] Integration test — add photos to album, verify detail page shows them in `tests/integration/album-detail.test.js`
- [ ] T015 [P] [US2] E2E test — upload photos, open album, click tile, verify lightbox opens in `tests/e2e/album-browsing.spec.js`

### Implementation for User Story 2

- [x] T016 [P] [US2] Create `src/album.html` with photo tile grid layout (figure elements, lightbox container, empty state, upload button)
- [x] T017 [US2] Implement album detail renderer in `src/render.js` — `renderPhotoGrid(photos)` function: grid of `<figure>` tiles with thumbnails, filename captions
- [x] T018 [P] [US2] Implement photo import in `src/import.js` — File API handler, validate mime type and file size, generate thumbnail via `<canvas>`, save blob to IndexedDB, insert metadata row in SQLite
- [x] T019 [US2] Implement lightbox in `src/lightbox.js` — full-size image overlay with close button, backdrop click to dismiss
- [x] T020 [US2] Wire up page routing in `src/main.js` — navigate from album tile click to album detail page (`?id=<album_id>`), back button returns to main page

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 — Reorganize Albums via Drag and Drop (Priority: P2)

**Goal**: User drags album tiles on the main page to reorder them. Order persists after refresh.

**Independent Test**: Drag an album to a new position, refresh the page, confirm the order is preserved.

### Tests for User Story 3

- [ ] T021 [P] [US3] Unit test for sort order recalculation logic in `tests/unit/drag.test.js`
- [ ] T022 [P] [US3] E2E test — drag album tile to new position, verify order persists after reload in `tests/e2e/drag-reorder.spec.js`

### Implementation for User Story 3

- [x] T023 [P] [US3] Implement drag and drop handlers in `src/drag.js` — `dragstart`, `dragover` (with visual insertion indicator), `drop` (reorder albums and persist), `dragend` cleanup. Export `initDragDrop(container)` function.
- [x] T024 [US3] Integrate drag-and-drop into main page — call `initDragDrop()` from `src/main.js`, wire drop handler to `db.reorderAlbums()` and re-render grid

**Checkpoint**: All three user stories should now be independently functional.

---

## Phase 6: User Story 4 — Create and Manage Albums (Priority: P3)

**Goal**: User creates, renames, and deletes albums. Photos can be added to or removed from albums.

**Independent Test**: Create an album, add 3 photos, rename it, remove a photo, then delete the album — all operations succeed without errors.

### Tests for User Story 4

- [ ] T025 [P] [US4] Unit test for album CRUD operations in `tests/unit/db.test.js`
- [ ] T026 [P] [US4] E2E test — create album, add photos, rename, remove photo, delete album in `tests/e2e/album-crud.spec.js`

### Implementation for User Story 4

- [x] T027 [US4] Add "New Album" button and inline creation flow to main page — prompt for name, call `db.createAlbum()`, re-render grid
- [x] T028 [P] [US4] Add album rename (click-to-edit inline) and delete (confirmation dialog) actions on album tiles in `src/render.js` and `src/main.js`
- [x] T029 [US4] Add "Add Photos" (file input) and "Remove Photo" (button on tile/lightbox) to album detail page in `src/main.js`, wire to `import.js` and `db.removePhoto()`

**Checkpoint**: All four user stories are complete and independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T030 [P] Configure ESLint with `eslint-config-recommended` for code quality — add `.eslintrc.json` and npm lint script
- [ ] T031 Handle truncation of long album names with ellipsis and tooltip on hover (Edge Case: FR-016)
- [ ] T032 Reject non-image files during upload with user-facing error message (Edge Case: FR-015)
- [ ] T033 Prevent nesting — if user drops album onto another album tile, reject the action (Edge Case: FR-002)
- [ ] T034 [P] Stub Playwright E2E test config in `playwright.config.js` with basic smoke test
- [ ] T035 Run `quickstart.md` validation to verify all scenarios pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can proceed in priority order (US1 → US2 → US3 → US4)
  - US1 and US2 can overlap since they modify different files/renderers
  - US3 depends on US1 main page existing
  - US4 depends on US1 and US2 (album CRUD on main page, photo CRUD on detail page)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — no dependencies on other stories
- **US2 (P1)**: Can start after Foundational — depends on US1 for navigation but independently testable with direct URL access
- **US3 (P2)**: Can start after US1 — requires main page with album tiles
- **US4 (P3)**: Depends on US1 + US2 — album CRUD on main page, photo CRUD on detail page

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD)
- Core implementation before edge cases
- Story complete before moving to next priority

### Parallel Opportunities

- T001 and T002 can run sequentially (T002 needs project root)
- T003-T006 in Phase 2 can all run in parallel (different concerns)
- Within each US phase, [P] tasks can run in parallel
- US1 and US2 renderer tasks are in different parts of `render.js` — can be parallelized

---

## Parallel Example: Phase 2 — Foundational

```bash
Task: "Implement SQLite + IndexedDB in src/db.js"
Task: "Create base CSS design tokens in src/style.css"
Task: "Copy sql.js WASM binary to src/lib/sql-wasm.wasm"
```

## Parallel Example: User Story 2

```bash
Task: "Create album.html with photo grid layout"
Task: "Implement photo import in src/import.js"
Task: "Tests for User Story 2"

# Then:
Task: "Implement album detail renderer in src/render.js"
Task: "Implement lightbox in src/lightbox.js"

# Then:
Task: "Wire up page routing in src/main.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Albums display grouped by date
5. Demo-ready MVP

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (View albums) → **MVP!**
3. Add US2 (Browse photos) → Core consumption
4. Add US3 (Drag reorder) → Organization power
5. Add US4 (Full CRUD) → Complete experience
6. Polish → Production quality

### Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
