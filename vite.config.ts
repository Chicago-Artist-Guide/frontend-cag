/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), '');
  const publicValue = (nextName: string, viteName: string) =>
    environment[nextName] || environment[viteName] || '';

  const publicDefinitions =
    mode === 'test'
      ? {}
      : {
          'process.env.NEXT_PUBLIC_FIREBASE_API_KEY': JSON.stringify(
            publicValue(
              'NEXT_PUBLIC_FIREBASE_API_KEY',
              'VITE_APP_FIREBASE_API_KEY'
            )
          ),
          'process.env.NEXT_PUBLIC_FIREBASE_APP_ID': JSON.stringify(
            publicValue(
              'NEXT_PUBLIC_FIREBASE_APP_ID',
              'VITE_APP_FIREBASE_APP_ID'
            )
          ),
          'process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID': JSON.stringify(
            publicValue(
              'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
              'VITE_APP_FIREBASE_MID'
            )
          ),
          'process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID': JSON.stringify(
            publicValue(
              'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
              'VITE_APP_FIREBASE_PROJECT_ID'
            )
          ),
          'process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID': JSON.stringify(
            publicValue(
              'NEXT_PUBLIC_FIREBASE_SENDER_ID',
              'VITE_APP_FIREBASE_SENDER_ID'
            )
          ),
          'process.env.NEXT_PUBLIC_LGL_API_KEY': JSON.stringify(
            publicValue('NEXT_PUBLIC_LGL_API_KEY', 'VITE_APP_LGL_API_KEY')
          )
        };

  return {
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
    assetsInclude: ['**/*.JPG', '**/*.jpg', '**/*.PNG', '**/*.png'],
    define: publicDefinitions,
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
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setupTests.ts'],
      // firestore.rules.test.ts runs in node + emulator via `npm run test:rules`
      exclude: ['**/node_modules/**', '**/dist/**', '**/*.rules.test.ts']
    }
  };
});
