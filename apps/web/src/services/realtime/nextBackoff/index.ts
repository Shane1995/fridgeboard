import { BACKOFF_BASE_MS, BACKOFF_MAX_MS } from '../constants';
import type { NextBackoffOptions } from './types';

export const nextBackoff = ({ attempt }: NextBackoffOptions): number => {
  const ceiling = Math.min(BACKOFF_MAX_MS, BACKOFF_BASE_MS * 2 ** attempt);
  return Math.floor(ceiling / 2 + Math.random() * (ceiling / 2));
};
