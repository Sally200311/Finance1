
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', 
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.FIREBASE_CONFIG': JSON.stringify(process.env.FIREBASE_CONFIG)
  },
  build: {
    // Vite uses esbuild by default for minification which is faster and has better type support
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },
  // Use esbuild's built-in capability to drop console and debugger in production builds
  esbuild: {
    drop: ['console', 'debugger'],
  }
});
