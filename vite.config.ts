import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dns from 'dns'

// Set DNS resolution order to prefer IPv4
dns.setDefaultResultOrder('ipv4first')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
      '@components': path.resolve(process.cwd(), './src/components'),
      '@api': path.resolve(process.cwd(), './src/api'),
      '@types': path.resolve(process.cwd(), './src/types'),
      '@pages': path.resolve(process.cwd(), './src/pages'),
      '@service': path.resolve(process.cwd(), './src/service'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'https://jafabackend.duckdns.org',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🚫 Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🚀 Sending Request:', req.method, req.url, '→', proxyReq.getHeader('host'));
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('📥 Response:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
})