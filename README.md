# Photo Album Organizer

A client-side web application for organizing photos into flat, date-grouped albums with drag-and-drop reordering. Built with vanilla JavaScript, SQLite via WebAssembly, and IndexedDB.

## Features

- **Date-grouped albums** — Albums are automatically grouped by creation date (Today, Yesterday, Earlier This Week, or monthly)
- **Drag & drop reordering** — Reorder albums on the main page; order persists across sessions
- **Photo management** — Import photos from your local file system, view them in a grid, and preview at full size in a lightbox
- **Album CRUD** — Create, rename, and delete albums; add or remove photos

## Tech Stack

- **Runtime**: Vanilla JavaScript (ES2022+), no frameworks
- **Build tool**: [Vite](https://vitejs.dev/)
- **Metadata storage**: [sql.js](https://github.com/sql-js/sql.js) (SQLite compiled to WebAssembly), persisted to IndexedDB
- **Binary storage**: IndexedDB for image blobs (thumbnails + full-size)
- **Testing**: [Vitest](https://vitest.dev/) (unit + integration), [Playwright](https://playwright.dev/) (E2E)
- **Linting**: ESLint

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run unit/integration tests
npm test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build
```

## Project Structure

```
src/
├── index.html           # Main page (album grid)
├── album.html           # Album detail page (photo grid)
├── style.css            # All application styles
├── main.js              # App entry point and routing
├── db.js                # SQLite + IndexedDB initialization and queries
├── import.js            # Photo import, validation, thumbnail generation
├── render.js            # DOM rendering (album grid, photo grid, dialogs)
├── drag.js              # HTML5 Drag & Drop handlers
├── lightbox.js          # Full-size photo lightbox overlay
└── lib/
    └── sql-wasm.wasm    # sql.js WebAssembly binary

specs/001-photo-album-organizer/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan
├── data-model.md        # Database schema
└── quickstart.md        # Validation guide
```

## Constraints

- **No server** — All data stays local in the browser
- **Single-user** — No authentication or cloud sync
- **Supported formats** — JPEG, PNG, GIF, WebP
- **Max file size** — 20MB per photo
- **Desktop-first** — Modern browser (Chrome, Firefox, Safari, Edge — latest 2 versions)
