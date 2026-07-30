// @vitest-environment node

import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, type Dirent } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

interface PinnedFontAsset {
  family: 'Lora' | 'Montserrat' | 'Open Sans';
  file: string;
  originalUrl: string;
  sha256: string;
  sourceFile: string;
  sourceGitBlob: string;
  sourceSha256: string;
  style: 'italic' | 'normal';
  subset: 'latin';
  unicodeRange: string;
  weights: string[];
  woff2: {
    flavor: 'TrueType';
    length: number;
    numTables: number;
    totalSfntSize: number;
  };
}

interface FontProvenance {
  assets: PinnedFontAsset[];
  licenses: Array<{
    family: PinnedFontAsset['family'];
    file: string;
    sha256: string;
    sourceUrl: string;
  }>;
  retrievedAt: string;
  sourceCommit: string;
  sourceRepository: string;
}

const projectRoot = process.cwd();
const fontsDirectory = path.join(projectRoot, 'app/fonts');
const sha256 = (value: Buffer | string): string =>
  createHash('sha256').update(value).digest('hex');

const expectedAssets = [
  {
    family: 'Lora',
    file: 'lora-italic-latin-400.woff2',
    sha256: 'e93da94dec22f905fdb1f79589eb50200922d3b18f191514ca3312ffbe4ff6f0',
    style: 'italic',
    weights: ['400']
  },
  {
    family: 'Montserrat',
    file: 'montserrat-normal-latin.woff2',
    sha256: '6438d7b8ea9c7c3992d5e2fd2afdb1ff948570a3ef0bedae76247b51632960ba',
    style: 'normal',
    weights: ['400', '700']
  },
  {
    family: 'Open Sans',
    file: 'open-sans-normal-latin.woff2',
    sha256: '441af0def989ebfdbd6ad85ffaed85e967ab21a05f1dd342f16259464a206dd0',
    style: 'normal',
    weights: ['300', '600']
  }
] as const;

const listSourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry: Dirent) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listSourceFiles(absolutePath);
    return /\.(?:css|scss|ts|tsx)$/u.test(entry.name) ? [absolutePath] : [];
  });

