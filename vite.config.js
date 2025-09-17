import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Treat Excel files as static assets so import-analysis doesn't attempt to parse them
  assetsInclude: ['**/*.xlsx', '**/*.xls']
})
