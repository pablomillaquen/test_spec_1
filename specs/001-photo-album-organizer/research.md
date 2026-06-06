# Research: Photo Album Organizer

## Decision: Build Tool & Project Setup
- **Decision**: Vite with vanilla HTML/CSS/JS
- **Rationale**: User explicitly specified Vite with minimal libraries and vanilla stack. Vite provides fast HMR, simple config, and zero framework overhead.
- **Alternatives considered**: CRA (React), Vue CLI, Parcel

## Decision: SQLite in Browser
- **Decision**: Use `sql.js` (SQLite compiled to WASM) for metadata storage, persisted via `IndexedDB`
- **Rationale**: User wants SQLite locally. sql.js is the only viable SQLite option in the browser. Data is persisted by saving the entire DB file to IndexedDB as a `Uint8Array` on every write.
- **Alternatives considered**: better-sqlite3 (requires Node.js/Electron), localStorage (not SQL), IndexedDB directly (no SQL queries)

## Decision: Image Storage
- **Decision**: Images stored as Blobs in IndexedDB, referenced by SQLite via UUID
- **Rationale**: "Images are not uploaded anywhere" means local-only. IndexedDB can store large binary blobs. SQLite stores metadata + UUID reference; the actual blob lives in IndexedDB.
- **Alternatives considered**: File System Access API (limited browser support), data URLs in SQLite (bloats DB)

## Decision: Drag & Drop
- **Decision**: Native HTML5 Drag and Drop API
- **Rationale**: Zero dependencies, fully capable for album reordering. Vanilla JS event handling.
- **Alternatives considered**: SortableJS library (extra dependency — rejected per minimal-libraries constraint)

## Decision: Testing
- **Decision**: Vitest (Vite-native test runner) for unit/integration tests, Playwright for E2E
- **Rationale**: Vitest integrates seamlessly with Vite config. Playwright is the standard for browser E2E — needed for drag-and-drop and UI interaction testing.
- **Alternatives considered**: Jest (needs separate config), Cypress (heavier)

## Decision: Styling
- **Decision**: Vanilla CSS with CSS Grid and Flexbox
- **Rationale**: Modern CSS is powerful enough for a tile-grid layout and drag-and-drop UX without any framework.
- **Alternatives considered**: Tailwind (CSS dependency), PostCSS (extra pipeline)

## Performance Targets
- **Target**: Tile grid renders 100+ photos within 2s → achieved via lazy-loading thumbnails (IntersectionObserver), thumbnail pre-generation on import
- **Target**: Drag-and-drop responds within 200ms → native HTML5 DnD satisfies this
- **Target**: SQLite queries under 10ms → trivial dataset, no indexing needed
