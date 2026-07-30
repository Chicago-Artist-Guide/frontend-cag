import { parseEventDateTime } from '../../utils/dates';
import type { CommunityEvent } from './types';

// A published event, or one predating the `status` field — matches the
// existing client behaviour in src/routes/Events.tsx (events without a
// `status` are treated as published for backwards compatibility).
export const isPublishedEvent = (event: CommunityEvent): boolean =>
  !event.status || event.status === 'published';

/**
 * Combines event date and time into a sortable Date. Falls back to
 * end-of-day so all-day events stay upcoming through the entire date.
 * Returns the epoch (a safely-past sentinel) for unparseable input — same
 * behaviour as src/routes/Events.tsx's `getEventDateTime`.
 */
export const getEventDateTime = (event: CommunityEvent): Date => {
  const dateTime = parseEventDateTime(event.date, event.time, 'endOfDay');
  if (!dateTime) {
    console.error(
      'Invalid event date:',
      event.date,
      'for event:',
      event.name
    );
    return new Date(0);
  }
  return dateTime;
};

export interface EventsByTiming {
  past: CommunityEvent[];
  upcoming: CommunityEvent[];
}

// Splits published events into upcoming (soonest first) and past (most
// recent first), matching src/routes/Events.tsx exactly. `now` is injected
// rather than read internally so callers — and tests — control the cutoff
// instead of relying on the system clock at call time.
export const splitEventsByTiming = (
  events: CommunityEvent[],
  now: Date
): EventsByTiming => {
  const published = events.filter(isPublishedEvent);

  const upcoming = published
    .filter((event) => getEventDateTime(event) >= now)
    .sort(
      (a, b) => getEventDateTime(a).getTime() - getEventDateTime(b).getTime()
    );

  const past = published
    .filter((event) => getEventDateTime(event) < now)
    .sort(
      (a, b) => getEventDateTime(b).getTime() - getEventDateTime(a).getTime()
    );

  return { past, upcoming };
};
