import { daysBetween } from '@fridgeboard/lambda-kit/utils/daysBetween/index.ts';
import { isCalendarDate } from '@fridgeboard/lambda-kit/utils/isCalendarDate/index.ts';
import { EVENT_WINDOW_MAX_DAYS } from '../../constants.ts';
import type { EventWindow, ReadWindowOptions } from './types.ts';

export const readWindow = ({ query }: ReadWindowOptions): EventWindow | undefined => {
  const from = query?.from;
  const to = query?.to;
  if (!isCalendarDate(from) || !isCalendarDate(to)) {
    return undefined;
  }
  const days = daysBetween({ from, to });
  return days >= 0 && days < EVENT_WINDOW_MAX_DAYS ? { from, to } : undefined;
};
