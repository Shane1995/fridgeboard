import type { FormEvent } from 'react';
import type { Bucket, HistoryEntry } from '../../../../services/shoppingList/types';

export type AddItemFormState = {
  name: string;
  setName: (name: string) => void;
  bucketId: string;
  setBucketId: (bucketId: string) => void;
  buckets: Bucket[];
  suggestions: HistoryEntry[];
  pickSuggestion: (suggestion: HistoryEntry) => void;
  isAdding: boolean;
  handleSubmit: (event: FormEvent) => void;
};
