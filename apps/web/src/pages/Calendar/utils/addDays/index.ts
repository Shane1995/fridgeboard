import { MS_PER_DAY } from './constants';
import type { AddDaysOptions } from './types';

export const addDays = ({ date, days }: AddDaysOptions): string =>
  new Date(Date.parse(`${date}T00:00:00Z`) + days * MS_PER_DAY).toISOString().slice(0, 10);
