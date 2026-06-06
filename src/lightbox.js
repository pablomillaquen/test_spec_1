export function openLightbox(imageUrl, filename, onRemove) {
  const existing = document.querySelector('.lightbox-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay open';

  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = filename || 'Photo';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'lightbox-close';
  closeBtn.innerHTML = '&times;';

  const removeBtn = document.createElement('button');
  removeBtn.className = 'btn btn-danger lightbox-remove';
  removeBtn.textContent = 'Remove Photo';

  overlay.appendChild(img);
  overlay.appendChild(closeBtn);
  if (onRemove) overlay.appendChild(removeBtn);

  const close = () => {
    overlay.classList.remove('open');
    setTimeout(() => overlay.remove(), 250);
  };

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', function onKey(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
  });

  if (onRemove) {
    removeBtn.addEventListener('click', () => {
      close();
      onRemove();
    });
  }

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('open'));
}
