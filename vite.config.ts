import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// GitHub Pages serves this app from a /Billtracker/ subpath; Vercel and
// other platforms serve it from the domain root, so only apply the subpath
// base when explicitly building for GitHub Pages.
export default defineConfig({
  base: process.env.GH_PAGES ? '/Billtracker/' : '/',
  plugins: [react()],
})
