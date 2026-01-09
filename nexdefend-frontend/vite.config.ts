/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  const config = {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      host: true, // Needed for Docker to expose port
      proxy: {
        '/api': {
          target: env.API_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
        },
        '/ws': {
          target: env.API_PROXY_TARGET ? env.API_PROXY_TARGET.replace('http', 'ws') : 'ws://localhost:8080',
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
