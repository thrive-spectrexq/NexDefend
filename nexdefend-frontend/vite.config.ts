/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://api:8080', // Use the Docker service name
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://api:8080', // Use the Docker service name
        ws: true,
      },
      // --- ADD THESE NEW ENTRIES ---
      '/login': {
        target: 'http://api:8080', // Proxy to the backend
        changeOrigin: true,
      },
      '/register': {
        target: 'http://api:8080', // Proxy to the backend
        changeOrigin: true,
      },
      // --- END OF NEW ENTRIES ---
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})
