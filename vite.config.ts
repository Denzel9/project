import path from 'path'

import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'

const manualChunks = (id: string) => {
  if (!id.includes('node_modules')) return

  if (id.includes('@mui/icons-material')) return 'mui-icons'
  if (id.includes('@mui/x-date-pickers') || id.includes('@mui/x-')) return 'mui-x'
  if (
    id.includes('@mui/material') ||
    id.includes('@mui/system') ||
    id.includes('@mui/lab') ||
    id.includes('@emotion')
  ) {
    return 'mui-core'
  }
  if (id.includes('@tiptap') || id.includes('prosemirror')) return 'tiptap'
  if (id.includes('emoji-picker-react')) return 'emoji-picker'
  if (id.includes('socket.io-client')) return 'socket'
  if (id.includes('swiper')) return 'swiper'
  if (
    id.includes('react-markdown') ||
    id.includes('remark-') ||
    id.includes('micromark') ||
    id.includes('mdast') ||
    id.includes('hast')
  ) {
    return 'markdown'
  }
  if (id.includes('react-dnd')) return 'react-dnd'
  if (id.includes('@tanstack/react-query')) return 'react-query'
  if (id.includes('react-dom') || id.includes('/react/')) return 'react-vendor'
  if (id.includes('react-router')) return 'react-router'
  if (id.includes('dayjs') || id.includes('date-fns')) return 'dates'
  if (id.includes('axios')) return 'axios'
  if (id.includes('yup')) return 'yup'
  if (id.includes('react-hook-form')) return 'react-hook-form'
}

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      open: false,
    }),
  ],
  server: {
    open: true,
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@widgets': path.resolve(__dirname, './src/widgets'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@features': path.resolve(__dirname, './src/features'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
})
