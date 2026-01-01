
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This allows the browser-side code to access the API Key
    // It checks standard, Next-style, and Gemini-style variable names
    'process.env.API_KEY': JSON.stringify(
      process.env.API_KEY || 
      process.env.NEXT_PUBLIC_API_KEY || 
      process.env.GEMINI_API_KEY
    ),
  },
  build: {
    outDir: 'dist',
  },
})
