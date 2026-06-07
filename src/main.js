import { initDatabase, createAlbum, getAlbums, getAlbumById, getPhotos, renameAlbum, deleteAlbum, reorderAlbums, removePhoto } from './db.js';
import { renderAlbumGrid, renderPhotoGrid } from './render.js';
import { importPhotos } from './import.js';

async function init() {
  await initDatabase();

  const params = new URLSearchParams(window.location.search);
  if (window.location.pathname.endsWith('album.html') && params.has('id')) {
    setupAlbumPage(params.get('id'));
  } else {
    setupMainPage();
  }
}

function setupMainPage() {
  document.getElementById('new-album-btn')?.addEventListener('click', handleCreateAlbum);

  renderMainView();
}

async function renderMainView() {
  const albums = getAlbums();
  renderAlbumGrid(albums, {
    onReorder: handleReorder,
    onCreateAlbum: handleCreateAlbum,
    onRenameAlbum: handleRenameAlbum,
    onDeleteAlbum: handleDeleteAlbum,
  });
}

function handleCreateAlbum() {
  const name = prompt('Album name:');
  if (name && name.trim()) {
    createAlbum(name.trim());
    renderMainView();
  }
}

function handleRenameAlbum(id, name) {
  renameAlbum(id, name);
}

function handleDeleteAlbum(id) {
  deleteAlbum(id);
  renderMainView();
}

function handleReorder(albumIds) {
  reorderAlbums(albumIds);
  renderMainView();
}

function setupAlbumPage(albumId) {
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

  renderAlbumView(albumId);
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
  renderPhotoGrid(photos, album.name, {
    onAddPhotos: async (files) => {
      await importPhotos(albumId, files);
      renderAlbumView(albumId);
    },
    onRemovePhoto: (photoId) => {
      removePhoto(photoId);
      renderAlbumView(albumId);
    },
  });
}

document.addEventListener('DOMContentLoaded', init);
