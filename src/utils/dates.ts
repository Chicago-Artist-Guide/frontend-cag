/**
 * Date helpers for event-style records that store `date` as a YYYY-MM-DD
 * string (no time/zone) and an optional `time` like "7:00 PM".
 *
 * Why this exists: bare `new Date('2026-04-25')` is parsed as UTC midnight,
 * which renders as the previous day in negative-offset zones (e.g. Chicago)
 * and silently flips events to "past" a day early. This module is the one
 * place that handles that quirk.
 */

/**
 * Parse a YYYY-MM-DD-prefixed date string as local-time midnight. Returns
 * null for unparseable input so callers can pick their own recovery
 * (display "Invalid date", filter out, fall back to a sentinel, etc.).
 */
export const parseLocalDate = (dateStr: string): Date | null => {
  if (typeof dateStr !== 'string' || dateStr.length === 0) {
    return null;
  }
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    // Validate components before constructing — JS's Date rolls invalid
    // values forward (month 13 → next year, day 99 → +3 months) which
    // would silently accept garbage like "2026-13-99".
    const year = parseInt(m[1], 10);
    const month = parseInt(m[2], 10);
    const day = parseInt(m[3], 10);
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }
    const d = new Date(year, month - 1, day);
    // After construction, verify nothing rolled over (catches Feb 30 etc.).
    if (
      d.getFullYear() !== year ||
      d.getMonth() !== month - 1 ||
      d.getDate() !== day
    ) {
      return null;
    }
    return d;
  }
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d;
};

export type EmptyTimeFallback = 'startOfDay' | 'endOfDay';

const applyEmptyTimeFallback = (d: Date, fallback: EmptyTimeFallback) => {
  if (fallback === 'endOfDay') {
    d.setHours(23, 59, 59, 999);
  } else {
    d.setHours(0, 0, 0, 0);
  }
};

/**
 * Combine a date string with an optional time string into a sortable Date
 * in the user's local zone. Returns null when the date is unparseable.
 *
 * Recognized time formats: "7:00 PM", "7PM", "7 PM", "19:00".
 *
 * `emptyTimeFallback` controls what happens when `time` is missing, empty,
 * or unparseable:
 *   - `'endOfDay'` (23:59:59.999) — for "is this still upcoming today?"
 *     checks; an all-day event stays upcoming through the entire date.
 *   - `'startOfDay'` (00:00:00) — for sort orderings where all-day events
 *     should appear before timed events on the same day.
 */
export const parseEventDateTime = (
  dateStr: string,
  timeStr: string | undefined,
  emptyTimeFallback: EmptyTimeFallback = 'endOfDay'
): Date | null => {
  const eventDate = parseLocalDate(dateStr);
  if (!eventDate) {
    return null;
  }

  const trimmed = (timeStr ?? '').trim();
  if (trimmed === '') {
    applyEmptyTimeFallback(eventDate, emptyTimeFallback);
    return eventDate;
  }

  const upper = trimmed.toUpperCase();
  const time12 = upper.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);
  const time24 = upper.match(/^(\d{1,2}):(\d{2})$/);

  let hours: number | null = null;
  let minutes = 0;

  if (time12) {
    hours = parseInt(time12[1], 10);
    minutes = time12[2] ? parseInt(time12[2], 10) : 0;
    const isPM = time12[3] === 'PM';
    if (isPM && hours !== 12) hours += 12;
    else if (!isPM && hours === 12) hours = 0;
  } else if (time24) {
    hours = parseInt(time24[1], 10);
    minutes = parseInt(time24[2], 10);
  }

  if (hours === null || hours > 23 || minutes > 59) {
    applyEmptyTimeFallback(eventDate, emptyTimeFallback);
    return eventDate;
  }

  eventDate.setHours(hours, minutes, 0, 0);
  return eventDate;
};

/**
 * True if the event's date is today or later in the user's local zone.
 * Returns false for unparseable input. Time-of-day on the event is
 * intentionally ignored — an event at 9am today is still "upcoming"
 * relative to a list filter.
 */
export const isUpcomingEventDate = (dateStr: string): boolean => {
  const event = parseLocalDate(dateStr);
  if (!event) {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return event >= today;
};
