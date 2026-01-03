import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    cors: true,
    port: 12000,
    host: '127.0.0.1',
    strictPort: true,
    allowedHosts: true,
  },
})
