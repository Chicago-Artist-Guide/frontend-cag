// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';

// jsdom does not implement window.scrollTo; stub it for tests (e.g. ScrollToTop)
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-empty-function -- intentional no-op for jsdom
  window.scrollTo = () => {};
}
