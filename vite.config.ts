import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'jsmediatags': 'jsmediatags/dist/jsmediatags.min.js',
    },
  },
  server: {
    fs: {
      // 允许访问 music_database 目录
      allow: ['..']
    }
  }
})
