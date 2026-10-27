import type { ParseDateOptions, ParsedDate } from './types';

export const parseDate = ({ date }: ParseDateOptions): ParsedDate => {
  const [year = 0, month = 1, day = 1] = date.split('-').map(Number);
  return { year, month: month - 1, day };
};
