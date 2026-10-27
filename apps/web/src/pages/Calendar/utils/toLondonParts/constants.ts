import { CALENDAR_TIME_ZONE } from '../../constants';

export const LONDON_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  timeZone: CALENDAR_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});
