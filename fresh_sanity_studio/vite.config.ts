import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '..'),
      '@/lib': path.resolve(__dirname, '../lib'),
      '@/components': path.resolve(__dirname, '../components'),
      '@/utils': path.resolve(__dirname, './utils'),
      '@/schemas': path.resolve(__dirname, './schemas'),
      '@/plugins': path.resolve(__dirname, './plugins')
    }
  }
})