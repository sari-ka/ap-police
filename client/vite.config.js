import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  optimizeDeps: {
    exclude: ['core-js', 'canvg']
  },
  build: {
    rollupOptions: {
      external: (id) => id.startsWith('core-js/')
    }
  }
})
