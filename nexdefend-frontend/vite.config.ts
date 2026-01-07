/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const config = {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
        '/ws': {
          target: 'ws://localhost:8080',
          ws: true,
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    },
    define: {} as any
  }

  // If we are in 'desktop' mode (passed via command line --mode desktop),
  // we hardcode the API URLs to point to the local Wails backend.
  if (mode === 'desktop') {
    config.define = {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify('http://localhost:8080/api/v1'),
      'import.meta.env.VITE_AUTH_BASE_URL': JSON.stringify('http://localhost:8080/api/v1/auth'),
      'import.meta.env.VITE_AI_API_URL': JSON.stringify('http://localhost:5000'),
    }
  }

  return config
})
