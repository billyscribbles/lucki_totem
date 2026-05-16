import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    host: '0.0.0.0',
    port: 4173,
    // Serves only built static assets behind Railway's proxy, so the
    // dev-server Host check (DNS-rebinding protection) isn't needed here.
    // Without this, Vite 5.4.12+ returns 403 for the Railway domain.
    allowedHosts: true,
  },
  build: {
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
        },
      },
    },
  },
})
