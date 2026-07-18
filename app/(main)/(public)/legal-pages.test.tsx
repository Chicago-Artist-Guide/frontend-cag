import fs from 'node:fs';
import path from 'node:path';

const readPage = (route: string) =>
  fs.readFileSync(path.resolve(__dirname, route, 'page.tsx'), 'utf8');

const readRoute = (routeFile: string) =>
  fs.readFileSync(
    path.resolve(__dirname, '..', '..', '..', 'src', 'routes', routeFile),
    'utf8'
  );

const readProjectFile = (file: string) =>
  fs.readFileSync(path.resolve(__dirname, '..', '..', '..', file), 'utf8');

describe('legal App Router pages', () => {
  it.each([
    ['privacy-policy', 'PrivacyPolicy', 'PrivacyPolicy.tsx', 'PRIVACY POLICY'],
    ['terms-of-service', 'TOS', 'TOS.tsx', 'TERMS OF SERVICE']
  ])(
    'composes /%s from its static legal document',
    (route, component, routeFile, marker) => {
      const source = readPage(route);

      expect(source).toContain(`src/routes/${component}`);
      expect(source).toMatch(new RegExp(`<${component}\\s*/>`));
      expect(readRoute(routeFile)).toContain(marker);
    }
  );

  it.each(['privacy-policy', 'terms-of-service'])(
    'keeps /%s outside the client-only legacy adapter',
    (route) => {
      const source = readPage(route);

      expect(source.trimStart().startsWith("'use client';")).toBe(false);
      expect(source).not.toMatch(
        /LegacyApp|react-router|next\/dynamic|ssr:\s*false/u
      );
    }
  );

  it('keeps legal copy server-owned behind a narrow styled client boundary', () => {
    const privacyPolicy = readRoute('PrivacyPolicy.tsx');
    const terms = readRoute('TOS.tsx');
    const styles = readProjectFile('src/components/Legal/LegalPageStyles.tsx');

    expect(privacyPolicy.trimStart().startsWith("'use client';")).toBe(false);
    expect(terms.trimStart().startsWith("'use client';")).toBe(false);
    expect(privacyPolicy).not.toContain("from 'styled-components'");
    expect(terms).not.toContain("from 'styled-components'");
    expect(terms).not.toMatch(/<ul>\s*<(?:p|div|ListParagraph)>/u);
    expect(styles.trimStart()).toMatch(/^'use client';/u);
    expect(styles).toContain("from 'styled-components'");
    expect(styles).toContain('export const LegalList = styled.ul');
  });
});
