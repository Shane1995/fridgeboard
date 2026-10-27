import { toLondonParts } from '../toLondonParts';
import { MS_PER_MINUTE } from './constants';
import type { FromLondonPartsOptions } from './types';

const offsetAt = ({ ms }: { ms: number }): number => {
  const { date, time } = toLondonParts({ instant: new Date(ms).toISOString() });
  return Date.parse(`${date}T${time}:00Z`) - Math.floor(ms / MS_PER_MINUTE) * MS_PER_MINUTE;
};

export const fromLondonParts = ({ date, time }: FromLondonPartsOptions): string => {
  const wall = Date.parse(`${date}T${time}:00Z`);
  const guess = wall - offsetAt({ ms: wall });
  return new Date(wall - offsetAt({ ms: guess })).toISOString();
};
