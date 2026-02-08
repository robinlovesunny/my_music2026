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
    proxy: {
      '/lrcapi': {
        target: 'https://api.lrc.cx',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lrcapi/, ''),
      },
    },
  },
})
