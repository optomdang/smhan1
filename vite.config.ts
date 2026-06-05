import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages: https://optomdang.github.io/smhan1/
  base: '/smhan1/',
  plugins: [react()],
})