describe('owned legacy brand fonts', () => {
  it('pins the exact sparse local-font declarations', () => {
    const source = readFileSync(path.join(projectRoot, 'app/fonts.ts'), 'utf8');

    expect(source).toContain("import localFont from 'next/font/local'");
    expect(source.match(/localFont\(/gu)).toHaveLength(3);
    expect(source).toContain("variable: '--font-montserrat'");
    expect(source).toContain("variable: '--font-open-sans'");
    expect(source).toContain("variable: '--font-lora'");
    expect(source.match(/weight: '(?:300|400|600|700)'/gu)).toEqual([
      "weight: '400'",
      "weight: '700'",
      "weight: '300'",
      "weight: '600'",
      "weight: '400'"
    ]);
    expect(source.match(/style: '(?:italic|normal)'/gu)).toEqual([
      "style: 'normal'",
      "style: 'normal'",
      "style: 'normal'",
      "style: 'normal'",
      "style: 'italic'"
    ]);
    expect(source.match(/display: 'swap'/gu)).toHaveLength(3);
    expect(source).not.toMatch(/next\/font\/google/u);
  });

  it('pins licensed WOFF2 binaries and authoritative provenance', () => {
    const provenance = JSON.parse(
      readFileSync(path.join(fontsDirectory, 'provenance.json'), 'utf8')
    ) as FontProvenance;

    expect(provenance.sourceRepository).toBe('https://github.com/google/fonts');
    expect(provenance.sourceCommit).toBe(
      '389b770410cc0b7c21c85673bfa2077420fe7f65'
    );
    expect(provenance.retrievedAt).toBe('2026-07-17');
    expect(
      provenance.assets.map(({ family, file, sha256, style, weights }) => ({
        family,
        file,
        sha256,
        style,
        weights
      }))
    ).toEqual(expectedAssets);

    for (const asset of provenance.assets) {
      const filePath = path.join(fontsDirectory, asset.file);
      const contents = readFileSync(filePath);
      expect(statSync(filePath).isFile()).toBe(true);
      expect(sha256(contents)).toBe(asset.sha256);
      expect(contents.subarray(0, 4).toString('ascii')).toBe('wOF2');
      expect(contents.readUInt32BE(4)).toBe(0x00010000);
      expect(contents.readUInt32BE(8)).toBe(asset.woff2.length);
      expect(contents.readUInt16BE(12)).toBe(asset.woff2.numTables);
      expect(contents.readUInt32BE(16)).toBe(asset.woff2.totalSfntSize);
      expect(asset.woff2.flavor).toBe('TrueType');
      expect(asset.subset).toBe('latin');
      expect(asset.unicodeRange).toBe(
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD'
      );
      expect(asset.originalUrl).toMatch(
        /^https:\/\/fonts\.gstatic\.com\/s\/(?:lora|montserrat|opensans)\//u
      );
      expect(asset.sourceFile).toMatch(
        /^ofl\/(?:lora|montserrat|opensans)\/.+\.ttf$/u
      );
      expect(asset.sourceGitBlob).toMatch(/^[a-f0-9]{40}$/u);
      expect(asset.sourceSha256).toMatch(/^[a-f0-9]{64}$/u);
    }

    expect(
      provenance.assets.map(({ sourceGitBlob, sourceSha256 }) => ({
        sourceGitBlob,
        sourceSha256
      }))
    ).toEqual([
      {
        sourceGitBlob: 'e973ccf7e5c69a831090c729a0dc2c592f42f4cc',
        sourceSha256:
          '22d8d8854b53807aa664ca34f2031a9ed57a1d0dea296b8b96cdd3aad937a2b3'
      },
      {
        sourceGitBlob: 'c97aca18592834d8706549c279cb8d5ac5d85f69',
        sourceSha256:
          '0f7b311b2f3279e4eef9b2f968bcdbab6e28f4daeb1f049f4f278a902bcd82f7'
      },
      {
        sourceGitBlob: '9db85693b027f3b05f6d77471d215f20707127c1',
        sourceSha256:
          '36643644f318a812aab2d2ed3bb98f8cf0872527f835fe9398d95fe6b9adb878'
      }
    ]);

    expect(provenance.licenses).toHaveLength(3);
    for (const license of provenance.licenses) {
      const contents = readFileSync(path.join(fontsDirectory, license.file));
      expect(sha256(contents)).toBe(license.sha256);
      expect(contents.toString('utf8')).toContain(
        'SIL OPEN FONT LICENSE Version 1.1'
      );
      expect(license.sourceUrl).toContain(`${provenance.sourceCommit}/ofl/`);
    }
  });

  it('exposes every generated font variable from the root layout', () => {
    const layout = readFileSync(
      path.join(projectRoot, 'app/layout.tsx'),
      'utf8'
    );

    expect(layout).toContain('montserrat.variable');
    expect(layout).toContain('openSans.variable');
    expect(layout).toContain('lora.variable');
    expect(layout).toMatch(/<html[^>]+className=/u);
  });

  it('routes shared and source-wide font-family declarations through variables', () => {
    const customScss = readFileSync(
      path.join(projectRoot, 'src/styles/custom.scss'),
      'utf8'
    );
    const styleVars = readFileSync(
      path.join(projectRoot, 'src/theme/styleVars.ts'),
      'utf8'
    );
    const tailwind = readFileSync(
      path.join(projectRoot, 'tailwind.config.js'),
      'utf8'
    );

    expect(customScss).toContain('$montserrat: var(--font-montserrat)');
    expect(customScss).toContain('$open-sans: var(--font-open-sans)');
    expect(customScss).toContain('$lora: var(--font-lora)');
    expect(styleVars).toContain("lora: 'var(--font-lora), serif'");
    expect(styleVars).toContain(
      "montserrat: 'var(--font-montserrat), sans-serif'"
    );
    expect(styleVars).toContain(
      "mainFont: 'var(--font-open-sans), sans-serif'"
    );
    expect(tailwind).toContain("'var(--font-open-sans)',\n");
    expect(tailwind).toContain("'var(--font-montserrat)',\n");
    expect(tailwind).toContain("lora: ['var(--font-lora)'");

    const violations = listSourceFiles(path.join(projectRoot, 'src')).flatMap(
      (filePath) =>
        readFileSync(filePath, 'utf8')
          .split('\n')
          .flatMap((line, index) =>
            /font(?:-family|Family)\s*:\s*[^;\n]*(?:Montserrat|Open Sans|Lora)/u.test(
              line
            )
              ? [`${path.relative(projectRoot, filePath)}:${index + 1}`]
              : []
          )
    );
    expect(violations).toEqual([]);
  });

  it('does not retain a runtime Google Fonts stylesheet', () => {
    expect(
      readFileSync(path.join(projectRoot, 'index.html'), 'utf8')
    ).not.toMatch(/fonts\.(?:googleapis|gstatic)\.com/u);
  });
});
