import type { HistoryEntry } from '../../types';

export type SuggestFromOptions = {
  history: readonly HistoryEntry[];
  query: string;
  onList: readonly string[];
};
