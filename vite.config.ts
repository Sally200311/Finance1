import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  build: {
    // Switch to esbuild to resolve terser type conflicts and improve build speed
    minify: 'esbuild'
  },
  // Use esbuild's drop feature to remove console and debugger in production
  esbuild: {
    drop: ['console', 'debugger']
  }
});