import { renderHook, waitFor } from '@testing-library/react';
import { BucketColor } from '../../services/shoppingList/constants';
import { fakeShoppingList } from '../../testUtils/fakeShoppingList';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { useBucketsQuery } from './index';

describe('useBucketsQuery', () => {
  beforeEach(() => window.localStorage.clear());

  it('loads the buckets in order', async () => {
    await fakeShoppingList.createBucket({ name: 'Express', color: BucketColor.Mint });
    const { result } = renderHook(() => useBucketsQuery(), {
      wrapper: createShoppingListWrapper(),
    });

    await waitFor(() => expect(result.current.data?.map(({ name }) => name)).toEqual(['Express']));
  });
});
