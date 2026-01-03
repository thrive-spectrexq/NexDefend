/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  const config = {
    plugins: [react(), tailwindcss()],
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
        '/login': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
        '/register': {
          target: 'http://localhost:8080',
          changeOrigin: true,
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
