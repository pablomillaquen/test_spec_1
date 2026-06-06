import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        album: resolve(__dirname, 'src/album.html'),
      },
    },
  },
  server: {
    open: '/index.html',
  },
});
