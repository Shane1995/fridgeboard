import { act, renderHook, waitFor } from '@testing-library/react';
import { BucketColor } from '../../services/shoppingList/constants';
import { fakeShoppingList } from '../../testUtils/fakeShoppingList';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { useBucketsQuery } from '../useBucketsQuery';
import { useReorderBucketsMutation } from './index';

describe('useReorderBucketsMutation', () => {
  beforeEach(() => window.localStorage.clear());

  it('reorders the buckets and refreshes the buckets query', async () => {
    const a = await fakeShoppingList.createBucket({ name: 'A', color: BucketColor.Mint });
    const b = await fakeShoppingList.createBucket({ name: 'B', color: BucketColor.Sky });
    const { result } = renderHook(
      () => ({ reorder: useReorderBucketsMutation(), buckets: useBucketsQuery() }),
      { wrapper: createShoppingListWrapper() },
    );
    await waitFor(() => expect(result.current.buckets.data).toHaveLength(2));

    await act(async () => result.current.reorder.mutateAsync([b.id, a.id]));

    await waitFor(() =>
      expect(result.current.buckets.data?.map(({ name }) => name)).toEqual(['B', 'A']),
    );
  });
});
