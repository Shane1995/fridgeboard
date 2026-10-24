import { act, renderHook, waitFor } from '@testing-library/react';
import { BucketColor } from '../../services/shoppingList/constants';
import { testRepository } from '../../testUtils/testRepository';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { useBucketsQuery } from '../useBucketsQuery';
import { useUpdateBucketMutation } from './index';

describe('useUpdateBucketMutation', () => {
  beforeEach(() => window.localStorage.clear());

  it('renames a bucket and refreshes the buckets query', async () => {
    const { id } = await testRepository.createBucket({
      name: 'Express',
      color: BucketColor.Mint,
    });
    const { result } = renderHook(
      () => ({ update: useUpdateBucketMutation(), buckets: useBucketsQuery() }),
      { wrapper: createShoppingListWrapper() },
    );
    await waitFor(() => expect(result.current.buckets.data).toHaveLength(1));

    await act(async () => result.current.update.mutateAsync({ id, changes: { name: 'Tesco' } }));

    await waitFor(() => expect(result.current.buckets.data?.[0]?.name).toBe('Tesco'));
  });
});
