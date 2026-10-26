import { RETRY_DELAY_STEP_MS } from './constants.ts';
import type { RetryDelayOptions } from './types.ts';

export const retryDelay = ({ attempt }: RetryDelayOptions): number =>
  Math.floor(Math.random() * RETRY_DELAY_STEP_MS * attempt);
