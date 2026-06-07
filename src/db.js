import initSqlJs from 'sql.js';
import sqlWasmUrl from './lib/sql-wasm.wasm?url';

const DB_NAME = 'photo_album_organizer';
const BLOB_STORE_NAME = 'photo_blobs';
const DB_VERSION = 1;

let db = null;
let idb = null;

export function getDb() {
  return db;
}

export function getIdb() {
  return idb;
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const d = event.target.result;
      if (!d.objectStoreNames.contains(BLOB_STORE_NAME)) {
        d.createObjectStore(BLOB_STORE_NAME);
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = () => reject(request.error);
  });
}

export async function initDatabase() {
  const SQL = await initSqlJs({
    locateFile: () => sqlWasmUrl,
  });
  idb = await openIndexedDB();
  const saved = await loadDbFromIndexedDB();
  if (saved) {
    db = new SQL.Database(new Uint8Array(saved));
  } else {
    db = new SQL.Database();
    db.run(`
      CREATE TABLE albums (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL CHECK(length(name) > 0 AND length(name) <= 100),
        sort_order INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        date_group TEXT NOT NULL
      )
    `);
    db.run(`
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
      )
    `);
    db.run('CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos(album_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_albums_date_group ON albums(date_group)');
    db.run('CREATE INDEX IF NOT EXISTS idx_albums_sort_order ON albums(date_group, sort_order)');
    db.run('CREATE INDEX IF NOT EXISTS idx_photos_sort_order ON photos(album_id, sort_order)');
  }
}

function loadDbFromIndexedDB() {
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(BLOB_STORE_NAME, 'readonly');
    const store = tx.objectStore(BLOB_STORE_NAME);
    const req = store.get('__sqlite_db__');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function persistDatabase() {
  const data = db.export();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(BLOB_STORE_NAME, 'readwrite');
    const store = tx.objectStore(BLOB_STORE_NAME);
    const req = store.put(data, '__sqlite_db__');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function deriveDateGroup(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const inputDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today - inputDate) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7) return 'Earlier This Week';
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

export function createAlbum(name) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const dateGroup = deriveDateGroup(now);
  const maxOrder = db.exec(
    'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM albums WHERE date_group = ?',
    [dateGroup],
  );
  const sortOrder = maxOrder.length > 0 ? maxOrder[0].values[0][0] : 0;
  db.run(
    'INSERT INTO albums (id, name, sort_order, created_at, date_group) VALUES (?, ?, ?, ?, ?)',
    [id, name, sortOrder, now, dateGroup],
  );
  persistDatabase();
  return { id, name, sort_order: sortOrder, created_at: now, date_group: dateGroup };
}

export function getAlbums() {
  const stmt = db.exec(
    'SELECT id, name, sort_order, created_at, date_group FROM albums ORDER BY date_group DESC, sort_order ASC',
  );
  if (stmt.length === 0) return [];
  const cols = stmt[0].columns;
  return stmt[0].values.map((row) => {
    const obj = {};
    cols.forEach((col, i) => { obj[col] = row[i]; });
    obj.photo_count = getPhotoCount(obj.id);
    obj.cover_thumbnail = getCoverThumbnail(obj.id);
    return obj;
  });
}

export function getAlbumById(id) {
  const stmt = db.exec('SELECT id, name, sort_order, created_at, date_group FROM albums WHERE id = ?', [id]);
  if (stmt.length === 0 || stmt[0].values.length === 0) return null;
  const cols = stmt[0].columns;
  const row = stmt[0].values[0];
  const obj = {};
  cols.forEach((col, i) => { obj[col] = row[i]; });
  return obj;
}

export function renameAlbum(id, name) {
  db.run('UPDATE albums SET name = ? WHERE id = ?', [name, id]);
  persistDatabase();
}

export function deleteAlbum(id) {
  const photos = getPhotos(id);
  photos.forEach((p) => deleteBlob(p.thumbnail_blob_id));
  photos.forEach((p) => deleteBlob(p.fullsize_blob_id));
  db.run('DELETE FROM albums WHERE id = ?', [id]);
  persistDatabase();
}

