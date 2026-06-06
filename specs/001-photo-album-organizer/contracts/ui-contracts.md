# UI Contracts: Photo Album Organizer

## Page: Main Page (Album Grid)

| Contract | Behavior |
|----------|----------|
| **URL** | `/` |
| **Empty state** | Shows illustration + "Create your first album" button |
| **Date groups** | Albums grouped under `<h2>` date headers (e.g., "Today", "Yesterday", "June 2026") |
| **Album tile** | `<article>` element with: cover thumbnail `<img>`, album name `<h3>`, photo count `<span>` |
| **Drag & drop** | Album tiles are `draggable="true"`. On `dragstart`: set `data-album-id`. On `dragover`: show visual drop indicator. On `drop`: reorder and persist. |
| **Drop animation** | Other tiles shift to show insertion point during drag |
| **Persistence** | After drop, new order is immediately saved to SQLite and IndexedDB flushes |

### Album Tile States

| State | Visual |
|-------|--------|
| Default | Static tile with cover, name, count |
| Hover | Slight elevation/scale, pointer cursor |
| Dragging | Reduced opacity, ghost image follows cursor |
| Dropped | Snap animation to new position |

## Page: Album Detail (Photo Grid)

| Contract | Behavior |
|----------|----------|
| **URL** | `/album.html?id=<album_id>` |
| **Empty state** | "This album is empty — add some photos" with upload button |
| **Photo tile** | `<figure>` with thumbnail `<img>`, filename `<figcaption>` |
| **Upload** | `<input type="file" accept="image/*" multiple>` — on change, import photos |
| **Full-size view** | Click tile → lightbox overlay with full-size image, close button, and "Remove" action |

### Photo Tile States

| State | Visual |
|-------|--------|
| Default | Thumbnail with filename caption |
| Hover | Overlay with photo name, dim background |
| Selected (for removal) | Checkmark overlay, border highlight |
| Loading (during import) | Skeleton/pulse placeholder |

## Navigation

| Action | Behavior |
|--------|----------|
| Click album title | Navigate to album detail page |
| Back button (album detail) | Return to main page |
| Delete album | Confirmation dialog → remove album + all photo blobs → return to main page |
| Rename album | Inline edit on album tile → save on blur/Enter → cancel on Escape |

## Drag & Drop Protocol

```text
DragStart:
  - Set dataTransfer.effectAllowed = "move"
  - Set dataTransfer.setData("text/plain", albumId)
  - Add .dragging CSS class to source tile

DragOver (on other tiles):
  - Prevent default (allow drop)
  - Calculate whether drop is before or after the target tile
  - Add .drop-before or .drop-after visual indicator

Drop:
  - Read albumId from dataTransfer
  - Update sort_order for all affected albums in SQLite
  - Re-render tiles in new order
  - Persist DB to IndexedDB

DragEnd:
  - Remove all drag-related CSS classes
  - Clean up dataTransfer
```
