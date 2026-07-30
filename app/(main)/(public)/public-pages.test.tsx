import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { vi } from 'vitest';

vi.mock('../../../src/components/layout/Collapsible', () => ({
  default: () => <div data-testid="collapsible-client-island" />
}));
vi.mock('../../../src/components/Redesign/Values', () => ({
  default: () => <div data-testid="values-client-island" />
}));
vi.mock('../../../src/components/Redesign/PartnerSlider', () => ({
  default: () => <div data-testid="partner-slider-client-island" />
}));
import Home from '../../../src/routes/Home';
import TheaterResources from '../../../src/routes/TheaterResources';
import WhoWeAre from '../../../src/routes/WhoWeAre';

const readProjectFile = (file: string) =>
  fs.readFileSync(path.resolve(__dirname, '..', '..', '..', file), 'utf8');

const expectServerPage = (
  pageFile: string,
  componentName: string,
  routeFile: string
) => {
  const absolutePage = path.resolve(__dirname, pageFile);

  expect(fs.existsSync(absolutePage)).toBe(true);
  if (!fs.existsSync(absolutePage)) return;

  const source = fs.readFileSync(absolutePage, 'utf8');
  expect(source.trimStart().startsWith("'use client';")).toBe(false);
  expect(source).toContain(routeFile);
  expect(source).toMatch(new RegExp(`<${componentName}\\s*/>`));
  expect(source).not.toMatch(/LegacyApp|react-router|next\/dynamic/u);
};

