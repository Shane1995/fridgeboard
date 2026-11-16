import type { LondonLocalToInstantOptions } from './types.ts';

const MS_PER_MINUTE = 60_000;

const LONDON_PARTS = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London',
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const londonOffsetMs = (instant: number): number => {
  const parts = Object.fromEntries(
    LONDON_PARTS.formatToParts(instant).map(({ type, value }) => [type, Number(value)]),
  );
  const wallClock = Date.UTC(
    parts.year ?? 0,
    (parts.month ?? 1) - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return Math.round((wallClock - instant) / MS_PER_MINUTE) * MS_PER_MINUTE;
};

// The instant a London wall-clock time falls on. A time the clocks skip (spring) or repeat
// (autumn) lands on the later of the two readings.
export const londonLocalToInstant = ({ date, time }: LondonLocalToInstantOptions): string => {
  const wallClock = Date.parse(`${date}T${time}:00Z`);
  const guess = wallClock - londonOffsetMs(wallClock);
  const instant = wallClock - londonOffsetMs(guess);
  return new Date(instant).toISOString().replace('.000Z', 'Z');
};
