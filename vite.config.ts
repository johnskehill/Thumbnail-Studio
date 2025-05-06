import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // ← add this
  base: '/Thumbnail-Studio/',

  plugins: [react()],
})
