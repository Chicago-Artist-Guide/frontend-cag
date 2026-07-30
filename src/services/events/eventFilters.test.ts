import {
  getEventDateTime,
  isPublishedEvent,
  splitEventsByTiming
} from './eventFilters';
import type { CommunityEvent } from './types';

const makeEvent = (
  overrides: Partial<CommunityEvent> = {}
): CommunityEvent => ({
  date: '2026-06-01',
  details: 'Details',
  externalUrl: 'https://example.com/event',
  id: 'event-1',
  image: '',
  location: 'Chicago',
  name: 'Test Event',
  price: 'Free',
  time: '7:00 PM',
  ...overrides
});

describe('isPublishedEvent', () => {
  it('treats events without a status as published (legacy documents)', () => {
    expect(isPublishedEvent(makeEvent({ status: undefined }))).toBe(true);
  });

  it('treats explicitly published events as published', () => {
    expect(isPublishedEvent(makeEvent({ status: 'published' }))).toBe(true);
  });

  it.each(['draft', 'cancelled'] as const)(
    'excludes %s events',
    (status) => {
      expect(isPublishedEvent(makeEvent({ status }))).toBe(false);
    }
  );
});

describe('getEventDateTime', () => {
  it('combines date and time into a local Date', () => {
    const dt = getEventDateTime(makeEvent({ date: '2026-06-01', time: '7:00 PM' }));
    expect(dt.getFullYear()).toBe(2026);
    expect(dt.getMonth()).toBe(5);
    expect(dt.getDate()).toBe(1);
    expect(dt.getHours()).toBe(19);
  });

  it('falls back to the epoch and logs when the date is unparseable', () => {
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const dt = getEventDateTime(makeEvent({ date: 'not-a-date' }));
    expect(dt.getTime()).toBe(0);
    expect(errorSpy).toHaveBeenCalledWith(
      'Invalid event date:',
      'not-a-date',
      'for event:',
      'Test Event'
    );
    errorSpy.mockRestore();
  });
});

describe('splitEventsByTiming', () => {
  const now = new Date(2026, 5, 15, 12, 0, 0);

  it('sorts upcoming events soonest-first', () => {
    const events = [
      makeEvent({ id: 'later', date: '2026-07-01' }),
      makeEvent({ id: 'soonest', date: '2026-06-16' }),
      makeEvent({ id: 'middle', date: '2026-06-20' })
    ];

    const { upcoming } = splitEventsByTiming(events, now);

    expect(upcoming.map((event) => event.id)).toEqual([
      'soonest',
      'middle',
      'later'
    ]);
  });

  it('sorts past events most-recent-first', () => {
    const events = [
      makeEvent({ id: 'oldest', date: '2026-01-01' }),
      makeEvent({ id: 'most-recent', date: '2026-06-10' }),
      makeEvent({ id: 'middle', date: '2026-03-01' })
    ];

    const { past } = splitEventsByTiming(events, now);

    expect(past.map((event) => event.id)).toEqual([
      'most-recent',
      'middle',
      'oldest'
    ]);
  });

  it('keeps an all-day event today in upcoming (end-of-day fallback)', () => {
    const events = [
      makeEvent({ id: 'today-all-day', date: '2026-06-15', time: '' })
    ];

    const { past, upcoming } = splitEventsByTiming(events, now);

    expect(upcoming.map((event) => event.id)).toEqual(['today-all-day']);
    expect(past).toEqual([]);
  });

  it('excludes draft and cancelled events from both buckets', () => {
    const events = [
      makeEvent({ id: 'draft', date: '2026-07-01', status: 'draft' }),
      makeEvent({
        id: 'cancelled',
        date: '2026-01-01',
        status: 'cancelled'
      }),
      makeEvent({ id: 'published', date: '2026-07-01', status: 'published' })
    ];

    const { past, upcoming } = splitEventsByTiming(events, now);

    expect(upcoming.map((event) => event.id)).toEqual(['published']);
    expect(past).toEqual([]);
  });
});
