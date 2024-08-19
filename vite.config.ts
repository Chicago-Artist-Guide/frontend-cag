import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  // depending on your application, base can also be "/"
  base: '',
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgr({
      svgrOptions: {
        icon: true
      }
    })
  ],
  define: {
    'process.env': {},
    // Add empty default values for your env vars
    'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(''),
    'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(''),
    'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(''),
    'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(''),
    'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(''),
    'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(''),
    'import.meta.env.VITE_FIREBASE_MEASUREMENT_ID': JSON.stringify('')
  },
  server: {
    // this ensures that the browser opens upon server start
    open: true,
    // this sets a default port to 3000
    port: 3000
  },
  css: {
    postcss: './postcss.config.js',
    preprocessorOptions: {
      scss: {
        includePaths: [path.resolve(__dirname, 'node_modules')],
        quietDeps: true
      }
    }
  }
});
