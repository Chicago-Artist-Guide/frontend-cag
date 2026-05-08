import {
  isUpcomingEventDate,
  parseEventDateTime,
  parseLocalDate
} from '../utils/dates';

describe('parseLocalDate', () => {
  it('parses YYYY-MM-DD as local-time midnight (not UTC)', () => {
    // The original bug: bare new Date('2026-04-25') is UTC, which renders
    // as 2026-04-24 in negative-offset zones. parseLocalDate must produce
    // an instant whose LOCAL date is 2026-04-25 regardless of zone.
    const d = parseLocalDate('2026-04-25');
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2026);
    expect(d!.getMonth()).toBe(3); // April is index 3
    expect(d!.getDate()).toBe(25);
    expect(d!.getHours()).toBe(0);
    expect(d!.getMinutes()).toBe(0);
  });

  it('keeps the local date even when the same string would shift in UTC parsing', () => {
    const local = parseLocalDate('2026-04-25')!;
    const utc = new Date('2026-04-25');
    // The test only proves the bug exists in zones with negative offset.
    // In a positive-offset (or UTC) environment both will render as the
    // 25th. So just assert the local-parse value is a valid Apr 25 in
    // the runner's local zone.
    expect(local.getDate()).toBe(25);
    // And the UTC-derived date can differ in negative-offset zones —
    // demonstrate by comparing local interpretations:
    const localFromUtc = new Date(utc).getDate();
    if (new Date().getTimezoneOffset() > 0) {
      expect(localFromUtc).not.toBe(25);
    }
  });

  it('handles ISO strings with time/zone by falling back to native parse', () => {
    const d = parseLocalDate('2026-04-25T14:30:00Z');
    expect(d).not.toBeNull();
    // The native parse runs because the regex fast-path only captures the
    // date prefix; the result's local date may still match the input UTC
    // date depending on the runner zone, so just assert it's a real Date.
    expect(Number.isNaN(d!.getTime())).toBe(false);
  });

  it('returns null for empty / non-string / unparseable input', () => {
    expect(parseLocalDate('')).toBeNull();
    expect(parseLocalDate(undefined as unknown as string)).toBeNull();
    expect(parseLocalDate('not a date')).toBeNull();
    expect(parseLocalDate('2026-13-99')).toBeNull();
  });
});

describe('parseEventDateTime', () => {
  it('combines date and 12-hour time', () => {
    const d = parseEventDateTime('2026-04-25', '7:30 PM')!;
    expect(d.getHours()).toBe(19);
    expect(d.getMinutes()).toBe(30);
  });

  it('handles 12 PM and 12 AM correctly', () => {
    expect(parseEventDateTime('2026-04-25', '12:00 PM')!.getHours()).toBe(12);
    expect(parseEventDateTime('2026-04-25', '12:00 AM')!.getHours()).toBe(0);
  });

  it('handles compact 12-hour formats ("7PM", "7 PM")', () => {
    expect(parseEventDateTime('2026-04-25', '7PM')!.getHours()).toBe(19);
    expect(parseEventDateTime('2026-04-25', '7 PM')!.getHours()).toBe(19);
  });

  it('combines date and 24-hour time', () => {
    const d = parseEventDateTime('2026-04-25', '19:30')!;
    expect(d.getHours()).toBe(19);
    expect(d.getMinutes()).toBe(30);
  });

  it('default endOfDay fallback for missing time keeps event in "today" through midnight', () => {
    const d = parseEventDateTime('2026-04-25', undefined)!;
    expect(d.getHours()).toBe(23);
    expect(d.getMinutes()).toBe(59);
  });

  it('startOfDay fallback for missing time sorts before timed events', () => {
    const d = parseEventDateTime('2026-04-25', '', 'startOfDay')!;
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
  });

  it('falls back when the time is unparseable', () => {
    const end = parseEventDateTime('2026-04-25', 'tonight', 'endOfDay')!;
    expect(end.getHours()).toBe(23);
    const start = parseEventDateTime('2026-04-25', 'tonight', 'startOfDay')!;
    expect(start.getHours()).toBe(0);
  });

  it('falls back when the time is impossibly large', () => {
    const d = parseEventDateTime('2026-04-25', '25:00', 'startOfDay')!;
    expect(d.getHours()).toBe(0);
  });

  it('returns null for unparseable date input', () => {
    expect(parseEventDateTime('not a date', '7:00 PM')).toBeNull();
  });
});

describe('isUpcomingEventDate', () => {
  const today = new Date();
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  it('treats today as upcoming (not past)', () => {
    expect(isUpcomingEventDate(fmt(today))).toBe(true);
  });

  it('treats tomorrow as upcoming', () => {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isUpcomingEventDate(fmt(tomorrow))).toBe(true);
  });

  it('treats yesterday as past', () => {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isUpcomingEventDate(fmt(yesterday))).toBe(false);
  });

  it('returns false for unparseable input (does not throw)', () => {
    expect(isUpcomingEventDate('')).toBe(false);
    expect(isUpcomingEventDate('not a date')).toBe(false);
  });
});
