import { renderHook, waitFor } from '@testing-library/react';
import { useShopsQuery } from '../../hooks/useShopsQuery';
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
      shops: useShopsQuery(),
    }),
    { wrapper: createShoppingListWrapper() },
  );
  await waitFor(() => expect(result.current.items.data).toHaveLength(itemCount));
  return result;
};
