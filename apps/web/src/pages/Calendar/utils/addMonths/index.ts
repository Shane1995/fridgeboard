import { parseDate } from '../parseDate';
import type { AddMonthsOptions } from './types';

const pad = (value: number): string => String(value).padStart(2, '0');

export const addMonths = ({ date, months }: AddMonthsOptions): string => {
  const { year, month, day } = parseDate({ date });
  const total = year * 12 + month + months;
  const nextYear = Math.floor(total / 12);
  const nextMonth = total - nextYear * 12;
  const lastDay = new Date(Date.UTC(nextYear, nextMonth + 1, 0)).getUTCDate();
  return `${nextYear}-${pad(nextMonth + 1)}-${pad(Math.min(day, lastDay))}`;
};
