import type { SleepOptions } from './types.ts';

export const sleep = ({ ms }: SleepOptions): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
