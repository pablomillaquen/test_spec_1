# Quickstart: Photo Album Organizer

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

## Validation Scenarios

### Scenario 1: Create an album and add photos

1. Open the app at the URL shown by Vite (typically `http://localhost:5173`)
2. Click "New Album", enter a name, and confirm
3. **Expected**: New album tile appears on the main page under "Today" date group
4. Click the album to open it
5. Click "Add Photos" and select 3 image files from your local file system
6. **Expected**: 3 photo tiles appear in a grid layout with thumbnail previews
7. **Expected**: Photo count on the album tile (on main page) updates to "3 photos"

### Scenario 2: Reorder albums via drag and drop

1. Create 3 albums (A, B, C) — they appear in creation order
2. Drag album C between A and B
3. **Expected**: Albums reorder to A, C, B with smooth animation
4. Refresh the page
5. **Expected**: Order persists as A, C, B

### Scenario 3: View full-size photo

1. Open an album with at least one photo
2. Click any photo tile
3. **Expected**: Full-size photo opens in a lightbox overlay
4. Click the close button or backdrop
5. **Expected**: Lightbox closes, returning to the tile grid

### Scenario 4: Empty state

1. Open the app with no albums
2. **Expected**: Main page shows empty state with "Create your first album" prompt
3. Create an album but do not add photos
4. Click the album
5. **Expected**: Album detail shows empty state with "Add Photos" prompt

### Scenario 5: Delete an album

1. Create an album with 2 photos
2. On the main page, click the delete action on the album
3. Confirm deletion in the dialog
4. **Expected**: Album is removed from the main page
5. **Expected**: Photos are also removed (blobs cleaned from IndexedDB)

## Running Tests

```bash
# Unit + integration tests
npx vitest run

# E2E tests (requires Playwright)
npx playwright test
```

## Project Structure

```
src/
├── main.js              # App entry, router logic
├── db.js                # SQLite + IndexedDB initialization and queries
├── import.js            # Photo import (File API, thumbnail generation)
├── render.js            # DOM rendering functions (album grid, photo grid)
├── drag.js              # Drag and drop handlers
├── lightbox.js          # Full-size photo lightbox
├── style.css            # All application styles
└── index.html           # Main page HTML

specs/001-photo-album-organizer/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan
├── research.md          # Technical research
├── data-model.md        # Database and blob schema
├── quickstart.md        # This file — validation guide
├── contracts/           # UI contracts
│   └── ui-contracts.md
└── checklists/          # Quality checklists
    └── requirements.md
```
