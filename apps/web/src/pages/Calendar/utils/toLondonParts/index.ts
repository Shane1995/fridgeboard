import type { LondonParts } from '../../types';
import { LONDON_FORMATTER } from './constants';
import type { ToLondonPartsOptions } from './types';

export const toLondonParts = ({ instant }: ToLondonPartsOptions): LondonParts => {
  const parts = LONDON_FORMATTER.formatToParts(new Date(instant));
  const read = ({ type }: { type: Intl.DateTimeFormatPartTypes }): string =>
    parts.find((part) => part.type === type)?.value ?? '';
  return {
    date: `${read({ type: 'year' })}-${read({ type: 'month' })}-${read({ type: 'day' })}`,
    time: `${read({ type: 'hour' })}:${read({ type: 'minute' })}`,
  };
};
