import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  // ESTA LINHA É CRUCIAL - define o base path
  base: '/flexa-ide/',
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || '/flexa-server'),
    'process.env.VITE_WS_URL': JSON.stringify(process.env.VITE_WS_URL || '/flexa-server/ws')
  }
})