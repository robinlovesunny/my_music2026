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
    },
    proxy: {
      // 代理 DashScope API 解决 CORS 问题
      '/api/dashscope': {
        target: 'https://dashscope.aliyuncs.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/dashscope/, ''),
        timeout: 180000, // 图片生成可能需要较长时间
      },
    },
  }
})
