// @vitest-environment node

import { createHash } from 'node:crypto';
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  type Dirent
} from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const publicImages = path.join(projectRoot, 'public/images');
const sourceImages = path.join(projectRoot, 'src/images');
const assetPattern = /\.(?:gif|jpe?g|png|svg)$/iu;
const sourcePattern = /\.(?:css|js|jsx|mjs|scss|ts|tsx)$/iu;

const listFiles = (directory: string): string[] => {
  if (!existsSync(directory)) return [];

  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry: Dirent) => {
      const absolutePath = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(absolutePath) : [absolutePath];
    })
    .sort();
};

const relativeFiles = (directory: string): string[] =>
  listFiles(directory).map((file) => path.relative(directory, file));

const inventoryFingerprint = (directory: string): string => {
  const inventory = relativeFiles(directory)
    .map((relativePath) => {
      const contents = readFileSync(path.join(directory, relativePath));
      const fileHash = createHash('sha256').update(contents).digest('hex');
      return `${relativePath}:${fileHash}\n`;
    })
    .join('');

  return createHash('sha256').update(inventory).digest('hex');
};

describe('public image migration', () => {
  it('preserves the complete legacy asset inventory byte for byte', () => {
    expect(relativeFiles(publicImages)).toHaveLength(123);
    expect(inventoryFingerprint(publicImages)).toBe(
      '9b8564941f68146a890704f2faf3b55107e8b75d475b800318a90a204f68c5ec'
    );
    expect(
      relativeFiles(sourceImages).filter((file) => assetPattern.test(file))
    ).toEqual([]);
  });

  it.each([
    '/hero.png',
    '/donate.png',
    '/images/home_dance.svg',
    '/images/partners/mpaact_hq-1.jpg',
    '/images/who-we-are/board/Board_Adler.jpg',
    '/images/donate/stage_bow.png',
    '/images/cagLogo1.svg',
    '/images/logoPlain.svg',
    '/images/footer-background.png'
  ])('serves the representative public URL %s', (publicUrl) => {
    const file = path.join(projectRoot, 'public', publicUrl);
    expect(statSync(file).isFile()).toBe(true);
  });

  it('leaves no source-local image imports or stale migration paths', () => {
    const sourceFiles = ['app', 'e2e', 'scripts', 'src']
      .flatMap((directory) => listFiles(path.join(projectRoot, directory)))
      .filter((file) => sourcePattern.test(file));
    const offenders = sourceFiles
      .filter((file) =>
        /(?:src\/images\/|(?:from|import)\s+['"][^'"]*(?:\.\.\/|\.\/)images(?:\/|['"]))/u.test(
          readFileSync(file, 'utf8')
        )
      )
      .map((file) => path.relative(projectRoot, file));

    expect(offenders).toEqual([]);

    const publicUrls = sourceFiles.flatMap(
      (file) => readFileSync(file, 'utf8').match(/\/images\/[\w./-]+/gu) ?? []
    );
    expect(publicUrls.length).toBeGreaterThan(0);
    for (const publicUrl of new Set(publicUrls)) {
      expect(existsSync(path.join(projectRoot, 'public', publicUrl))).toBe(
        true
      );
    }
  });
});

describe('default Turbopack contract', () => {
  it('uses the default Next dev and production build commands', () => {
    const packageJson = JSON.parse(
      readFileSync(path.join(projectRoot, 'package.json'), 'utf8')
    ) as { scripts: Record<string, string> };

    expect(packageJson.scripts.dev).toBe('next dev');
    expect(packageJson.scripts.build).toBe('next build');
    expect(
      `${packageJson.scripts.dev} ${packageJson.scripts.build}`
    ).not.toMatch(/--(?:turbo|turbopack|webpack)/u);
  });

  it('has no webpack callback or Turbopack escape hatch', () => {
    const source = readFileSync(
      path.join(projectRoot, 'next.config.ts'),
      'utf8'
    );

    expect(source).not.toMatch(/\bwebpack\s*:/u);
    expect(source).not.toMatch(/\bturbopack\s*:/u);
    expect(source).toContain("output: 'standalone'");
    expect(source).toContain('styledComponents: true');
    expect(source).toContain('disableStaticImages: true');
  });
});
