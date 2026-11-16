import { SHOP_COLORS } from '@fridgeboard/contract/lists/constants';
import { EVENT_REMINDER_MAX_MINUTES } from '../../constants.ts';
import type { ReadEventExtrasOptions, ReadEventExtrasResult } from './types.ts';

const COLORS: readonly string[] = SHOP_COLORS;

const isColor = (value: unknown): value is string =>
  typeof value === 'string' && COLORS.includes(value);

const isReminder = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= 0 &&
  value <= EVENT_REMINDER_MAX_MINUTES;

export const readEventExtras = ({ fields }: ReadEventExtrasOptions): ReadEventExtrasResult => {
  const { color, reminder } = fields;
  if (color !== undefined && color !== null && !isColor(color)) {
    return { reason: 'invalid-color' };
  }
  if (reminder !== undefined && reminder !== null && !isReminder(reminder)) {
    return { reason: 'invalid-reminder' };
  }
  return {
    extras: {
      ...(isColor(color) ? { color } : {}),
      ...(isReminder(reminder) ? { reminder } : {}),
    },
  };
};
