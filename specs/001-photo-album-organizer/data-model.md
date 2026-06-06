# Data Model: Photo Album Organizer

## Entity: Album

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | TEXT (UUID) | Primary key, generated on creation |
| `name` | TEXT | Required, max 100 chars |
| `sort_order` | INTEGER | Required, position within date group |
| `created_at` | TEXT (ISO 8601) | Required, set on creation |
| `date_group` | TEXT | Derived from created_at (e.g., "June 2026") |

**Validation Rules**:
- Name must be non-empty and ≤ 100 characters
- sort_order is unique per date_group
- Albums cannot contain other albums (enforced at UI layer)

**State Transitions**:
- `created` → `renamed` (name changes)
- `created` → `reordered` (sort_order changes)
- `created` → `deleted` (album removal cascades to photo references)

## Entity: Photo

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | TEXT (UUID) | Primary key, generated on import |
| `album_id` | TEXT (UUID) | Foreign key → Album, required |
| `filename` | TEXT | Original filename, required |
| `mime_type` | TEXT | e.g., "image/jpeg", required |
| `file_size` | INTEGER | Bytes, required |
| `thumbnail_blob_id` | TEXT | UUID reference to IndexedDB blob |
| `fullsize_blob_id` | TEXT | UUID reference to IndexedDB blob |
| `imported_at` | TEXT (ISO 8601) | Required, timestamp of import |
| `sort_order` | INTEGER | Position within album, required |

**Validation Rules**:
- mime_type must be in: image/jpeg, image/png, image/gif, image/webp
- file_size MUST NOT exceed 20MB
- album_id must reference an existing Album
- filename must be non-empty

**State Transitions**:
- `imported` → `removed` (photo removed from album, blob deleted from IndexedDB)

## Database: SQLite Schema

```sql
CREATE TABLE albums (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK(length(name) > 0 AND length(name) <= 100),
  sort_order INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  date_group TEXT NOT NULL
);

CREATE TABLE photos (
  id TEXT PRIMARY KEY,
  album_id TEXT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL CHECK(mime_type IN ('image/jpeg','image/png','image/gif','image/webp')),
  file_size INTEGER NOT NULL CHECK(file_size <= 20971520),
  thumbnail_blob_id TEXT NOT NULL,
  fullsize_blob_id TEXT NOT NULL,
  imported_at TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE INDEX idx_photos_album_id ON photos(album_id);
CREATE INDEX idx_albums_date_group ON albums(date_group);
CREATE INDEX idx_albums_sort_order ON albums(date_group, sort_order);
CREATE INDEX idx_photos_sort_order ON photos(album_id, sort_order);
```

## IndexedDB: Blob Store

**Store name**: `photo_blobs`

| Key | Value |
|-----|-------|
| `<blob_id>` (TEXT UUID) | Blob (binary image data) |

- One object store for all image blobs (thumbnails and full-size)
- Blob IDs are UUIDs referenced from SQLite `photos.thumbnail_blob_id` and `photos.fullsize_blob_id`
- Blobs are deleted when a photo is removed or album is deleted
