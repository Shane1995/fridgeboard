import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useAddItemMutation } from '../../../../hooks/useAddItemMutation';
import { useMeQuery } from '../../../../hooks/useMeQuery';
import { useBucketsQuery } from '../../../../hooks/useBucketsQuery';
import { useItemsQuery } from '../../../../hooks/useItemsQuery';
import { useSuggestionsQuery } from '../../../../hooks/useSuggestionsQuery';
import { useLocalStorage } from '../../../../hooks/useLocalStorage';
import {
  LAST_BUCKET_STORAGE_KEY,
  UNSORTED_BUCKET_ID,
} from '../../../../services/shoppingList/constants';
import { UNSORTED_BUCKET } from '../../../../services/shoppingList/utils/groupItemsByBucket';
import type { HistoryEntry } from '../../../../services/shoppingList/types';
import type { AddItemFormState } from './types';

export const useAddItemForm = (focusedBucketId?: string): AddItemFormState => {
  const [name, setName] = useState('');
  const [lastBucketId, setLastBucketId] = useLocalStorage(LAST_BUCKET_STORAGE_KEY);
  const { data } = useBucketsQuery();
  const { data: me } = useMeQuery();
  const addItem = useAddItemMutation();
  const query = name.trim();
  const { data: items } = useItemsQuery();
  const onList = (items ?? []).filter(({ checked }) => !checked).map(({ name: listed }) => listed);
  const { data: found } = useSuggestionsQuery(query, onList);

  useEffect(() => {
    if (focusedBucketId !== undefined) {
      setLastBucketId(focusedBucketId);
    }
  }, [focusedBucketId, setLastBucketId]);

  const buckets = [UNSORTED_BUCKET, ...(data ?? [])];
  const bucketId = buckets.find(({ id }) => id === lastBucketId)?.id ?? UNSORTED_BUCKET_ID;

  const suggestions = (found ?? []).filter(
    ({ name: known }) => known.toLowerCase() !== query.toLowerCase(),
  );

  const pickSuggestion = ({ name: picked, bucketId: pickedBucket }: HistoryEntry) => {
    setName(picked);
    if (buckets.some(({ id }) => id === pickedBucket)) {
      setLastBucketId(pickedBucket);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed === '' || addItem.isPending) {
      return;
    }
    addItem.mutate(
      { name: trimmed, bucketId, addedBy: me?.username ?? me?.email },
      { onSuccess: () => setName('') },
    );
  };

  return {
    name,
    setName,
    bucketId,
    setBucketId: setLastBucketId,
    buckets,
    suggestions,
    pickSuggestion,
    isAdding: addItem.isPending,
    handleSubmit,
  };
};
