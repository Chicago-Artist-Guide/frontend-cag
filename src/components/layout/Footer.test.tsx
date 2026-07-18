import { readFileSync } from 'node:fs';
import path from 'node:path';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { zeffyUrl } from '../../utils/marketing';

const footerMocks = vi.hoisted(() => ({
  nextLinkDefaultPrevented: [] as boolean[]
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.ComponentProps<'a'>) => (
    <a
      data-next-link="true"
      href={href}
      {...props}
      onClick={(event) => {
        props.onClick?.(event);
        footerMocks.nextLinkDefaultPrevented.push(event.defaultPrevented);
        event.preventDefault();
      }}
    >
      {children}
    </a>
  )
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
    footerMocks.nextLinkDefaultPrevented.length = 0;
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

  it('lets every internal Next Link perform client navigation', () => {
    render(<Footer />);

    for (const [name] of internalLinks) {
      const link = screen.getByRole('link', { exact: true, name });
      fireEvent.click(link);
    }

    expect(footerMocks.nextLinkDefaultPrevented).toEqual(
      internalLinks.map(() => false)
    );
  });

  it('contains no React Router dependency', () => {
    const source = readFileSync(
      path.resolve(process.cwd(), 'src/components/layout/Footer.tsx'),
      'utf8'
    );

    expect(source).toContain("from 'next/link'");
    expect(source).not.toMatch(
      /navigateLegacyDocument|react-router-dom|\bto=/u
    );
  });
});
