import react from '@vitejs/plugin-react';
import { defineConfig } from 'electron-vite';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url));
const sassVariablesPath = join(rootDir, 'src/assets/style/Settings/_variables.scss').replace(/\\/g, '/');
const alias = {
  '@': resolve(rootDir, 'src'),
};

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          background: resolve(rootDir, 'src/background.ts'),
        },
      },
    },
  },
  renderer: {
    root: '.',
    plugins: [react()],
    resolve: {
      alias,
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "${sassVariablesPath}" as *;`,
        },
      },
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(rootDir, 'index.html'),
        },
      },
    },
  },
});
