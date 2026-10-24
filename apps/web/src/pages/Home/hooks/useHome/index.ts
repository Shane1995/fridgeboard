import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useOverlayState } from '@heroui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useBucketsQuery } from '../../../../hooks/useBucketsQuery';
import { BUCKETS_QUERY_KEY } from '../../../../hooks/useBucketsQuery/constants';
import { useClearCheckedMutation } from '../../../../hooks/useClearCheckedMutation';
import { useReorderBucketsMutation } from '../../../../hooks/useReorderBucketsMutation';
import { useLocalStorage } from '../../../../hooks/useLocalStorage';
import { useItemsQuery } from '../../../../hooks/useItemsQuery';
import {
  FOCUS_BUCKET_STORAGE_KEY,
  UNSORTED_BUCKET_ID,
} from '../../../../services/shoppingList/constants';
import type { Bucket } from '../../../../services/shoppingList/types';
import {
  groupItemsByBucket,
  UNSORTED_BUCKET,
} from '../../../../services/shoppingList/utils/groupItemsByBucket';
import type { HomeState } from './types';

export const useHome = (): HomeState => {
  const buckets = useBucketsQuery();
  const items = useItemsQuery();
  const newBucketDialog = useOverlayState();
  const clear = useClearCheckedMutation();
  const [storedFocus, setFocus] = useLocalStorage(FOCUS_BUCKET_STORAGE_KEY);
  const reorder = useReorderBucketsMutation();
  const queryClient = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const bucketList = buckets.data ?? [];
  const itemList = items.data ?? [];

  const grouped = groupItemsByBucket(bucketList, itemList);
  const focusedId = [UNSORTED_BUCKET, ...bucketList].find(({ id }) => id === storedFocus)?.id;
  const visibleSections =
    focusedId === undefined
      ? grouped.sections
      : grouped.sections.filter(({ bucket }) => bucket.id === focusedId);
  const visibleChecked =
    focusedId === undefined
      ? grouped.checked
      : grouped.checked.filter(({ bucketId }) =>
          focusedId === UNSORTED_BUCKET_ID
            ? !bucketList.some(({ id }) => id === bucketId)
            : bucketId === focusedId,
        );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over === null || active.id === over.id) {
      return;
    }
    const ids = bucketList.map(({ id }) => id);
    const reordered = arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
    queryClient.setQueryData<Bucket[]>([BUCKETS_QUERY_KEY], (current) =>
      reordered.flatMap((id) => current?.find((bucket) => bucket.id === id) ?? []),
    );
    reorder.mutate(reordered);
  };

  return {
    grouped,
    focusedId,
    setFocus,
    visibleSections,
    visibleChecked,
    reorderable: grouped.sections.filter(({ bucket }) => bucket.id !== UNSORTED_BUCKET_ID),
    unsorted: grouped.sections.find(({ bucket }) => bucket.id === UNSORTED_BUCKET_ID),
    sensors,
    handleDragEnd,
    allBuckets: [UNSORTED_BUCKET, ...bucketList],
    hasItems: itemList.length > 0,
    isLoading: buckets.isPending || items.isPending,
    hasError: buckets.isError || items.isError,
    newBucketDialog,
    isClearing: clear.isPending,
    handleClearChecked: () => clear.mutate(),
  };
};
