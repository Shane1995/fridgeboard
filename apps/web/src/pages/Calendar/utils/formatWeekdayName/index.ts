import { addDays } from '../addDays';
import { REFERENCE_SUNDAY, WEEKDAY_NAME_FORMATTER } from './constants';
import type { FormatWeekdayNameOptions } from './types';

export const formatWeekdayName = ({ weekday }: FormatWeekdayNameOptions): string =>
  WEEKDAY_NAME_FORMATTER.format(
    new Date(`${addDays({ date: REFERENCE_SUNDAY, days: weekday })}T00:00:00Z`),
  );
