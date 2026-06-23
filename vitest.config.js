import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// Separate test config so the production build config in vite.config.js
// (notably its rollup `manualChunks`) stays untouched.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
});
