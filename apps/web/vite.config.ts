import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// In dev and in Compose, the web server proxies /graphql to the API, so the browser never
// needs CORS and the API URL stays out of the bundle.
const apiTarget = process.env['API_PROXY_TARGET'] ?? 'http://localhost:4000';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: { '/graphql': apiTarget },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test-setup.ts'],
  },
});
