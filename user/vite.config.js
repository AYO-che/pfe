import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/plans': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        bypass: (req) => {
          if (req.headers.accept && req.headers.accept.includes('text/html')) {
            return req.url;
          }
        },
      },
      '/subscriptions': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/notifications': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/auth':          { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/users':         { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/uploads':       { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/payments':      { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/sessions':      { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/blog':          { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/conversations': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/chat':          { target: 'http://localhost:5000', changeOrigin: true, secure: false },
    },
  },
})