export function reorderAlbums(albumIds) {
  const albumIdsStr = albumIds.map((id) => `'${id}'`).join(',');
  const stmt = db.exec(
    `SELECT id, date_group FROM albums WHERE id IN (${albumIdsStr})`,
  );
  if (stmt.length === 0) return;
  const groupOrder = {};
  stmt[0].values.forEach((row) => {
    const id = row[0];
    const group = row[1];
    if (!groupOrder[group]) groupOrder[group] = 0;
    groupOrder[group]++;
  });
  let sortOrder = 0;
  albumIds.forEach((id, idx) => {
    if (idx > 0) {
      const prevGroup = albumIds[idx - 1];
      const prevStmt = db.exec('SELECT date_group FROM albums WHERE id = ?', [prevGroup]);
      const currStmt = db.exec('SELECT date_group FROM albums WHERE id = ?', [id]);
      if (prevStmt[0] && currStmt[0] && prevStmt[0].values[0][0] !== currStmt[0].values[0][0]) {
        sortOrder = 0;
      }
    }
    db.run('UPDATE albums SET sort_order = ? WHERE id = ?', [sortOrder, id]);
    sortOrder++;
  });
  persistDatabase();
}

export function addPhoto(albumId, filename, mimeType, fileSize, thumbnailBlobId, fullsizeBlobId) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const maxOrder = db.exec(
    'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM photos WHERE album_id = ?',
    [albumId],
  );
  const sortOrder = maxOrder.length > 0 ? maxOrder[0].values[0][0] : 0;
  db.run(
    `INSERT INTO photos (id, album_id, filename, mime_type, file_size, thumbnail_blob_id, fullsize_blob_id, imported_at, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, albumId, filename, mimeType, fileSize, thumbnailBlobId, fullsizeBlobId, now, sortOrder],
  );
  persistDatabase();
  return id;
}

export function getPhotos(albumId) {
  const stmt = db.exec(
    'SELECT id, album_id, filename, mime_type, file_size, thumbnail_blob_id, fullsize_blob_id, imported_at, sort_order FROM photos WHERE album_id = ? ORDER BY sort_order ASC',
    [albumId],
  );
  if (stmt.length === 0) return [];
  const cols = stmt[0].columns;
  return stmt[0].values.map((row) => {
    const obj = {};
    cols.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

function getPhotoCount(albumId) {
  const stmt = db.exec('SELECT COUNT(*) AS cnt FROM photos WHERE album_id = ?', [albumId]);
  if (stmt.length === 0) return 0;
  return stmt[0].values[0][0];
}

function getCoverThumbnail(albumId) {
  const stmt = db.exec(
    'SELECT thumbnail_blob_id FROM photos WHERE album_id = ? ORDER BY sort_order ASC LIMIT 1',
    [albumId],
  );
  if (stmt.length === 0 || stmt[0].values.length === 0) return null;
  return stmt[0].values[0][0];
}

export function getPhotoById(id) {
  const stmt = db.exec(
    'SELECT id, album_id, filename, mime_type, file_size, thumbnail_blob_id, fullsize_blob_id, imported_at, sort_order FROM photos WHERE id = ?',
    [id],
  );
  if (stmt.length === 0 || stmt[0].values.length === 0) return null;
  const cols = stmt[0].columns;
  const row = stmt[0].values[0];
  const obj = {};
  cols.forEach((col, i) => { obj[col] = row[i]; });
  return obj;
}

export function removePhoto(id) {
  const photo = getPhotoById(id);
  if (photo) {
    deleteBlob(photo.thumbnail_blob_id);
    deleteBlob(photo.fullsize_blob_id);
  }
  db.run('DELETE FROM photos WHERE id = ?', [id]);
  persistDatabase();
}

export function saveBlob(id, blob) {
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(BLOB_STORE_NAME, 'readwrite');
    const store = tx.objectStore(BLOB_STORE_NAME);
    const req = store.put(blob, id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function loadBlob(id) {
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(BLOB_STORE_NAME, 'readonly');
    const store = tx.objectStore(BLOB_STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function deleteBlob(id) {
  const tx = idb.transaction(BLOB_STORE_NAME, 'readwrite');
  const store = tx.objectStore(BLOB_STORE_NAME);
  store.delete(id);
}
