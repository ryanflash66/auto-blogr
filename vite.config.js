import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import crypto from 'node:crypto'
import os from 'node:os'
import path from 'path'

// Keep the dep-optimizer cache off the project tree. The default
// (node_modules/.vite) sits inside a synced Dropbox folder on some checkouts,
// which locks the deps dir mid-rebuild; the rename of deps_temp_* -> deps then
// fails with EBUSY, leaving no deps dir and every prebundled import 404ing.
// Dev-only: this has no effect on build output.
const projectId = crypto.createHash('sha256').update(__dirname).digest('hex').slice(0, 8)
const cacheDir = path.join(os.tmpdir(), `vite-autoblogr-${projectId}`)

// https://vite.dev/config/
export default defineConfig({
  cacheDir,
  server: {
    // Vite rejects Host headers it doesn't recognise (a DNS-rebinding guard).
    // A leading dot allows the domain and its subdomains, so demo tunnels work
    // without re-editing this on every restart (quick-tunnel names are random).
    // Dev-server only; the production build is unaffected.
    allowedHosts: ['.trycloudflare.com'],
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});