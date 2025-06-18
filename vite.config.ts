
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Replace <repo-name> with your GitHub repository name
  server: {
    port: 3000
  }
})
    