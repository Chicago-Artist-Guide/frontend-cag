import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { zeffyUrl } from '../../../../src/utils/marketing';

const pagePath = path.resolve(
  process.cwd(),
  'app/(main)/(public)/donate/page.tsx'
);
const pageModules = import.meta.glob('./page.tsx');

describe('Donate App Router page', () => {
  it('is a server page with route-owned static content and a narrow style island', () => {
    expect(existsSync(pagePath)).toBe(true);
    const source = existsSync(pagePath) ? readFileSync(pagePath, 'utf8') : '';

    expect(source.trimStart().startsWith("'use client';")).toBe(false);
    expect(source).toContain('Donate to Support Chicago Artists');
    expect(source).toContain('Where your donation goes');
    expect(source).toContain('Corporate Sponsorship Opportunities');
    expect(source).toContain('Chicago Artist Guide is Supported By');
    expect(source).toMatch(/DonatePageFrame/u);
    expect(source).not.toMatch(
      /LegacyApp|react-router-dom|src\/routes\/Donate|styled-components/u
    );
  });

  it('preserves headings, copy, assets, and every external destination', async () => {
    const loadPage = pageModules['./page.tsx'];
    expect(typeof loadPage).toBe('function');
    if (!loadPage) return;

    const { default: DonatePage } = (await loadPage()) as {
      default: React.ComponentType;
    };
    const { container } = render(<DonatePage />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Donate to Support Chicago Artists'
      })
    ).toBeTruthy();
    expect(
      screen.getByText(/Your donation helps us keep the platform free/u)
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', { name: 'Where your donation goes' })
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', {
        name: 'Corporate Sponsorship Opportunities'
      })
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', {
        name: 'Chicago Artist Guide is Supported By'
      })
    ).toBeTruthy();

    expect(
      screen.getAllByRole('link', {
        hidden: true,
        name: /Donate Securely Now/u
      })
    ).toHaveLength(2);
    for (const link of screen.getAllByRole('link', {
      hidden: true,
      name: /Donate Securely Now/u
    })) {
      expect(link.getAttribute('href')).toBe(zeffyUrl);
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    }

    const externalHrefs = [
      'mailto:anna@chicagoartistguide.org',
      'https://www.driehausfoundation.org/',
      'https://www.cct.org/young-leaders-fund/',
      'https://westloopsoul.com/',
      'https://www.pfm.com/',
      'https://giosbbqbarandgrill.com/'
    ];
    for (const href of externalHrefs) {
      expect(
        container.querySelector<HTMLAnchorElement>(`a[href="${href}"]`)
      ).not.toBeNull();
    }

    for (const [alt, src] of [
      ['Keys', '/images/donate/keys.png'],
      ['Sign Board', '/images/donate/sign_board.png'],
      ['Coins', '/images/donate/coins.png'],
      ['Theater Stage', '/images/donate/stage_bow.png'],
      ['Stage Light', '/images/donate/stage_light.png'],
      ['Laptop', '/images/donate/laptop.png']
    ]) {
      expect(screen.getByAltText(alt).getAttribute('src')).toBe(src);
    }
  });
});
