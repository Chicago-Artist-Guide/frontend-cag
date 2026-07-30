// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.stubEnv('NEXT_PUBLIC_FIREBASE_API_KEY', 'test-api-key');
vi.stubEnv('NEXT_PUBLIC_FIREBASE_APP_ID', 'test-app-id');
vi.stubEnv('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID', '');
vi.stubEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'test-project');
vi.stubEnv('NEXT_PUBLIC_FIREBASE_SENDER_ID', 'test-sender');
vi.stubEnv('NEXT_PUBLIC_LGL_API_KEY', 'test-lgl-key');

// jsdom does not implement window.scrollTo; stub it for tests (e.g. ScrollToTop)
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-empty-function -- intentional no-op for jsdom
  window.scrollTo = () => {};
}
