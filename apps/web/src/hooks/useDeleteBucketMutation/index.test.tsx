import { act, renderHook, waitFor } from '@testing-library/react';
import { BucketColor, UNSORTED_BUCKET_ID } from '../../services/shoppingList/constants';
import { testRepository } from '../../testUtils/testRepository';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { useBucketsQuery } from '../useBucketsQuery';
import { useItemsQuery } from '../useItemsQuery';
import { useDeleteBucketMutation } from './index';

describe('useDeleteBucketMutation', () => {
  beforeEach(() => window.localStorage.clear());

  it('deletes the bucket and refreshes buckets and items', async () => {
    const bucket = await testRepository.createBucket({
      name: 'Express',
      color: BucketColor.Mint,
    });
    await testRepository.addItem({ name: 'Milk', bucketId: bucket.id });
    const { result } = renderHook(
      () => ({
        remove: useDeleteBucketMutation(),
        buckets: useBucketsQuery(),
        items: useItemsQuery(),
      }),
      { wrapper: createShoppingListWrapper() },
    );
    await waitFor(() => expect(result.current.items.data).toHaveLength(1));

    await act(async () => result.current.remove.mutateAsync(bucket.id));

    await waitFor(() => expect(result.current.buckets.data).toEqual([]));
    await waitFor(() => expect(result.current.items.data?.[0]?.bucketId).toBe(UNSORTED_BUCKET_ID));
  });
});
