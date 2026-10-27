import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // In development, "/api/..." requests are forwarded to the Express server,
    // so the browser sees a single origin and no CORS setup is needed.
    // Set API_PROXY_TARGET to point at an API running on a different port.
    proxy: {
      '/api': process.env.API_PROXY_TARGET || 'http://localhost:8000',
    },
  },
})
