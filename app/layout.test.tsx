// @vitest-environment node

import fs from 'fs';
import path from 'path';
import React, { type ScriptHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { vi } from 'vitest';

vi.mock('./fonts', () => ({
  lora: { variable: 'font-lora' },
  montserrat: { variable: 'font-montserrat' },
  openSans: { variable: 'font-open-sans' }
}));

vi.mock('next/script', () => ({
  default: ({
    strategy,
    ...props
  }: ScriptHTMLAttributes<HTMLScriptElement> & { strategy?: string }) => (
    <script data-strategy={strategy} {...props} />
  )
}));

import RootLayout, { metadata, viewport } from './layout';

const description =
  "Diversifying theatre one connection at a time. Diversifying Chicago Theatre by providing more equitable casting and hiring opportunities. At Chicago Artist Guide, we're reimagining how theatres find, audition, and cast artists for their productions. We envision a more equitable, accessible way for local theatres to connect directly with the diverse actors, artists, and backstage crew they represent, all in an easy-to-use online network.";
const openGraphDescription =
  "Diversifying Chicago Theatre by providing more equitable casting and hiring opportunities. At Chicago Artist Guide, we're reimagining how theatres find, audition, and cast artists for their productions. We envision a more equitable, accessible way for local theatres to connect directly with the diverse actors, artists, and backstage crew they represent, all in an easy-to-use online network.";

describe('RootLayout document contract', () => {
  it('exports the complete legacy metadata and viewport through Next', () => {
    expect(metadata).toEqual({
      description,
      icons: {
        apple: [{ sizes: '180x180', url: '/apple-touch-icon.png' }],
        icon: [
          {
            sizes: '32x32',
            type: 'image/png',
            url: '/favicon-32x32.png'
          },
          {
            sizes: '16x16',
            type: 'image/png',
            url: '/favicon-16x16.png'
          }
        ],
        other: [
          {
            color: '#00aba9',
            rel: 'mask-icon',
            url: '/safari-pinned-tab.svg'
          }
        ]
      },
      manifest: '/site.webmanifest',
      openGraph: {
        description: openGraphDescription,
        images: ['https://www.chicagoartistguide.org/FBCover.jpg'],
        title:
          'Chicago Artist Guide: Diversifying theatre one connection at a time'
      },
      other: { 'msapplication-TileColor': '#ffc40d' },
      title: 'Chicago Artist Guide'
    });
    expect(viewport).toEqual({
      initialScale: 1,
      themeColor: '#fff',
      width: 'device-width'
    });
  });

  it('renders the local brand fonts, widget, registry, and noscript fallback', () => {
    const markup = renderToStaticMarkup(
      <RootLayout>
        <main data-layout-child="">content</main>
      </RootLayout>
    );

    expect(markup).toContain(
      '<html class="font-montserrat font-open-sans font-lora" lang="en">'
    );
    expect(markup).toContain(
      '<noscript>You need to enable JavaScript to run this app.</noscript>'
    );
    expect(markup).toContain('data-layout-child=""');
    expect(markup).toContain(
      'src="https://widgets.givebutter.com/latest.umd.cjs?acct=o8yi4881nb5X1BSi"'
    );
    expect(markup).toContain('async=""');
    expect(markup).toContain('data-strategy="afterInteractive"');
  });

  it('keeps global styles and document-only ownership in the root layout', () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, 'layout.tsx'),
      'utf8'
    );

    expect(source).toContain(
      "import 'react-datepicker/dist/react-datepicker.css'"
    );
    expect(source).toContain("import '../src/styles/App.scss'");
    expect(source).toContain("import Script from 'next/script'");
    expect(source).toContain(
      '<StyledComponentsRegistry>{children}</StyledComponentsRegistry>'
    );
    expect(source).toContain('montserrat.variable');
    expect(source).toContain('openSans.variable');
    expect(source).toContain('lora.variable');
    expect(source).not.toMatch(
      /AppProviders|fonts\.googleapis\.com|next\/font\/google/
    );
  });
});
