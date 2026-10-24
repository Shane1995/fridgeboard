import { act, waitFor } from '@testing-library/react';
import { BucketColor, UNSORTED_BUCKET_ID } from '../../services/shoppingList/constants';
import { fakeShoppingList } from '../../testUtils/fakeShoppingList';
import { renderShoppingListMutation } from '../../testUtils/renderShoppingListMutation';
import { useDeleteBucketMutation } from './index';

describe('useDeleteBucketMutation', () => {
  beforeEach(() => window.localStorage.clear());

  it('deletes the bucket and refreshes buckets and items', async () => {
    const bucket = await fakeShoppingList.createBucket({
      name: 'Express',
      color: BucketColor.Mint,
    });
    await fakeShoppingList.addItem({ name: 'Milk', bucketId: bucket.id });
    const result = await renderShoppingListMutation(() => useDeleteBucketMutation(), 1);

    await act(async () => result.current.mutation.mutateAsync(bucket.id));

    await waitFor(() => expect(result.current.buckets.data).toEqual([]));
    await waitFor(() => expect(result.current.items.data?.[0]?.bucketId).toBe(UNSORTED_BUCKET_ID));
  });
});
