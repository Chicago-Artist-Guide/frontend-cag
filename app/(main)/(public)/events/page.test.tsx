import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Mock at the service boundary so the Server Component render doesn't hit
// live Firestore. Mock the CACHED module, which is the seam `page.tsx`
// actually calls through — mocking the raw `server.ts` underneath would still
// execute `unstable_cache`, which throws outside the Next request runtime
// ("Invariant: incrementalCache missing").
vi.mock('../../../../src/services/events/cached', () => ({
  getCachedEvents: vi.fn()
}));

import { getCachedEvents } from '../../../../src/services/events/cached';
import EventsPage from './page';

const mockListEvents = vi.mocked(getCachedEvents);

const pagePath = path.resolve(process.cwd(), 'app/(main)/(public)/events/page.tsx');

// EventsPage is an async Server Component. Outside the Next.js RSC runtime it
// is still a plain async function — calling it directly and rendering the
// resolved element is the standard way to exercise it under Vitest/RTL.
const renderPage = async () => {
  const element = await EventsPage();
  return render(element);
};

describe('Events App Router page', () => {
  beforeAll(() => {
    // jsdom does not implement IntersectionObserver; EventCard (rendered by
    // this page) uses one for its scroll-in fade animation, same as
    // window.scrollTo is stubbed in src/test/setupTests.ts for ScrollToTop.
    if (typeof window.IntersectionObserver === 'undefined') {
      window.IntersectionObserver = vi.fn().mockImplementation(() => ({
        disconnect: vi.fn(),
        observe: vi.fn(),
        unobserve: vi.fn()
      })) as unknown as typeof IntersectionObserver;
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is a Server Component that fetches via listEvents, not a client-side effect', () => {
    expect(existsSync(pagePath)).toBe(true);
    const source = existsSync(pagePath) ? readFileSync(pagePath, 'utf8') : '';

    expect(source.trimStart().startsWith("'use client';")).toBe(false);
    expect(source).not.toMatch(/useEffect|useState/u);
    expect(source).toContain('getCachedEvents');
    // Must NOT prerender at build time: CI builds with placeholder Firebase
    // config, so a build-time Firestore fetch would either fail the build or
    // silently ship a page containing zero events.
    expect(source).toContain("export const dynamic = 'force-dynamic'");
    expect(source).not.toMatch(/export const revalidate/u);
    expect(source).toContain('export const metadata');
  });

  it('server-renders upcoming and past events with no client-side fetch', async () => {
    mockListEvents.mockResolvedValueOnce([
      {
        date: '2099-01-01',
        details: 'A future mixer',
        externalUrl: 'https://example.com/future',
        id: 'future-event',
        image: '',
        location: 'Chicago',
        name: 'Future Mixer',
        price: 'Free',
        status: 'published',
        time: '7:00 PM'
      },
      {
        date: '2000-01-01',
        details: 'A past mixer',
        externalUrl: 'https://example.com/past',
        id: 'past-event',
        image: '',
        location: 'Chicago',
        name: 'Past Mixer',
        price: 'Free',
        status: 'published',
        time: '7:00 PM'
      }
    ]);

    await renderPage();

    expect(mockListEvents).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('heading', { level: 1, name: 'EVENTS' })).toBeInTheDocument();
    // EventCard renders separate mobile/tablet/desktop markup (toggled by CSS
    // media queries, all present in jsdom), so each event's title appears
    // more than once in the DOM.
    expect(screen.getAllByText('Future Mixer').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Past Mixer').length).toBeGreaterThan(0);
  });

  it('excludes draft and cancelled events', async () => {
    mockListEvents.mockResolvedValueOnce([
      {
        date: '2099-01-01',
        details: 'Not ready yet',
        externalUrl: 'https://example.com/draft',
        id: 'draft-event',
        image: '',
        location: 'Chicago',
        name: 'Draft Event',
        price: 'Free',
        status: 'draft',
        time: '7:00 PM'
      }
    ]);

    await renderPage();

    expect(screen.queryAllByText('Draft Event')).toHaveLength(0);
    expect(screen.getByText('No upcoming events at this time.')).toBeInTheDocument();
    expect(screen.getByText('No past events found.')).toBeInTheDocument();
  });

  it('renders empty states when there are no events at all', async () => {
    mockListEvents.mockResolvedValueOnce([]);

    await renderPage();

    expect(screen.getByText('No upcoming events at this time.')).toBeInTheDocument();
    expect(screen.getByText('No past events found.')).toBeInTheDocument();
  });
});
