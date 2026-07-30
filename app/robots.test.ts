import { existsSync } from 'node:fs';
import path from 'node:path';
import robots from './robots';

describe('robots', () => {
  it('preserves every pre-existing Disallow rule and adds /admin', () => {
    const { rules } = robots();

    expect(rules).toEqual(
      expect.objectContaining({
        disallow: expect.arrayContaining([
          '/login',
          '/logout',
          '/sign-up',
          '/profile',
          '/admin'
        ]),
        userAgent: '*'
      })
    );
  });

  it('does not drop any rule that public/robots.txt used to declare', () => {
    const { rules } = robots();
    const disallow = Array.isArray(rules.disallow)
      ? rules.disallow
      : [rules.disallow].filter(Boolean);

    // These four are the exact rules that used to live in public/robots.txt,
    // which this route replaces (and which was deleted alongside it).
    for (const legacyRule of ['/login', '/logout', '/sign-up', '/profile']) {
      expect(disallow).toContain(legacyRule);
    }
  });

  it('points sitemap at an absolute /sitemap.xml URL', () => {
    const { sitemap } = robots();

    expect(sitemap).toMatch(/^https?:\/\/.+\/sitemap\.xml$/u);
  });

  it('replaces the static public/robots.txt so this route actually serves', () => {
    const staticRobotsPath = path.resolve(process.cwd(), 'public/robots.txt');
    expect(existsSync(staticRobotsPath)).toBe(false);
  });
});
