import { WEEKDAY_FORMATTER } from './constants';
import type { FormatWeekdayOptions } from './types';

export const formatWeekday = ({ date }: FormatWeekdayOptions): string =>
  WEEKDAY_FORMATTER.format(new Date(`${date}T00:00:00Z`));
