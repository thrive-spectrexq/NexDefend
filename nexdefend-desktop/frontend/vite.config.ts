import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
        '@': '/src',
    },
  },
  // Explicitly set environment variables for the desktop app
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('http://localhost:8080/api/v1'),
    'import.meta.env.VITE_AUTH_BASE_URL': JSON.stringify('http://localhost:8080/api/v1/auth'),
    'import.meta.env.VITE_AI_API_URL': JSON.stringify('http://localhost:5000'),
  }
})
