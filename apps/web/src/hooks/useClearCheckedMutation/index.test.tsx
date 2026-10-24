import { act, renderHook, waitFor } from '@testing-library/react';
import { UNSORTED_BUCKET_ID } from '../../services/shoppingList/constants';
import { testRepository } from '../../testUtils/testRepository';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { useItemsQuery } from '../useItemsQuery';
import { useClearCheckedMutation } from './index';

describe('useClearCheckedMutation', () => {
  beforeEach(() => window.localStorage.clear());

  it('removes ticked items and refreshes the items query', async () => {
    const milk = await testRepository.addItem({
      name: 'Milk',
      bucketId: UNSORTED_BUCKET_ID,
    });
    await testRepository.addItem({ name: 'Eggs', bucketId: UNSORTED_BUCKET_ID });
    await testRepository.updateItem(milk.id, { checked: true });
    const { result } = renderHook(
      () => ({ clear: useClearCheckedMutation(), items: useItemsQuery() }),
      { wrapper: createShoppingListWrapper() },
    );
    await waitFor(() => expect(result.current.items.data).toHaveLength(2));

    await act(async () => result.current.clear.mutateAsync());

    await waitFor(() =>
      expect(result.current.items.data?.map(({ name }) => name)).toEqual(['Eggs']),
    );
  });
});
