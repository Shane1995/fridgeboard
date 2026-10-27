import { MONTH_TITLE_FORMATTER } from './constants';
import type { FormatMonthTitleOptions } from './types';

export const formatMonthTitle = ({ date }: FormatMonthTitleOptions): string =>
  MONTH_TITLE_FORMATTER.format(new Date(`${date}T00:00:00Z`));
