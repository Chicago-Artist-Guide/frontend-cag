import type { Metadata } from 'next';
import React from 'react';
import EventCard from '../../../../src/components/shared/EventCard';
import PageContainer from '../../../../src/components/layout/PageContainer';
import { Tagline, Title } from '../../../../src/components/layout/Titles';
import { splitEventsByTiming } from '../../../../src/services/events/eventFilters';
import { getCachedEvents } from '../../../../src/services/events/cached';
import EventsPageFrame from './events-page-frame';

export const metadata: Metadata = {
  description:
    'See what’s happening in the Chicago theatre community — workshops, mixers, showcases, and other upcoming and past Chicago Artist Guide events.',
  title: 'Community Events | Chicago Artist Guide'
};

// Revalidate every 5 minutes, matching /roles (see
// app/(main)/(public)/roles/page.tsx): events don't change minute to minute,
// so ISR keeps this fast and crawlable while cutting Firestore reads versus
// fetching on every request.
// Render per request rather than prerendering at build time: CI builds with
// placeholder Firebase config, so a build-time Firestore fetch either fails
// the build or silently ships a prerendered page containing zero events.
// `getCachedEvents` (src/services/events/cached.ts) caches the Firestore read
// itself, so per-request rendering does not mean a query per visitor.
//
// Rendering per request also removes the date-cutoff staleness this page
// would otherwise have: `now` below is evaluated on every request, so an
// event never sits in the wrong upcoming/past bucket after crossing midnight.
export const dynamic = 'force-dynamic';

// Server Component: every event is fetched and split here so crawlers and
// first paint see the full upcoming/past lists with no client-side fetch.
// Per-card interactivity (the fade-in-on-scroll observer) stays inside
// EventCard, which is a Client Component.
const EventsPage = async () => {
  const events = await getCachedEvents();
  const { past, upcoming } = splitEventsByTiming(events, new Date());

  return (
    <PageContainer>
      <EventsPageFrame>
        <div className="header-section">
          <Title>EVENTS</Title>
          <Tagline>Celebrate, Learn & Grow with Chicago Artist Guide</Tagline>
          <div className="divider-bar" />
        </div>

        <div className="events-section">
          <h2 className="section-title">Upcoming Events</h2>
          {upcoming.length === 0 ? (
            <p className="empty-state-text">No upcoming events at this time.</p>
          ) : (
            <div className="event-list">
              {upcoming.map((event, index) => (
                <EventCard
                  event={event}
                  index={index}
                  key={event.id}
                  status="upcoming"
                />
              ))}
            </div>
          )}

          <h2 className="section-title">Past Events</h2>
          {past.length === 0 ? (
            <p className="empty-state-text">No past events found.</p>
          ) : (
            <div className="event-list">
              {past.map((event, index) => (
                <EventCard
                  event={event}
                  index={index}
                  key={event.id}
                  status="past"
                />
              ))}
            </div>
          )}

          <div className="end-of-events">— end of events —</div>
        </div>
      </EventsPageFrame>
    </PageContainer>
  );
};

export default EventsPage;
