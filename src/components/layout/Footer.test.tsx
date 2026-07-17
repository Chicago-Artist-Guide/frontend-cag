import { readFileSync } from 'node:fs';
import path from 'node:path';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { zeffyUrl } from '../../utils/marketing';

const footerMocks = vi.hoisted(() => ({
  navigateLegacyDocument: vi.fn()
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.ComponentProps<'a'>) => (
    <a
      data-next-link="true"
      href={href}
      {...props}
      onClick={(event) => {
        props.onClick?.(event);
        event.preventDefault();
      }}
    >
      {children}
    </a>
  )
}));
vi.mock('../../utils/navigation', () => ({
  navigateLegacyDocument: footerMocks.navigateLegacyDocument
}));

import Footer from './Footer';

const internalLinks = [
  ['HOME', '/'],
  ['ABOUT US', '/about-us'],
  ['EVENTS', '/events'],
  ['FAQ', '/faq'],
  ['THEATRE RESOURCES', '/theatre-resources'],
  ['TERMS OF SERVICE', '/terms-of-service'],
  ['PRIVACY POLICY', '/privacy-policy']
] as const;

const externalHrefs = [
  zeffyUrl,
  'http://www.facebook.com/chiartistguide',
  'https://www.linkedin.com/company/chicago-artist-guide',
  'https://www.instagram.com/chiartistguide',
  'https://medium.com/chiartistguide',
  'mailto:contact@chicagoartistguide.org'
] as const;

describe('Footer navigation boundary', () => {
  beforeEach(() => {
    footerMocks.navigateLegacyDocument.mockReset();
  });

  it('uses Next links for every internal destination', () => {
    render(<Footer />);

    for (const [name, href] of internalLinks) {
      const link = screen.getByRole('link', { exact: true, name });

      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveAttribute('data-next-link', 'true');
    }
  });

  it('keeps Donate, social, and email destinations as ordinary anchors', () => {
    const { container } = render(<Footer />);

    for (const href of externalHrefs) {
      const link = container.querySelector<HTMLAnchorElement>(
        `a[href="${href}"]`
      );

      expect(link).not.toBeNull();
      expect(link).not.toHaveAttribute('data-next-link');
    }

    expect(
      screen.getByRole('link', { exact: true, name: 'DONATE' })
    ).toHaveAttribute('href', zeffyUrl);
    expect(screen.getByAltText('Chicago Artist Guide')).toHaveAttribute(
      'src',
      '/images/logoPlain.svg'
    );
  });

  it('passes every internal Next Link href to the document boundary', () => {
    render(<Footer />);

    for (const [name] of internalLinks) {
      const link = screen.getByRole('link', { exact: true, name });
      fireEvent.click(link);
    }

    expect(footerMocks.navigateLegacyDocument).toHaveBeenCalledTimes(
      internalLinks.length
    );
    expect(
      footerMocks.navigateLegacyDocument.mock.calls.map((call) => call[1])
    ).toEqual(internalLinks.map(([, href]) => href));
    for (const [locationLike, , click] of footerMocks.navigateLegacyDocument
      .mock.calls) {
      expect(locationLike).toBe(window.location);
      expect(click).toEqual(expect.objectContaining({ button: 0 }));
    }
  });

  it('contains no React Router dependency', () => {
    const source = readFileSync(
      path.resolve(process.cwd(), 'src/components/layout/Footer.tsx'),
      'utf8'
    );

    expect(source).toContain("from 'next/link'");
    expect(source).not.toMatch(/react-router-dom|\bto=/u);
  });
});
