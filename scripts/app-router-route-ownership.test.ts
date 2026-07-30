import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

const publicRoutes = [
  'about-us',
  'donate',
  'faq',
  'home',
  'privacy-policy',
  'terms-of-service',
  'theatre-resources'
] as const;

const pagePath = (route: (typeof publicRoutes)[number]) =>
  path.join(projectRoot, 'app', '(main)', '(public)', route, 'page.tsx');

describe('App Router public route ownership', () => {
  it.each(publicRoutes)('/%s has a concrete App Router page', (route) => {
    expect(existsSync(pagePath(route))).toBe(true);
  });

  it.each(publicRoutes)(
    '/%s remains a Server Component outside the legacy adapter',
    (route) => {
      const source = readFileSync(pagePath(route), 'utf8');

      expect(source.trimStart().startsWith("'use client';")).toBe(false);
      expect(source).toMatch(/export default/u);
      expect(source).not.toMatch(
        /LegacyApp|src\/routes\/App|react-router|next\/dynamic|ssr:\s*false/u
      );
    }
  );
});
