import { act, renderHook, waitFor } from '@testing-library/react';
import { BucketColor } from '../../services/shoppingList/constants';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { useBucketsQuery } from '../useBucketsQuery';
import { useCreateBucketMutation } from './index';

describe('useCreateBucketMutation', () => {
  beforeEach(() => window.localStorage.clear());

  it('creates a bucket and refreshes the buckets query', async () => {
    const { result } = renderHook(
      () => ({ create: useCreateBucketMutation(), buckets: useBucketsQuery() }),
      { wrapper: createShoppingListWrapper() },
    );
    await waitFor(() => expect(result.current.buckets.data).toEqual([]));

    await act(async () =>
      result.current.create.mutateAsync({ name: 'Express', color: BucketColor.Mint }),
    );

    await waitFor(() =>
      expect(result.current.buckets.data?.map(({ name }) => name)).toEqual(['Express']),
    );
  });
});
