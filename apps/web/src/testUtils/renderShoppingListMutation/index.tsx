import { renderHook, waitFor } from '@testing-library/react';
import { useBucketsQuery } from '../../hooks/useBucketsQuery';
import { useItemsQuery } from '../../hooks/useItemsQuery';
import { createShoppingListWrapper } from '../createShoppingListWrapper';

export const renderShoppingListMutation = async <T,>(
  useMutationUnderTest: () => T,
  itemCount: number,
) => {
  const { result } = renderHook(
    () => ({
      mutation: useMutationUnderTest(),
      items: useItemsQuery(),
      buckets: useBucketsQuery(),
    }),
    { wrapper: createShoppingListWrapper() },
  );
  await waitFor(() => expect(result.current.items.data).toHaveLength(itemCount));
  return result;
};
