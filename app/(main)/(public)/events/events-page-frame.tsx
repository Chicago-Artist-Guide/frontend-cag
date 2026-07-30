'use client';

import styled from 'styled-components';

// Layout-only styling for /events, lifted verbatim from the styled-component
// rules in src/routes/Events.tsx (HeaderSection, EventsSection, SectionTitle,
// DividerBar, EventList, EmptyStateText, EndOfEvents). The actual copy and
// event list stay in page.tsx as plain server-rendered markup — this frame
// only owns the CSS, matching the pattern used by
// app/(main)/(public)/donate/donate-page-frame.tsx.
const EventsPageFrame = styled.div`
  .header-section {
    margin-bottom: 24px;
    text-align: center;
  }

  .divider-bar {
    width: 100%;
    max-width: 200px;
    height: 3px;
    border-radius: 2px;
    margin: 16px auto 24px auto;
    background-image: linear-gradient(90deg, #efc93d 0%, #e17b60 100%);
  }

  .events-section {
    padding: 0 16px;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-top: 2rem;
    margin-bottom: 1rem;
    text-transform: uppercase;
    color: #2f4550;
    text-align: center;
  }

  .event-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 32px;
  }

  .empty-state-text {
    text-align: center;
    color: #888;
    margin: 20px 0;
    font-size: 0.9rem;
    font-style: italic;
  }

  .end-of-events {
    text-align: center;
    font-style: italic;
    color: #888;
    margin: 32px 0 0 0;
    font-size: 0.9rem;
  }

  @media (min-width: 640px) {
    .header-section {
      margin-bottom: 32px;
    }

    .divider-bar {
      max-width: 250px;
      height: 4px;
      margin: 18px auto 28px auto;
    }

    .events-section {
      padding: 0 24px;
    }

    .section-title {
      font-size: 1.375rem;
      margin-top: 2.5rem;
      margin-bottom: 1.25rem;
    }

    .event-list {
      gap: 24px;
      margin-bottom: 40px;
    }

    .empty-state-text {
      font-size: 1rem;
      margin: 24px 0;
    }

    .end-of-events {
      font-size: 1rem;
      margin: 40px 0 0 0;
    }
  }

  @media (min-width: 768px) {
    .header-section {
      margin-bottom: 48px;
    }

    .divider-bar {
      max-width: 300px;
      margin: 18px auto 32px auto;
    }

    .events-section {
      padding: 0 32px;
    }

    .section-title {
      font-size: 1.5rem;
      margin-top: 3rem;
      margin-bottom: 1.5rem;
      text-align: left;
    }

    .event-list {
      gap: 32px;
      margin-bottom: 48px;
    }

    .end-of-events {
      margin: 48px 0 0 0;
    }
  }

  @media (min-width: 1024px) {
    .events-section {
      padding: 0;
    }

    .section-title {
      font-size: 1.75rem;
    }
  }
`;

export default EventsPageFrame;
