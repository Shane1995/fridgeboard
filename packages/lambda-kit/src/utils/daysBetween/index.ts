import { MS_PER_DAY } from './constants.ts';
import type { DaysBetweenOptions } from './types.ts';

export const daysBetween = ({ from, to }: DaysBetweenOptions): number =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / MS_PER_DAY);
