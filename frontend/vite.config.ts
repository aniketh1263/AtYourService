import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite is the tool that runs our dev server and builds the app for production.
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), // understands JSX/TSX and enables "hot reload" (the page updates as you save)
    tailwindcss(), // turns Tailwind class names (like "p-4") into real CSS
  ],
  server: {
    port: 5173,
    // The React app runs on port 5173 and the NestJS API on port 3000. A browser treats those as
    // different "origins" and blocks calls between them (CORS). The proxy fixes that: our code calls
    // a relative URL such as "/api/health", and Vite quietly forwards it to http://localhost:3000.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
