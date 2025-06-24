import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0', // 监听所有网络接口，允许远程访问
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        router: (req) => {
          const host = req.headers.host;
          if (host && host.startsWith('192.168.')) {
            const ip = host.split(':')[0];
            return `http://${ip}:8000`;
          }
          return 'http://localhost:8000';
        }
      },
      '/static': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        router: (req) => {
          const host = req.headers.host;
          if (host && host.startsWith('192.168.')) {
            const ip = host.split(':')[0];
            return `http://${ip}:8000`;
          }
          return 'http://localhost:8000';
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: '@import "./src/styles/variables.less";',
      },
    },
  },
})