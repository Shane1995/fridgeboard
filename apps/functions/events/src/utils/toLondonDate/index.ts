import { LONDON_TIME_ZONE } from '../../constants.ts';
import type { ToLondonDateOptions } from './types.ts';

const LONDON_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: LONDON_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const toLondonDate = ({ instant }: ToLondonDateOptions): string | undefined => {
  const time = Date.parse(instant);
  return Number.isNaN(time) ? undefined : LONDON_DATE.format(time);
};
