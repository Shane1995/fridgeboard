import { MS_PER_SECOND } from './constants.ts';

export const flowMaxAge = (ttlMs: number): number => Math.ceil(ttlMs / MS_PER_SECOND);
