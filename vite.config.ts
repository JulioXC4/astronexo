import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({ plugins: [react()], build: { rollupOptions: { input: { game: resolve(import.meta.dirname, 'index.html'), gallery: resolve(import.meta.dirname, 'visual-gallery.html') } } } });
