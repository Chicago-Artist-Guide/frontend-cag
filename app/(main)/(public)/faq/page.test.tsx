import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.ComponentProps<'a'>) => (
    <a data-next-link="true" href={href} {...props}>
      {children}
    </a>
  )
}));

const pagePath = path.resolve(
  process.cwd(),
  'app/(main)/(public)/faq/page.tsx'
);
const accordionPath = path.resolve(
  process.cwd(),
  'app/(main)/(public)/faq/faq-accordion.tsx'
);
const pageModules = import.meta.glob('./page.tsx');

describe('FAQ App Router page', () => {
  it('keeps static route content on the server and isolates the accordion island', () => {
    expect(existsSync(pagePath)).toBe(true);
    expect(existsSync(accordionPath)).toBe(true);
    const source = existsSync(pagePath) ? readFileSync(pagePath, 'utf8') : '';
    const accordionSource = existsSync(accordionPath)
      ? readFileSync(accordionPath, 'utf8')
      : '';

    expect(source.trimStart().startsWith("'use client';")).toBe(false);
    expect(source).toContain('FREQUENTLY ASKED QUESTIONS');
    expect(source).toContain("Find out what we're all about");
    expect(source).toContain('About Chicago Artist Guide');
    expect(source).toMatch(/FaqAccordion/u);
    expect(source).not.toMatch(
      /LegacyApp|react-router-dom|src\/routes\/FAQ|styled-components|Collapsible/u
    );
    expect(accordionSource.trimStart().startsWith("'use client';")).toBe(true);
  });

  it('server-renders questions, preserves the legacy blob-only artwork, and keeps accordion behavior', async () => {
    const loadPage = pageModules['./page.tsx'];
    expect(typeof loadPage).toBe('function');
    if (!loadPage) return;

    const { default: FAQPage } = (await loadPage()) as {
      default: React.ComponentType;
    };
    render(<FAQPage />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'FREQUENTLY ASKED QUESTIONS'
      })
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', { name: "Find out what we're all about" })
    ).toBeTruthy();
    expect(screen.getByText('Why was CAG created?')).toBeTruthy();
    expect(
      screen.getByText('WHO IS ABLE TO SEE THE PROFILE INFORMATION?')
    ).toBeTruthy();

    const usersButton = screen.getByRole('button', { name: /Our Users/u });
    expect(usersButton.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(usersButton);
    expect(usersButton.getAttribute('aria-expanded')).toBe('true');

    const decorativeImages = screen.getAllByAltText('');
    expect(decorativeImages).toHaveLength(2);
    expect(
      decorativeImages.map((image) => image.getAttribute('src')).filter(Boolean)
    ).toEqual(['/images/blue_blob.svg']);
  });

  it('uses Next links for same-origin body destinations and anchors for external links', async () => {
    const loadPage = pageModules['./page.tsx'];
    expect(typeof loadPage).toBe('function');
    if (!loadPage) return;

    const { default: FAQPage } = (await loadPage()) as {
      default: React.ComponentType;
    };
    const { container } = render(<FAQPage />);

    for (const href of [
      '/about-us',
      '/donate',
      '/terms-of-service',
      '/privacy-policy'
    ]) {
      const links = Array.from(
        container.querySelectorAll<HTMLAnchorElement>(`a[href="${href}"]`)
      );
      expect(links.length).toBeGreaterThan(0);
      for (const link of links) {
        expect(link.getAttribute('data-next-link')).toBe('true');
      }
    }

    for (const href of [
      'https://medium.com/chiartistguide/diversifying-and-strengthening-theater-in-chicago-2145d83806e2',
      'https://forms.gle/S99sz1LLMQwpsAq16',
      'https://theghostlightproject.com/',
      'mailto: anna@chicagoartistguide.org'
    ]) {
      const link = container.querySelector<HTMLAnchorElement>(
        `a[href="${href}"]`
      );
      expect(link).not.toBeNull();
      expect(link?.hasAttribute('data-next-link')).toBe(false);
    }
  });
});
