import { defineConfig } from 'vite'

// Interactive 3D demo film (Three.js) — lives in /showcase, separate from the app build.
export default defineConfig({
  root: 'showcase',
  base: './',
  publicDir: '../public',
  server: { host: '0.0.0.0', port: 5174, allowedHosts: true, fs: { allow: ['..'] } },
  preview: { host: '0.0.0.0', port: 5174, allowedHosts: true },
  build: { outDir: '../dist/showcase', emptyOutDir: true, chunkSizeWarningLimit: 1500 },
})
