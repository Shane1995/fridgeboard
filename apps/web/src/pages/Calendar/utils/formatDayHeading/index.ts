import { DAY_HEADING_FORMATTER } from './constants';
import type { FormatDayHeadingOptions } from './types';

export const formatDayHeading = ({ date }: FormatDayHeadingOptions): string =>
  DAY_HEADING_FORMATTER.format(new Date(`${date}T00:00:00Z`));
