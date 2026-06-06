import { initDatabase, createAlbum, getAlbums, getAlbumById, getPhotos, renameAlbum, deleteAlbum, reorderAlbums, removePhoto } from './db.js';
import { renderAlbumGrid, renderPhotoGrid, showLoading } from './render.js';
import { importPhotos } from './import.js';

async function init() {
  await initDatabase();
  const params = new URLSearchParams(window.location.search);
  if (window.location.pathname.endsWith('album.html') && params.has('id')) {
    await renderAlbumView(params.get('id'));
  } else {
    await renderMainView();
  }
}

async function renderMainView() {
  const albums = getAlbums();
  renderAlbumGrid(albums, handleReorder);
  setupMainEventListeners();
}

function setupMainEventListeners() {
  document.addEventListener('create-album', () => {
    const name = prompt('Album name:');
    if (name && name.trim()) {
      createAlbum(name.trim());
      renderMainView();
    }
  });

  document.getElementById('new-album-btn')?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('create-album'));
  });

  document.addEventListener('rename-album', (e) => {
    renameAlbum(e.detail.id, e.detail.name);
  });

  document.addEventListener('delete-album', (e) => {
    deleteAlbum(e.detail.id);
    renderMainView();
  });
}

function handleReorder(albumIds) {
  reorderAlbums(albumIds);
  const albums = getAlbums();
  renderAlbumGrid(albums, handleReorder);
  setupMainEventListeners();
}

async function renderAlbumView(albumId) {
  const album = getAlbumById(albumId);
  if (!album) {
    document.getElementById('album-content').innerHTML = `
      <div class="empty-state">
        <h2>Album not found</h2>
        <p><a href="/index.html" class="back-link">Back to albums</a></p>
      </div>
    `;
    return;
  }
  const photos = getPhotos(albumId);
  renderPhotoGrid(photos, album.name);
  setupAlbumEventListeners(albumId);
}

function setupAlbumEventListeners(albumId) {
  document.getElementById('back-btn')?.addEventListener('click', () => {
    window.location.href = '/index.html';
  });

  document.getElementById('add-photos-btn')?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/gif,image/webp';
    input.multiple = true;
    input.addEventListener('change', async () => {
      if (input.files.length > 0) {
        await importPhotos(albumId, Array.from(input.files));
        renderAlbumView(albumId);
      }
    });
    input.click();
  });

  document.addEventListener('add-photos', async (e) => {
    await importPhotos(albumId, e.detail.files);
    renderAlbumView(albumId);
  });

  document.addEventListener('remove-photo', (e) => {
    removePhoto(e.detail.id);
    renderAlbumView(albumId);
  });
}

document.addEventListener('DOMContentLoaded', init);
