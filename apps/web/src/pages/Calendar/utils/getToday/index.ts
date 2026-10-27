import { toLondonParts } from '../toLondonParts';
import type { GetTodayOptions } from './types';

export const getToday = ({ now }: GetTodayOptions): string =>
  toLondonParts({ instant: now.toISOString() }).date;
