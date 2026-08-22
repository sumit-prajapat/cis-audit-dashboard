import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // Hardcode API URL to bypass Vercel env var issues
    'import.meta.env.VITE_API_URL': JSON.stringify('https://cis-audit-api.onrender.com')
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
      '/auth': 'http://localhost:8000',
      '/orgs': 'http://localhost:8000',
      '/billing': 'http://localhost:8000',
    }
  }
})
