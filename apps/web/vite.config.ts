import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@yccify/types': path.resolve(__dirname, '../../packages/types/src'),
      '@yccify/api': path.resolve(__dirname, '../../packages/api/src'),
    },
  },
  optimizeDeps: {
    exclude: ['@yccify/api', '@yccify/types'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:7130',
        changeOrigin: true,
      },
      '/assets': {
        target: 'http://localhost:7130',
        changeOrigin: true,
      },
    },
  },
});

