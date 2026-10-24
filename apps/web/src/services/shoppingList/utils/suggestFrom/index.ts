import { MAX_SUGGESTIONS } from '../../constants';
import type { HistoryEntry } from '../../types';
import type { SuggestFromOptions } from './types';

const sameName = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

export const suggestFrom = ({ history, query, onList }: SuggestFromOptions): HistoryEntry[] => {
  const needle = query.trim().toLowerCase();
  if (needle === '') {
    return [];
  }
  const starts = (entry: HistoryEntry) => (entry.name.toLowerCase().startsWith(needle) ? 0 : 1);
  return history
    .filter(
      (entry) =>
        entry.name.toLowerCase().includes(needle) &&
        !onList.some((name) => sameName(name, entry.name)),
    )
    .sort((a, b) => starts(a) - starts(b) || b.count - a.count)
    .slice(0, MAX_SUGGESTIONS);
};
