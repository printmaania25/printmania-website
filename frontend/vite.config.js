import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',  // Root-relative paths: /assets/index.js (default, remove './')
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false  // Prod optimization
  }
});