describe('public App Router pages', () => {
  it('defines /home as a concrete Server Component', () => {
    expectServerPage('home/page.tsx', 'Home', 'src/routes/Home');
  });

  it('defines /about-us as a concrete Server Component', () => {
    expectServerPage('about-us/page.tsx', 'WhoWeAre', 'src/routes/WhoWeAre');
  });

  it('defines /theatre-resources as a concrete Server Component', () => {
    expectServerPage(
      'theatre-resources/page.tsx',
      'TheaterResources',
      'src/routes/TheaterResources'
    );
  });

  it('keeps unique Home content, assets, and destinations in server output', () => {
    const markup = renderToStaticMarkup(<Home />);

    expect(markup).toContain('Discover your next');
    expect(markup).toContain('Free for everyone. Proudly made in Chicago.');
    expect(markup).toContain('src="/hero.png"');
    expect(markup).toContain('src="/donate.png"');
    expect(markup).toContain('href="/sign-up"');
    expect(markup).toContain('href="/shows"');
  });

  it('keeps unique About content and the FAQ destination in server output', () => {
    const markup = renderToStaticMarkup(<WhoWeAre />);

    expect(markup).toContain('ABOUT US');
    expect(markup).toContain('Theatre for everyone, made by anyone.');
    expect(markup).toContain('Meet Our Team');
    expect(markup).toContain('href="/faq"');
  });

  it('keeps unique resource content, assets, forms, and external anchors in server output', () => {
    const markup = renderToStaticMarkup(<TheaterResources />);

    expect(markup).toContain('THEATRE RESOURCES');
    expect(markup).toContain('Our collection of useful links and resources');
    expect(markup).toContain('src="/images/blue_blob.svg"');
    expect(markup).toContain('href="https://forms.gle/eCHjeDGphFBr7y4W6"');
    expect(markup).toContain('href="https://www.techsoup.org/"');
    expect(markup).toContain('docs.google.com/forms');
  });

  it('keeps route compositions server-safe and same-origin anchors on Next Link', () => {
    const homeSource = readProjectFile('src/routes/Home.tsx');
    const aboutSource = readProjectFile('src/routes/WhoWeAre.tsx');
    const resourcesSource = readProjectFile('src/routes/TheaterResources.tsx');
    const homeFaqSource = readProjectFile('src/components/FAQ/homeFAQ.tsx');

    for (const source of [homeSource, aboutSource, resourcesSource]) {
      expect(source.trimStart().startsWith("'use client';")).toBe(false);
      expect(source).not.toMatch(/react-router/u);
      expect(source).not.toMatch(/<a\s+href="\//u);
    }
    expect(homeSource).toContain("from 'next/link'");
    expect(aboutSource).toContain("from 'next/link'");
    expect(aboutSource).toContain('AboutFrame');
    expect(aboutSource).toContain('AboutTeam');
    expect(aboutSource).not.toContain('AboutContent');
    expect(aboutSource).not.toContain('styled-components');
    expect(homeSource).not.toContain('allowTransparency');
    expect(homeFaqSource).toContain("from 'next/link'");
    expect(homeFaqSource).not.toMatch(/<a\s+href="\//u);
  });

  it('isolates only interactive or runtime-styled sections behind client boundaries', () => {
    const clientFiles = [
      'src/components/Home/HomeFaq.tsx',
      'src/components/Redesign/Values.tsx',
      'src/components/Redesign/PartnerSlider.tsx',
      'src/components/WhoWeAre/AboutFrame.tsx',
      'src/components/WhoWeAre/AboutTeam.tsx'
    ];

    for (const file of clientFiles) {
      const absoluteFile = path.resolve(__dirname, '..', '..', '..', file);
      expect(fs.existsSync(absoluteFile)).toBe(true);
      if (!fs.existsSync(absoluteFile)) continue;
      expect(fs.readFileSync(absoluteFile, 'utf8').trimStart()).toMatch(
        /^'use client';/u
      );
    }

    expect(readProjectFile('src/routes/TheaterResources.tsx')).not.toMatch(
      /useState|useEffect|useRef|styled-components|react-bootstrap/u
    );
  });

  it('keeps About copy server-owned behind a style-only frame and interactive team island', () => {
    const aboutFrameFile = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'src/components/WhoWeAre/AboutFrame.tsx'
    );
    const aboutTeamFile = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'src/components/WhoWeAre/AboutTeam.tsx'
    );
    const obsoleteAboutContentFile = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'src/components/WhoWeAre/AboutContent.tsx'
    );
    const obsoleteTeamSectionsFile = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'src/components/WhoWeAre/TeamSections.tsx'
    );

    expect(fs.existsSync(aboutFrameFile)).toBe(true);
    expect(fs.existsSync(aboutTeamFile)).toBe(true);
    expect(fs.existsSync(obsoleteAboutContentFile)).toBe(false);
    expect(fs.existsSync(obsoleteTeamSectionsFile)).toBe(false);
    if (!fs.existsSync(aboutFrameFile) || !fs.existsSync(aboutTeamFile)) return;

    const aboutSource = readProjectFile('src/routes/WhoWeAre.tsx');
    const frameSource = fs.readFileSync(aboutFrameFile, 'utf8');
    const teamSource = fs.readFileSync(aboutTeamFile, 'utf8');

    expect(aboutSource).toMatch(
      /<AboutFrame[\s\S]*<div className="header-section">[\s\S]*<h1 className="page-title">ABOUT US<\/h1>[\s\S]*<div className="divider-bar" \/>[\s\S]*<div className="about-section">[\s\S]*<div className="vision-mission-wrapper">[\s\S]*<div className="about-card">[\s\S]*<h2 className="about-title">Vision<\/h2>[\s\S]*<\/div>[\s\S]*<div className="about-card">[\s\S]*<h2 className="about-title">Mission<\/h2>[\s\S]*<\/div>[\s\S]*<\/div>[\s\S]*<\/div>[\s\S]*<div className="team-section">[\s\S]*<h2 className="meet-our-team-title">Meet Our Team<\/h2>[\s\S]*<AboutTeam \/>/u
    );
    expect(aboutSource).toContain("from 'next/link'");
    expect(aboutSource).toContain('Theatre for everyone, made by anyone.');
    expect(aboutSource).toContain('href="/faq"');
    expect(aboutSource).not.toMatch(/bios|Collapsible|styled-components/u);

    expect(frameSource.trimStart()).toMatch(/^'use client';/u);
    expect(frameSource).toContain("from 'styled-components'");
    expect(frameSource).not.toMatch(
      /ABOUT US|Theatre for everyone|Mission|next\/link|bios|Collapsible|Team/u
    );

    expect(teamSource.trimStart()).toMatch(/^'use client';/u);
    expect(teamSource).toContain('sectionTitles={sectionTitles}');
    expect(teamSource).toContain('subSections={bios}');
    expect(teamSource).toContain('subContainer={Team}');
    expect(teamSource).toContain('grid={true}');

    const styleContract = [
      'margin-bottom: 32px;',
      'font-size: 3rem;',
      'max-width: 300px;',
      'background-image: linear-gradient(90deg, #efc93d 0%, #e17b60 100%);',
      'margin-bottom: 64px;',
      'gap: 48px;',
      'border-radius: 12px;',
      'padding: 36px;',
      'line-height: 1.7;',
      'margin-top: 64px;',
      'font-size: 2.25rem;',
      'text-align: left;'
    ];
    for (const declaration of styleContract) {
      expect(frameSource).toContain(declaration);
    }
  });
});
