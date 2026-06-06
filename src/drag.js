export function initDragDrop(grid, albums, onReorder) {
  let dragSrcId = null;

  const tiles = grid.querySelectorAll('.album-tile');
  tiles.forEach((tile) => {
    tile.addEventListener('dragstart', (e) => {
      dragSrcId = tile.dataset.albumId;
      tile.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', tile.dataset.albumId);
    });

    tile.addEventListener('dragend', () => {
      tile.classList.remove('dragging');
      grid.querySelectorAll('.album-tile').forEach((t) => {
        t.classList.remove('drop-target-before', 'drop-target-after');
      });
      dragSrcId = null;
    });

    tile.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      if (tile.dataset.albumId === dragSrcId) return;

      const rect = tile.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const isBefore = e.clientY < midY;

      grid.querySelectorAll('.album-tile').forEach((t) => {
        t.classList.remove('drop-target-before', 'drop-target-after');
      });
      tile.classList.add(isBefore ? 'drop-target-before' : 'drop-target-after');
    });

    tile.addEventListener('dragleave', () => {
      tile.classList.remove('drop-target-before', 'drop-target-after');
    });

    tile.addEventListener('drop', (e) => {
      e.preventDefault();
      grid.querySelectorAll('.album-tile').forEach((t) => {
        t.classList.remove('drop-target-before', 'drop-target-after');
      });

      const srcId = e.dataTransfer.getData('text/plain');
      const targetId = tile.dataset.albumId;

      if (srcId === targetId) return;

      const rect = tile.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const insertBefore = e.clientY < midY;

      const allTiles = Array.from(grid.querySelectorAll('.album-tile'));
      const srcTile = allTiles.find((t) => t.dataset.albumId === srcId);
      const targetTile = allTiles.find((t) => t.dataset.albumId === targetId);

      if (!srcTile || !targetTile) return;

      let ordered = allTiles.map((t) => t.dataset.albumId);
      const srcIdx = ordered.indexOf(srcId);
      ordered.splice(srcIdx, 1);
      const targetIdx = ordered.indexOf(targetId);
      const insertIdx = insertBefore ? targetIdx : targetIdx + 1;
      ordered.splice(insertIdx, 0, srcId);

      onReorder(ordered);
    });
  });
}
