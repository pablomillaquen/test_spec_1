import { getPhotoById, getPhotos, loadBlob } from './db.js';
import { initDragDrop } from './drag.js';
import { openLightbox } from './lightbox.js';

const loadedUrls = new Map();

function getCachedUrl(blobId) {
  if (loadedUrls.has(blobId)) return loadedUrls.get(blobId);
  return null;
}

async function loadImageUrl(blobId) {
  const cached = getCachedUrl(blobId);
  if (cached) return cached;
  const blob = await loadBlob(blobId);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  loadedUrls.set(blobId, url);
  return url;
}

function revokeUrl(blobId) {
  if (loadedUrls.has(blobId)) {
    URL.revokeObjectURL(loadedUrls.get(blobId));
    loadedUrls.delete(blobId);
  }
}

export function renderAlbumGrid(albums, onReorder) {
  const container = document.getElementById('main-content');
  if (!albums || albums.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📸</div>
        <h2>No Albums Yet</h2>
        <p>Create your first photo album to get started.</p>
        <button class="btn btn-primary" id="empty-create-btn">+ Create Album</button>
      </div>
    `;
    const btn = container.querySelector('#empty-create-btn');
    if (btn) btn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('create-album'));
    });
    return;
  }

  const groups = {};
  albums.forEach((album) => {
    if (!groups[album.date_group]) groups[album.date_group] = [];
    groups[album.date_group].push(album);
  });

  let html = '';
  const groupOrder = ['Today', 'Yesterday', 'Earlier This Week'];
  const customGroups = Object.keys(groups).filter((g) => !groupOrder.includes(g)).sort().reverse();
  const sortedGroups = [...groupOrder.filter((g) => groups[g]), ...customGroups];

  sortedGroups.forEach((group) => {
    html += `<section class="date-group" data-group="${group}">`;
    html += `<h2>${group}</h2>`;
    html += `<div class="album-grid" data-group="${group}">`;
    groups[group].forEach((album) => {
      html += renderAlbumTile(album);
    });
    html += `</div></section>`;
  });

  container.innerHTML = html;

  const grids = container.querySelectorAll('.album-grid');
  grids.forEach((grid) => {
    initDragDrop(grid, albums, onReorder);
  });

  document.querySelectorAll('.album-tile').forEach((tile) => {
    tile.addEventListener('click', (e) => {
      if (e.target.closest('.album-actions')) return;
      const albumId = tile.dataset.albumId;
      window.location.href = `/album.html?id=${albumId}`;
    });
  });

  document.querySelectorAll('.rename-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tile = btn.closest('.album-tile');
      const nameEl = tile.querySelector('.album-name');
      const currentName = nameEl.textContent;
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'rename-input';
      input.value = currentName;
      nameEl.replaceWith(input);
      input.focus();
      input.select();
      const finishRename = () => {
        const newName = input.value.trim() || currentName;
        const albumId = tile.dataset.albumId;
        document.dispatchEvent(new CustomEvent('rename-album', { detail: { id: albumId, name: newName } }));
        const span = document.createElement('span');
        span.className = 'album-name';
        span.textContent = newName;
        input.replaceWith(span);
      };
      input.addEventListener('blur', finishRename);
      input.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') { ev.preventDefault(); input.blur(); }
        if (ev.key === 'Escape') { ev.preventDefault(); input.value = currentName; input.blur(); }
      });
    });
  });

  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tile = btn.closest('.album-tile');
      const albumId = tile.dataset.albumId;
      const albumName = tile.querySelector('.album-name').textContent;
      showConfirmDialog(
        'Delete Album',
        `Are you sure you want to delete "${albumName}" and all its photos?`,
        () => {
          document.dispatchEvent(new CustomEvent('delete-album', { detail: { id: albumId } }));
        },
      );
    });
  });

  albums.forEach((album) => {
    if (album.cover_thumbnail) {
      const img = container.querySelector(`.album-tile[data-album-id="${album.id}"] .album-cover`);
      if (img) {
        loadImageUrl(album.cover_thumbnail).then((url) => {
          if (url) img.src = url;
        });
      }
    }
  });
}

function renderAlbumTile(album) {
  return `
    <article class="album-tile" draggable="true" data-album-id="${album.id}" data-sort-order="${album.sort_order}" data-date-group="${album.date_group}">
      <img class="album-cover" alt="${escapeHtml(album.name)}" />
      <div class="album-name" title="${escapeHtml(album.name)}">${escapeHtml(album.name)}</div>
      <div class="album-meta">${album.photo_count} photo${album.photo_count !== 1 ? 's' : ''}</div>
      <div class="album-actions">
        <button class="btn btn-ghost rename-btn" title="Rename">✏️</button>
        <button class="btn btn-ghost delete-btn" title="Delete">🗑</button>
      </div>
    </article>
  `;
}

export function renderPhotoGrid(photos, albumName) {
  const container = document.getElementById('album-content');
  const titleEl = document.getElementById('album-title');
  if (titleEl) titleEl.textContent = albumName || 'Album';

  if (!photos || photos.length === 0) {
    container.innerHTML = `
      <div class="upload-zone" id="upload-zone">
        <p>Drop photos here or click to add</p>
      </div>
      <div class="empty-state">
        <div class="empty-icon">🖼</div>
        <h2>This album is empty</h2>
        <p>Add some photos to get started.</p>
      </div>
    `;
    setupUploadZone(container);
    return;
  }

  let html = `<div class="upload-zone" id="upload-zone"><p>Drop photos here or click to add</p></div>`;
  html += `<div class="photo-grid">`;
  photos.forEach((photo) => {
    html += `
      <figure class="photo-tile" data-photo-id="${photo.id}">
        <img alt="${escapeHtml(photo.filename)}" loading="lazy" />
        <figcaption class="photo-filename">${escapeHtml(photo.filename)}</figcaption>
      </figure>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;

  setupUploadZone(container);

  container.querySelectorAll('.photo-tile').forEach((tile) => {
    tile.addEventListener('click', () => {
      const photoId = tile.dataset.photoId;
      const photo = getPhotoById(photoId);
      if (photo) {
        loadBlob(photo.fullsize_blob_id).then((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            openLightbox(url, photo.filename, () => {
              URL.revokeObjectURL(url);
              document.dispatchEvent(new CustomEvent('remove-photo', { detail: { id: photoId } }));
            });
          }
        });
      }
    });
  });

  photos.forEach((photo) => {
    const img = container.querySelector(`.photo-tile[data-photo-id="${photo.id}"] img`);
    if (img) {
      loadImageUrl(photo.thumbnail_blob_id).then((url) => {
        if (url) img.src = url;
      });
    }
  });
}

function setupUploadZone(container) {
  const zone = container.querySelector('#upload-zone');
  if (!zone) return;
  zone.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/gif,image/webp';
    input.multiple = true;
    input.addEventListener('change', () => {
      if (input.files.length > 0) {
        document.dispatchEvent(new CustomEvent('add-photos', { detail: { files: Array.from(input.files) } }));
      }
    });
    input.click();
  });
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.style.borderColor = 'var(--color-accent)'; });
  zone.addEventListener('dragleave', () => { zone.style.borderColor = ''; });
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.style.borderColor = '';
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(f.type)
    );
    if (files.length > 0) {
      document.dispatchEvent(new CustomEvent('add-photos', { detail: { files } }));
    }
  });
}

export function showLoading(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>
    `;
  }
}

export function showConfirmDialog(title, message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'dialog-overlay';
  overlay.innerHTML = `
    <div class="dialog-box">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(message)}</p>
      <div class="dialog-actions">
        <button class="btn btn-ghost" id="dialog-cancel">Cancel</button>
        <button class="btn btn-danger" id="dialog-confirm">Delete</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('#dialog-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#dialog-confirm').addEventListener('click', () => {
    onConfirm();
    overlay.remove();
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
