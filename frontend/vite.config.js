import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration.
 * The backend API URL is injected via VITE_BACKEND_URL in .env — never hardcoded.
 * https://vitejs.dev/config/
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // disable in production for security
  },
});
