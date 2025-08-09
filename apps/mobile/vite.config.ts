import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@saiy/lib': path.resolve(__dirname, '../../packages/lib/src'),
      '@saiy/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
})
